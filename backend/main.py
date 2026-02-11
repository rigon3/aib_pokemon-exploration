from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import json
import joblib
from pathlib import Path

from .feature_engineering import build_features

app = FastAPI(title="Pokemon Battle AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data"
MODEL_DIR = Path(__file__).parent / "model"
POKEMON_CSV = DATA_DIR / "pokemon.csv"
MODEL_PATH = MODEL_DIR / "battle_model_XGBoost.pkl"
FEATURE_COLS_PATH = MODEL_DIR / "feature_columns_XGBoost.json"

STAT_COLS = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed']

pokemon_df = pd.read_csv(POKEMON_CSV)

try:
    model = joblib.load(MODEL_PATH)
    with open(FEATURE_COLS_PATH, "r") as f:
        feature_columns = json.load(f)
except FileNotFoundError:
    print(f"WARNING: Model files not found in {MODEL_DIR}")
    print(f"  Expected: {MODEL_PATH}")
    print(f"  Expected: {FEATURE_COLS_PATH}")
    model = None
    feature_columns = None


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/pokemon/{pokemon_id}")
def get_pokemon(pokemon_id: int):
    row = pokemon_df[pokemon_df["#"] == pokemon_id]
    if row.empty:
        raise HTTPException(status_code=404, detail="Pokemon not found")
    data = row.iloc[0].to_dict()
    return {k: (None if pd.isna(v) else v) for k, v in data.items()}


class PredictRequest(BaseModel):
    p1_id: int
    p2_id: int


@app.post("/predict")
def predict(req: PredictRequest):
    if model is None or feature_columns is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Place model files in backend/model/",
        )

    p1_row = pokemon_df[pokemon_df["#"] == req.p1_id]
    p2_row = pokemon_df[pokemon_df["#"] == req.p2_id]

    if p1_row.empty:
        raise HTTPException(status_code=404, detail=f"Pokemon {req.p1_id} not found")
    if p2_row.empty:
        raise HTTPException(status_code=404, detail=f"Pokemon {req.p2_id} not found")

    p1 = p1_row.iloc[0]
    p2 = p2_row.iloc[0]

    features_df = build_features(p1, p2, feature_columns)

    prediction = model.predict(features_df)[0]
    probabilities = model.predict_proba(features_df)[0]

    if prediction == 1:
        winner_id = req.p1_id
        winner_name = str(p1["Name"])
        confidence = round(float(probabilities[1]) * 100)
    else:
        winner_id = req.p2_id
        winner_name = str(p2["Name"])
        confidence = round(float(probabilities[0]) * 100)

    p1_total = int(p1[STAT_COLS].sum())
    p2_total = int(p2[STAT_COLS].sum())

    return {
        "winner_id": int(winner_id),
        "winner_name": winner_name,
        "confidence": confidence,
        "p1_total_stats": p1_total,
        "p2_total_stats": p2_total,
        "summary": (
            f"{winner_name} wins with {confidence}% confidence "
            f"(XGBoost model prediction based on stats, types, and legendary status)"
        ),
    }
