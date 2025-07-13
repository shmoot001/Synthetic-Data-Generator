import pandas as pd
from app.celery_app import celery_app
from app.services.tvae_service import TVAEService
from app.tasks.train_task_fn import train_tvae_model_func

@celery_app.task(name="train_tvae_model")
def train_tvae_model(payload: dict, config: dict, model_name: str, verbose: bool = False):
    model_path = f"trained_models/{model_name}.pkl"
    return train_tvae_model_func(payload, config, model_path, verbose)
