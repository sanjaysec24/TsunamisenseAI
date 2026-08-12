# TSUNAMISENSE AI — SYSTEM TECHNICAL ARCHITECTURE

## 1. Locked Project Roadmap Sequence

- **PHASE 0**: Product Definition + Technical Architecture Foundation [COMPLETED]
- **PHASE 1**: Data Engine (USGS Seismology, NOAA NCEI Historical Dataset, Tectonic Registries) [COMPLETED - PHASE 1.1]
- **PHASE 2**: ML Engine (Gradient Boosted Trees + Hydrodynamic Feature Engineering)
- **PHASE 3**: TsunamiSense Intelligence Engine (Multi-source Risk Fusion & Decision Rules)
- **PHASE 4**: Gemini Analyst (Google GenAI SDK Integration, Function Calling, Natural Language Rationale)
- **PHASE 5**: Backend Service (FastAPI / Express API layer)
- **PHASE 6**: Real-Time Pipeline (WebSocket / Server-Sent Events Streaming)
- **PHASE 7**: Interactive GIS Visualization (Mapbox GL / Leaflet Vector Layers)
- **PHASE 8**: Validation + Demo Benchmarks

---

## 2. End-to-End Data Pipeline Architecture

```
[ USGS / NOAA / DART Feeds ]
             │
             ▼
      [ INGESTION ]  ──>  [ NORMALIZATION ]
                                │
                                ▼
                   [ FEATURE ENGINEERING ]
                     - Seafloor Displacement ΔZ
                     - Distance to Trench Axis
                     - Epicentral Water Column Depth H
                                │
                                ▼
                       [ ML MODEL INFERENCE ]
                         - Random Forest / XGBoost
                                │
                                ▼
                      [ RISK ASSESSMENT ]
                        - Score (0 - 100)
                        - Level & Confidence
                                │
                                ▼
                       [ BACKEND API LAYER ]
                                │
         ┌──────────────────────┴──────────────────────┐
         ▼                                             ▼
  [ FRONTEND UI / GIS ]                     [ GEMINI AI ANALYST ]
  - Monitor Dashboard                       - Natural Language Rationale
  - Earthquake Analyzer                     - Historical Analog Synthesis
  - 5-Layer Map Viewport
```

---

## 3. ML Service & Gemini Service Boundaries

### ML Service Boundary
```
Frontend Client  ──(POST /api/predict)──>  Backend API  ──>  ML Model Inference
```
- **Input**: `EarthquakeEvent` (`magnitude`, `depthKm`, `latitude`, `longitude`, `focalMechanism`)
- **Output**: `RiskAssessment` (`riskScore`, `riskLevel`, `confidence`, `contributingFactors`)
- **Rule**: The frontend NEVER calculates or fabricates ML risk scores. In Phase 0, the frontend receives a clean `DISCONNECTED` response.

### Gemini Service Boundary
```
Frontend Client  ──(POST /api/ai/explain)──>  Backend API  ──>  Gemini 2.5 Flash
```
- **Input**: Structured factual parameters (`EarthquakeEvent` + `RiskAssessment` + User Query)
- **Output**: `AIExplainApiResponse` (`explanation`, `phase`)
- **Rule**: Gemini receives structured facts; it does not compute physics or risk scores independently.

---

## 4. API Endpoint Contracts

1. `POST /api/predict`: Submits earthquake parameters for ML tsunami generation modeling.
2. `GET /api/events`: Fetches live/recent earthquake feeds ($M \ge 5.0$).
3. `GET /api/events/:id`: Retrieves full metadata for a specific seismic event.
4. `GET /api/historical`: Queries historical tsunami benchmark events from NOAA NCEI dataset.
5. `GET /api/ocean-observations`: Fetches telemetry from the DART deep-ocean buoy network.
6. `POST /api/ai/explain`: Requests Gemini AI Analyst natural language explanation.
7. `GET /api/health`: Subsystem health check and Phase status indicator.

---

## 5. 5-Layer GIS Map Architecture

1. **Layer 1: Earthquakes (USGS)** — Focal depth and magnitude-scaled markers.
2. **Layer 2: Historical Tsunamis (NOAA NCEI)** — Benchmark historic epicenter locations.
3. **Layer 3: ML Risk Heatmap** — Predicted tsunami potential contours and propagation vectors.
4. **Layer 4: DART Deep-Ocean Buoys** — Water height elevation telemetry stations.
5. **Layer 5: Tectonic Context** — Plate boundaries, fault lines, and subduction trench axes.

---

## 6. Strict Data & Scientific Integrity Policy

- Zero fabricated scientific measurements or fake risk scores.
- Standardized status badges: `AWAITING DATA INTEGRATION`, `PREDICTION ENGINE DISCONNECTED`, `PHASE 4 REQUIRED`.
- Clear legal disclaimer: *TsunamiSense AI is a research decision-support prototype and does not replace official tsunami warning centers.*
