import pytest
import pandas as pd
from ctgan_service.data_preprocessor import DataPreprocessor

def test_valid_data_passes_validation():
    df = pd.DataFrame({
        "name": ["Alice", "Bob", "Charlie"],
        "age": [25, 30, 35]
    })
    pre = DataPreprocessor(min_rows=3)
    pre.validate(df)  # should not raise

def test_too_few_rows_raises():
    df = pd.DataFrame({"x": [1]})
    pre = DataPreprocessor(min_rows=2)
    with pytest.raises(ValueError, match="Too few rows"):
        pre.validate(df)

def test_clean_removes_nulls():
    df = pd.DataFrame({
        "col1": ["2020-01-01", None],
        "col2": [1, 2]
    })
    pre = DataPreprocessor()
    cleaned = pre.clean(df)
    assert cleaned.shape[0] == 1

def test_date_column_is_transformed():
    df = pd.DataFrame({
        "date": ["2020-01-01", "2020-01-02", "2020-01-03"]
    })
    pre = DataPreprocessor()
    cleaned = pre.clean(df)
    assert cleaned["date"].dtype in [int, "int64"]
    assert all(cleaned["date"] == [0, 1, 2])
