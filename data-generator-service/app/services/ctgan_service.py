from sdv.tabular import CTGAN
import pandas as pd
from datetime import datetime
import os

class CTGANService:
    def __init__(self):
        # Initialize a CTGAN model and training state
        self.model = CTGAN()
        self.trained = False
        self.last_training_data = None

    def configure(self, **kwargs):
        # Configure the CTGAN model with custom parameters
        self.model = CTGAN(**kwargs)

    def train(self, data: pd.DataFrame):
        # Train the CTGAN model on the given DataFrame
        self.model.fit(data)
        self.trained = True
        self.last_training_data = data 

    def generate_with_evaluation(self, num_rows: int, eval_collection=None) -> dict:
        if not self.trained or self.last_training_data is None:
            raise Exception("Model not trained or no training data available.")

        synthetic_data = self.model.sample(num_rows)

        from sdmetrics.single_table import QualityReport
        report = QualityReport()
        report.generate(self.last_training_data, synthetic_data)

        results = report.get_results()

        # Spara till MongoDB om collection är angiven
        if eval_collection:
            self.save_evaluation_report(results, eval_collection, metadata={
                "model": "CTGAN",
                "rows_generated": num_rows
            })

        return {
            "synthetic_data": synthetic_data,
            "evaluation": results
        }



    def generate(self, num_rows: int) -> pd.DataFrame:
        # Generate synthetic data using the trained model
        if not self.trained:
            raise Exception("Model not trained yet.")
        return self.model.sample(num_rows)

    def save_model(self, file_path: str):
        # Save the trained model to disk
        if not self.trained:
            raise Exception("Model not trained yet.")
        self.model.save(file_path)

    def load_model(self, file_path: str):
        # Load a pre-trained model from disk
        self.model = CTGAN.load(file_path)
        self.trained = True

    def evaluate(self, real_data: pd.DataFrame, synthetic_data: pd.DataFrame) -> dict:
        # Evaluate the quality of the synthetic data using SDMetrics
        from sdmetrics.single_table import QualityReport
        report = QualityReport()
        report.generate(real_data, synthetic_data)
        return report.get_results()

    def preview(self, num_rows: int = 5) -> pd.DataFrame:
        # Return a preview of synthetic data
        if not self.trained:
            raise Exception("Model not trained yet.")
        return self.model.sample(num_rows)

    def save_evaluation_report(self, evaluation_result: dict, collection, metadata: dict = None):
        report_doc = {
            "timestamp": datetime.now().isoformat(),
            "evaluation": evaluation_result,
        }
        if metadata:
            report_doc.update(metadata)
        collection.insert_one(report_doc)


    def save_to_mongodb(self, data: pd.DataFrame, collection):
        # Save generated data to a MongoDB collection
        records = data.to_dict(orient='records')
        collection.insert_many(records)

    def log_training(self, message: str, log_path: str = "training.log"):
        # Log training messages to a file with a timestamp
        with open(log_path, "a") as f:
            f.write(f"{datetime.now()} - {message}\n")

    def export_to_csv(self, data: pd.DataFrame, file_path: str):
        # Export synthetic data to a CSV file
        data.to_csv(file_path, index=False)

    def export_to_json(self, data: pd.DataFrame, file_path: str):
        # Export synthetic data to a JSON file
        data.to_json(file_path, orient='records', lines=True)

    def validate_data(self, data: pd.DataFrame) -> bool:
        # Validate input data before training (check for nulls or emptiness)
        if data.isnull().values.any():
            raise ValueError("Training data contains missing values.")
        if data.empty:
            raise ValueError("Training data is empty.")
        return True

    def get_training_metadata(self) -> dict:
        # Return metadata about the current training session
        return {
            "trained": self.trained,
            "num_epochs": self.model.epochs if self.trained else None,
            "model_type": "CTGAN",
            "timestamp": datetime.now().isoformat()
        }
