from fastapi import FastAPI
from app.routes import gpt2_routes
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import FileResponse

app = FastAPI(
    title="Synthetic Journal Generator",
    version="1.0.0",
    description="Generates synthetic patient journals using GPT-2.",
)
app.include_router(gpt2_routes.router, prefix="/gpt2", tags=["GPT-2"])

@app.get("/")
def root():
    return {"message": "GPT-2 Journal Generator Service is running"}
