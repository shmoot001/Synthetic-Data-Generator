from sdv.single_table import TVAESynthesizer
from sdv.metadata import SingleTableMetadata
import pandas as pd
from datetime import datetime
import os
from dateutil.parser import parse as parse_date
from app.services.data_preprocessor import DataPreprocessor
from pathlib import Path


class TVAEService:
    def __init__(self):
        print("🔧 TVAEService initialized (model created during training)...")
        self.model = None
        self.trained = False
        self.last_training_data = None
        self.metadata = None
        self.preprocessor = DataPreprocessor(min_rows=100)

    def configure(self, **kwargs):
        """Reconfigures the TVAE model with custom parameters (metadata required)."""
        if self.metadata is None:
            raise Exception("Metadata must be set before configuring the model.")
        self.model = TVAESynthesizer(metadata=self.metadata, **kwargs)

    def train(self, data: pd.DataFrame, epochs=100, batch_size=1000, verbose=True):
        """Validates, cleans and trains the TVAE model on the input data."""
        self.preprocessor.validate(data)
        clean_data = self.preprocessor.clean(data)
        self.metadata = SingleTableMetadata()
        self.metadata.detect_from_dataframe(data=clean_data)

        self.model = TVAESynthesizer(metadata=self.metadata, epochs=epochs, batch_size=batch_size, verbose=verbose)
        self.model.fit(clean_data)

        self.trained = True
        self.last_training_data = clean_data.copy()
        self.log_training(f"TVAE trained on {len(clean_data)} rows and {len(clean_data.columns)} columns.")
        print("✅ TVAE training completed successfully.")

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
        self.model = TVAESynthesizer.load(file_path)
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


# Skapa instans av tjänsten
tvae_service = TVAEService()
