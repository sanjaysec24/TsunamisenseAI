/**
 * TSUNAMISENSE AI — Data Engine Facade Controller (Phase 1.1)
 * 
 * Central controller coordinating USGS ingestion, NOAA benchmark ingestion,
 * tectonic context loading, deduplication, spatiotemporal event association,
 * manifest generation, and quality reporting.
 */

import {
  EarthquakeRecord,
  TsunamiRecord,
  TectonicFeature,
  EventAssociation,
  DataManifest,
  DataQualityReport,
  USGSQueryParams
} from './types';

import { USGSIngestionModule, USGSIngestResult } from './ingestion/usgsIngest';
import { NOAATsunamiIngestionModule } from './ingestion/noaaTsunamiIngest';
import { TectonicIngestionModule } from './ingestion/tectonicIngest';
import { DuplicateDetector } from './deduplication/duplicateDetector';
import { EventAssociator } from './association/eventAssociator';
import { ManifestGenerator } from './manifests/manifestGenerator';
import { QualityReportGenerator } from './reports/qualityReport';

export interface DataEnginePipelineResult {
  earthquakes: EarthquakeRecord[];
  tsunamis: TsunamiRecord[];
  tectonicFeatures: TectonicFeature[];
  associations: EventAssociation[];
  earthquakeManifest: DataManifest;
  tsunamiManifest: DataManifest;
  earthquakeQualityReport: DataQualityReport;
}

export class DataEngineFacade {
  /**
   * Executes full Phase 1.1 Data Engine Pipeline.
   */
  static async runPipeline(
    usgsParams?: USGSQueryParams
  ): Promise<DataEnginePipelineResult> {
    const defaultUsgsParams: USGSQueryParams = {
      minMagnitude: 6.0,
      limit: 100,
      ...usgsParams
    };

    // 1. Ingest USGS Earthquake Data
    let usgsResult: USGSIngestResult;
    try {
      usgsResult = await USGSIngestionModule.fetchAndIngest(defaultUsgsParams);
    } catch (err: any) {
      // Fallback gracefully if network fails or API is unavailable
      usgsResult = {
        source_url: USGSIngestionModule.buildQueryUrl(defaultUsgsParams),
        retrieved_at: new Date().toISOString(),
        total_retrieved: 0,
        valid_count: 0,
        invalid_count: 0,
        records: [],
        errors: [{ record_id: 'SYSTEM', field: 'network', reason: err.message, raw_value: null }]
      };
    }

    // 2. Ingest NOAA Historical Tsunami Dataset
    const noaaResult = NOAATsunamiIngestionModule.ingestBenchmarkDataset();

    // 3. Ingest Tectonic Features
    const tectonicFeatures = TectonicIngestionModule.getSubductionZones();

    // 4. Deduplication
    const eqDedup = DuplicateDetector.deduplicateEarthquakes(usgsResult.records);
    const tsuDedup = DuplicateDetector.deduplicateTsunamis(noaaResult.records);

    // 5. Earthquake ↔ Tsunami Association Engine
    const associations = EventAssociator.associateEvents(
      eqDedup.uniqueRecords,
      tsuDedup.uniqueRecords
    );

    // 6. Manifest Generation
    const earthquakeManifest = ManifestGenerator.createEarthquakeManifest(
      'usgs_earthquakes_normalized_v1',
      usgsResult.source_url,
      eqDedup.uniqueRecords,
      usgsResult.invalid_count,
      eqDedup.duplicatesDetected
    );

    const tsunamiManifest = ManifestGenerator.createTsunamiManifest(
      'noaa_tsunami_events_normalized_v1',
      noaaResult.source_url,
      tsuDedup.uniqueRecords,
      noaaResult.invalid_count,
      tsuDedup.duplicatesDetected
    );

    // 7. Quality Report Generation
    const earthquakeQualityReport = QualityReportGenerator.generateEarthquakeQualityReport(
      'USGS Earthquakes Live Feed',
      eqDedup.uniqueRecords,
      usgsResult.invalid_count,
      eqDedup.duplicatesDetected,
      usgsResult.errors
    );

    return {
      earthquakes: eqDedup.uniqueRecords,
      tsunamis: tsuDedup.uniqueRecords,
      tectonicFeatures,
      associations,
      earthquakeManifest,
      tsunamiManifest,
      earthquakeQualityReport
    };
  }
}
