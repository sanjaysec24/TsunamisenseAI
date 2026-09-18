# 🌊 TsunamiSense AI

### AI-Powered Tsunami Risk Assessment & Decision-Support Platform

> **Understand the risk before the wave arrives.**

TsunamiSense AI is an AI-powered research and decision-support platform that analyzes earthquake parameters and geographic context to estimate potential tsunami-generation risk.

It combines **Machine Learning, Geospatial Intelligence, real-world data, explainable risk assessment, and Generative AI** into a single interactive platform.

> ⚠️ **Disclaimer:** TsunamiSense AI is a research and decision-support prototype. It is **not an official tsunami warning, forecasting, or emergency alert system** and must not be used as a replacement for authoritative tsunami-warning agencies.

---

## ✨ Features

- 🌍 Interactive real-world geographic map
- 📍 Click-to-select earthquake location
- 📌 Automatic latitude and longitude extraction
- 🔄 Bidirectional map ↔ form synchronization
- 🌋 Earthquake magnitude and depth analysis
- 🤖 Machine-learning based risk assessment
- 📊 Risk score and risk-level visualization
- 🧠 Contributing-factor analysis
- ✨ Gemini-powered AI explanation
- 🔌 Prediction API integration
- 🧹 Clear/reset location
- 📱 Mobile touch support
- ♿ Keyboard accessibility
- ⚠️ Input validation and error handling

---

## 🎯 Problem

Earthquakes contain important information such as:

- Magnitude
- Depth
- Latitude
- Longitude
- Geographic location

However, these raw parameters are difficult for a general user to interpret in terms of potential tsunami-generation risk.

TsunamiSense AI addresses this problem by combining:

```text
Earthquake Data
      +
Geographic Context
      +
Machine Learning
      +
Risk Assessment
      +
Explainable AI
      +
Interactive Visualization
```

into one analysis workflow.

---

## 💡 Solution

TsunamiSense AI provides an interactive environment where a user can select an earthquake location, enter earthquake parameters, run the ML risk-assessment pipeline, and receive an understandable explanation of the result.

### Core Workflow

```text
Interactive Map
       ↓
Location Selection
       ↓
Latitude + Longitude
       ↓
Magnitude + Depth
       ↓
Prediction API
       ↓
Machine Learning Model
       ↓
Risk Assessment
       ↓
Contributing Factors
       ↓
Gemini Explanation
       ↓
User Interface
```

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │    REAL-WORLD DATA   │
                    │                      │
                    │ USGS / NOAA / Other  │
                    │ Validated Sources    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     DATA ENGINE      │
                    │                      │
                    │ Validation / Cleaning│
                    │ Normalization        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ FEATURE ENGINEERING  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    ML MODEL ENGINE   │
                    │                      │
                    │ Risk Classification  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   RISK ASSESSMENT    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     PREDICTION API   │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴───────────┐
                    │                      │
                    ▼                      ▼
          ┌──────────────────┐   ┌──────────────────┐
          │    FRONTEND      │   │      GEMINI      │
          │                  │   │                  │
          │ Interactive Map  │   │ AI Explanation   │
          │ Analysis UI      │   │ Analyst Layer    │
          └────────┬─────────┘   └────────┬─────────┘
                   │                      │
                   └──────────┬───────────┘
                              ▼
                    ┌──────────────────┐
                    │       USER       │
                    └──────────────────┘
```

---

# 🗺️ Interactive Map

The application uses **Leaflet** for real geographic interaction.

### Features

- 🌍 Real-world geographic basemap
- 📍 Click-to-select earthquake location
- 📌 Automatic latitude/longitude extraction
- 🎯 Custom selection marker
- 📋 Location information popover
- 🔄 Map → Form synchronization
- 🔄 Form → Map synchronization
- ✅ Coordinate validation
- 🧹 Clear/reset location
- 📱 Mobile touch support

### Map → Form

When the user clicks the map:

```text
Map Click
   ↓
Latitude
   +
Longitude
   ↓
