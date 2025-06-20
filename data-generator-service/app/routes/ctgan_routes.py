import tempfile
import os
import pandas as pd
from fastapi import APIRouter, File, UploadFile, HTTPException, Body
from pydantic import BaseModel
from app.services.ctgan_service import CTGANService
from app.db.mongodb import get_mongo_collection
from app.models.request_models import TrainRequest, GenerateRequest, EvaluateRequest, ExportRequest
from io import StringIO
from typing import List




router = APIRouter()
ctgan_service = CTGANService()


# Train the model using raw JSON data (sent in request body)
@router.post("/train")
def train_model(request: TrainRequest):
    try:
        df = pd.DataFrame(request.data)
        ctgan_service.validate_data(df)  # Ensure input data is valid
        ctgan_service.train(df)          # Train CTGAN on the data
        return {"message": "Model trained successfully"}
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
async def train_from_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        decoded = contents.decode("utf-8")

        # Read file based on extension
        if file.filename.endswith(".csv"):
            df = pd.read_csv(StringIO(decoded))
        elif file.filename.endswith(".json"):
            df = pd.read_json(StringIO(decoded))
        else:
            raise HTTPException(status_code=400, detail="Only .csv or .json files are supported")

        ctgan_service.validate_data(df)
        ctgan_service.train(df)
        return {"message": f"Model trained on {len(df)} rows from file {file.filename}"}
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
