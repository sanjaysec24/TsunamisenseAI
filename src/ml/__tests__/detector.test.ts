/**
 * TSUNAMISENSE AI — Core Detector Unit & Benchmark Integration Test Suite
 * 
 * Verifies prediction engine functionality across real historical benchmarks
 * and synthetic input validation edge cases.
 */

import { predict_tsunami_risk } from '../predictor';

export function runDetectorTestSuite() {
  console.log('===========================================================');
  console.log('TSUNAMISENSE AI — CORE DETECTOR TEST SUITE');
  console.log('===========================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail = '') => {
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName} — ${detail}`);
      failed++;
    }
  };

  // 1. Benchmark Event 1: 2011 Tohoku Megathrust (Mw 9.1, depth 29km)
  try {
    const tohoku = predict_tsunami_risk(9.1, 29.0, 38.297, 142.373, '2011 Tohoku, Japan');
    assert(
      tohoku.risk_level === 'HIGH' || tohoku.risk_level === 'CRITICAL',
      '1.1 Real Event — 2011 Tohoku Megathrust predicts HIGH or CRITICAL risk',
      `Got ${tohoku.risk_level} (Score: ${tohoku.risk_score})`
    );
    assert(
      tohoku.risk_score >= 70,
      '1.2 Real Event — 2011 Tohoku risk score >= 70',
      `Score: ${tohoku.risk_score}`
    );
    assert(
      tohoku.contributing_factors.length > 0,
      '1.3 Real Event — Returns structured contributing factors',
      `Factors count: ${tohoku.contributing_factors.length}`
    );
  } catch (e: any) {
    assert(false, '1.1 Real Event — 2011 Tohoku test', e.message);
  }

  // 2. Benchmark Event 2: 2004 Sumatra Megathrust (Mw 9.1, depth 30km)
  try {
    const sumatra = predict_tsunami_risk(9.1, 30.0, 3.316, 95.854, '2004 Sumatra, Indonesia');
    assert(
      sumatra.risk_level === 'HIGH' || sumatra.risk_level === 'CRITICAL',
      '2.1 Real Event — 2004 Sumatra Megathrust predicts HIGH or CRITICAL risk',
      `Got ${sumatra.risk_level} (Score: ${sumatra.risk_score})`
    );
  } catch (e: any) {
    assert(false, '2.1 Real Event — 2004 Sumatra test', e.message);
  }

  // 3. Benchmark Event 3: 2013 Sea of Okhotsk Deep Mantle Event (Mw 8.3, depth 609km)
  try {
    const okhotsk = predict_tsunami_risk(8.3, 609.0, 54.88, 153.28, '2013 Okhotsk Deep');
    assert(
      okhotsk.risk_level === 'LOW' || okhotsk.risk_level === 'GUARDED',
      '3.1 Real Event — Deep Okhotsk event (609km) predicts LOW/GUARDED risk despite Mw 8.3',
      `Got ${okhotsk.risk_level} (Score: ${okhotsk.risk_score})`
    );
  } catch (e: any) {
    assert(false, '3.1 Real Event — 2013 Okhotsk Deep test', e.message);
  }

  // 4. Benchmark Event 4: 2023 Turkey Continental Inland Fault (Mw 7.8, depth 10km)
  try {
    const turkey = predict_tsunami_risk(7.8, 10.0, 37.174, 37.032, '2023 Turkey Inland');
    assert(
      turkey.risk_level === 'LOW' || turkey.risk_level === 'GUARDED' || turkey.risk_level === 'MODERATE',
      '4.1 Real Event — Continental Inland Turkey event has suppressed risk relative to offshore megathrusts',
      `Got ${turkey.risk_level} (Score: ${turkey.risk_score})`
    );
  } catch (e: any) {
    assert(false, '4.1 Real Event — 2023 Turkey test', e.message);
  }

  // 5. Synthetic Unit Test: Rejects Invalid Latitude (> 90 deg)
  try {
    predict_tsunami_risk(7.5, 20.0, 105.0, 120.0);
    assert(false, '5.1 Input Validation — Rejects latitude > 90°');
  } catch (e: any) {
    assert(
      e.message.includes('Latitude'),
      '5.1 Input Validation — Rejects latitude > 90°',
      e.message
    );
  }

  // 6. Synthetic Unit Test: Rejects Invalid Longitude (> 180 deg)
  try {
    predict_tsunami_risk(7.5, 20.0, 10.0, 210.0);
    assert(false, '6.1 Input Validation — Rejects longitude > 180°');
  } catch (e: any) {
    assert(
      e.message.includes('Longitude'),
      '6.1 Input Validation — Rejects longitude > 180°',
      e.message
    );
  }

  // 7. Synthetic Unit Test: Rejects Missing / Invalid Magnitude
  try {
    predict_tsunami_risk(NaN as any, 20.0, 10.0, 120.0);
    assert(false, '7.1 Input Validation — Rejects NaN magnitude');
  } catch (e: any) {
    assert(
      e.message.includes('magnitude'),
      '7.1 Input Validation — Rejects NaN magnitude',
      e.message
    );
  }

  // 8. Synthetic Unit Test: Rejects Negative Depth
  try {
    predict_tsunami_risk(7.5, -15.0, 10.0, 120.0);
    assert(false, '8.1 Input Validation — Rejects negative focal depth');
  } catch (e: any) {
    assert(
      e.message.includes('depth'),
      '8.1 Input Validation — Rejects negative focal depth',
      e.message
    );
  }

  console.log(`\nSUMMARY: ${passed} passed, ${failed} failed, ${passed + failed} total.`);
  if (failed > 0) {
    throw new Error(`${failed} detector unit test(s) failed.`);
  }
}
