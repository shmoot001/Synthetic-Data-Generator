from fastapi import APIRouter, File, UploadFile, HTTPException
import pandas as pd
from app.services.ctgan_service import CTGANService
from io import StringIO

router = APIRouter()
ctgan_service = CTGANService()

class TrainRequest(BaseModel):
    data: list[dict]  # Lista av rader (dvs dicts) som vi tränar på

class GenerateRequest(BaseModel):
    num_rows: int

@router.post("/train")
def train_model(request: TrainRequest):
    try:
        df = pd.DataFrame(request.data)
        ctgan_service.train(df)
        return {"message": "Model trained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
def generate_data(request: GenerateRequest):
    try:
        synthetic_df = ctgan_service.generate(request.num_rows)
        return synthetic_df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/train-file")
async def train_from_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        decoded = contents.decode("utf-8")

        # Välj parser beroende på filtyp
        if file.filename.endswith(".csv"):
            df = pd.read_csv(StringIO(decoded))
        elif file.filename.endswith(".json"):
            df = pd.read_json(StringIO(decoded))
        else:
            raise HTTPException(status_code=400, detail="Only .csv or .json files are supported")

        ctgan_service.train(df)
        return {"message": f"Model trained on {len(df)} rows from file {file.filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))