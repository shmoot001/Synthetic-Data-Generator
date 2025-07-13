from pydantic import BaseModel
from typing import List, Dict, Optional

class TrainRequest(BaseModel):
    data: List[dict]
    config: Optional[Dict[str, str]] = None  # e.g., {"field_names": "auto"}

class GenerateRequest(BaseModel):
    num_rows: int

class EvaluateRequest(BaseModel):
    real_data: List[dict]
    synthetic_data: List[dict]

class ExportRequest(BaseModel):
    format: str  # 'csv' or 'json'
    num_rows: int
