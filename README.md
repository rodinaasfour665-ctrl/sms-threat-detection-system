# 🐉 Cyber Dragon Security Dashboard

AI-Powered SMS Threat Detection System built with Machine Learning, NLP, and Streamlit.

Cyber Dragon analyzes SMS messages in real time and classifies them as **Normal** or **Suspicious** while providing a threat score, risk level assessment, and keyword-based threat analysis.

---

## 🚀 Features

✅ Real-time SMS Threat Detection

✅ NLP-based Text Processing

✅ TF-IDF Feature Engineering

✅ Logistic Regression Classification

✅ Threat Score (0-100%)

✅ Threat Level Categorization

✅ Suspicious Keyword Detection

✅ Interactive Streamlit Dashboard

✅ Analysis History Tracking

✅ Cyberpunk Security-Themed UI

---

## 🧠 Machine Learning Pipeline

1. Data Preprocessing
   - Lowercasing
   - Cleaning special characters
   - Whitespace normalization

2. Feature Engineering
   - TF-IDF Vectorization
   - 5000 Features
   - Unigrams + Bigrams

3. Model Training
   - Logistic Regression
   - Balanced Class Weights

4. Prediction
   - Normal / Suspicious Classification
   - Risk Score Calculation
   - Threat Keyword Detection

---

## 📊 Performance

| Metric | Score |
|----------|----------|
| Accuracy | 98.57% |
| Precision (Normal) | 99% |
| Precision (Suspicious) | 96% |
| Recall (Suspicious) | 93% |
| F1 Score | 0.95 |

Dataset Size: 5,572 SMS Messages

---

## 📁 Project Structure

```text
Cyber-Dragon-Security-Dashboard
│
├── app/
│   └── app.py
│
├── training/
│   └── train.py
│
├── models/
│   ├── model.pkl
│   └── vectorizer.pkl
│
├── data/
│   └── dataset.csv
│
├── docs/
│   └── Technical_Documentation.docx
│
├── requirements.txt
└── README.md
```

---

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/Cyber-Dragon-Security-Dashboard.git
cd Cyber-Dragon-Security-Dashboard
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## ▶️ Run the Application

Launch the dashboard:

```bash
streamlit run app/app.py
```

Open:

```text
http://localhost:8501
```

---

## 🔄 Retrain the Model

If you want to retrain the model:

```bash
python training/train.py
```

New model files will be generated automatically.

---

## 🛠 Technologies Used

- Python
- Scikit-Learn
- Pandas
- NumPy
- Streamlit
- Plotly
- Joblib
- NLP
- TF-IDF

---

## 🎯 Future Improvements

- BERT-based Threat Detection
- URL Analysis
- Batch Message Processing
- REST API Integration
- Database Support
- Cloud Deployment

