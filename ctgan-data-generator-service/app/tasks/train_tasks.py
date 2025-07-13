import pandas as pd
from app.celery_app import celery_app
from app.services.ctgan_service import CTGANService
from app.tasks.train_task_fn import train_ctgan_model_func

@celery_app.task(name="train_ctgan_model")
def train_ctgan_model(payload: dict, model_name:str ,verbose: bool = False):
    model_path = f"trained_models/{model_name}.pkl"
    return train_ctgan_model_func(payload, model_path, verbose)
