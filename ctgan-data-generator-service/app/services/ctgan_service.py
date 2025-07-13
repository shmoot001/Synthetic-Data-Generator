from ctgan import CTGAN
import pandas as pd
from datetime import datetime
import os
from dateutil.parser import parse as parse_date
from app.services.data_preprocessor import DataPreprocessor
from pathlib import Path


class CTGANService:
    def __init__(self):
        print("🔧 Initializing CTGAN model...")
        self.model = CTGAN(batch_size=5000, epochs=100, verbose=True)
        self.trained = False
        self.last_training_data = None
        self.preprocessor = DataPreprocessor(min_rows=100)

    def configure(self, **kwargs):
        """Reconfigures the CTGAN model with custom parameters."""
        self.model = CTGAN(**kwargs)

    def train(self, data: pd.DataFrame):
        """Validates, cleans and trains the CTGAN model on the input data."""
        self.preprocessor.validate(data)
        clean_data = self.preprocessor.clean(data)
        categorical_columns = self.preprocessor.get_categorical_columns(clean_data)

        self.model.fit(clean_data, discrete_columns=categorical_columns)
        self.trained = True
        self.last_training_data = clean_data.copy()
        self.log_training(f"CTGAN trained on {len(clean_data)} rows and {len(clean_data.columns)} columns.")
        print(" CTGAN training completed successfully.")



    def generate(self, num_rows: int) -> pd.DataFrame:
        # Generate synthetic data using the trained model
        if not self.trained:
            raise Exception("Model not trained yet.")
        return self.model.sample(num_rows)

    def save_model(self, file_path: str):
        # Save the trained model to disk
        if not self.trained:
            raise Exception("Model not trained yet.")
        file_path = Path(file_path)
        file_path.parent.mkdir(parents=True, exist_ok=True)  # säkerställ att mappen finns
        self.model.save(str(file_path))


    def load_model(self, file_path: str):
        # Load a pre-trained model from disk
        self.model = CTGAN.load(file_path)
        self.trained = True

    def preview(self, num_rows: int = 5) -> pd.DataFrame:
        # Return a preview of synthetic data
        if not self.trained:
            raise Exception("Model not trained yet.")
        return self.model.sample(num_rows)


    def save_to_mongodb(self, data: pd.DataFrame, collection):
        # Save generated data to a MongoDB collection
        records = data.to_dict(orient='records')
        collection.insert_many(records)

    def log_training(self, message: str, log_path: str = "logs/training.log"):
        # Log training messages to a file with a timestamp
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        with open(log_path, "a") as f:
            f.write(f"{datetime.now()} - {message}\n")

    def export_to_csv(self, data: pd.DataFrame, file_path: str):
        # Export synthetic data to a CSV file
        data.to_csv(file_path, index=False)

    def export_to_json(self, data: pd.DataFrame, file_path: str):
        # Export synthetic data to a JSON file
        data.to_json(file_path, orient='records', lines=True)

    def get_training_metadata(self) -> dict:
        # Return metadata about the current training session
        return {
            "trained": self.trained,
            "num_epochs": self.model.epochs if self.trained else None,
            "model_type": "CTGAN",
            "timestamp": datetime.now().isoformat()
        }

ctgan_service = CTGANService()
