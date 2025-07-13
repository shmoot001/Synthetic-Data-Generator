from pydantic import BaseModel

class TextRequest(BaseModel):
    prompt: str
    max_length: int = 200
    count: int = 1 

class ExportRequest(BaseModel):
    prompt: str
    max_length: int = 200
    format: str  # "txt" or "json"
