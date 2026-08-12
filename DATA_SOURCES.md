# TSUNAMISENSE AI — DATA SOURCES REGISTRY

This document serves as the authoritative, human-readable and machine-auditable registry of all scientific datasets integrated into the **TsunamiSense AI Data Engine (Phase 1.1)**.

---

## 1. PRIMARY SOURCE 1: USGS Earthquake Catalog (FDSN Web Service)

- **Source Name:** USGS Earthquake Catalog / FDSN Event Web Service
- **Organization:** United States Geological Survey (USGS) Earthquake Hazards Program
- **Official URL:** `https://earthquake.usgs.gov/fdsnws/event/1/`
- **API Query Endpoint:** `https://earthquake.usgs.gov/fdsnws/event/1/query`
- **Purpose:** Primary authoritative source for real-time and historical global earthquake origin times, epicentral coordinates, focal depths, magnitudes ($M_w$, $M_{wc}$, $M_{ww}$, $M_b$, $M_s$), event status, and USGS event page links.
- **Access Method:** Public RESTful Web Service (No API key required)
- **Supported Formats:** GeoJSON, CSV, QuakeML
- **Update Characteristics:** Real-time stream (updated every 1–5 minutes for global events $M \ge 2.5$)
- **Core Fields Ingested:**
  - `id`: USGS Unique Event Identifier (e.g., `us7000lui3`)
  - `properties.time`: Origin time in Epoch milliseconds (normalized to UTC ISO 8601)
  - `geometry.coordinates[0]`: Longitude (Decimal degrees, $-180$ to $+180$)
  - `geometry.coordinates[1]`: Latitude (Decimal degrees, $-90$ to $+90$)
  - `geometry.coordinates[2]`: Focal Depth in kilometers
  - `properties.mag`: Moment Magnitude
  - `properties.magType`: Magnitude calculation scale ($M_w$, $M_{wc}$, $M_{ww}$, etc.)
  - `properties.place`: Geographic location description
  - `properties.type`: Event category (`earthquake`, `subduction megathrust`, etc.)
  - `properties.status`: Event status (`automatic`, `reviewed`)
  - `properties.tsunami`: Initial USGS Tsunami Warning Flag (0 or 1)
- **Limitations:** Focal mechanisms and centroid moment tensors ($CMT$) are available for events $M \ge 5.5$ via detail queries.
- **License / Usage:** Public Domain (U.S. Government Work)
- **Retrieval Timestamp:** Real-time on query execution.

---

## 2. PRIMARY SOURCE 2: NOAA/NCEI Global Historical Tsunami Database

- **Source Name:** NCEI/WDS Global Historical Tsunami Database
- **Organization:** National Oceanic and Atmospheric Administration (NOAA) / National Centers for Environmental Information (NCEI)
- **Official URL:** `https://www.ngdc.noaa.gov/hazard/tsunami.shtml`
- **Dataset / Service:** NOAA NCEI Historical Tsunami Event Service (`hazel/hazard-service/api/v1/tsunamis/events`)
- **Purpose:** Primary historical benchmark database for tsunamigenic events from 2000 BCE to present, recording source parameters, water height measurements, and impact statistics.
- **Access Method:** Public Web API / TSV / CSV / GeoJSON export
- **Supported Formats:** TSV, GeoJSON, JSON API
- **Update Characteristics:** Periodically updated as post-event scientific field surveys complete
- **Core Fields Ingested:**
  - `id`: NCEI Historical Tsunami Event ID
  - `year`, `month`, `day`, `hour`, `minute`: Event occurrence timestamp (UTC)
  - `latitude`, `longitude`: Source geographic coordinates
  - `causeCode`: Primary tsunami generation mechanism (0 = Unknown, 1 = Earthquake, 2 = Volcanic Eruption, 3 = Landslide, etc.)
  - `tsunamiMagnitude`: Validity scale / Tsunami intensity scale ($M_t$)
  - `maxWaterHeight`: Maximum observed water height above sea level (meters)
  - `country`, `locationName`: Affected region name and nation
  - `deathsDirect`, `deathsTotal`: Direct and total fatalities estimate
  - `damageAmountMillion`: Economic damage estimate in USD millions
  - `earthquakeEventId`: Associated USGS/NCEI earthquake source identifier (where available)
