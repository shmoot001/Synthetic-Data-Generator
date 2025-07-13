import pytest
import pandas as pd
from ctgan_service.ctgan_service import CTGANService

def test_train_sets_trained_flag():
    df = pd.DataFrame({
        "gender": ["M", "F", "M", "F"],
        "age": [30, 25, 40, 35]
    })
    service = CTGANService()
    service.train(df)
    assert service.trained
    assert isinstance(service.last_training_data, pd.DataFrame)

def test_generate_without_train_raises():
    service = CTGANService()
    with pytest.raises(Exception, match="Model not trained yet"):
        service.generate(5)

def test_training_metadata_keys():
    df = pd.DataFrame({
        "name": ["A", "B", "C"],
        "score": [10, 20, 30]
    })
    service = CTGANService()
    service.train(df)
    meta = service.get_training_metadata()
    assert set(meta.keys()) == {"trained", "num_epochs", "model_type", "timestamp"}
