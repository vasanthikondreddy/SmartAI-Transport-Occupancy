#!/usr/bin/env python3
"""
Run this once to train and save the model:
    python train_model.py
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, mean_absolute_error, classification_report
import pickle, json, os

df = pd.read_excel("APSRTC_Synthetic_Dataset_10K.xlsx")

FEATURES = [
    "Day of Week", "Month", "Season", "Hour of Departure",
    "Source City", "Destination City", "Bus Type", "Bus Capacity",
    "Is Weekend", "Is Holiday", "Is Peak Hour", "Route Distance KM"
]

X = df[FEATURES].copy()
y_cls = df["Occupancy Level"].copy()
y_reg = df["Occupancy Percentage"].copy()

# Encode categoricals
encoders = {}
CAT_COLS = ["Day of Week", "Month", "Season", "Source City", "Destination City", "Bus Type"]
for col in CAT_COLS:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col].astype(str))
    encoders[col] = le

le_target = LabelEncoder()
y_cls_enc = le_target.fit_transform(y_cls)
encoders["target"] = le_target

X_arr = X.values
X_train, X_test, yc_train, yc_test, yr_train, yr_test = train_test_split(
    X_arr, y_cls_enc, y_reg.values,
    test_size=0.2, random_state=42, stratify=y_cls_enc
)

# --- Classifier ---
print("Training classifier...")
clf = RandomForestClassifier(
    n_estimators=300, max_depth=14,
    min_samples_leaf=2, random_state=42, n_jobs=-1
)
clf.fit(X_train, yc_train)
acc = accuracy_score(yc_test, clf.predict(X_test))
print(f"  Accuracy : {acc:.4f}")
print(classification_report(yc_test, clf.predict(X_test), target_names=le_target.classes_))

# --- Regressor ---
print("Training regressor...")
reg = RandomForestRegressor(n_estimators=200, max_depth=12, random_state=42, n_jobs=-1)
reg.fit(X_train, yr_train)
mae = mean_absolute_error(yr_test, reg.predict(X_test))
print(f"  MAE      : {mae:.2f}%")

# --- Save ---
os.makedirs("model", exist_ok=True)
with open("model/classifier.pkl", "wb") as f: pickle.dump(clf, f)
with open("model/regressor.pkl",  "wb") as f: pickle.dump(reg, f)
with open("model/encoders.pkl",   "wb") as f: pickle.dump(encoders, f)

enc_classes = {col: list(encoders[col].classes_) for col in CAT_COLS}
enc_classes["target_classes"] = list(le_target.classes_)

meta = {
    "features": FEATURES,
    "cat_cols": CAT_COLS,
    "classifier_accuracy": round(acc, 4),
    "regressor_mae": round(mae, 2),
    "encoder_classes": enc_classes,
}
with open("model/meta.json", "w") as f: json.dump(meta, f, indent=2)

print("\n✅ Model saved to ./model/")
print("   classifier.pkl  |  regressor.pkl  |  encoders.pkl  |  meta.json")