/**
 * TSUNAMISENSE AI — Model Training, Evaluation & Selection Engine
 * 
 * Trains Logistic Regression, Random Forest, and Gradient Boosting models on real dataset,
 * evaluates all 3 models, selects the best model, and outputs modelArtifact.json.
 */

import fs from 'fs';
import path from 'path';
import { MLDatasetManager } from '../dataset/datasetManager';
import { FeatureExtractor } from '../features/featureExtractor';
import { Preprocessor } from '../preprocessing/preprocessor';
import { LogisticRegressionModel } from '../models/logisticRegression';
import { RandomForestModel } from '../models/randomForest';
import { GradientBoostingModel } from '../models/gradientBoosting';
import { ModelEvaluator } from '../evaluation/evaluator';
import { ModelArtifact, ModelComparisonResult } from '../types';

export class ModelTrainingPipeline {
  static runTrainingPipeline(): ModelArtifact {
    console.log('===========================================================');
    console.log('TSUNAMISENSE AI — MODEL TRAINING & SELECTION PIPELINE');
    console.log('===========================================================');

    // 1. Load Dataset
    const dataset = MLDatasetManager.getDataset();
    const summary = MLDatasetManager.getDatasetSummary();
    console.log(`1. Loaded ${summary.total_records} verified records (${summary.tsunamigenic_records} tsunamigenic, ${summary.non_tsunamigenic_records} non-tsunamigenic).`);

    // 2. Feature Extraction
    const featureKeys = FeatureExtractor.getFeatureKeys();
    const featureVectors = dataset.map((rec) => ({
      rec,
      extracted: FeatureExtractor.extractFeatures(
        rec.magnitude,
        rec.depth_km,
        rec.latitude,
        rec.longitude
      )
    }));

    // 3. Train/Test Stratified Split
    const { trainRecords, testRecords } = Preprocessor.stratifiedSplit(dataset, 0.25);
    console.log(`2. Stratified Split: ${trainRecords.length} Training Samples | ${testRecords.length} Testing Samples.`);

    // 4. Compute Scaler Params on Training Set
    const trainExtracted = trainRecords.map((r) =>
      FeatureExtractor.extractFeatures(r.magnitude, r.depth_km, r.latitude, r.longitude)
    );
    const scalerParams = Preprocessor.computeScalerParams(trainExtracted);

    // Prepare scaled arrays for ML algorithms
    const trainX = trainRecords.map((r) => {
      const feat = FeatureExtractor.extractFeatures(r.magnitude, r.depth_km, r.latitude, r.longitude);
      return Preprocessor.scaleFeatures(feat, scalerParams);
    });
    const trainY = trainRecords.map((r) => r.tsunami_label);

    const testX = testRecords.map((r) => {
      const feat = FeatureExtractor.extractFeatures(r.magnitude, r.depth_km, r.latitude, r.longitude);
      return Preprocessor.scaleFeatures(feat, scalerParams);
    });
    const testY = testRecords.map((r) => r.tsunami_label);

    // 5. Train Model 1: Logistic Regression
    console.log('3. Training Model 1: Logistic Regression...');
    const logReg = new LogisticRegressionModel(featureKeys.length);
    logReg.train(trainX, trainY, featureKeys, 0.05, 500, 0.01);
    const logRegProbs = testX.map((x) => logReg.predictProbability(x));
    const logRegMetrics = ModelEvaluator.evaluate(logRegProbs, testY, trainRecords.length);

    // 6. Train Model 2: Random Forest
    console.log('4. Training Model 2: Random Forest Ensemble...');
    const randForest = new RandomForestModel(20);
    randForest.train(trainX, trainY, featureKeys);
    const rfProbs = testX.map((x) => randForest.predictProbability(x));
    const rfMetrics = ModelEvaluator.evaluate(rfProbs, testY, trainRecords.length);

    // 7. Train Model 3: Gradient Boosting Decision Trees
    console.log('5. Training Model 3: Gradient Boosted Trees...');
    const gradBoost = new GradientBoostingModel(15, 0.1);
    gradBoost.train(trainX, trainY, featureKeys);
    const gbProbs = testX.map((x) => gradBoost.predictProbability(x));
    const gbMetrics = ModelEvaluator.evaluate(gbProbs, testY, trainRecords.length);

    // 8. Compare & Rank Models
    const comparisons: ModelComparisonResult[] = [
      {
        model_name: 'Logistic Regression',
        metrics: logRegMetrics,
        is_selected: false,
        feature_importances: logReg.getWeightsRecord()
      },
      {
        model_name: 'Random Forest',
        metrics: rfMetrics,
        is_selected: false,
        feature_importances: randForest.getFeatureImportances()
      },
      {
        model_name: 'Gradient Boosting',
        metrics: gbMetrics,
        is_selected: false,
        feature_importances: gradBoost.getFeatureImportances()
      }
    ];

    // Rank models based on F1 Score & PR-AUC
    comparisons.sort((a, b) => b.metrics.f1_score - a.metrics.f1_score || b.metrics.pr_auc - a.metrics.pr_auc);
    comparisons[0].is_selected = true;

    const selected = comparisons[0];
    console.log(`\n===========================================================`);
    console.log(`MODEL COMPARISON & SELECTION RESULT:`);
    console.log(`===========================================================`);
    for (const comp of comparisons) {
      console.log(
        `${comp.is_selected ? '★ SELECTED -> ' : '  '} ${comp.model_name.padEnd(20)} | Precision: ${comp.metrics.precision.toFixed(3)} | Recall: ${comp.metrics.recall.toFixed(3)} | F1: ${comp.metrics.f1_score.toFixed(3)} | ROC-AUC: ${comp.metrics.roc_auc.toFixed(3)} | PR-AUC: ${comp.metrics.pr_auc.toFixed(3)}`
      );
    }

    // Prepare Artifact
    const artifact: ModelArtifact = {
      model_version: 'v1.1-mvp',
      trained_at: new Date().toISOString(),
      selected_model_name: selected.model_name,
      dataset_metadata: {
        total_records: summary.total_records,
        tsunamigenic_records: summary.tsunamigenic_records,
        non_tsunamigenic_records: summary.non_tsunamigenic_records,
        sources_used: summary.sources_used
      },
      feature_keys: featureKeys,
      scaler_params: scalerParams,
      weights: logReg.getWeightsRecord(),
      bias: logReg.bias,
      evaluation_metrics: selected.metrics,
      all_model_comparisons: comparisons
    };

    // Write artifact to src/ml/artifacts/selectedModel.json
    const artifactPath = path.join(process.cwd(), 'src', 'ml', 'artifacts', 'selectedModel.json');
    fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
    fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));

    console.log(`\n✓ Model artifact successfully generated at src/ml/artifacts/selectedModel.json\n`);
    return artifact;
  }
}
