from ctgan import CTGAN
import pandas as pd
from datetime import datetime
import os
from dateutil.parser import parse as parse_date



def try_parse_date(value):
    try:
        return parse_date(value)
    except Exception:
        return None

class CTGANService:
    def __init__(self):
        # Initialize a CTGAN model and training state
        print("Initializing CTGAN model...")
        batch_size = 5000
        epochs = 100
        self.model = CTGAN(batch_size=batch_size, epochs=epochs, verbose=True)
        self.trained = False
        self.last_training_data = None

    def configure(self, **kwargs):
        # Configure the CTGAN model with custom parameters
        self.model = CTGAN(**kwargs)



    def train(self, data: pd.DataFrame):
        self.validate_data(data)

        categorical_columns = list(data.select_dtypes(include=["object", "category"]).columns)

        self.model.fit(data, discrete_columns=categorical_columns)
        self.trained = True
        self.last_training_data = data.copy()

    def validate_data(self, data: pd.DataFrame) -> bool:
        if data.empty:
            raise ValueError("Training data is empty.")
        
        if data.isnull().values.any():
            print("Missing values detected. Dropping rows with nulls.")
            data.dropna(inplace=True)

        for col in data.columns:
            if data[col].dtype == object:
                sample = data[col].dropna().astype(str).iloc[0]
                parsed = try_parse_date(sample)
                if parsed:
                    try:
                        data[col] = pd.to_datetime(data[col], format="%Y-%m-%d", errors="raise")
                        data[col] = (data[col] - data[col].min()).dt.days
                        print(f"✅ Tolkat '{col}' som datum (YYYY-MM-DD).")
                    except Exception:
                        # Fall back till flexibel parsing
                        data[col] = pd.to_datetime(data[col], errors="coerce")
                        data[col] = (data[col] - data[col].min()).dt.days
                        print(f"⚠️ Tolkat '{col}' som datum med ospecifierat format.")


        return True

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

    def get_training_metadata(self) -> dict:
        # Return metadata about the current training session
        return {
            "trained": self.trained,
            "num_epochs": self.model.epochs if self.trained else None,
            "model_type": "CTGAN",
            "timestamp": datetime.now().isoformat()
        }
