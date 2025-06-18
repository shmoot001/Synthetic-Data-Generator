from fastapi import FastAPI
from app.routes import ctgan_routes

app = FastAPI(title="Synthetic Data Generator")
app.include_router(ctgan_routes.router, prefix="/ctgan", tags=["CTGAN"])

@app.get("/")
def root():
    return {"message": "CTGAN Data Generator Service is running"}
