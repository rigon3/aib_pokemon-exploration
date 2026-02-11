import pandas as pd


STAT_COLS = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed']


def build_features(p1_row: pd.Series, p2_row: pd.Series, feature_columns: list[str]) -> pd.DataFrame:
    """
    Build a single-row feature DataFrame for two Pokemon,
    replicating the exact feature engineering from the training script.
    """
    feat = {}

    # Stat differences (p1 - p2)
    for stat in STAT_COLS:
        feat[f'diff_{stat}'] = int(p1_row[stat]) - int(p2_row[stat])

    # Total stat difference
    p1_total = sum(int(p1_row[s]) for s in STAT_COLS)
    p2_total = sum(int(p2_row[s]) for s in STAT_COLS)
    feat['diff_total'] = p1_total - p2_total

    # Type columns (fill NaN Type 2 with "None" to match training)
    feat['p1_type1'] = p1_row['Type 1']
    feat['p1_type2'] = p1_row['Type 2'] if pd.notna(p1_row['Type 2']) else 'None'
    feat['p2_type1'] = p2_row['Type 1']
    feat['p2_type2'] = p2_row['Type 2'] if pd.notna(p2_row['Type 2']) else 'None'

    # Legendary flags
    feat['p1_legendary'] = int(bool(p1_row['Legendary']))
    feat['p2_legendary'] = int(bool(p2_row['Legendary']))

    # Speed advantage
    feat['speed_advantage'] = 1 if int(p1_row['Speed']) > int(p2_row['Speed']) else 0

    # One-hot encode the type columns
    row_df = pd.DataFrame([feat])
    row_df = pd.get_dummies(row_df, columns=['p1_type1', 'p1_type2', 'p2_type1', 'p2_type2'])

    # Align with training columns: add missing as 0, reorder, drop extras
    for col in feature_columns:
        if col not in row_df.columns:
            row_df[col] = 0
    row_df = row_df[feature_columns]

    row_df = row_df.astype(int)
    return row_df
