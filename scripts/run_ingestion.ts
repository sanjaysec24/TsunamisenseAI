/**
 * TSUNAMISENSE AI — CLI Ingestion Pipeline Execution Script (Phase 1.1)
 * 
 * Fetches real USGS earthquakes, NOAA historical tsunami benchmark dataset,
 * executes deduplication and spatiotemporal event association, and outputs
 * normalized snapshots in data/processed/ and manifests in data/manifests/.
 */

import fs from 'fs';
import path from 'path';
import { DataEngineFacade } from '../src/dataEngine/dataEngineFacade';

async function runIngestionScript() {
  console.log('====================================================');
  console.log('TSUNAMISENSE AI — PHASE 1.1 DATA ENGINE INGESTION');
  console.log('====================================================\n');

  console.log('1. Fetching real USGS earthquakes & NOAA benchmark records...');
  const result = await DataEngineFacade.runPipeline({
    minMagnitude: 5.5,
    limit: 100
  });

  console.log(`\n✓ Retrived ${result.earthquakes.length} normalized earthquake records.`);
  console.log(`✓ Retrived ${result.tsunamis.length} normalized NOAA benchmark tsunami records.`);
  console.log(`✓ Retrived ${result.tectonicFeatures.length} subduction trench geometry features.`);
  console.log(`✓ Formed ${result.associations.length} earthquake-tsunami association pairings.`);

  // Ensure directories exist
  const processedDir = path.join(process.cwd(), 'data', 'processed');
  const manifestsDir = path.join(process.cwd(), 'data', 'manifests');

  fs.mkdirSync(processedDir, { recursive: true });
  fs.mkdirSync(manifestsDir, { recursive: true });

  // Write Processed Snapshots
  fs.writeFileSync(
    path.join(processedDir, 'earthquakes_normalized.json'),
    JSON.stringify(result.earthquakes, null, 2)
  );

  fs.writeFileSync(
    path.join(processedDir, 'tsunami_events_normalized.json'),
    JSON.stringify(result.tsunamis, null, 2)
  );

  fs.writeFileSync(
    path.join(processedDir, 'earthquake_tsunami_associations.json'),
    JSON.stringify(result.associations, null, 2)
  );

  // Write Manifests
  fs.writeFileSync(
    path.join(manifestsDir, 'earthquakes_manifest.json'),
    JSON.stringify(result.earthquakeManifest, null, 2)
  );

  fs.writeFileSync(
    path.join(manifestsDir, 'tsunami_manifest.json'),
    JSON.stringify(result.tsunamiManifest, null, 2)
  );

  // Write Data Quality Report
  fs.writeFileSync(
    path.join(processedDir, 'data_quality_report.json'),
    JSON.stringify(result.earthquakeQualityReport, null, 2)
  );

  console.log('\n====================================================');
  console.log('DATA ENGINE QUALITY REPORT SUMMARY:');
  console.log('====================================================');
  console.log(`Total Records:      ${result.earthquakeQualityReport.total_records}`);
  console.log(`Valid Records:      ${result.earthquakeQualityReport.valid_records}`);
  console.log(`Invalid Records:    ${result.earthquakeQualityReport.invalid_records}`);
  console.log(`Duplicate Records:  ${result.earthquakeQualityReport.duplicate_records}`);
  console.log(`Magnitude Bounds:   [Mw ${result.earthquakeQualityReport.magnitude_range.min} to Mw ${result.earthquakeQualityReport.magnitude_range.max}]`);
  console.log(`Focal Depth Bounds: [${result.earthquakeQualityReport.depth_range.min}km to ${result.earthquakeQualityReport.depth_range.max}km]`);
  console.log(`Earliest Timestamp: ${result.earthquakeQualityReport.earliest_timestamp}`);
  console.log(`Latest Timestamp:   ${result.earthquakeQualityReport.latest_timestamp}`);
  console.log('\nProcessed snapshot files generated in data/processed/ and data/manifests/.\n');
}

runIngestionScript().catch((err) => {
  console.error('Ingestion Execution Error:', err);
  process.exit(1);
});
