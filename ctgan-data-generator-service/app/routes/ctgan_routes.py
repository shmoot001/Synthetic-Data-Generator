# app/routers/ctgan_router.py
import os
import tempfile
import logging
from io import StringIO, BytesIO
from time import time
from typing import Optional

import pandas as pd
from fastapi import (
    APIRouter, File, UploadFile, HTTPException, Body, Query, BackgroundTasks
)
from fastapi.responses import FileResponse
from pydantic import BaseModel
from celery.result import AsyncResult

from app.services.ctgan_service import CTGANService
from app.db.mongodb import get_mongo_collection
from app.models.request_models import TrainRequest, GenerateRequest, ExportRequest
from app.tasks.train_tasks import train_ctgan_model
from app.celery_app import celery_app

router = APIRouter()
ctgan_service = CTGANService()

# ✅ Riktig logger
logger = logging.getLogger(__name__)


# ✅ Hjälpare: läs CSV eller JSON robust
def _read_upload_to_df(file: UploadFile) -> pd.DataFrame:
    name = (file.filename or "").lower()
    content_type = (file.content_type or "").lower()

    data = file.file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file upload")

    # Detektera CSV/JSON
    is_json = name.endswith(".json") or "json" in content_type
    is_csv = name.endswith(".csv") or "csv" in content_type or not is_json

    try:
        if is_json:
            # stöd både JSON array och JSON lines
            try:
                return pd.read_json(BytesIO(data))
            except ValueError:
                return pd.read_json(BytesIO(data), lines=True)
        if is_csv:
            # robust mot encodingtrubbel
            try:
                return pd.read_csv(BytesIO(data))
            except UnicodeDecodeError:
                return pd.read_csv(BytesIO(data), encoding="latin-1")
    except Exception as e:
        logger.exception("Failed to parse uploaded file")
        raise HTTPException(status_code=400, detail=f"Could not parse file: {e}")

    raise HTTPException(status_code=400, detail="Unsupported file format")


@router.post(
    "/train",
    summary="Train CTGAN with optional custom config",
    description="Trains the CTGAN model using JSON data and optional configuration like batch_size and epochs.",
    tags=["Training"]
)
def train_model(request: TrainRequest):
    try:
        df = pd.DataFrame(request.data)
        if df.empty:
            raise HTTPException(status_code=400, detail="Training data is empty")

        if request.config:
            ctgan_service.configure(**request.config)

        ctgan_service.train(df)
        return {"message": "Model trained successfully", "config_used": request.config or "default"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("train_model failed")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/train-file",
    summary="Train CTGAN from file upload",
    description="Trains the CTGAN model using data from an uploaded file. Supports CSV and JSON formats.",
    tags=["Training"]
)
async def train_from_file(
    file: UploadFile = File(...),
    model_name: str = Query(..., description="Name to save the trained model as"),
    batch_size: Optional[int] = Query(None),
    epochs: int = Query(10, ge=1),
    sample_rows: Optional[int] = Query(None, ge=1)
):
    try:
        df = _read_upload_to_df(file)

        if sample_rows and df.shape[0] > sample_rows:
            df = df.sample(n=sample_rows, random_state=42)

        if not batch_size:
            n = df.shape[0]
            batch_size = 1000 if n <= 50_000 else 5_000 if n <= 100_000 else 10_000

        ctgan_service.configure(batch_size=batch_size, epochs=epochs, verbose=True)

        start = time()
        ctgan_service.train(df)
        duration = round(time() - start, 2)

        models_dir = "models"
        os.makedirs(models_dir, exist_ok=True)
        model_path = os.path.join(models_dir, f"{model_name}.pkl")
        ctgan_service.save_model(model_path)

        return {
            "message": f"Model '{model_name}' trained and saved successfully.",
            "saved_as": model_path,
            "rows_trained": len(df),
            "batch_size": batch_size,
            "epochs": epochs,
            "time_taken_seconds": duration
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("train_from_file failed")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/download-models",
    summary="List available trained models",
    description="Lists all trained models stored in the /models directory.",
    tags=["Model Management"]
)
def list_available_models():
    try:
        models_dir = "models"
        os.makedirs(models_dir, exist_ok=True)
        files = sorted(f for f in os.listdir(models_dir) if f.endswith(".pkl"))
        return {"models": files}
    except Exception as e:
        logger.exception("list_available_models failed")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/download-model",
    summary="Download trained model by name",
    description="Downloads the specified trained model file from /models directory.",
    tags=["Model Management"]
)
def download_model(model_name: str = Query(..., description="Name of the trained model to download (without .pkl)")):
    try:
        models_dir = "models"
        os.makedirs(models_dir, exist_ok=True)
        file_path = os.path.abspath(os.path.join(models_dir, f"{model_name}.pkl"))

        if not file_path.startswith(os.path.abspath(models_dir) + os.sep):
            raise HTTPException(status_code=400, detail="Invalid model name")

        if not os.path.exists(file_path):
            available = [f.replace(".pkl", "") for f in os.listdir(models_dir) if f.endswith(".pkl")]
            raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found. Available: {available}")

        return FileResponse(path=file_path, media_type="application/octet-stream", filename=f"{model_name}.pkl")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to download model {model_name}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to download model: {str(e)}")


