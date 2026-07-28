"""
🐉 Cyber Dragon Security Dashboard
app.py — Streamlit Dashboard
Run: streamlit run app.py
"""

import re
import joblib
import numpy as np
import pandas as pd
import streamlit as st
import plotly.graph_objects as go

# ─────────────────────────────────────────────
# Page Config
# ─────────────────────────────────────────────
st.set_page_config(
    page_title="🐉 Cyber Dragon Security",
    page_icon="🐉",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ─────────────────────────────────────────────
# CSS — Cyberpunk / Dark Theme
# ─────────────────────────────────────────────
st.markdown("""
<style>
  /* ── Base ── */
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');

  html, body, [data-testid="stAppViewContainer"] {
    background: #0a0a0f !important;
    color: #e0e0e0 !important;
    font-family: 'Share Tech Mono', monospace !important;
  }

  [data-testid="stHeader"] { background: transparent !important; }

  /* ── Title glow ── */
  .dragon-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 2.6rem;
    font-weight: 900;
    text-align: center;
    color: #00ff88;
    text-shadow:
      0 0 10px #00ff88,
      0 0 30px #00ff88,
      0 0 60px #00cc66;
    letter-spacing: 3px;
    margin-bottom: 0.2rem;
    padding-top: 1rem;
  }

  .dragon-sub {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.9rem;
    text-align: center;
    color: #00ccff;
    text-shadow: 0 0 8px #00ccff;
    letter-spacing: 4px;
    margin-bottom: 2rem;
  }

  /* ── Cards ── */
  .metric-card {
    background: linear-gradient(135deg, #0d1117 0%, #161b2e 100%);
    border: 1px solid #00ff88;
    border-radius: 8px;
    padding: 1.2rem 1rem;
    text-align: center;
    box-shadow: 0 0 12px rgba(0,255,136,0.15);
  }
  .metric-card.red {
    border-color: #ff2255;
    box-shadow: 0 0 12px rgba(255,34,85,0.15);
  }
  .metric-card.blue {
    border-color: #00ccff;
    box-shadow: 0 0 12px rgba(0,204,255,0.15);
  }
  .metric-label {
    font-size: 0.7rem;
    letter-spacing: 3px;
    color: #888;
    text-transform: uppercase;
  }
  .metric-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 2.2rem;
    font-weight: 700;
    color: #00ff88;
  }
  .metric-value.red { color: #ff2255; }
  .metric-value.blue { color: #00ccff; }

  /* ── Result boxes ── */
  .result-normal {
    background: linear-gradient(135deg, #001a0d, #002b18);
    border: 2px solid #00ff88;
    border-radius: 10px;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 0 0 20px rgba(0,255,136,0.3);
  }
  .result-suspicious {
    background: linear-gradient(135deg, #1a0008, #2b0010);
    border: 2px solid #ff2255;
    border-radius: 10px;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 0 0 20px rgba(255,34,85,0.3);
    animation: pulse 1.5s infinite;
  }
  @keyframes pulse {
    0%   { box-shadow: 0 0 20px rgba(255,34,85,0.3); }
    50%  { box-shadow: 0 0 40px rgba(255,34,85,0.6); }
    100% { box-shadow: 0 0 20px rgba(255,34,85,0.3); }
  }
  .result-label {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.8rem;
    font-weight: 900;
  }
  .label-normal    { color: #00ff88; text-shadow: 0 0 15px #00ff88; }
  .label-suspicious { color: #ff2255; text-shadow: 0 0 15px #ff2255; }

  /* ── Threat badge ── */
  .threat-badge {
    display: inline-block;
    padding: 0.3rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 2px;
    margin-top: 0.5rem;
  }
  .threat-low    { background: #003320; color: #00ff88; border: 1px solid #00ff88; }
  .threat-medium { background: #332200; color: #ffaa00; border: 1px solid #ffaa00; }
  .threat-high   { background: #330011; color: #ff2255; border: 1px solid #ff2255; }

  /* ── Keyword chips ── */
  .kw-chip {
    display: inline-block;
    background: rgba(255,34,85,0.15);
    border: 1px solid #ff2255;
    color: #ff6688;
    border-radius: 4px;
    padding: 2px 8px;
    margin: 2px;
    font-size: 0.8rem;
  }

  /* ── Input textarea ── */
  .stTextArea textarea {
    background: #0d1117 !important;
    color: #00ff88 !important;
    border: 1px solid #00ff88 !important;
    font-family: 'Share Tech Mono', monospace !important;
    font-size: 1rem !important;
    border-radius: 6px !important;
  }
  .stTextArea textarea:focus {
    box-shadow: 0 0 12px rgba(0,255,136,0.4) !important;
  }

  /* ── Buttons ── */
  .stButton > button {
    background: linear-gradient(90deg, #003322, #00ff88) !important;
    color: #0a0a0f !important;
    font-family: 'Orbitron', sans-serif !important;
    font-weight: 700 !important;
    font-size: 1rem !important;
    letter-spacing: 2px !important;
    border: none !important;
    border-radius: 6px !important;
    padding: 0.6rem 2rem !important;
    transition: all 0.2s !important;
    width: 100% !important;
  }
  .stButton > button:hover {
    background: linear-gradient(90deg, #00ff88, #00ccff) !important;
    box-shadow: 0 0 20px rgba(0,255,136,0.5) !important;
    transform: translateY(-1px) !important;
  }

  /* ── Progress bar ── */
  .stProgress > div > div {
    background: linear-gradient(90deg, #00ff88, #ffaa00, #ff2255) !important;
    border-radius: 4px !important;
  }

  /* ── Section headers ── */
  .section-header {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.85rem;
    letter-spacing: 3px;
    color: #00ccff;
    text-shadow: 0 0 8px #00ccff;
    border-bottom: 1px solid #00ccff33;
    padding-bottom: 0.4rem;
    margin: 1.5rem 0 1rem 0;
    text-transform: uppercase;
  }

  /* ── Table ── */
  .history-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.78rem;
  }
  .history-table th {
    color: #00ccff;
    border-bottom: 1px solid #00ccff44;
    padding: 0.4rem 0.6rem;
    text-align: left;
    letter-spacing: 2px;
    font-size: 0.7rem;
    text-transform: uppercase;
  }
  .history-table td {
    padding: 0.4rem 0.6rem;
    border-bottom: 1px solid #ffffff0a;
    color: #cccccc;
  }
  .history-table tr:hover td { background: rgba(0,255,136,0.04); }

  /* ── Divider ── */
  hr { border-color: #00ff8822 !important; }

  /* ── Hide Streamlit chrome ── */
  #MainMenu, footer, header { visibility: hidden; }
  .block-container { padding-top: 0.5rem !important; }
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────
# Load Model
# ─────────────────────────────────────────────
@st.cache_resource
def load_model():
    model      = joblib.load("model.pkl")
    vectorizer = joblib.load("vectorizer.pkl")
    return model, vectorizer

try:
    model, vectorizer = load_model()
    model_loaded = True
except Exception as e:
    model_loaded = False
    st.error(f"⚠️ Could not load model: {e}\nRun `python train.py` first.")

# ─────────────────────────────────────────────
# Keyword Lists
# ─────────────────────────────────────────────
URGENCY_KEYWORDS = [
    "urgent", "act now", "immediately", "limited time", "expires",
    "last chance", "hurry", "right now", "don't wait", "today only",
    "asap", "deadline", "respond now", "immediate action",
]
THREAT_KEYWORDS = [
    "password", "p@ssword", "passw0rd", "account", "login",
    "verify", "reset", "security", "credit card", "bank",
    "social security", "ssn", "pin", "otp", "click here",
    "cl1ck", "suspended", "confirm", "update your", "winner",
    "prize", "claim", "free", "cash", "won", "congratulations",
]

def detect_keywords(text: str):
    lower = text.lower()
    found = []
    for kw in URGENCY_KEYWORDS + THREAT_KEYWORDS:
        if kw in lower:
            found.append(kw)
    return list(set(found))

def get_threat_level(score: float) -> tuple:
    if score < 0.35:
        return "LOW",    "threat-low",    "🟢"
    elif score < 0.70:
        return "MEDIUM", "threat-medium", "🟡"
    else:
        return "HIGH",   "threat-high",   "🔴"

# ─────────────────────────────────────────────
# Predict Function
# ─────────────────────────────────────────────
def preprocess(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def predict_message(text: str) -> dict:
    clean    = preprocess(text)
    vec      = vectorizer.transform([clean])
    proba    = model.predict_proba(vec)[0]
    classes  = list(model.classes_)
    susp_idx = classes.index("Suspicious")
    risk     = float(proba[susp_idx])
    label    = "Suspicious" if risk >= 0.5 else "Normal"
    keywords = detect_keywords(text)
    return {
        "label":     label,
        "risk_score": risk,
        "detected_keywords": keywords,
    }

# ─────────────────────────────────────────────
# Session State
# ─────────────────────────────────────────────
if "history"     not in st.session_state: st.session_state.history     = []
if "total"       not in st.session_state: st.session_state.total       = 0
if "normal_cnt"  not in st.session_state: st.session_state.normal_cnt  = 0
if "susp_cnt"    not in st.session_state: st.session_state.susp_cnt    = 0

# ─────────────────────────────────────────────
# Header
# ─────────────────────────────────────────────
st.markdown('<div class="dragon-title">🐉 CYBER DRAGON</div>', unsafe_allow_html=True)
st.markdown('<div class="dragon-sub">[ MESSAGE URGENCY & THREAT DETECTION SYSTEM ]</div>', unsafe_allow_html=True)

if not model_loaded:
    st.stop()

# ─────────────────────────────────────────────
# Layout
# ─────────────────────────────────────────────
left_col, right_col = st.columns([3, 2], gap="large")

with left_col:
    # ── Input ──
    st.markdown('<div class="section-header">⚡ Message Analysis Terminal</div>', unsafe_allow_html=True)

    user_input = st.text_area(
        label="",
        placeholder="[ PASTE MESSAGE HERE — SMS, EMAIL, NOTIFICATION... ]",
        height=130,
        label_visibility="collapsed",
    )

    analyze_btn = st.button("🔍  ANALYZE THREAT", use_container_width=True)

    # ── Result ──
    if analyze_btn and user_input.strip():
        result = predict_message(user_input)
        label  = result["label"]
        risk   = result["risk_score"]
        kws    = result["detected_keywords"]

        # Update counters
        st.session_state.total += 1
        if label == "Normal":
            st.session_state.normal_cnt += 1
        else:
            st.session_state.susp_cnt += 1

        # Save to history
        st.session_state.history.insert(0, {
            "msg":   user_input[:60] + ("…" if len(user_input) > 60 else ""),
            "label": label,
            "risk":  risk,
        })
        st.session_state.history = st.session_state.history[:10]

        # ── Display result ──
        threat_level, threat_class, threat_icon = get_threat_level(risk)
        is_susp = label == "Suspicious"

        card_class  = "result-suspicious" if is_susp else "result-normal"
        label_class = "label-suspicious"  if is_susp else "label-normal"
        icon        = "🚨" if is_susp else "✅"

        st.markdown(f"""
        <div class="{card_class}">
          <div class="result-label {label_class}">{icon} {label.upper()}</div>
          <div style="margin-top:0.4rem;color:#aaa;font-size:0.8rem;letter-spacing:2px;">
            THREAT LEVEL: <span class="threat-badge {threat_class}">{threat_icon} {threat_level}</span>
          </div>
        </div>
        """, unsafe_allow_html=True)

        # Risk bar
        st.markdown('<div class="section-header">📊 Risk Score</div>', unsafe_allow_html=True)
        risk_pct = int(risk * 100)
        st.progress(risk)
        st.markdown(
            f'<div style="text-align:center;font-family:Orbitron,sans-serif;'
            f'font-size:1.4rem;color:{"#ff2255" if is_susp else "#00ff88"};">'
            f'{risk_pct}%</div>',
            unsafe_allow_html=True
        )

        # Keywords
        if kws:
            chips = "".join(f'<span class="kw-chip">{k}</span>' for k in kws)
            st.markdown(
                f'<div class="section-header">⚠️ Detected Keywords</div>'
                f'<div style="margin-bottom:1rem">{chips}</div>',
                unsafe_allow_html=True
            )
        else:
            st.markdown(
                '<div class="section-header">🔑 Detected Keywords</div>'
                '<span style="color:#555;font-size:0.85rem;">No threat keywords detected</span>',
                unsafe_allow_html=True
            )

        # Highlighted message
        highlighted = user_input
        for kw in kws:
            pattern = re.compile(re.escape(kw), re.IGNORECASE)
            highlighted = pattern.sub(
                f'<mark style="background:#ff225533;color:#ff6688;border-radius:3px;padding:1px 3px">{kw}</mark>',
                highlighted
            )
        st.markdown(
            '<div class="section-header">🔦 Keyword Highlights</div>'
            f'<div style="background:#0d1117;border:1px solid #333;border-radius:6px;'
            f'padding:1rem;font-size:0.9rem;line-height:1.7;">{highlighted}</div>',
            unsafe_allow_html=True
        )

    elif analyze_btn:
        st.warning("⚠️ Please enter a message to analyze.")

    # ── History Table ──
    st.markdown('<div class="section-header">🕒 Last 10 Analyzed Messages</div>', unsafe_allow_html=True)
    if st.session_state.history:
        rows = ""
        for h in st.session_state.history:
            color  = "#ff2255" if h["label"] == "Suspicious" else "#00ff88"
            icon   = "🚨" if h["label"] == "Suspicious" else "✅"
            risk_p = int(h["risk"] * 100)
            rows += f"""
            <tr>
              <td style="color:{color}">{icon} {h["label"]}</td>
              <td>{h["msg"]}</td>
              <td style="color:{color};font-family:Orbitron,sans-serif">{risk_p}%</td>
            </tr>"""
        st.markdown(f"""
        <table class="history-table">
          <thead><tr><th>Status</th><th>Message</th><th>Risk</th></tr></thead>
          <tbody>{rows}</tbody>
        </table>
        """, unsafe_allow_html=True)
    else:
        st.markdown('<span style="color:#555;font-size:0.85rem;">No messages analyzed yet.</span>', unsafe_allow_html=True)


with right_col:
    # ── Counters ──
    st.markdown('<div class="section-header">📡 Live Session Stats</div>', unsafe_allow_html=True)

    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown(f"""
        <div class="metric-card blue">
          <div class="metric-label">Total</div>
          <div class="metric-value blue">{st.session_state.total}</div>
        </div>""", unsafe_allow_html=True)
    with c2:
        st.markdown(f"""
        <div class="metric-card">
          <div class="metric-label">Normal</div>
          <div class="metric-value">{st.session_state.normal_cnt}</div>
        </div>""", unsafe_allow_html=True)
    with c3:
        st.markdown(f"""
        <div class="metric-card red">
          <div class="metric-label">Threats</div>
          <div class="metric-value red">{st.session_state.susp_cnt}</div>
        </div>""", unsafe_allow_html=True)

    # ── Pie Chart ──
    st.markdown('<div class="section-header">🥧 Detection Distribution</div>', unsafe_allow_html=True)

    normal_val = max(st.session_state.normal_cnt, 0)
    susp_val   = max(st.session_state.susp_cnt,   0)

    if normal_val + susp_val == 0:
        normal_val, susp_val = 1, 0   # placeholder

    fig = go.Figure(go.Pie(
        labels=["Normal", "Suspicious"],
        values=[normal_val, susp_val],
        hole=0.55,
        marker=dict(
            colors=["#00ff88", "#ff2255"],
            line=dict(color="#0a0a0f", width=3),
        ),
        textinfo="label+percent",
        textfont=dict(color="#ffffff", size=12, family="Share Tech Mono"),
        hovertemplate="<b>%{label}</b><br>Count: %{value}<br>%{percent}<extra></extra>",
    ))
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        showlegend=False,
        margin=dict(t=10, b=10, l=10, r=10),
        height=280,
        annotations=[dict(
            text=f"<b>{st.session_state.total}</b><br><span style='font-size:10px'>SCANNED</span>",
            x=0.5, y=0.5,
            font=dict(size=16, color="#00ccff", family="Orbitron"),
            showarrow=False,
        )],
    )
    st.plotly_chart(fig, use_container_width=True)

    # ── Model Info ──
    st.markdown('<div class="section-header">🤖 Model Info</div>', unsafe_allow_html=True)
    info_items = [
        ("Algorithm",   "Logistic Regression"),
        ("Vectorizer",  "TF-IDF (unigrams + bigrams)"),
        ("Features",    "5,000 max features"),
        ("Training Set","5,572 SMS messages"),
        ("Accuracy",    "98.57%"),
        ("Classes",     "Normal | Suspicious"),
    ]
    rows = "".join(
        f'<tr><td style="color:#555;padding:0.3rem 0.5rem">{k}</td>'
        f'<td style="color:#00ccff;padding:0.3rem 0.5rem">{v}</td></tr>'
        for k, v in info_items
    )
    st.markdown(
        f'<table style="width:100%;font-size:0.78rem;border-collapse:collapse">{rows}</table>',
        unsafe_allow_html=True
    )

    # ── Threat Level Legend ──
    st.markdown('<div class="section-header">🛡️ Threat Level Guide</div>', unsafe_allow_html=True)
    st.markdown("""
    <div style="font-size:0.8rem;line-height:2.2">
      <span class="threat-badge threat-low">🟢 LOW</span>
      &nbsp; Risk score &lt; 35% — likely safe<br>
      <span class="threat-badge threat-medium">🟡 MEDIUM</span>
      &nbsp; 35–70% — review carefully<br>
      <span class="threat-badge threat-high">🔴 HIGH</span>
      &nbsp; &gt; 70% — probable threat
    </div>
    """, unsafe_allow_html=True)

    # ── Quick Test Examples ──
    st.markdown('<div class="section-header">💡 Quick Test Messages</div>', unsafe_allow_html=True)
    examples = [
        ("🚨 Phishing",  "URGENT: Your account has been SUSPENDED. Click here to verify your p@ssword immediately or lose access forever!"),
        ("🚨 Phishing",  "Congratulations! You've WON a $500 prize. Claim your reward now — limited time offer. Enter your credit card to confirm."),
        ("✅ Normal",    "Hey, are you free this weekend? We're planning a BBQ at the park on Saturday around noon."),
        ("✅ Normal",    "Your Amazon order #123-456 has shipped and will arrive by Thursday. Track at amazon.com/orders"),
    ]
    for badge, msg in examples:
        with st.expander(f"{badge}"):
            st.code(msg, language=None)

# ─────────────────────────────────────────────
# Footer
# ─────────────────────────────────────────────
st.markdown("<hr>", unsafe_allow_html=True)
st.markdown("""
<div style="text-align:center;color:#333;font-size:0.7rem;letter-spacing:3px;padding:0.5rem 0;">
  🐉 CYBER DRAGON SECURITY SYSTEM &nbsp;|&nbsp; MODEL: LOGISTIC REGRESSION + TF-IDF &nbsp;|&nbsp; ACCURACY: 98.57%
</div>
""", unsafe_allow_html=True)
