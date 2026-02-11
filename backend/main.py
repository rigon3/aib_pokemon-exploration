from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from pathlib import Path

app = FastAPI(title="Pokemon Battle AI")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data"
POKEMON_CSV = DATA_DIR / "pokemon.csv"
COMBATS_CSV = DATA_DIR / "combats.csv"

pokemon_df = pd.read_csv(POKEMON_CSV)
combats_df = pd.read_csv(COMBATS_CSV)

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/pokemon/{pokemon_id}")
def get_pokemon(pokemon_id: int):
    row = pokemon_df[pokemon_df["#"] == pokemon_id]
    if row.empty:
        raise HTTPException(status_code=404, detail="Pokemon not found")
    pokemon_data = row.iloc[0].to_dict()
    # Convert NaN to None for JSON serialization
    pokemon_data = {k: (None if pd.isna(v) else v) for k, v in pokemon_data.items()}
    return pokemon_data

class PredictRequest(BaseModel):
    p1_id: int
    p2_id: int

@app.post("/predict")
def predict(req: PredictRequest):
    """Predict battle outcome based on Pokemon stats"""
    try:
        # Get both pokemon
        p1_row = pokemon_df[pokemon_df["#"] == req.p1_id]
        p2_row = pokemon_df[pokemon_df["#"] == req.p2_id]
        
        if p1_row.empty or p2_row.empty:
            raise HTTPException(status_code=404, detail="One or both Pokemon not found")
        
        p1 = p1_row.iloc[0]
        p2 = p2_row.iloc[0]
        
        # Calculate win probability based on total stats
        p1_total = p1[['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed']].sum()
        p2_total = p2[['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed']].sum()
        
        # Simple prediction: higher total stats wins
        winner_id = req.p1_id if p1_total >= p2_total else req.p2_id
        winner_name = p1['Name'] if p1_total >= p2_total else p2['Name']
        
        # Calculate win probability (0-100)
        total = p1_total + p2_total
        if winner_id == req.p1_id:
            confidence = int((p1_total / total) * 100)
        else:
            confidence = int((p2_total / total) * 100)
        
        return {
            "winner_id": int(winner_id),
            "winner_name": str(winner_name),
            "confidence": confidence,
            "p1_total_stats": int(p1_total),
            "p2_total_stats": int(p2_total),
            "summary": f"{winner_name} wins with {confidence}% confidence based on total stats ({int(max(p1_total, p2_total))} vs {int(min(p1_total, p2_total))})"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
