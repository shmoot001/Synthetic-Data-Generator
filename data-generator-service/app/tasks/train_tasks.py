import pandas as pd
from celery_app import celery_app
from app.services.ctgan_service import CTGANService

@celery_app.task(name="train_ctgan_model")
def train_ctgan_model(data_dict: dict, config: dict, model_path: str):
    try:
        df = pd.DataFrame(data_dict["rows"])
        service = CTGANService()
        service.configure(**config)
        service.train(df)
        service.save_model(model_path)
        service.log_training(f"✅ Model trained and saved to {model_path}")
        return {"status": "success", "model_path": model_path}
    except Exception as e:
        service.log_training(f"❌ Training failed: {e}")
        return {"status": "failed", "error": str(e)}
