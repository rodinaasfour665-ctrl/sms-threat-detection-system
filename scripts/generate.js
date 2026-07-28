const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, PageBreak, LevelFormat, Header, Footer,
  TabStopType, TabStopPosition
} = require("docx");
const fs = require("fs");

// ── Colors ──────────────────────────────────
const DARK_BLUE  = "1F3864";
const MID_BLUE   = "2E5BA8";
const LIGHT_BLUE = "D0E4F7";
const ACCENT     = "C00000";
const LIGHT_GRAY = "F2F2F2";
const MID_GRAY   = "BFBFBF";
const WHITE      = "FFFFFF";

// ── Helpers ──────────────────────────────────
const border = { style: BorderStyle.SINGLE, size: 1, color: MID_GRAY };
const borders = { top: border, bottom: border, left: border, right: border };

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, font: "Arial", size: 32, color: WHITE })],
    shading: { fill: DARK_BLUE, type: ShadingType.CLEAR },
    spacing: { before: 360, after: 180 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: MID_BLUE, space: 1 } },
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, font: "Arial", size: 26, color: DARK_BLUE })],
    spacing: { before: 280, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_BLUE, space: 1 } },
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, font: "Arial", size: 22, color: MID_BLUE })],
    spacing: { before: 200, after: 80 },
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Arial", size: 22, ...opts })],
    spacing: { before: 80, after: 80 },
  });
}

function bullet(text, bold_prefix = "") {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [
      ...(bold_prefix ? [new TextRun({ text: bold_prefix + " ", bold: true, font: "Arial", size: 22 })] : []),
      new TextRun({ text, font: "Arial", size: 22 }),
    ],
    spacing: { before: 60, after: 60 },
  });
}

function numbered(text, bold_prefix = "") {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    children: [
      ...(bold_prefix ? [new TextRun({ text: bold_prefix + " ", bold: true, font: "Arial", size: 22 })] : []),
      new TextRun({ text, font: "Arial", size: 22 }),
    ],
    spacing: { before: 60, after: 60 },
  });
}

function spacer(lines = 1) {
  return Array.from({ length: lines }, () =>
    new Paragraph({ children: [new TextRun("")], spacing: { before: 0, after: 0 } })
  );
}

function infoBox(label, value, labelColor = MID_BLUE) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 2800, type: WidthType.DXA },
        borders,
        shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, font: "Arial", size: 20, color: DARK_BLUE })] })],
      }),
      new TableCell({
        width: { size: 6560, type: WidthType.DXA },
        borders,
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: value, font: "Arial", size: 20 })] })],
      }),
    ],
  });
}

function makeTable(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: DARK_BLUE, type: ShadingType.CLEAR },
      borders,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, color: WHITE, font: "Arial", size: 20 })] })],
    })),
  });

  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      width: { size: colWidths[ci], type: WidthType.DXA },
      borders,
      shading: { fill: ri % 2 === 0 ? WHITE : LIGHT_GRAY, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: cell, font: "Arial", size: 20 })] })],
    })),
  }));

  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: colWidths, rows: [headerRow, ...dataRows] });
}

