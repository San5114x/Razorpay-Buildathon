import os
import random
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "ml", "fraud_model.pkl")
DATA_PATH = os.path.join(BASE_DIR, "ml", "creditcard.csv")

# Load trained model
model = joblib.load(MODEL_PATH)

# Load dataset once
dataset = pd.read_csv(DATA_PATH)

# Remove target column
feature_columns = [c for c in dataset.columns if c != "Class"]


def predict_fraud(amount, day, international, hour, chip, online):
    """
    Generates a realistic transaction using the original dataset structure
    so the trained model receives the exact feature names it expects.
    """

    # Pick a random transaction from the dataset
    sample = dataset.sample(1).copy()

    # Modify only the fields we can simulate
    sample["Amount"] = amount
    sample["Time"] = hour * 3600 + random.randint(0, 3599)

    # Keep only training features
    sample = sample[feature_columns]

    prediction = model.predict(sample)[0]

    return bool(prediction)