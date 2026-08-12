# TSUNAMISENSE AI — DATA DICTIONARY

This data dictionary specifies the exact field names, data types, physical units, valid scientific ranges, and missing-value semantics for all normalized datasets produced by the **TsunamiSense AI Data Engine (Phase 1.1)**.

---

## 1. Normalized Earthquake Dataset (`earthquakes_normalized`)

File Path: `data/processed/earthquakes_normalized.json` / `.csv`

| Field Name | Type | Unit | Description | Missing Value Behavior | Valid Range / Format |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `earthquake_id` | string | N/A | Authoritative USGS unique event identifier (e.g. `us7000lui3`) | Required (Cannot be null) | Non-empty string |
| `origin_time` | string | UTC | Event origin time normalized to ISO 8601 string | Required (Cannot be null) | YYYY-MM-DDTHH:mm:ss.sssZ |
| `latitude` | number | Degrees (°N/°S) | Epicentral latitude in decimal degrees | Required | $-90.0000$ to $+90.0000$ |
| `longitude` | number | Degrees (°E/°W) | Epicentral longitude in decimal degrees | Required | $-180.0000$ to $+180.0000$ |
| `depth_km` | number | Kilometers (km) | Hypocentral focal depth below sea level | Preserved as `null` | $0.0$ to $800.0$ km |
| `magnitude` | number | $M_w$ scale | Seismic moment magnitude | Preserved as `null` | $1.0$ to $10.0$ |
| `magnitude_type` | string | N/A | Calculation scale type ($M_w$, $M_{wc}$, $M_{ww}$, $M_b$, $M_s$) | Defaulted to `"UNKNOWN"` if missing | `Mw`, `Mwc`, `Mww`, `Mb`, `Ms` |
| `place` | string | N/A | Human-readable location description | Defaulted to `"Unknown Region"` | Non-empty text |
| `event_type` | string | N/A | Seismic event category | Defaulted to `"earthquake"` | `earthquake`, `subduction megathrust`, etc. |
| `status` | string | N/A | Review status of seismic solution | Defaulted to `"unreviewed"` | `automatic`, `reviewed` |
| `source` | string | N/A | Authoritative network code | Defaulted to `"USGS"` | `USGS`, `ISC`, `GEOFON` |
| `usgs_url` | string | N/A | Canonical USGS event web URL | Preserved as `null` | Valid HTTP/HTTPS URL |
| `usgs_tsunami_flag` | boolean | N/A | Initial USGS evaluation flag (0 = No warning, 1 = Warning) | Defaulted to `false` | `true`, `false` |
| `focal_mechanism` | string | N/A | Faulting mechanism style | Preserved as `null` | `Reverse / Thrust`, `Normal`, `Strike-Slip` |

---

## 2. Normalized Tsunami Dataset (`tsunami_events_normalized`)

File Path: `data/processed/tsunami_events_normalized.json` / `.csv`

| Field Name | Type | Unit | Description | Missing Value Behavior | Valid Range / Format |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `tsunami_event_id` | string | N/A | Authoritative NOAA/NCEI unique tsunami ID | Required | Non-empty string |
| `event_time` | string | UTC | Tsunami generation origin time ISO 8601 | Required | YYYY-MM-DDTHH:mm:ss.sssZ |
| `source_latitude` | number | Degrees (°N/°S) | Source epicenter/location latitude | Preserved as `null` | $-90.0000$ to $+90.0000$ |
| `source_longitude` | number | Degrees (°E/°W) | Source epicenter/location longitude | Preserved as `null` | $-180.0000$ to $+180.0000$ |
| `cause` | string | N/A | Primary trigger mechanism | Defaulted to `"Unknown"` | `Subduction Earthquake`, `Volcanic Eruption`, `Landslide` |
| `tsunami_magnitude` | number | $M_t$ scale | NOAA tsunami magnitude intensity | Preserved as `null` | $-2.0$ to $10.0$ |
| `maximum_water_height_m` | number | Meters (m) | Maximum observed water height | Preserved as `null` | $\ge 0.0$ m |
| `runup_height_m` | number | Meters (m) | Maximum inland inundation elevation | Preserved as `null` | $\ge 0.0$ m |
| `affected_region` | string | N/A | Region name or basin description | Defaulted to `"Unknown Region"` | Text string |
| `country` | string | N/A | Primary affected nation | Preserved as `null` | Text string |
| `fatalities_estimate` | string | N/A | Total casualty estimate range | Preserved as `null` | Text string or numeric string |
| `damage_amount_millions` | number | USD ($M) | Total economic damage estimate | Preserved as `null` | $\ge 0.0$ |
| `source_earthquake_id` | string | N/A | Associated USGS seismic event ID | Preserved as `null` | Text ID |
| `source` | string | N/A | Data provider attribution | Defaulted to `"NOAA_NCEI"` | `NOAA_NCEI` |

---

## 3. Earthquake ↔ Tsunami Associations Dataset (`earthquake_tsunami_associations`)

File Path: `data/processed/earthquake_tsunami_associations.json`

| Field Name | Type | Description | Valid Range / Values |
| :--- | :--- | :--- | :--- |
| `earthquake_id` | string | Foreign key to `earthquakes_normalized.earthquake_id` | Valid USGS Event ID |
| `tsunami_event_id` | string | Foreign key to `tsunami_events_normalized.tsunami_event_id` | Valid NOAA Tsunami Event ID |
| `association_method` | string | Method used to verify or propose association | `DETERMINISTIC_SOURCE_ID`, `SPATIOTEMPORAL_CANDIDATE`, `UNASSOCIATED` |
| `association_confidence` | number | Confidence score of association ($0.0$ to $1.0$) | $0.0$ to $1.0$ ($1.0$ = Verified ID Match) |
| `time_difference_minutes` | number | Absolute time delta between origin and wave report | $\ge 0.0$ minutes |
| `distance_km` | number | Epicentral spatial distance in km (Haversine formula) | $\ge 0.0$ km |
| `association_notes` | string | Analytical reasoning for matching/candidate decision | Detailed text rationale |

---

## 4. Dataset Lineage Manifest Schema (`data_manifest`)

File Path: `data/manifests/data_manifest.json`

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `dataset_name` | string | Name of dataset snapshot (e.g., `usgs_earthquakes_normalized_v1`) |
| `retrieved_at` | string | ISO 8601 UTC timestamp of original network retrieval |
| `source_url` | string | Official API URL queried |
| `processing_version` | string | Version of TsunamiSense AI Data Engine (`1.1.0`) |
| `record_count` | number | Total number of records processed |
| `valid_count` | number | Total valid records passing strict validation |
| `invalid_count` | number | Total invalid/rejected records |
| `duplicate_count` | number | Total duplicates detected and resolved |
| `missing_value_summary` | object | Count of missing/null values per field |
