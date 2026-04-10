#!/usr/bin/env python3
"""
APSRTC Bus Occupancy — XGBoost Model Trainer (Production)
==========================================================
Drop-in replacement for your old train_model.py.
Saves exact same filenames app.py already loads:
    model/classifier.pkl
    model/regressor.pkl
    model/encoders.pkl
    model/meta.json

Install dependency first:
    pip install xgboost

Then run:
    python train_model_bus.py
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
print("  APSRTC Bus Model — XGBoost Trainer")
print("=" * 55)
df = pd.read_excel("APSRTC_Balanced_10K.xlsx")
print(f"\n  Loaded: {len(df):,} rows x {df.shape[1]} columns")

# ── 2. Features ───────────────────────────────────────────────────────────────
FEATURES = [
    "Day of Week",
    "Month",
    "Season",
    "Hour of Departure",
    "Source City",
    "Destination City",
    "Bus Type",
    "Bus Capacity",
    "Is Weekend",
    "Is Holiday",
    "Is Peak Hour",
    "Route Distance KM",
    "Ticket Price INR",      # valid: known at booking time
]

CAT_COLS = [
    "Day of Week", "Month", "Season",
    "Source City", "Destination City", "Bus Type",
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

pct_preds = np.clip(reg.predict(X_test), 5, 98)
mae = mean_absolute_error(yr_test, pct_preds)
r2  = r2_score(yr_test, pct_preds)
print(f"  R2  : {r2:.4f}")
print(f"  MAE : {mae:.2f}%")

# ── 7. Save ───────────────────────────────────────────────────────────────────
os.makedirs("model", exist_ok=True)
with open("model/classifier.pkl", "wb") as f: pickle.dump(clf, f)
with open("model/regressor.pkl",  "wb") as f: pickle.dump(reg, f)
with open("model/encoders.pkl",   "wb") as f: pickle.dump(encoders, f)

enc_classes = {col: list(encoders[col].classes_) for col in CAT_COLS}
enc_classes["target_classes"] = list(le_target.classes_)

cat_values = {
    "bus_types":     sorted(df["Bus Type"].unique().tolist()),
    "source_cities": sorted(df["Source City"].unique().tolist()),
    "dest_cities":   sorted(df["Destination City"].unique().tolist()),
    "days":          list(encoders["Day of Week"].classes_),
    "months":        list(encoders["Month"].classes_),
    "seasons":       list(encoders["Season"].classes_),
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
with open("model/meta.json", "w") as f:
    json.dump(meta, f, indent=2)

print("\n" + "=" * 55)
print("  DONE — Bus model saved to ./model/")
print("=" * 55)
print(f"  Classifier Accuracy : {acc*100:.2f}%")
print(f"  Regressor R2        : {r2:.4f}")
print(f"  Regressor MAE       : {mae:.2f}%")
print("\n  Files: classifier.pkl | regressor.pkl | encoders.pkl | meta.json")