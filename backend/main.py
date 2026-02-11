from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from pathlib import Path

app = FastAPI(title="Pokemon Battle AI")

# Type effectiveness chart (what types are strong/weak against)
TYPE_MATCHUPS = {
    "Normal": {"weak_to": ["Fighting"], "strong_against": []},
    "Fire": {"weak_to": ["Water", "Ground", "Rock"], "strong_against": ["Grass", "Ice", "Bug", "Steel"]},
    "Water": {"weak_to": ["Electric", "Grass"], "strong_against": ["Fire", "Ground", "Rock"]},
    "Electric": {"weak_to": ["Ground"], "strong_against": ["Water", "Flying"]},
    "Grass": {"weak_to": ["Fire", "Ice", "Poison", "Flying", "Bug"], "strong_against": ["Water", "Ground", "Rock"]},
    "Ice": {"weak_to": ["Fire", "Fighting", "Rock", "Steel"], "strong_against": ["Grass", "Flying", "Ground", "Dragon"]},
    "Fighting": {"weak_to": ["Flying", "Psychic", "Fairy"], "strong_against": ["Normal", "Ice", "Rock", "Dark", "Steel"]},
    "Poison": {"weak_to": ["Ground", "Psychic"], "strong_against": ["Grass", "Fairy"]},
    "Ground": {"weak_to": ["Water", "Grass", "Ice"], "strong_against": ["Fire", "Electric", "Poison", "Rock", "Steel"]},
    "Flying": {"weak_to": ["Electric", "Ice", "Rock"], "strong_against": ["Grass", "Fighting", "Bug"]},
    "Psychic": {"weak_to": ["Bug", "Ghost", "Dark"], "strong_against": ["Fighting", "Poison"]},
    "Bug": {"weak_to": ["Fire", "Flying", "Rock"], "strong_against": ["Grass", "Psychic", "Dark"]},
    "Rock": {"weak_to": ["Water", "Grass", "Fighting", "Ground", "Steel"], "strong_against": ["Fire", "Ice", "Flying", "Bug"]},
    "Ghost": {"weak_to": ["Ghost", "Dark"], "strong_against": ["Psychic", "Ghost"]},
    "Dragon": {"weak_to": ["Ice", "Dragon", "Fairy"], "strong_against": ["Dragon"]},
    "Dark": {"weak_to": ["Fighting", "Bug", "Fairy"], "strong_against": ["Psychic", "Ghost"]},
    "Steel": {"weak_to": ["Fire", "Water", "Ground"], "strong_against": ["Ice", "Grass", "Rock", "Fairy"]},
    "Fairy": {"weak_to": ["Poison", "Steel"], "strong_against": ["Fighting", "Dragon", "Dark"]},
}

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
    p1_id: int | None = None
    p2_id: int | None = None
    p1_name: str | None = None
    p2_name: str | None = None

def find_pokemon(pokemon_id: int | None = None, pokemon_name: str | None = None):
    """
    Find a Pokemon by ID or name.
    Name search is case-insensitive.
    """
    if pokemon_id is not None:
        row = pokemon_df[pokemon_df["#"] == pokemon_id]
    elif pokemon_name is not None:
        row = pokemon_df[pokemon_df["Name"].str.lower() == pokemon_name.lower()]
    else:
        return None
    
    return row.iloc[0] if not row.empty else None

@app.post("/predict")
def predict(req: PredictRequest):
    """Predict battle outcome based on Pokemon stats and type matchups
    
    Can use either Pokemon ID or name:
    - By ID: {"p1_id": 1, "p2_id": 4}
    - By name: {"p1_name": "Bulbasaur", "p2_name": "Charmander"}
    - Mixed: {"p1_id": 1, "p2_name": "Charmander"}
    """
    try:
        # Get both pokemon (by ID or name)
        p1 = find_pokemon(req.p1_id, req.p1_name)
        p2 = find_pokemon(req.p2_id, req.p2_name)
        
        if p1 is None or p2 is None:
            raise HTTPException(status_code=404, detail="One or both Pokemon not found")
        
        # Calculate base stats
        stat_cols = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed']
        p1_total = p1[stat_cols].sum()
        p2_total = p2[stat_cols].sum()
        
        # Calculate type advantage multipliers
        p1_type_multiplier = calculate_type_advantage(
            [p1['Type 1'], p1['Type 2']], 
            [p2['Type 1'], p2['Type 2']]
        )
        p2_type_multiplier = calculate_type_advantage(
            [p2['Type 1'], p2['Type 2']], 
            [p1['Type 1'], p1['Type 2']]
        )
        
        # Calculate final scores (stats + type advantage)
        p1_score = p1_total * p1_type_multiplier
        p2_score = p2_total * p2_type_multiplier
        
        # Determine winner
        winner_id = req.p1_id if p1_score >= p2_score else req.p2_id
        winner_name = p1['Name'] if p1_score >= p2_score else p2['Name']
        
        # Calculate win probability (0-100)
        total = p1_score + p2_score
        if winner_id == req.p1_id:
            confidence = int((p1_score / total) * 100)
        else:
            confidence = int((p2_score / total) * 100)
        
        return {
            "winner_id": int(winner_id),
            "winner_name": str(winner_name),
            "confidence": confidence,
            "p1_total_stats": int(p1_total),
            "p2_total_stats": int(p2_total),
            "p1_type_multiplier": round(p1_type_multiplier, 2),
            "p2_type_multiplier": round(p2_type_multiplier, 2),
            "p1_final_score": round(p1_score, 2),
            "p2_final_score": round(p2_score, 2),
            "summary": f"{winner_name} wins with {confidence}% confidence (Stats: {int(max(p1_total, p2_total))} vs {int(min(p1_total, p2_total))}, Type advantage considered)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_type_advantage(attacker_types, defender_types):
    """
    Calculate type advantage multiplier.
    Returns > 1.0 if attacker is strong against defender
    Returns < 1.0 if attacker is weak against defender
    """
    multiplier = 1.0
    
    # Clean up types (remove NaN values)
    attacker_types = [t for t in attacker_types if pd.notna(t)]
    defender_types = [t for t in defender_types if pd.notna(t)]
    
    for att_type in attacker_types:
        if att_type in TYPE_MATCHUPS:
            matchup = TYPE_MATCHUPS[att_type]
            # Check if this type is strong against any defender type
            for def_type in defender_types:
                if def_type in matchup["strong_against"]:
                    multiplier *= 1.3  # 30% boost for advantage
                if def_type in matchup["weak_to"]:
                    multiplier *= 0.7  # 30% penalty for weakness
    
    return multiplier
