from pydantic import BaseModel
from typing import List

class TrainRequest(BaseModel):
    data: List[dict]
    config: Optional[Dict[str, int]] = None # e.g., {"batch_size": 1000, "epochs": 50}

class GenerateRequest(BaseModel):
    num_rows: int

class EvaluateRequest(BaseModel):
    real_data: List[dict]
    synthetic_data: List[dict]

class ExportRequest(BaseModel):
    format: str  # 'csv' or 'json'
    num_rows: int
