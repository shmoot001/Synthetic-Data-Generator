import pandas as pd
from datetime import datetime
import os
from pathlib import Path
from sdv.single_table import GaussianCopulaSynthesizer
from sdv.metadata import SingleTableMetadata


class GaussianCopulaService:
    def __init__(self):
        print("🔧 Initializing GaussianCopulaSynthesizer...")
        self.metadata = None
        self.model = None
        self.trained = False
        self.last_training_data = None

    def configure(self, **kwargs):
        """Reconfigures the synthesizer with custom parameters."""
        if self.metadata is None:
            raise Exception("Metadata must be defined before configuring the synthesizer.")
        self.model = GaussianCopulaSynthesizer(metadata=self.metadata, **kwargs)

    def train(self, data: pd.DataFrame):
        """Creates metadata and trains the synthesizer."""
        if data.empty:
            raise ValueError("Dataset is empty.")
        self.metadata = SingleTableMetadata()
        self.metadata.detect_from_dataframe(data)
        self.model = GaussianCopulaSynthesizer(metadata=self.metadata)
        self.model.fit(data)
        self.trained = True
        self.last_training_data = data.copy()
        self.log_training(f"GaussianCopulaSynthesizer trained on {len(data)} rows and {len(data.columns)} columns.")
        print(" GaussianCopula training completed successfully.")

    def generate(self, num_rows: int) -> pd.DataFrame:
        if not self.trained:
            raise Exception("Model not trained yet.")
        return self.model.sample(num_rows)

    def save_model(self, dir_path: str):
        if not self.trained:
            raise Exception("Model not trained yet.")
        dir_path = Path(dir_path)
        dir_path.mkdir(parents=True, exist_ok=True)
        self.model.save(dir_path)

    def load_model(self, dir_path: str):
        self.model = GaussianCopulaSynthesizer.load(dir_path)
        self.metadata = self.model.metadata
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
            "model_type": "GaussianCopulaSynthesizer",
            "timestamp": datetime.now().isoformat()
        }


gaussian_service = GaussianCopulaService()
