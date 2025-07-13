from fastapi import FastAPI
from app.routes import ctgan_routes
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import FileResponse


app = FastAPI(
    title="Synthetic Data Generator",
    version="1.0.0",
    description="Trains and generates synthetic data using CTGAN.",
)
app.include_router(ctgan_routes.router, prefix="/ctgan", tags=["CTGAN"])

@app.get("/")
def root():
    return {"message": "CTGAN Data Generator Service is running"}


