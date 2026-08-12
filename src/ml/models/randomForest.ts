/**
 * TSUNAMISENSE AI — Random Forest Classifier Model
 * 
 * Implements an ensemble of decision trees trained on bootstrap samples
 * with feature subsampling and Gini impurity splits.
 */

export interface TreeNode {
  featureIndex?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  value?: number; // Leaf probability or majority class
  isLeaf: boolean;
}

export class DecisionTree {
  public root: TreeNode | null = null;
  public maxDepth: number;
  public minSamplesSplit: number;

  constructor(maxDepth = 4, minSamplesSplit = 2) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  private giniImpurity(labels: number[]): number {
    if (labels.length === 0) return 0;
    const pos = labels.filter((l) => l === 1).length;
    const p1 = pos / labels.length;
    const p0 = 1 - p1;
    return 1 - (p1 * p1 + p0 * p0);
  }

  private bestSplit(
    X: number[][],
    y: number[],
    featureIndices: number[]
  ): { bestFeature: number; bestThreshold: number; bestGini: number } {
    let bestGini = Infinity;
    let bestFeature = -1;
    let bestThreshold = 0;

    for (const featIdx of featureIndices) {
      const values = X.map((x) => x[featIdx]);
      // Test unique midpoints
      const sorted = Array.from(new Set(values)).sort((a, b) => a - b);
      for (let i = 0; i < sorted.length - 1; i++) {
        const threshold = (sorted[i] + sorted[i + 1]) / 2;
        const leftY: number[] = [];
        const rightY: number[] = [];

        for (let j = 0; j < X.length; j++) {
          if (X[j][featIdx] <= threshold) {
            leftY.push(y[j]);
          } else {
            rightY.push(y[j]);
          }
        }

        if (leftY.length === 0 || rightY.length === 0) continue;

        const giniLeft = this.giniImpurity(leftY);
        const giniRight = this.giniImpurity(rightY);
        const weightedGini =
          (leftY.length / y.length) * giniLeft +
          (rightY.length / y.length) * giniRight;

        if (weightedGini < bestGini) {
          bestGini = weightedGini;
          bestFeature = featIdx;
          bestThreshold = threshold;
        }
      }
    }

    return { bestFeature, bestThreshold, bestGini };
  }

  private buildTree(
    X: number[][],
    y: number[],
    depth: number,
    nFeaturesToSample: number
  ): TreeNode {
    const numSamples = X.length;
    const numFeatures = X[0].length;
    const posCount = y.filter((l) => l === 1).length;
    const leafProb = numSamples > 0 ? posCount / numSamples : 0;

    if (
      depth >= this.maxDepth ||
      numSamples < this.minSamplesSplit ||
      posCount === 0 ||
      posCount === numSamples
    ) {
      return { isLeaf: true, value: leafProb };
    }

    // Random feature subset
    const allFeatureIndices = Array.from({ length: numFeatures }, (_, i) => i);
    const shuffled = allFeatureIndices.sort(() => Math.random() - 0.5);
    const featureIndices = shuffled.slice(0, nFeaturesToSample);

    const { bestFeature, bestThreshold, bestGini } = this.bestSplit(
      X,
      y,
      featureIndices
    );

    if (bestFeature === -1 || bestGini === Infinity) {
      return { isLeaf: true, value: leafProb };
    }

    const leftX: number[][] = [];
    const leftY: number[] = [];
    const rightX: number[][] = [];
    const rightY: number[] = [];

    for (let i = 0; i < X.length; i++) {
      if (X[i][bestFeature] <= bestThreshold) {
        leftX.push(X[i]);
        leftY.push(y[i]);
      } else {
        rightX.push(X[i]);
        rightY.push(y[i]);
      }
    }

    return {
      isLeaf: false,
      featureIndex: bestFeature,
      threshold: bestThreshold,
      left: this.buildTree(leftX, leftY, depth + 1, nFeaturesToSample),
      right: this.buildTree(rightX, rightY, depth + 1, nFeaturesToSample)
    };
  }

  train(X: number[][], y: number[]) {
    const numFeatures = X[0].length;
    const nFeaturesToSample = Math.max(1, Math.floor(Math.sqrt(numFeatures)));
    this.root = this.buildTree(X, y, 0, nFeaturesToSample);
  }

  predictSample(x: number[], node: TreeNode | null = this.root): number {
    if (!node) return 0;
    if (node.isLeaf || node.value !== undefined) {
      return node.value ?? 0;
    }
    const val = x[node.featureIndex!];
    if (val <= node.threshold!) {
      return this.predictSample(x, node.left);
    } else {
      return this.predictSample(x, node.right);
    }
  }
}

export class RandomForestModel {
  public trees: DecisionTree[] = [];
  public featureKeys: string[] = [];
  public numTrees: number;

  constructor(numTrees = 15) {
    this.numTrees = numTrees;
  }

  train(X: number[][], y: number[], featureKeys: string[]) {
    this.featureKeys = featureKeys;
    this.trees = [];
    const nSamples = X.length;

    for (let i = 0; i < this.numTrees; i++) {
      // Bootstrap sample with replacement
      const bootX: number[][] = [];
      const bootY: number[] = [];
      for (let s = 0; s < nSamples; s++) {
        const randIdx = Math.floor(Math.random() * nSamples);
        bootX.push(X[randIdx]);
        bootY.push(y[randIdx]);
      }

      const tree = new DecisionTree(4, 2);
      tree.train(bootX, bootY);
      this.trees.push(tree);
    }
  }

  predictProbability(x: number[]): number {
    if (this.trees.length === 0) return 0;
    let sumProb = 0;
    for (const tree of this.trees) {
      sumProb += tree.predictSample(x);
    }
    return sumProb / this.trees.length;
  }

  getFeatureImportances(): Record<string, number> {
    // Basic heuristic feature importance across trees
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
