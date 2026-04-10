#!/usr/bin/env python3
"""
AP Railways Train Occupancy — XGBoost Model Trainer (Production)
=================================================================
Drop-in replacement — saves to model/train_*.pkl files that app.py already loads.

Install dependency first:
    pip install xgboost

Then run:
    python train_model_train.py

Outputs (exact filenames your app.py loads):
    model/train_classifier.pkl
    model/train_regressor.pkl
    model/train_encoders.pkl
    model/train_meta.json
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (accuracy_score, mean_absolute_error,
                              r2_score, classification_report)
import xgboost as xgb
import pickle, json, os

# ── 1. Load Data ──────────────────────────────────────────────────────────────
print("=" * 55)
print("  AP Railways Train Model — XGBoost Trainer")
df = pd.read_excel("AP_Railways_Balanced_10K.xlsx")
print(f"\n  Loaded: {len(df):,} rows x {df.shape[1]} columns")

# ── 2. Features ───────────────────────────────────────────────────────────────
# These match exactly the keys built in app.py → predict_train() → row dict
FEATURES = [
    "Day of Week",
    "Month",
    "Season",
    "Train Type",
    "Railway Zone",
    "Source Station",
    "Destination Station",
    "Travel Class",
    "Is Weekend",
    "Is Holiday",
    "Is Festival Season",
    "Route Distance KM",
    "Departure Hour",
    "Is Peak Hour",
    "Journey Duration Hrs",
    "Seat Capacity",
    "Ticket Price INR",      # valid: known at booking time, strong signal
]

CAT_COLS = [
    "Day of Week", "Month", "Season",
    "Train Type", "Railway Zone",
    "Source Station", "Destination Station",
    "Travel Class",
]

X = df[FEATURES].copy()
y_cls = df["Occupancy Level"].copy()
y_reg = df["Occupancy Percentage"].copy()

# ── 3. Encode ─────────────────────────────────────────────────────────────────
encoders = {}
for col in CAT_COLS:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col].astype(str))
    encoders[col] = le

le_target = LabelEncoder()
y_cls_enc = le_target.fit_transform(y_cls)
encoders["target"] = le_target

num_classes = len(le_target.classes_)

# ── 4. Split ──────────────────────────────────────────────────────────────────
X_arr = X.values
X_train, X_test, yc_train, yc_test, yr_train, yr_test = train_test_split(
    X_arr, y_cls_enc, y_reg.values,
    test_size=0.2, random_state=42, stratify=y_cls_enc
)
print(f"\n  Train: {len(X_train):,}   Test: {len(X_test):,}")
print(f"  Classes: {list(le_target.classes_)}")

# ── 5. Classifier ─────────────────────────────────────────────────────────────
print("\n[1] Training XGBoost Classifier...")
clf = xgb.XGBClassifier(
    n_estimators=500,
    learning_rate=0.05,
    max_depth=7,
    subsample=0.85,
    colsample_bytree=0.85,
    min_child_weight=3,
    gamma=0.1,
    reg_alpha=0.05,
    reg_lambda=1.0,
    objective="multi:softprob",
    num_class=num_classes,
    eval_metric="mlogloss",
    use_label_encoder=False,
    random_state=42,
    n_jobs=-1,
    verbosity=0,
)
clf.fit(X_train, yc_train,
        eval_set=[(X_test, yc_test)],
        verbose=False)

acc = accuracy_score(yc_test, clf.predict(X_test))
print(f"  Accuracy : {acc:.4f}  ({acc*100:.2f}%)")
print(classification_report(
    yc_test, clf.predict(X_test),
    target_names=le_target.classes_
))

# ── 6. Regressor ─────────────────────────────────────────────────────────────
print("[2] Training XGBoost Regressor (Occupancy %)...")
reg = xgb.XGBRegressor(
    n_estimators=600,
    learning_rate=0.04,
    max_depth=7,
    subsample=0.85,
    colsample_bytree=0.85,
    min_child_weight=3,
    reg_alpha=0.05,
    reg_lambda=1.0,
    objective="reg:squarederror",
    eval_metric="mae",
    random_state=42,
    n_jobs=-1,
    verbosity=0,
)
reg.fit(X_train, yr_train,
        eval_set=[(X_test, yr_test)],
        verbose=False)

pct_preds = np.clip(reg.predict(X_test), 5, 100)
mae = mean_absolute_error(yr_test, pct_preds)
r2  = r2_score(yr_test, pct_preds)
print(f"  R2  : {r2:.4f}")
print(f"  MAE : {mae:.2f}%")

# ── 7. Save ───────────────────────────────────────────────────────────────────
os.makedirs("model", exist_ok=True)
with open("model/train_classifier.pkl", "wb") as f: pickle.dump(clf, f)
with open("model/train_regressor.pkl",  "wb") as f: pickle.dump(reg, f)
with open("model/train_encoders.pkl",   "wb") as f: pickle.dump(encoders, f)

enc_classes = {col: list(encoders[col].classes_) for col in CAT_COLS}
enc_classes["target_classes"] = list(le_target.classes_)

cat_values = {
    "train_types":          sorted(df["Train Type"].unique().tolist()),
    "railway_zones":        sorted(df["Railway Zone"].unique().tolist()),
    "source_stations":      sorted(df["Source Station"].unique().tolist()),
    "destination_stations": sorted(df["Destination Station"].unique().tolist()),
    "travel_classes":       sorted(df["Travel Class"].unique().tolist()),
    "days":                 list(encoders["Day of Week"].classes_),
    "months":               list(encoders["Month"].classes_),
    "seasons":              list(encoders["Season"].classes_),
}

meta = {
    "features":            FEATURES,
    "cat_cols":            CAT_COLS,
    "classifier_accuracy": round(acc, 4),
    "regressor_mae":       round(mae, 2),
    "regressor_r2":        round(r2, 4),
    "model":               "XGBoost",
    "encoder_classes":     enc_classes,
    "cat_values":          cat_values,
}
with open("model/train_meta.json", "w") as f:
    json.dump(meta, f, indent=2)

print("\n" + "=" * 55)
print("  DONE — Train model saved to ./model/")
print("=" * 55)
print(f"  Classifier Accuracy : {acc*100:.2f}%")
print(f"  Regressor R2        : {r2:.4f}")
print(f"  Regressor MAE       : {mae:.2f}%")
print("\n  Files: train_classifier.pkl | train_regressor.pkl | train_encoders.pkl | train_meta.json")