Analysis Form
```

### Form → Map

When the user manually changes the coordinates:

```text
Latitude + Longitude
        ↓
Validation
        ↓
Map Marker Reposition
```

This provides fully bidirectional geographic interaction.

---

# 🤖 Machine Learning

The ML pipeline processes earthquake and geographic features to estimate tsunami-generation risk.

### Input Features

```text
Magnitude
Depth
Latitude
Longitude
Geographic Context
Historical Context
```

Additional features are included only when supported by validated data.

---

## 🧪 Model Approaches

The project can evaluate classification approaches such as:

- Logistic Regression
- Random Forest
- Gradient Boosting

The final model is selected based on the actual evaluation results of the implemented pipeline.

---

## 📊 Model Evaluation

Because tsunami-related events can represent an imbalanced classification problem, evaluation considers multiple metrics.

### Metrics

- Precision
- Recall
- F1-Score
- ROC-AUC
- PR-AUC

> Accuracy is not used as the only evaluation metric.

### Why?

If positive events are relatively rare, a model can achieve high accuracy while still failing to identify important positive cases.

Using multiple metrics provides a better understanding of model behavior.

---

# 🧠 Risk Assessment

The machine-learning model produces the underlying assessment.

The application converts the result into user-friendly risk categories.

```text
LOW
MODERATE
HIGH
CRITICAL
```

> ⚠️ These are **application-level interpretation categories** and are not official tsunami-warning thresholds.

The application clearly separates:

```text
MODEL ASSESSMENT
```

from:

```text
OFFICIAL WARNING
```

TsunamiSense AI does not claim to provide official tsunami warnings.

---

# 🔌 Prediction API

The frontend communicates with the machine-learning pipeline through a prediction API.

### Request

```json
{
  "magnitude": 0,
  "depth_km": 0,
  "latitude": 0,
  "longitude": 0
}
```

The actual values are supplied by the user during analysis.

### Processing

```text
Frontend
   ↓
Prediction API
   ↓
Prediction Service
   ↓
Feature Processing
   ↓
ML Model
   ↓
Risk Assessment
   ↓
API Response
   ↓
Frontend
```

The frontend displays the actual assessment returned by the prediction service.

---

# ✨ Gemini AI Analyst

Gemini is used as an **explanation layer**, not as the primary prediction engine.

The architecture is intentionally separated:

```text
Earthquake Input
       ↓
Machine Learning Model
       ↓
Structured Risk Assessment
       ↓
Gemini
       ↓
Human-Readable Explanation
```

### Gemini Explains

- Why the model produced the assessment
- Important contributing factors
- Risk interpretation
- Uncertainty
- Recommended verification

### Gemini Does Not

- Calculate the primary risk score
- Override the ML model
- Replace the prediction pipeline
- Invent scientific measurements
- Invent earthquake observations
- Invent buoy readings
- Invent historical events
- Generate official warnings

If Gemini becomes unavailable, the underlying ML assessment remains independent.

---

# 🌐 Data Sources

The project is designed around authoritative public sources.

### Primary Sources

- **USGS** — Earthquake data
- **NOAA / NCEI** — Historical tsunami information

### Additional Data

Validated geographic and tectonic reference datasets may be used where applicable.

### Data Pipeline

```text
Source Data
    ↓
Validation
    ↓
Cleaning
    ↓
Normalization
    ↓
Feature Engineering
    ↓
