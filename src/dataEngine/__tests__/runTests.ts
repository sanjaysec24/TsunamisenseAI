/**
 * TSUNAMISENSE AI — Data Engine Test Runner (Phase 1.1)
 */

import { runDataEngineTestSuite } from './dataEngine.test';

console.log('Running TsunamiSense AI Data Engine Test Suite...\n');
const result = runDataEngineTestSuite();

console.log(result.log.join('\n'));

if (result.failed > 0) {
  console.error(`\nTest suite FAILED with ${result.failed} failure(s).`);
  process.exit(1);
} else {
  console.log(`\nTest suite PASSED ALL ${result.passed} tests successfully!`);
  process.exit(0);
}
