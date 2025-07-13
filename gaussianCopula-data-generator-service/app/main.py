from fastapi import FastAPI
from app.routes import gaussian_routes
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import FileResponse

app = FastAPI(
    title="Synthetic Data Generator",
    version="1.0.0",
    description="Trains and generates synthetic data using GaussianCopula.",
)
app.include_router(gaussian_routes.router, prefix="/gaussian", tags=["GaussianCopula"])

@app.get("/")
def root():
    return {"message": "GaussianCopula Data Generator Service is running"}
