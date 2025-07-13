from fastapi import FastAPI
from app.routes import tvae_routes
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import FileResponse


app = FastAPI(
    title="Synthetic Data Generator",
    version="1.0.0",
    description="Trains and generates synthetic data using TVAE.",
)
app.include_router(tvae_routes.router, prefix="/tvae", tags=["TVAE"])

@app.get("/")
def root():
    return {"message": "TVAE Data Generator Service is running"}
