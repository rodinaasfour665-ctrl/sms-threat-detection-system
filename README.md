# Cyber Dragon Security Dashboard

AI-Powered SMS Threat Detection System built with Machine Learning, NLP, and Streamlit.

Cyber Dragon analyzes SMS messages in real time and classifies them as Normal or Suspicious, providing a threat score, risk level assessment, and keyword-based threat analysis.
---
## Features

- Real-time SMS threat detection
- NLP-based text processing
- TF-IDF feature engineering
- Logistic Regression classification
- Threat score (0-100%)
- Threat level categorization
- Suspicious keyword detection
- Interactive Streamlit dashboard
- Analysis history tracking
- Cyberpunk security-themed UI

## Machine Learning Pipeline

1. **Data Preprocessing**
   - Lowercasing
   - Cleaning special characters
   - Whitespace normalization
2. **Feature Engineering**
   - TF-IDF vectorization
   - 5,000 features
   - Unigrams and bigrams
3. **Model Training**
   - Logistic Regression
   - Balanced class weights
4. **Prediction**
   - Normal / Suspicious classification
   - Risk score calculation
   - Threat keyword detection

## Performance

| Metric | Score |
|---|---|
| Accuracy | 98.57% |
| Precision (Normal) | 99% |
| Precision (Suspicious) | 96% |
| Recall (Suspicious) | 93% |
| F1 Score | 0.95 |

Dataset size: 5,572 SMS messages

## Project Structure

```text
sms-threat-detection-system/
├── app/
│   └── app.py
├── training/
│   └── train.py
├── models/
│   ├── model.pkl
│   └── vectorizer.pkl
├── data/
│   └── dataset.csv
├── docs/
│   └── Technical_Documentation.docx
├── requirements.txt
└── README.md
```

## Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/sms-threat-detection-system.git
cd sms-threat-detection-system
```

Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the Application

Launch the dashboard:

```bash
streamlit run app/app.py
```

Then open:

```text
http://localhost:8501
```

## Retraining the Model

To retrain the model:

```bash
python training/train.py
```

New model files will be generated automatically.

## Technologies Used

- Python
- Scikit-learn
- Pandas
- NumPy
- Streamlit
- Plotly
- Joblib
- NLP
- TF-IDF

