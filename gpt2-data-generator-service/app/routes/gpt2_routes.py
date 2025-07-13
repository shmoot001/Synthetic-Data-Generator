from fastapi import APIRouter, HTTPException, Body
from app.services.gpt2_service import GPT2Service
from app.db.mongodb import get_mongo_collection
from app.models.gpt2_models import TextRequest, ExportRequest
import tempfile

router = APIRouter()
gpt2_service = GPT2Service()


@router.post("/generate", summary="Generate synthetic journal text", tags=["Generation"])
def generate_text(request: TextRequest):
    try:
        result = gpt2_service.generate(request.prompt, request.max_length)
        return {"generated_text": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/generate-multiple", summary="Generate multiple synthetic journal entries", tags=["Generation"])
def generate_multiple_texts(request: TextRequest):
    try:
        results = gpt2_service.generate_multiple(request.prompt, request.max_length, request.count)
        return {"generated_texts": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/preview", summary="Preview synthetic journal", tags=["Data Management"])
def preview_text(max_length: int = 100):
    try:
        text = gpt2_service.preview(max_length)
        return {"preview": text}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/metadata", summary="Get generation metadata", tags=["Model Management"])
def get_metadata():
    return gpt2_service.get_generation_metadata()


@router.post("/save-to-db", summary="Save generated text to MongoDB", tags=["Database"])
def save_to_db(request: TextRequest):
    try:
        text = gpt2_service.generate(request.prompt, request.max_length)
        collection = get_mongo_collection()
        gpt2_service.save_to_mongodb(text, collection)
        return {"message": "Generated text saved to MongoDB"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save-model", summary="Save GPT-2 model", tags=["Model Management"])
def save_model(path: str = Body(..., embed=True)):
    try:
        gpt2_service.save_model(path)
        return {"message": f"Model saved to {path}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/load-model", summary="Load GPT-2 model", tags=["Model Management"])
def load_model(path: str = Body(..., embed=True)):
    try:
        gpt2_service.load_model(path)
        return {"message": f"Model loaded from {path}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/export", summary="Export generated text", tags=["Export"])
def export_text(request: ExportRequest):
    try:
        text = gpt2_service.generate(request.prompt, request.max_length)
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{request.format}") as tmp:
            if request.format == "txt":
                gpt2_service.export_to_txt(text, tmp.name)
            elif request.format == "json":
                gpt2_service.export_to_json(text, tmp.name)
            else:
                raise HTTPException(status_code=400, detail="Format must be 'txt' or 'json'")
            tmp.seek(0)
            return {"message": "Text exported", "path": tmp.name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
