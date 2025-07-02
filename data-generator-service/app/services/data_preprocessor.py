import pandas as pd
from typing import List, Optional
from datetime import datetime

class DataPreprocessor:
    def __init__(self, min_rows: int = 1000):
        self.min_rows = min_rows

    def validate(self, data: pd.DataFrame) -> None:
        """Validates whether the dataset is suitable for training. Raises error if not."""
        if data.empty:
            raise ValueError(" The dataset is empty.")
        if data.shape[0] < self.min_rows:
            raise ValueError(f" Too few rows. Minimum required is {self.min_rows}.")
        if data.shape[1] < 2:
            raise ValueError(" Dataset must contain at least two columns.")
        for col in data.columns:
            if data[col].nunique() <= 1:
                raise ValueError(f" Column '{col}' contains only a single unique value.")
        if data.isnull().sum().sum() > 0:
            print(f"  Missing values detected. Total nulls: {data.isnull().sum().sum()}")

    def clean(self, data: pd.DataFrame) -> pd.DataFrame:
        """Cleans and transforms the data. Returns a new DataFrame."""
        data = data.copy()
        data.dropna(inplace=True)
        data = self._handle_potential_dates(data)
        return data

    def _handle_potential_dates(self, data: pd.DataFrame) -> pd.DataFrame:
        """Converts string columns that appear to be dates into numeric format (number of days)."""
        for col in data.columns:
            if data[col].dtype == object:
                try:
                    sample = data[col].dropna().astype(str).iloc[0]
                    parsed = self._try_parse_date(sample)
                    if parsed:
                        data[col] = pd.to_datetime(data[col], errors="coerce")
                        data[col] = (data[col] - data[col].min()).dt.days
                        print(f" Column '{col}' interpreted as a date and converted to days.")
                except Exception:
                    pass
        return data

    def _try_parse_date(self, value: str) -> Optional[datetime]:
        """Tries to parse a string as a date using common formats."""
        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(value, fmt)
            except ValueError:
                continue
        return None

    def get_categorical_columns(self, data: pd.DataFrame) -> List[str]:
        """Returns a list of categorical columns (object or category)."""
        return list(data.select_dtypes(include=["object", "category"]).columns)
