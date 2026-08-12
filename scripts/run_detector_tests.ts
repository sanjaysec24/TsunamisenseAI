/**
 * TSUNAMISENSE AI — CLI Test Runner for Tsunami Risk Detector
 */

import { runDetectorTestSuite } from '../src/ml/__tests__/detector.test';

try {
  runDetectorTestSuite();
  console.log('\nTsunami Risk Detector Test Suite PASSED ALL TESTS Successfully!\n');
} catch (err) {
  console.error('\nTest Suite Execution Failed:', err);
  process.exit(1);
}
