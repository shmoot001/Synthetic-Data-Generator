from pydantic import BaseModel
from typing import List

class TrainRequest(BaseModel):
    data: List[dict]

class GenerateRequest(BaseModel):
    num_rows: int

class EvaluateRequest(BaseModel):
    real_data: List[dict]
    synthetic_data: List[dict]

class ExportRequest(BaseModel):
    format: str  # 'csv' or 'json'
    num_rows: int