@router.post(
    "/train-file-celery",
    summary="Train CTGAN with Celery",
    description="Asynchronously trains the CTGAN model using data from an uploaded file. Supports CSV and JSON formats.",
    tags=["Training"]
)
async def train_file_with_celery(
    file: UploadFile = File(...),
    model_name: str = Query(...),
    batch_size: Optional[int] = Query(None),
    epochs: int = Query(10, ge=1),
    sample_rows: Optional[int] = Query(None, ge=1),
    verbose: bool = Query(True)
):
    try:
        df = _read_upload_to_df(file)

        if sample_rows and df.shape[0] > sample_rows:
            df = df.sample(n=sample_rows, random_state=42)

        if not batch_size:
            n = df.shape[0]
            batch_size = 1000 if n <= 50_000 else 5_000 if n <= 100_000 else 10_000

        config = {"batch_size": batch_size, "epochs": epochs, "verbose": verbose}
        task = train_ctgan_model.delay({"rows": df.to_dict(orient="records")}, config, model_name)

        return {"message": "Training task submitted", "task_id": task.id}
    except Exception as e:
        logger.exception("train_file_with_celery failed")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/generate",
    summary="Generate synthetic data",
    description="Generates synthetic data using the trained CTGAN model. Specify the number of rows to generate.",
    tags=["Generation"]
)
def generate_data(request: GenerateRequest):
    try:
        if request.num_rows <= 0:
            raise HTTPException(status_code=400, detail="num_rows must be > 0")
        synthetic_df = ctgan_service.generate(request.num_rows)
        return synthetic_df.to_dict(orient="records")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("generate_data failed")
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/preview",
    summary="Preview synthetic data",
    description="Returns a preview of synthetic data generated by the CTGAN model. Specify the number of rows to preview.",
    tags=["Data Management"]
)
def preview_data(num_rows: int = Query(5, ge=1)):
    try:
        df = ctgan_service.preview(num_rows)
        return df.to_dict(orient="records")
    except Exception as e:
        logger.exception("preview_data failed")
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/metadata",
    summary="Get training metadata",
    description="Returns metadata about the last training session, including status, timestamp, and configuration used.",
    tags=["Database"]
)
def get_training_metadata():
    return ctgan_service.get_training_metadata()


@router.post(
    "/save-to-db",
    summary="Save generated data to MongoDB",
    description="Saves the generated synthetic data to MongoDB. Specify the number of rows to save.",
    tags=["Database"]
)
def save_to_db(request: GenerateRequest):
    try:
        if request.num_rows <= 0:
            raise HTTPException(status_code=400, detail="num_rows must be > 0")
        df = ctgan_service.generate(request.num_rows)
        collection = get_mongo_collection()
        ctgan_service.save_to_mongodb(df, collection)
        return {"message": f"{request.num_rows} rows saved to MongoDB"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("save_to_db failed")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/save-model",
    summary="Save trained CTGAN model",
    description="Saves the trained CTGAN model to a specified file path.",
    tags=["Model Management"]
)
def save_model(path: str = Body(..., embed=True)):
    try:
        ctgan_service.save_model(path)
        return {"message": f"Model saved to {path}"}
    except Exception as e:
        logger.exception("save_model failed")
        raise HTTPException(status_code=400, detail=str(e))


@router.post(
    "/load-model",
    summary="Load CTGAN model from file",
    description="Loads a previously saved CTGAN model from the specified file path.",
    tags=["Model Management"]
)
def load_model(path: str = Body(..., embed=True)):
    try:
        ctgan_service.load_model(path)
        return {"message": f"Model loaded from {path}"}
    except Exception as e:
        logger.exception("load_model failed")
        raise HTTPException(status_code=400, detail=str(e))


@router.post(
    "/export",
    summary="Export synthetic data",
    description="Exports synthetic data generated by the CTGAN model to CSV or JSON.",
    tags=["Export"]
)
def export_data(
    request: ExportRequest,
    background_tasks: BackgroundTasks
):
    try:
        if request.num_rows <= 0:
            raise HTTPException(status_code=400, detail="num_rows must be > 0")

        df = ctgan_service.generate(request.num_rows)

        suffix = ".csv" if request.format == "csv" else ".json" if request.format == "json" else None
        if suffix is None:
            raise HTTPException(status_code=400, detail="Format must be 'csv' or 'json'")

        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        tmp.close()

        if request.format == "csv":
            ctgan_service.export_to_csv(df, tmp.name)
            media_type = "text/csv"
            filename = "synthetic_data.csv"
        else:
            ctgan_service.export_to_json(df, tmp.name)
            media_type = "application/json"
            filename = "synthetic_data.json"

        # ✅ Städa temporärfil efter svar
        background_tasks.add_task(lambda p=tmp.name: os.path.exists(p) and os.remove(p))

        return FileResponse(path=tmp.name, media_type=media_type, filename=filename)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("export_data failed")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/task-status/{task_id}",
    summary="Get task status",
    description="Retrieves the status of a background task by its ID.",
    tags=["Tasks"]
)
def get_task_status(task_id: str):
    result = AsyncResult(task_id, app=celery_app)
    return {
        "task_id": task_id,
        "state": result.state,
        "info": str(result.result) if result.result is not None else None
    }


@router.get(
    "/db-data",
    summary="Get all data from MongoDB",
    description="Returns all documents currently stored in the synthetic data MongoDB collection.",
    tags=["Database"]
)
def get_all_db_data():
    try:
        collection = get_mongo_collection()
        data = list(collection.find({}, {"_id": 0}))
        return {"count": len(data), "data": data}
    except Exception as e:
        logger.exception("get_all_db_data failed")
        raise HTTPException(status_code=500, detail=str(e))
