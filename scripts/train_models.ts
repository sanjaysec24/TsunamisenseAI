/**
 * TSUNAMISENSE AI — CLI Script to Train ML Models & Export Model Artifact
 */

import { ModelTrainingPipeline } from '../src/ml/trainer/trainAllModels';

try {
  ModelTrainingPipeline.runTrainingPipeline();
  console.log('ML Model Training Pipeline Completed Successfully.');
} catch (err) {
  console.error('Error executing ML training pipeline:', err);
  process.exit(1);
}
