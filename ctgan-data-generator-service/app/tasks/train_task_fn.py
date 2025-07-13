import pandas as pd

def train_ctgan_model_func(payload: dict, model_path: str, verbose: bool = False):
    from app.services.ctgan_service import ctgan_service  # eller liknande
    service = ctgan_service

    try:
        df = pd.DataFrame(payload["rows"])
        service.configure(batch_size=1000, epochs=10, verbose=verbose)
        service.train(df)
        service.save_model(model_path)
        return {"status": "✅ Model trained and saved."}

    except Exception as e:
        if service:
            service.log_training(f"❌ Training failed: {e}")
        raise