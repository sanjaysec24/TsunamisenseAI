/**
 * TSUNAMISENSE AI — Model Evaluation Engine
 * 
 * Computes Precision, Recall, F1, ROC-AUC, and PR-AUC metrics across test samples.
 */

import { ModelEvaluationMetrics } from '../types';

export class ModelEvaluator {
  /**
   * Computes comprehensive evaluation metrics for a model's predicted probabilities vs ground truth labels.
   */
  static evaluate(
    probabilities: number[],
    labels: number[],
    trainCount: number,
    threshold = 0.5
  ): ModelEvaluationMetrics {
    const totalSamples = probabilities.length;
    let tp = 0;
    let fp = 0;
    let tn = 0;
    let fn = 0;

    for (let i = 0; i < totalSamples; i++) {
      const pred = probabilities[i] >= threshold ? 1 : 0;
      const actual = labels[i];

      if (pred === 1 && actual === 1) tp++;
      else if (pred === 1 && actual === 0) fp++;
      else if (pred === 0 && actual === 0) tn++;
      else if (pred === 0 && actual === 1) fn++;
    }

    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    const rocAuc = this.calculateRocAuc(probabilities, labels);
    const prAuc = this.calculatePrAuc(probabilities, labels);

    return {
      confusion_matrix: { tp, fp, tn, fn },
      precision: Math.round(precision * 1000) / 1000,
      recall: Math.round(recall * 1000) / 1000,
      f1_score: Math.round(f1Score * 1000) / 1000,
      roc_auc: Math.round(rocAuc * 1000) / 1000,
      pr_auc: Math.round(prAuc * 1000) / 1000,
      total_samples: totalSamples,
      train_samples: trainCount,
      test_samples: totalSamples
    };
  }

  /**
   * Calculates Receiver Operating Characteristic Area Under Curve (ROC-AUC).
   */
  private static calculateRocAuc(probabilities: number[], labels: number[]): number {
    const posCount = labels.filter((l) => l === 1).length;
    const negCount = labels.length - posCount;

    if (posCount === 0 || negCount === 0) return 0.5;

    // Pair probabilities with labels and sort descending
    const pairs = probabilities.map((p, i) => ({ prob: p, label: labels[i] }));
    pairs.sort((a, b) => b.prob - a.prob);

    let auc = 0;
    let currentTp = 0;
    let currentFp = 0;
    let prevFp = 0;
    let prevTp = 0;

    for (const pair of pairs) {
      if (pair.label === 1) {
        currentTp++;
      } else {
        currentFp++;
        auc += (currentTp + prevTp) / 2; // Trapezoidal rule unit
        prevFp = currentFp;
        prevTp = currentTp;
      }
    }

    return auc / (posCount * negCount);
  }

  /**
   * Calculates Precision-Recall Area Under Curve (PR-AUC).
   */
  private static calculatePrAuc(probabilities: number[], labels: number[]): number {
    const pairs = probabilities.map((p, i) => ({ prob: p, label: labels[i] }));
    pairs.sort((a, b) => b.prob - a.prob);

    const posCount = labels.filter((l) => l === 1).length;
    if (posCount === 0) return 0;

    let prAuc = 0;
    let tp = 0;
    let fp = 0;
    let prevRecall = 0;

    for (let i = 0; i < pairs.length; i++) {
      if (pairs[i].label === 1) tp++;
      else fp++;

      const currentRecall = tp / posCount;
      const currentPrecision = tp / (tp + fp);
      const deltaRecall = currentRecall - prevRecall;

      prAuc += currentPrecision * deltaRecall;
      prevRecall = currentRecall;
    }

    return prAuc;
  }
}
