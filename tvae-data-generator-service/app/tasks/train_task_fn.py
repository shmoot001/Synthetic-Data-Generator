import pandas as pd

def train_tvae_model_func(payload: dict, config: dict, model_path: str, verbose: bool = False):
    from app.services.tvae_service import tvae_service
    service = tvae_service

    try:
        df = pd.DataFrame(payload["rows"])
        service.configure(**config)
        service.train(df)
        service.save_model(model_path)
        return {"status": "✅ Model trained and saved."}

    except Exception as e:
        if service:
            service.log_training(f"❌ Training failed: {e}")
        raise