Machine Learning
```

The project prioritizes data provenance and validation rather than fabricated or arbitrary scientific data.

---

# 🧩 Data Processing

Before data reaches the ML model, the pipeline can perform:

- Missing-value handling
- Duplicate removal
- Data-type normalization
- Geographic validation
- Feature preparation
- Data consistency checks
- Source/provenance tracking

Invalid or unsupported scientific values should not be silently fabricated.

---

# 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Mapping | Leaflet |
| Machine Learning | Python |
| Backend | Prediction API |
| Generative AI | Google Gemini |
| Earthquake Data | USGS |
| Historical Tsunami Data | NOAA / NCEI |
| Geographic Data | Validated geographic/tectonic sources |

> Exact model names, package versions, backend framework, and additional libraries should match the final verified implementation.

---

# 🔄 End-to-End User Flow

### 1. Select Location

The user opens the interactive map and selects an earthquake location.

### 2. Extract Coordinates

The system obtains:

```text
Latitude
Longitude
```

### 3. Enter Parameters

The user enters:

```text
Magnitude
Focal Depth
```

### 4. Analyze Event

The user clicks:

```text
ANALYZE EVENT
```

### 5. Prediction

The frontend sends the event parameters to the prediction API.

### 6. ML Assessment

The ML pipeline processes the event and produces the underlying assessment.

### 7. Risk Result

The application displays the available:

```text
Risk Score
Risk Level
Model Probability
Contributing Factors
```

### 8. AI Explanation

Gemini explains the structured assessment in natural language.

---

# 🎯 Core Design Principle

> **The ML model predicts. The API connects. The map provides geographic context. Gemini explains.**

This separation keeps the system:

- Modular
- Explainable
- Maintainable
- Easier to test
- Safer to integrate with Generative AI

---

# 🔐 Security

Sensitive credentials must never be committed to the repository.

Environment variables should be used for API keys and secrets.

Example:

```env
GEMINI_API_KEY=your_api_key
```

### Security Rules

- Never commit real API keys
- Never expose private keys in frontend code
- Use environment variables
- Keep `.env` files out of Git
- Provide `.env.example` without real credentials

Recommended `.gitignore` entries:

```gitignore
.env
.env.local
.env.*.local
```

---

# 🧪 Testing

The project should be validated across multiple layers.

### Data

- Source validation
- Missing values
- Duplicate records
- Invalid geographic values

### Machine Learning

- Model loading
- Prediction function
- Evaluation metrics
- Edge cases

### API

- Request validation
- Correct payload
- Response structure
- Error handling

### Interactive Map

- Map click
- Coordinate extraction
- Marker placement
- Marker movement
- Form synchronization
- Clear location

### Gemini

- Explanation generation
- Structured input
- Failure handling
- No prediction override
- No fabricated measurements

### UI

- Desktop responsiveness
- Mobile responsiveness
- Keyboard navigation
- Loading states
- Error states

---

# ⚠️ Error Handling

The application should gracefully handle:

- Invalid coordinates
- Missing magnitude
- Missing depth
- API unavailable
- ML model unavailable
- Gemini unavailable
- Network failures
- Invalid API responses
- Map loading failures

The user should receive understandable messages rather than raw technical errors.

Example:

```text
Risk analysis could not be completed.
Please verify the event inputs and try again.
```

---

# 📱 Responsive Design

TsunamiSense AI is designed for both desktop and mobile interaction.

### Desktop

```text
Large Interactive Map
        +
Analysis Controls
        +
Risk Assessment
        +
AI Explanation
```

### Mobile

```text
Map
 ↓
Location
 ↓
Analysis Form
 ↓
Risk Result
 ↓
