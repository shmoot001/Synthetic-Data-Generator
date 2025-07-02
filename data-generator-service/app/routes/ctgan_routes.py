import tempfile
import os
import pandas as pd
from fastapi import APIRouter, File, UploadFile, HTTPException, Body, Query
from pydantic import BaseModel
from app.services.ctgan_service import CTGANService
from app.db.mongodb import get_mongo_collection
from app.models.request_models import TrainRequest, GenerateRequest, EvaluateRequest, ExportRequest
from io import StringIO
from typing import List
from datetime import datetime
from time import time
from tasks.train_tasks import train_ctgan_model
from celery.result import AsyncResult
from celery_app import celery_app

router = APIRouter()
ctgan_service = CTGANService()

@router.post("/generate-with-eval")
def generate_data_with_evaluation(request: GenerateRequest):
    try:
        eval_collection = get_mongo_collection(db_name="synthetic_data", collection_name="evaluation_reports")
        result = ctgan_service.generate_with_evaluation(request.num_rows, eval_collection)
        data = result["synthetic_data"].to_dict(orient="records")
        evaluation = result["evaluation"]
        return {
            "synthetic_data": data,
            "evaluation": evaluation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Train the model using raw JSON data (sent in request body)
@router.post(
    "/train",
    summary="Train CTGAN with optional custom config",
    description="Trains the CTGAN model using JSON data and optional configuration like batch_size and epochs.",
    tags=["Training"]
)
def train_model(request: TrainRequest):
    try:
        df = pd.DataFrame(request.data)
        
        # If config is passed, reconfigure model
        if request.config:
            ctgan_service.configure(**request.config)

        ctgan_service.train(df)          # Train CTGAN on the data
        return {"message": "Model trained successfully", "config_used": request.config or "default"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Generate synthetic data
@router.post("/generate")
def generate_data(request: GenerateRequest):
    try:
        synthetic_df = ctgan_service.generate(request.num_rows)
        return synthetic_df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Train the model from an uploaded file (.csv or .json)
@router.post("/train-file")
async def train_from_file(
    file: UploadFile = File(...),
    batch_size: int = Query(None),
    epochs: int = Query(10),
    model_path: str = Query(...),
    sample_rows: int = Query(None)
):
    try:
        contents = await file.read()
        df = pd.read_csv(StringIO(contents.decode("utf-8")))

        if sample_rows and df.shape[0] > sample_rows:
            df = df.sample(n=sample_rows, random_state=42)

        if not batch_size:
            if df.shape[0] > 100_000:
                batch_size = 10000
            elif df.shape[0] > 50000:
                batch_size = 5000
            else:
                batch_size = 1000

        ctgan_service.configure(batch_size=batch_size, epochs=epochs, verbose=True)

        start = time()
        ctgan_service.train(df)
        ctgan_service.save_model(model_path)
        duration = round(time() - start, 2)

        return {
            "message": f"Model trained and saved successfully",
            "rows_trained": len(df),
            "batch_size": batch_size,
            "epochs": epochs,
            "time_taken_seconds": duration,
            "model_path": model_path
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/train-file-celery")
async def train_file_with_celery(
    file: UploadFile = File(...),
    batch_size: int = Query(None),
    epochs: int = Query(10),
    model_path: str = Query(...),
    sample_rows: int = Query(None),
    verbose: bool = Query(True)
):
    try:
        contents = await file.read()
        df = pd.read_csv(StringIO(contents.decode("utf-8")))

        if sample_rows and df.shape[0] > sample_rows:
            df = df.sample(n=sample_rows)

        if not batch_size:
            if df.shape[0] > 100_000:
                batch_size = 10000
            elif df.shape[0] > 50000:
                batch_size = 5000
            else:
                batch_size = 1000

        config = {"batch_size": batch_size, "epochs": epochs, "verbose": verbose}

        task = train_ctgan_model.delay({"rows": df.to_dict(orient="records")}, config, model_path)

        return {"message": "Training task submitted", "task_id": task.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Preview a few synthetic samples from the trained model
@router.get("/preview")
def preview_data(num_rows: int = 5):
    try:
        df = ctgan_service.preview(num_rows)
        return df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Evaluate synthetic data against real data using quality metrics
@router.post("/evaluate")
def evaluate_model(request: EvaluateRequest):
    try:
        real_df = pd.DataFrame(request.real_data)
        synthetic_df = pd.DataFrame(request.synthetic_data)
        result = ctgan_service.evaluate(real_df, synthetic_df)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Get metadata about the training session (status, timestamp, etc.)
@router.get("/metadata")
def get_training_metadata():
    return ctgan_service.get_training_metadata()


# Endpoint to save generated data to MongoDB
@router.post("/save-to-db")
def save_to_db(request: GenerateRequest):
    try:
        df = ctgan_service.generate(request.num_rows)
        collection = get_mongo_collection()
        ctgan_service.save_to_mongodb(df, collection)
        return {"message": f"{request.num_rows} rows saved to MongoDB"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Save the trained model to a given file path
@router.post("/save-model")
def save_model(path: str = Body(..., embed=True)):
    try:
        ctgan_service.save_model(path)
        return {"message": f"Model saved to {path}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Load a previously saved model from disk
@router.post("/load-model")
def load_model(path: str = Body(..., embed=True)):
    try:
        ctgan_service.load_model(path)
        return {"message": f"Model loaded from {path}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/evaluations")
def list_evaluation_reports(
    model: str = Query(None),
    min_score: float = Query(None),
    from_date: str = Query(None),
    to_date: str = Query(None)
):
    try:
        collection = get_mongo_collection(db_name="synthetic_data", collection_name="evaluation_reports")
        
        query = {}

        # Filtrera på modelltyp
        if model:
            query["model"] = model

        # Filtrera på datumintervall
        if from_date or to_date:
            date_filter = {}
            if from_date:
                date_filter["$gte"] = from_date
            if to_date:
                date_filter["$lte"] = to_date
            query["timestamp"] = date_filter

        # Hämta resultat från MongoDB
        reports = list(collection.find(query, {"_id": 0}))

        # Filtrera på minsta score i Python (eftersom score ligger inuti evaluation dict)
        if min_score is not None:
            def pass_threshold(report):
                evaluation = report.get("evaluation", {})
                scores = []
                for val in evaluation.values():
                    if isinstance(val, dict) and "Score" in val:
                        scores.append(val["Score"])
                return any(score >= min_score for score in scores)

            reports = list(filter(pass_threshold, reports))

        return {"reports": reports}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Export synthetic data to CSV or JSON, return file path
@router.post("/export")
def export_data(request: ExportRequest):
    try:
        df = ctgan_service.generate(request.num_rows)
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{request.format}") as tmp:
            if request.format == "csv":
                ctgan_service.export_to_csv(df, tmp.name)
            elif request.format == "json":
                ctgan_service.export_to_json(df, tmp.name)
            else:
                raise HTTPException(status_code=400, detail="Format must be 'csv' or 'json'")
            tmp.seek(0)
            return {"message": "Data exported", "path": tmp.name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

        
@router.get("/task-status/{task_id}")
def get_task_status(task_id: str):
    result = AsyncResult(task_id, app=celery_app)
    return {
        "task_id": task_id,
        "state": result.state,
        "info": result.result
    }