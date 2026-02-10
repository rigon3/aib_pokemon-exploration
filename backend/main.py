from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
from pathlib import Path

app = FastAPI(title="Pokemon Battle AI")

DATA_DIR = Path(__file__).parent / "data"
POKEMON_CSV = DATA_DIR / "pokemon.csv"

pokemon_df = pd.read_csv(POKEMON_CSV)

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/pokemon/{pokemon_id}")
def get_pokemon(pokemon_id: int):
    row = pokemon_df[pokemon_df["#"] == pokemon_id]
    if row.empty:
        raise HTTPException(status_code=404, detail="Pokemon not found")
    return row.iloc[0].to_dict()

class PredictRequest(BaseModel):
    p1_id: int
    p2_id: int

@app.post("/predict", status_code=501)
def predict(req: PredictRequest):
    # TODO:  integrate the trained model here
    raise HTTPException(status_code=501, detail="Model not integrated yet")
