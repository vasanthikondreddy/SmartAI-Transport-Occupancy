#!/usr/bin/env python3
"""
AI-Commute Occupancy Prediction API
- Bus:   POST /predict/bus   (APSRTC model)
- Train: POST /predict/train (AP Railways model)
Run: uvicorn app:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle, json, os
import numpy as np

app = FastAPI(title="AI-Commute Occupancy Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE = os.path.dirname(__file__)

# ── Load BUS model ────────────────────────────────────────────────────────────
with open(os.path.join(BASE, "model/classifier.pkl"), "rb") as f:
    bus_clf = pickle.load(f)
with open(os.path.join(BASE, "model/regressor.pkl"), "rb") as f:
    bus_reg = pickle.load(f)
with open(os.path.join(BASE, "model/encoders.pkl"), "rb") as f:
    bus_encoders = pickle.load(f)
with open(os.path.join(BASE, "model/meta.json")) as f:
    bus_meta = json.load(f)

bus_le_target = bus_encoders["target"]

# ── Load TRAIN model ──────────────────────────────────────────────────────────
with open(os.path.join(BASE, "model/train_classifier.pkl"), "rb") as f:
    train_clf = pickle.load(f)
with open(os.path.join(BASE, "model/train_regressor.pkl"), "rb") as f:
    train_reg = pickle.load(f)
with open(os.path.join(BASE, "model/train_encoders.pkl"), "rb") as f:
    train_encoders = pickle.load(f)
with open(os.path.join(BASE, "model/train_meta.json")) as f:
    train_meta = json.load(f)

train_le_target = train_encoders["target"]

# ── Helpers ───────────────────────────────────────────────────────────────────
def safe_encode(encoders: dict, col: str, value: str) -> int:
    le = encoders[col]
    if value in le.classes_:
        return int(le.transform([value])[0])
    return 0

def auto_peak(hour: int) -> int:
    return 1 if (7 <= hour <= 10) or (17 <= hour <= 20) else 0

def is_weekend(day: str) -> int:
    return 1 if day in ("Saturday", "Sunday") else 0

# ══════════════════════════════════════════════════════════════════════════════
# BUS ENDPOINT
# ══════════════════════════════════════════════════════════════════════════════

class BusPredictRequest(BaseModel):
    day_of_week: str
    month: str
    season: str
    hour_of_departure: int
    source_city: str
    destination_city: str
    bus_type: str
    bus_capacity: int
    is_holiday: int = 0

@app.post("/predict/bus")
def predict_bus(req: BusPredictRequest):
    weekend = is_weekend(req.day_of_week)
    peak    = auto_peak(req.hour_of_departure)

    row = {
        "Day of Week":       safe_encode(bus_encoders, "Day of Week",       req.day_of_week),
        "Month":             safe_encode(bus_encoders, "Month",             req.month),
        "Season":            safe_encode(bus_encoders, "Season",            req.season),
        "Hour of Departure": req.hour_of_departure,
        "Source City":       safe_encode(bus_encoders, "Source City",       req.source_city),
        "Destination City":  safe_encode(bus_encoders, "Destination City",  req.destination_city),
        "Bus Type":          safe_encode(bus_encoders, "Bus Type",          req.bus_type),
        "Bus Capacity":      req.bus_capacity,
        "Is Weekend":        weekend,
        "Is Holiday":        req.is_holiday,
        "Is Peak Hour":      peak,
        "Route Distance KM": 300,
    }

    X = np.array([[row[f] for f in bus_meta["features"]]])

    level   = bus_le_target.inverse_transform(bus_clf.predict(X))[0]
    pct     = float(np.clip(bus_reg.predict(X)[0], 5, 98))
    proba   = bus_clf.predict_proba(X)[0]
    classes = bus_le_target.inverse_transform(range(len(proba)))

    return {
        "occupancy_level":      level,
        "occupancy_percentage": round(pct, 1),
        "estimated_passengers": round((pct / 100) * req.bus_capacity),
        "probabilities":        {c: round(float(p), 3) for c, p in zip(classes, proba)},
        "model_accuracy":       bus_meta["classifier_accuracy"],
    }

# ══════════════════════════════════════════════════════════════════════════════
# TRAIN ENDPOINT
# ══════════════════════════════════════════════════════════════════════════════

class TrainPredictRequest(BaseModel):
    day_of_week: str
    month: str
    season: str
    train_type: str
    railway_zone: str
    source_station: str
    destination_station: str
    travel_class: str
    departure_hour: int
    seat_capacity: int
    route_distance_km: int
    journey_duration_hrs: float = 5.0
    is_weekend: int = 0
    is_holiday: int = 0
    is_festival_season: int = 0
    is_peak_hour: int = 0

@app.post("/predict/train")
def predict_train(req: TrainPredictRequest):
    peak = req.is_peak_hour if req.is_peak_hour else auto_peak(req.departure_hour)

    row = {
        "Day of Week":         safe_encode(train_encoders, "Day of Week",         req.day_of_week),
        "Month":               safe_encode(train_encoders, "Month",               req.month),
        "Season":              safe_encode(train_encoders, "Season",              req.season),
        "Train Type":          safe_encode(train_encoders, "Train Type",          req.train_type),
        "Railway Zone":        safe_encode(train_encoders, "Railway Zone",        req.railway_zone),
        "Source Station":      safe_encode(train_encoders, "Source Station",      req.source_station),
        "Destination Station": safe_encode(train_encoders, "Destination Station", req.destination_station),
        "Travel Class":        safe_encode(train_encoders, "Travel Class",        req.travel_class),
        "Is Weekend":          req.is_weekend,
        "Is Holiday":          req.is_holiday,
        "Is Festival Season":  req.is_festival_season,
        "Route Distance KM":   req.route_distance_km,
        "Departure Hour":      req.departure_hour,
        "Is Peak Hour":        peak,
        "Journey Duration Hrs":req.journey_duration_hrs,
        "Seat Capacity":       req.seat_capacity,
    }

    X = np.array([[row[f] for f in train_meta["features"]]])

    level   = train_le_target.inverse_transform(train_clf.predict(X))[0]
    pct     = float(np.clip(train_reg.predict(X)[0], 5, 100))
    proba   = train_clf.predict_proba(X)[0]
    classes = train_le_target.inverse_transform(range(len(proba)))

    return {
        "occupancy_level":      level,
        "occupancy_percentage": round(pct, 1),
        "estimated_passengers": round((pct / 100) * req.seat_capacity),
        "probabilities":        {c: round(float(p), 3) for c, p in zip(classes, proba)},
        "model_accuracy":       train_meta["classifier_accuracy"],
        "model_mae_pct":        train_meta["regressor_mae"],
    }

# ── Meta / health endpoints ───────────────────────────────────────────────────

@app.get("/meta/bus")
def bus_meta_values():
    return bus_meta.get("cat_values", {})

@app.get("/meta/train")
def train_meta_values():
    return train_meta.get("cat_values", {})

@app.get("/")
def root():
    return {
        "message": "AI-Commute Prediction API is running!",
        "endpoints": {
            "bus":   "POST /predict/bus",
            "train": "POST /predict/train",
        },
        "bus_accuracy":   bus_meta["classifier_accuracy"],
        "train_accuracy": train_meta["classifier_accuracy"],
    }