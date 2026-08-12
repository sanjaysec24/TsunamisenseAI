/**
 * TSUNAMISENSE AI — Gradient Boosting Decision Tree Classifier
 * 
 * Implements sequentially boosted regression trees fitted to pseudo-residuals
 * with learning rate scaling and logistic sigmoid transformation.
 */

import { DecisionTree, TreeNode } from './randomForest';

export class GradientBoostingModel {
  public trees: DecisionTree[] = [];
  public learningRate: number;
  public nEstimators: number;
  public initialRawLogOdds = 0;
  public featureKeys: string[] = [];

  constructor(nEstimators = 12, learningRate = 0.1) {
    this.nEstimators = nEstimators;
    this.learningRate = learningRate;
  }

  private sigmoid(z: number): number {
    if (z > 30) return 0.999999;
    if (z < -30) return 0.000001;
    return 1 / (1 + Math.exp(-z));
  }

  train(X: number[][], y: number[], featureKeys: string[]) {
    this.featureKeys = featureKeys;
    this.trees = [];

    const nSamples = X.length;
    const posCount = y.filter((val) => val === 1).length;
    const p0 = posCount / (nSamples || 1);
    this.initialRawLogOdds = Math.log((p0 + 1e-5) / (1 - p0 + 1e-5));

    // Array of current raw predictions F(x)
    const currentF = new Array(nSamples).fill(this.initialRawLogOdds);

    for (let m = 0; m < this.nEstimators; m++) {
      // Calculate pseudo-residuals = y - sigmoid(F(x))
      const residuals: number[] = [];
      for (let i = 0; i < nSamples; i++) {
        const prob = this.sigmoid(currentF[i]);
        residuals.push(y[i] - prob);
      }

      // Fit a decision tree to residuals
      const tree = new DecisionTree(3, 2);
      tree.train(X, residuals);

      // Update predictions F(x) += learningRate * tree.predict(x)
      for (let i = 0; i < nSamples; i++) {
        const leafVal = tree.predictSample(X[i]);
        currentF[i] += this.learningRate * leafVal;
      }

      this.trees.push(tree);
    }
  }

  predictProbability(x: number[]): number {
    let f = this.initialRawLogOdds;
    for (const tree of this.trees) {
      f += this.learningRate * tree.predictSample(x);
    }
    return this.sigmoid(f);
  }

  getFeatureImportances(): Record<string, number> {
    const importances: Record<string, number> = {};
    for (const key of this.featureKeys) {
      importances[key] = 0;
    }

    const traverse = (node: TreeNode | null) => {
      if (!node || node.isLeaf) return;
      if (node.featureIndex !== undefined && this.featureKeys[node.featureIndex]) {
        const key = this.featureKeys[node.featureIndex];
        importances[key] = (importances[key] || 0) + 1;
      }
      traverse(node.left || null);
      traverse(node.right || null);
    };

    for (const tree of this.trees) {
      traverse(tree.root);
    }

    const total = Object.values(importances).reduce((a, b) => a + b, 0) || 1;
    const normalized: Record<string, number> = {};
    for (const key of this.featureKeys) {
      normalized[key] = Math.round(((importances[key] || 0) / total) * 1000) / 1000;
    }
    return normalized;
  }
}