AI Explanation
```

The core analysis workflow should remain usable on smaller screens.

---

# ♿ Accessibility

The interface includes accessibility considerations such as:

- Keyboard navigation
- Visible focus states
- Semantic buttons
- Form labels
- Input validation messages
- Mobile touch support
- Readable contrast
- Risk information not dependent only on color

---

# 🚧 Project Status

### Core MVP

- [x] Interactive geographic map
- [x] Map location selection
- [x] Coordinate extraction
- [x] Bidirectional map/form synchronization
- [x] Earthquake analysis form
- [x] ML prediction integration
- [x] Risk assessment
- [x] Contributing factors
- [x] Gemini explanation
- [x] Clear location functionality
- [x] Mobile interaction
- [x] Keyboard accessibility

### Final Verification

- [ ] Verify all external data layers
- [ ] Verify final production ML model
- [ ] Verify final evaluation metrics
- [ ] Verify API failure handling
- [ ] Verify all scientific values displayed by the UI
- [ ] Complete responsive testing
- [ ] Remove development/debug artifacts
- [ ] Complete production deployment

---

# 🔮 Future Scope

Potential future improvements include:

- 🌍 Real-time earthquake ingestion
- 🌋 Expanded tectonic analysis
- 🌊 Additional ocean observations
- 🗺️ Advanced geospatial analysis
- 🔁 Historical event replay
- 🧠 Improved model calibration
- 📈 Model monitoring
- 🔍 Advanced explainability
- 🚨 Integration with authoritative alert infrastructure where appropriate

Future capabilities will only be represented as active features after actual implementation and validation.

---

# 📂 Suggested Project Structure

```text
TsunamiSense-AI/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── map/
│   └── services/
│
├── backend/
│   ├── api/
│   ├── services/
│   └── models/
│
├── ml/
│   ├── data/
│   ├── preprocessing/
│   ├── features/
│   ├── training/
│   └── prediction/
│
├── docs/
│
├── .env.example
├── .gitignore
├── README.md
└── requirements.txt
```

> The actual repository structure may differ depending on the final implementation.

---

# 🎓 What This Project Demonstrates

TsunamiSense AI demonstrates an end-to-end AI engineering workflow:

```text
Real-World Data
      ↓
Data Engineering
      ↓
Feature Engineering
      ↓
Machine Learning
      ↓
Risk Assessment
      ↓
API Engineering
      ↓
Geospatial Interaction
      ↓
Explainable AI
      ↓
Generative AI
      ↓
Human-Centered UI
```

The project demonstrates that building an AI application involves more than training a model.

It also requires:

- Data quality
- Model evaluation
- API design
- Geospatial interaction
- Explainability
- Security
- Error handling
- User experience
- Responsible AI design

---

# ⚠️ Scientific Limitations

Tsunami generation is a complex physical process involving geological and oceanographic factors that cannot be completely represented by a small machine-learning feature set.

Therefore:

- Model outputs are estimates
- Historical relationships do not guarantee future behavior
- Data quality affects model performance
- Model uncertainty must be considered
- The system does not replace physical tsunami forecasting models
- The system does not replace official warning agencies
- The system should not be used as an emergency alert mechanism

For real emergencies, always rely on official tsunami-warning and emergency authorities.

---

# 🌊 Project Vision

> **Make complex disaster-risk information easier to understand using AI, without replacing scientific and emergency-response infrastructure.**

---

# 💬 Interview Explanation

### One Sentence

> **TsunamiSense AI uses earthquake and geographic information with machine learning to estimate tsunami-generation risk, while an interactive map provides the location input and Gemini explains the resulting assessment.**

### Simple Technical Explanation

```text
The map gives the location.
        ↓
The form gives earthquake parameters.
        ↓
The ML model calculates the assessment.
        ↓
The API connects the system.
        ↓
Gemini explains the result.
        ↓
The UI makes everything understandable.
```

---

# 🏆 Key Takeaway

TsunamiSense AI is built around a simple separation of responsibilities:

```text
🗺️ MAP
Provides geographic input

📊 DATA
Provides real-world evidence

🤖 ML
Produces the risk assessment

🔌 API
Connects the components

🧠 EXPLAINABILITY
Shows contributing factors

✨ GEMINI
Explains the assessment

💻 UI
Makes the system understandable
```

---

# ⚠️ Disclaimer

**TsunamiSense AI is an experimental research and decision-support prototype.**

It is **not an official tsunami warning system, emergency alert service, or replacement for authoritative tsunami forecasting agencies**.

The model's output should be treated as an analytical estimate and not as a confirmed prediction or emergency instruction.

For real emergencies, always rely on official government, emergency-response, and tsunami-warning authorities.

---

## 🌊 TsunamiSense AI

**AI · Machine Learning · Geospatial Intelligence · Explainable AI · Generative AI**

> **Understand the risk before the wave arrives.**
