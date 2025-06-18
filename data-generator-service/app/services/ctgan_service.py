from sdv.tabular import CTGAN
import pandas as pd

class CTGANService:
    def __init__(self):
        self.model = CTGAN()
        self.trained = False

    def train(self, data: pd.DataFrame):
        self.model.fit(data)
        self.trained = True

    def generate(self, num_rows: int) -> pd.DataFrame:
        if not self.trained:
            raise Exception("Model not trained yet.")
        return self.model.sample(num_rows)


    def save_model(self, file_path: str):
        if not self.trained:
            raise Exception("Model not trained yet.")
        self.model.save(file_path)

    