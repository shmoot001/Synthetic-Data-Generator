from sdv.tabular import TVAE
import pandas as pd
from datetime import datetime
import os
from dateutil.parser import parse as parse_date
from app.services.data_preprocessor import DataPreprocessor
from pathlib import Path


class TVAEService:
    def __init__(self):
        print("🔧 Initializing TVAE model...")
        self.model = TVAE(epochs=100, verbose=True)
        self.trained = False
        self.last_training_data = None
        self.preprocessor = DataPreprocessor(min_rows=100)

    def configure(self, **kwargs):
        """Reconfigures the TVAE model with custom parameters."""
        self.model = TVAE(**kwargs)

    def train(self, data: pd.DataFrame):
        """Validates, cleans and trains the TVAE model on the input data."""
        self.preprocessor.validate(data)
        clean_data = self.preprocessor.clean(data)
        categorical_columns = self.preprocessor.get_categorical_columns(clean_data)

        self.model.fit(clean_data, discrete_columns=categorical_columns)
        self.trained = True
        self.last_training_data = clean_data.copy()
        self.log_training(f"TVAE trained on {len(clean_data)} rows and {len(clean_data.columns)} columns.")
        print(" TVAE training completed successfully.")

    def generate(self, num_rows: int) -> pd.DataFrame:
        if not self.trained:
            raise Exception("Model not trained yet.")
        return self.model.sample(num_rows)

    def save_model(self, file_path: str):
        if not self.trained:
            raise Exception("Model not trained yet.")
        file_path = Path(file_path)
        file_path.parent.mkdir(parents=True, exist_ok=True)
        self.model.save(str(file_path))

    def load_model(self, file_path: str):
        self.model = TVAE.load(file_path)
        self.trained = True

    def preview(self, num_rows: int = 5) -> pd.DataFrame:
        if not self.trained:
            raise Exception("Model not trained yet.")
        return self.model.sample(num_rows)

    def save_to_mongodb(self, data: pd.DataFrame, collection):
        records = data.to_dict(orient='records')
        collection.insert_many(records)

    def log_training(self, message: str, log_path: str = "logs/training.log"):
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        with open(log_path, "a") as f:
            f.write(f"{datetime.now()} - {message}\n")

    def export_to_csv(self, data: pd.DataFrame, file_path: str):
        data.to_csv(file_path, index=False)

    def export_to_json(self, data: pd.DataFrame, file_path: str):
        data.to_json(file_path, orient='records', lines=True)

    def get_training_metadata(self) -> dict:
        return {
            "trained": self.trained,
            "num_epochs": self.model.epochs if self.trained else None,
            "model_type": "TVAE",
            "timestamp": datetime.now().isoformat()
        }

tvae_service = TVAEService()