- **Limitations:** Pre-1900 events rely on historical archives and variable runup accuracy.
- **License / Usage:** Public Domain (NOAA Open Data Policy)

---

## 3. PRIMARY SOURCE 3: NOAA/NCEI Tsunami Run-Up Observations Database

- **Source Name:** NOAA/NCEI Tsunami Run-Up Dataset
- **Organization:** NOAA National Centers for Environmental Information (NCEI)
- **Official URL:** `https://www.ngdc.noaa.gov/hazard/tsu_db.shtml`
- **Purpose:** Detailed localized coastal run-up measurements, tide gauge peaks, and field survey water column height observations associated with historical tsunami events.
- **Access Method:** Public Web Service / TSV Export
- **Supported Formats:** TSV, CSV
- **Update Characteristics:** Event-triggered survey additions
- **Core Fields Ingested:**
  - `runupId`: Unique runup record identifier
  - `eventId`: Foreign key referencing `noaa_tsunami_event_id`
  - `latitude`, `longitude`: Runup measurement site coordinates
  - `firstWaveArrival`: Arrival time relative to earthquake origin
  - `waveHeight`: Peak-to-trough wave height (meters)
  - `runupHeight`: Maximum elevation reached by water inland (meters)
  - `measurementType`: Gauge type (Tide Gauge, DART Buoy, Eyewitness, Survey Mark)
- **Limitations:** Spatial coverage is dense near populated coastlines, sparse in unpopulated island arc zones.

---

## 4. PRIMARY SOURCE 4: Authoritative Tectonic & Geographic Information

- **Source Name:** USGS Geoserve Tectonic Regions & Peter Bird 2002 Plate Boundaries (PB2002)
- **Organization:** USGS / EarthByte / Peter Bird (2002)
- **Official URL:** `https://earthquake.usgs.gov/ws/geoserve/`
- **Purpose:** Defines tectonic plate boundaries, active subduction trench axes, transform faults, and oceanic spreading ridges for computing epicentral distance to nearest trench line ($\text{Dist}_{\text{trench}}$).
- **Access Method:** Static GeoJSON / USGS Geoserve Web API
- **Supported Formats:** GeoJSON
- **Update Characteristics:** Stable geological reference dataset
- **Core Fields Ingested:**
  - `plateName`: Tectonic plate name (e.g., Sunda Plate, Pacific Plate, Nazca Plate)
  - `boundaryType`: Tectonic regime (`subduction_zone`, `transform_fault`, `spreading_ridge`)
  - `coordinates`: Polyline coordinate geometry defining fault/trench axis trajectory

---

## 5. OPTIONAL SOURCE: NOAA DART Deep-Ocean Buoy Network

- **Source Name:** Deep-ocean Assessment and Reporting of Tsunamis (DART)
- **Organization:** NOAA National Data Buoy Center (NDBC)
- **Official URL:** `https://www.ndbc.noaa.gov/dart.shtml`
- **Purpose:** Real-time bottom pressure recorder (BPR) water column height telemetry for deep-ocean wave propagation monitoring.
- **Access Method:** NDBC Real-time Data Stream / Web Service
- **Supported Formats:** ASCII / NetCDF
- **Update Characteristics:** 15-minute routine reporting; 15-second high-frequency reporting during trigger events.
- **Status in Phase 1.1:** Optional secondary telemetry feed; non-blocking for core earthquake-tsunami dataset normalization.

---

## DATA INTEGRITY & SCIENTIFIC ETHICS GUARANTEE

1. **Explicit Entity Separation:** Earthquake events and tsunami events are maintained as distinct entity schemas.
2. **Deterministic Labeling Policy:** No artificial labeling rules (such as $M_w \ge X \implies \text{tsunami}$) are applied.
3. **Missing Value Preservation:** Missing depths, magnitudes, or wave heights are preserved as `null` and flagged. No arbitrary `0` or mean-imputed values are written to raw or processed stores.