// ── Document ──────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
      },
      {
        reference: "numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
      },
    ],
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: WHITE, font: "Arial" },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: DARK_BLUE, font: "Arial" },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, color: MID_BLUE, font: "Arial" },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ],
  },
  sections: [
    // ══════════════════════════════════════════
    // COVER PAGE
    // ══════════════════════════════════════════
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
      },
      children: [
        ...spacer(4),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "CYBER DRAGON", bold: true, font: "Arial", size: 72, color: DARK_BLUE })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Security Dashboard", bold: true, font: "Arial", size: 52, color: MID_BLUE })],
          spacing: { before: 120, after: 120 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: MID_BLUE, space: 1 }, top: { style: BorderStyle.SINGLE, size: 8, color: MID_BLUE, space: 1 } },
          children: [new TextRun({ text: "Message Urgency & Threat Detection System", font: "Arial", size: 28, color: ACCENT, bold: true })],
          spacing: { before: 240, after: 240 },
        }),
        ...spacer(2),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Technical Architecture & Project Documentation", font: "Arial", size: 26, color: "444444" })],
        }),
        ...spacer(3),
        new Table({
          width: { size: 5760, type: WidthType.DXA },
          columnWidths: [2400, 3360],
          rows: [
            infoBox("Document Type", "Technical Report"),
            infoBox("Project Name", "Cyber Dragon Security Dashboard"),
            infoBox("Version", "1.0"),
            infoBox("Model Accuracy", "98.57%"),
            infoBox("Dataset Size", "5,572 SMS messages"),
            infoBox("Algorithm", "Logistic Regression + TF-IDF"),
          ],
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },

    // ══════════════════════════════════════════
    // MAIN CONTENT
    // ══════════════════════════════════════════
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1260, bottom: 1080, left: 1260 } },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Cyber Dragon Security Dashboard  |  Technical Documentation", font: "Arial", size: 18, color: MID_BLUE }),
              ],
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_BLUE, space: 1 } },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_BLUE, space: 1 } },
              tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
              children: [
                new TextRun({ text: "Confidential  |  v1.0", font: "Arial", size: 18, color: "888888" }),
                new TextRun({
                      children: ["Page "],
                     }),
              ],
            }),
          ],
        }),
      },
      children: [

        // ── 1. EXECUTIVE SUMMARY ──
        heading1("1. Executive Summary"),
        body("The Cyber Dragon Security Dashboard is a production-ready machine learning system designed to automatically classify messages as either Normal or Suspicious. It provides real-time threat detection for SMS messages, emails, and notifications using Natural Language Processing (NLP) techniques combined with a cyberpunk-styled interactive web dashboard."),
        ...spacer(1),
        body("The system achieves 98.57% classification accuracy on the UCI SMS Spam Collection benchmark dataset — one of the most widely used real-world datasets for spam/threat detection research."),
        ...spacer(1),

        makeTable(
          ["Metric", "Result"],
          [
            ["Overall Accuracy", "98.57%"],
            ["Normal (Ham) Precision", "99%"],
            ["Suspicious (Spam) Precision", "96%"],
            ["Suspicious Recall", "93%"],
            ["F1-Score (Suspicious)", "0.95"],
            ["Test Set Size", "1,115 messages"],
            ["Misclassifications", "16 out of 1,115"],
          ],
          [4680, 4680]
        ),
        ...spacer(1),

        // ── 2. PROJECT OVERVIEW ──
        heading1("2. Project Overview"),
        heading2("2.1 Objectives"),
        body("The project was built to fulfill the following goals:"),
        bullet("Classify messages in real-time as Normal or Suspicious"),
        bullet("Provide a risk score from 0 to 100% for each message"),
        bullet("Detect specific urgency and threat keywords within messages"),
        bullet("Display threat level categorization: Low, Medium, or High"),
        bullet("Offer a professional cyberpunk-themed dashboard for security analysts"),
        bullet("Track analysis history and live session statistics"),
        ...spacer(1),

        heading2("2.2 Dataset"),
        body("The project uses the UCI SMS Spam Collection dataset, loaded from the user-provided file SpamCollectionSMS.txt. This is a publicly available benchmark dataset widely used in NLP spam detection research."),
        ...spacer(1),
        makeTable(
          ["Property", "Value"],
          [
            ["Total Messages", "5,572"],
            ["Normal (Ham) Messages", "4,825  (86.6%)"],
            ["Suspicious (Spam) Messages", "747  (13.4%)"],
            ["Source", "UCI Machine Learning Repository"],
            ["Format", "Tab-separated: label + message"],
            ["Output CSV", "dataset.csv (Normal / Suspicious labels)"],
          ],
          [3600, 5760]
        ),
        ...spacer(1),

        // ── 3. SYSTEM ARCHITECTURE ──
        heading1("3. System Architecture"),
        body("The system is composed of four independent layers that are decoupled for maintainability and scalability. Data flows from the raw dataset through preprocessing and training, culminating in a live dashboard that never retrains the model at runtime."),
        ...spacer(1),

        heading2("3.1 Architecture Layers"),
        makeTable(
          ["Layer", "Component", "Technology", "Purpose"],
          [
            ["Data Layer", "dataset.csv", "Pandas / CSV", "Stores 5,572 labeled SMS messages"],
            ["ML Layer", "train.py", "scikit-learn", "Preprocessing, vectorization, training"],
            ["Model Layer", "model.pkl + vectorizer.pkl", "joblib", "Serialized trained artifacts"],
            ["App Layer", "app.py", "Streamlit + Plotly", "Interactive real-time dashboard"],
          ],
          [1800, 2200, 2000, 3360]
        ),
        ...spacer(1),

        heading2("3.2 Data Flow"),
        body("The end-to-end pipeline follows this sequence:"),
        numbered("Raw SMS data is read from SpamCollectionSMS.txt (tab-separated, ham/spam labels)"),
        numbered("Labels are mapped: ham -> Normal, spam -> Suspicious and saved as dataset.csv"),
        numbered("train.py loads dataset.csv, applies text preprocessing, fits TF-IDF vectorizer"),
        numbered("Logistic Regression model is trained on 80% of data (4,457 messages)"),
        numbered("Model evaluated on 20% test set (1,115 messages): 98.57% accuracy"),
        numbered("Both model.pkl and vectorizer.pkl are serialized with joblib"),
        numbered("app.py loads model.pkl and vectorizer.pkl once at startup (cached)"),
        numbered("User input is preprocessed identically and classified in real time"),
        ...spacer(1),

        heading2("3.3 ML Pipeline Detail"),
        heading3("Text Preprocessing"),
        body("All text passes through a deterministic preprocessing function before vectorization or prediction:"),
        bullet("Convert to lowercase"),
        bullet("Remove all punctuation and non-alphanumeric characters (regex substitution)"),
        bullet("Collapse multiple whitespace characters to single spaces"),
        bullet("Strip leading and trailing whitespace"),
        ...spacer(1),

        heading3("TF-IDF Vectorization"),
        body("The TfidfVectorizer is configured with the following parameters:"),
        makeTable(
          ["Parameter", "Value", "Rationale"],
          [
            ["max_features", "5,000", "Caps vocabulary to prevent overfitting"],
            ["ngram_range", "(1, 2)", "Captures single words and two-word phrases"],
            ["sublinear_tf", "True", "Applies log normalization to term frequencies"],
          ],
          [2400, 2400, 4560]
        ),
        ...spacer(1),

        heading3("Logistic Regression Classifier"),
        makeTable(
          ["Parameter", "Value", "Rationale"],
          [
            ["C (regularization)", "1.0", "Default — balanced bias/variance"],
            ["class_weight", "balanced", "Compensates for 87/13 class imbalance"],
            ["solver", "lbfgs", "Efficient for multi-class, smaller datasets"],
            ["max_iter", "1,000", "Ensures convergence"],
          ],
          [2400, 2400, 4560]
        ),
        ...spacer(1),

        // ── 4. FILE STRUCTURE ──
        heading1("4. Project File Structure"),
        body("The project consists of 7 files organized in a flat structure for simplicity:"),
        ...spacer(1),
        makeTable(
          ["File", "Size", "Purpose"],
          [
            ["dataset.csv", "~490 KB", "5,572 labeled SMS messages (Normal / Suspicious)"],
            ["train.py", "~4 KB", "Full model training script with evaluation output"],
            ["model.pkl", "~41 KB", "Serialized Logistic Regression model (joblib)"],
            ["vectorizer.pkl", "~183 KB", "Serialized TF-IDF vectorizer with 5,000-feature vocabulary"],
            ["app.py", "~21 KB", "Streamlit dashboard — cyberpunk UI, real-time prediction"],
            ["requirements.txt", "<1 KB", "Python dependency declarations"],
            ["README.md", "~2 KB", "Setup instructions and performance summary"],
          ],
          [2200, 1400, 5760]
        ),
        ...spacer(1),

        // ── 5. DASHBOARD FEATURES ──
        heading1("5. Streamlit Dashboard (app.py)"),
        heading2("5.1 Feature Overview"),
        makeTable(
          ["Feature", "Description"],
          [
            ["Message Input", "Multi-line textarea for SMS, email, or notification text"],
            ["Threat Classification", "Instant Normal / Suspicious label with color coding"],
            ["Risk Score", "Probability 0-100% with gradient progress bar"],
            ["Threat Level", "Low (<35%) / Medium (35-70%) / High (>70%) badge"],
            ["Keyword Detection", "30+ urgency and threat keywords scanned and listed"],
            ["Keyword Highlighting", "Matched keywords highlighted inline in the input text"],
            ["Session Counters", "Live Total / Normal / Suspicious counts for the session"],
            ["Pie Chart", "Plotly donut chart showing detection distribution"],
            ["History Table", "Last 10 analyzed messages with label and risk score"],
            ["Model Info Panel", "Algorithm, accuracy, training set details"],
            ["Quick Test Examples", "Pre-loaded phishing and normal message examples"],
          ],
          [3000, 6360]
        ),
        ...spacer(1),

        heading2("5.2 Cyberpunk UI Design"),
        body("The dashboard implements a cyberpunk security console aesthetic with the following design choices:"),
        bullet("Dark background: #0a0a0f (near-black)"),
        bullet("Neon green (#00ff88) for safe/normal indicators and primary accents"),
        bullet("Neon red (#ff2255) for threat/suspicious indicators with pulse animation"),
        bullet("Cyan (#00ccff) for headers, labels, and informational elements"),
        bullet("Orbitron Google Font for titles and metric values (futuristic aesthetic)"),
        bullet("Share Tech Mono for body text (terminal/console feel)"),
        bullet("Glowing CSS text-shadow effects on all key labels"),
        bullet("Animated pulsing red glow on suspicious result cards"),
        ...spacer(1),

        heading2("5.3 predict_message() Function"),
        body("A standalone prediction function is provided that can be imported and used independently of the Streamlit UI:"),
        ...spacer(1),
        new Paragraph({
          children: [new TextRun({ text: 'result = predict_message("URGENT: Verify your account password now!")', font: "Courier New", size: 20, color: ACCENT })],
          shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR },
          spacing: { before: 60, after: 60 },
          indent: { left: 360 },
        }),
        ...spacer(1),
        body("Return value structure:"),
        makeTable(
          ["Key", "Type", "Example"],
          [
            ["label", "string", '"Suspicious" or "Normal"'],
            ["risk_score", "float", "0.93"],
            ["detected_keywords", "list[str]", '["urgent", "verify", "password", "account"]'],
          ],
          [2400, 1800, 5160]
        ),
        ...spacer(1),

        // ── 6. KEYWORD DETECTION ──
        heading1("6. Keyword Detection System"),
        body("The keyword detection module runs independently from the ML model and matches 30+ predefined patterns against each message. Keywords are grouped into two categories:"),
        ...spacer(1),
        heading2("6.1 Urgency Keywords"),
        body("These keywords signal time pressure or immediate action demands:"),
        bullet("urgent, act now, immediately, limited time, expires"),
        bullet("last chance, hurry, right now, today only, asap"),
        bullet("deadline, respond now, immediate action, don't wait"),
        ...spacer(1),
        heading2("6.2 Threat Keywords"),
        body("These keywords relate to account security, financial data, or known phishing patterns:"),
        bullet("password, p@ssword, passw0rd (obfuscation variants)"),
        bullet("account, login, verify, reset, security"),
        bullet("credit card, bank, social security, ssn, pin, otp"),
        bullet("click here, cl1ck (obfuscation), suspended, confirm"),
        bullet("winner, prize, claim, free, cash, won, congratulations"),
        ...spacer(1),

        // ── 7. HOW TO RUN ──
        heading1("7. Setup & Execution Guide"),
        heading2("7.1 Prerequisites"),
        bullet("Python 3.8 or higher"),
        bullet("pip package manager"),
        bullet("Internet access (for Google Fonts in Streamlit only)"),
        ...spacer(1),
        heading2("7.2 Installation Steps"),
        numbered("Download all 7 project files into the same directory"),
        numbered("Open a terminal in that directory"),
        numbered("Install Python dependencies:  pip install -r requirements.txt"),
        numbered("(Optional) Retrain the model:  python train.py"),
        numbered("Launch the dashboard:  streamlit run app.py"),
        numbered("Open browser at:  http://localhost:8501"),
        ...spacer(1),

        heading2("7.3 Dependencies"),
        makeTable(
          ["Package", "Version", "Purpose"],
          [
            ["scikit-learn", ">=1.3.0", "TF-IDF vectorizer and Logistic Regression"],
            ["pandas", ">=2.0.0", "Dataset loading and preprocessing"],
            ["numpy", ">=1.24.0", "Numerical operations"],
            ["joblib", ">=1.3.0", "Model serialization (pkl files)"],
            ["streamlit", ">=1.32.0", "Web dashboard framework"],
            ["plotly", ">=5.18.0", "Interactive donut chart"],
          ],
          [2400, 1800, 5160]
        ),
        ...spacer(1),

        // ── 8. PERFORMANCE ──
        heading1("8. Model Performance & Evaluation"),
        heading2("8.1 Classification Report"),
        makeTable(
          ["Class", "Precision", "Recall", "F1-Score", "Support"],
          [
            ["Normal", "0.99", "0.99", "0.99", "966"],
            ["Suspicious", "0.96", "0.93", "0.95", "149"],
            ["Accuracy", "", "", "0.99", "1,115"],
            ["Macro Avg", "0.97", "0.96", "0.97", "1,115"],
            ["Weighted Avg", "0.99", "0.99", "0.99", "1,115"],
          ],
          [2600, 1700, 1700, 1700, 1660]
        ),
        ...spacer(1),

        heading2("8.2 Confusion Matrix"),
        makeTable(
          ["", "Predicted Normal", "Predicted Suspicious"],
          [
            ["True Normal", "960", "6"],
            ["True Suspicious", "10", "139"],
          ],
          [3120, 3120, 3120]
        ),
        body("The model shows excellent performance with only 16 total errors: 6 normal messages incorrectly flagged (false positives) and 10 suspicious messages missed (false negatives)."),
        ...spacer(1),

        heading2("8.3 Why These Results Are Strong"),
        bullet("98.57% accuracy on a highly imbalanced dataset (87/13 split)"),
        bullet("class_weight='balanced' prevents the model from defaulting to the majority class"),
        bullet("Bigram features (ngram_range=(1,2)) capture multi-word phishing phrases"),
        bullet("sublinear_tf normalization reduces the impact of repeated spam words"),
        ...spacer(1),

        // ── 9. DESIGN DECISIONS ──
        heading1("9. Design Decisions & Trade-offs"),
        makeTable(
          ["Decision", "Choice Made", "Alternative", "Reason"],
          [
            ["Algorithm", "Logistic Regression", "Naive Bayes, SVM, BERT", "Fast, interpretable, excellent on TF-IDF, no GPU required"],
            ["Vectorizer", "TF-IDF bigrams", "Count vectorizer, word2vec", "Captures phrase context without heavy compute"],
            ["Model storage", "joblib .pkl", "pickle, ONNX", "Fastest serialization for scikit-learn objects"],
            ["Dashboard", "Streamlit", "Flask, FastAPI, Dash", "Zero-boilerplate, native Python, fast iteration"],
            ["Charts", "Plotly", "Matplotlib, Altair", "Interactive, dark-theme compatible, animated"],
            ["Deployment", "Local CLI", "Docker, cloud deploy", "Simplest setup; trivially containerizable"],
          ],
          [1800, 2200, 2000, 3360]
        ),
        ...spacer(1),

        // ── 10. FUTURE IMPROVEMENTS ──
        heading1("10. Future Improvements"),
        heading2("10.1 Model Enhancements"),
        bullet("Fine-tune a DistilBERT or TinyBERT model on the same dataset for semantic understanding"),
        bullet("Add URL/link detection as an additional feature signal"),
        bullet("Implement ensemble voting between Logistic Regression and Naive Bayes"),
        bullet("Add character-level n-gram features to better handle obfuscated text (p@ssw0rd)"),
        ...spacer(1),
        heading2("10.2 Dashboard Enhancements"),
        bullet("Persistent database (SQLite) to store analysis history across sessions"),
        bullet("Batch file upload: analyze multiple messages at once from CSV"),
        bullet("Export history to PDF or Excel report"),
        bullet("REST API endpoint for integration with email clients or SIEM tools"),
        bullet("Admin panel for retraining on new labeled data"),
        ...spacer(1),

        // ── SIGNATURE LINE ──
        ...spacer(2),
        new Paragraph({
  border: {
    top: { style: BorderStyle.SINGLE, size: 4, color: LIGHT_BLUE, space: 1 },
  },
  tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
  children: [
    new TextRun({ text: "Confidential  |  v1.0", font: "Arial", size: 18, color: "888888" }),
    new TextRun({ text: "\tPage ", font: "Arial", size: 18, color: "888888" }),
    new TextRun({
      children: [PageNumber.CURRENT],
    }),
  ],
})
      ],
    },
  ],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("Cyber_Dragon_Technical_Documentation.docx", buf);
  console.log("Done.");
});