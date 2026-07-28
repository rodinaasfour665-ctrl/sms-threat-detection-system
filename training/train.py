"""
🐉 Cyber Dragon Security Dashboard
Train.py — Model Training Script
Uses SMS Spam Collection dataset (5572 messages)
"""

import pandas as pd
import numpy as np
import re
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, confusion_matrix, classification_report
)

# ─────────────────────────────────────────────
# 1. Load Dataset
# ─────────────────────────────────────────────
print("=" * 55)
print("🐉 CYBER DRAGON — MODEL TRAINING")
print("=" * 55)

df = pd.read_csv("dataset.csv")
print(f"\n📊 Dataset loaded: {len(df)} messages")
print(df["label"].value_counts().to_string())

# ─────────────────────────────────────────────
# 2. Preprocessing
# ─────────────────────────────────────────────
def preprocess(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

df["clean"] = df["message"].astype(str).apply(preprocess)

# ─────────────────────────────────────────────
# 3. Train / Test Split
# ─────────────────────────────────────────────
X = df["clean"]
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f"\n🔀 Train: {len(X_train)} | Test: {len(X_test)}")

# ─────────────────────────────────────────────
# 4. TF-IDF Vectorization
# ─────────────────────────────────────────────
vectorizer = TfidfVectorizer(
    max_features=5000,
    ngram_range=(1, 2),
    sublinear_tf=True,
)
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec  = vectorizer.transform(X_test)

# ─────────────────────────────────────────────
# 5. Train Logistic Regression
# ─────────────────────────────────────────────
model = LogisticRegression(
    max_iter=1000,
    class_weight="balanced",
    C=1.0,
    solver="lbfgs",
)
model.fit(X_train_vec, y_train)

# ─────────────────────────────────────────────
# 6. Evaluate
# ─────────────────────────────────────────────
y_pred = model.predict(X_test_vec)
acc = accuracy_score(y_test, y_pred)

print(f"\n✅ Accuracy: {acc * 100:.2f}%\n")
print("📋 Classification Report:")
print(classification_report(y_test, y_pred))

cm = confusion_matrix(y_test, y_pred, labels=["Normal", "Suspicious"])
print("🔢 Confusion Matrix:")
print(f"               Pred Normal  Pred Suspicious")
print(f"True Normal       {cm[0][0]:>6}          {cm[0][1]:>6}")
print(f"True Suspicious   {cm[1][0]:>6}          {cm[1][1]:>6}")

# ─────────────────────────────────────────────
# 7. Save Model & Vectorizer
# ─────────────────────────────────────────────
joblib.dump(model,      "model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("\n💾 Saved: model.pkl")
print("💾 Saved: vectorizer.pkl")
print("\n🐉 Training complete — ready to launch dashboard!")
