/**
 * TSUNAMISENSE AI — Logistic Regression Classifier Model
 * 
 * Implements Logistic Regression with sigmoid activation, L2 regularization,
 * and class-weighted gradient descent optimization.
 */

export class LogisticRegressionModel {
  public weights: number[] = [];
  public bias = 0;
  public featureKeys: string[] = [];

  constructor(featureCount = 9) {
    this.weights = new Array(featureCount).fill(0);
    this.bias = 0;
  }

  private sigmoid(z: number): number {
    if (z > 30) return 0.999999;
    if (z < -30) return 0.000001;
    return 1 / (1 + Math.exp(-z));
  }

  /**
   * Trains Logistic Regression using gradient descent with L2 penalty and class balancing.
   */
  train(
    X: number[][],
    y: number[],
    featureKeys: string[],
    learningRate = 0.05,
    epochs = 400,
    l2Lambda = 0.01
  ) {
    this.featureKeys = featureKeys;
    const nSamples = X.length;
    const nFeatures = X[0].length;

    this.weights = new Array(nFeatures).fill(0);
    this.bias = 0;

    // Calculate class weights for imbalance handling
    const posCount = y.filter((val) => val === 1).length;
    const negCount = nSamples - posCount;
    const posWeight = negCount / (posCount || 1);
    const negWeight = 1.0;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let dWs = new Array(nFeatures).fill(0);
      let dB = 0;

      for (let i = 0; i < nSamples; i++) {
        const xi = X[i];
        const yi = y[i];

        let linearPredict = this.bias;
        for (let j = 0; j < nFeatures; j++) {
          linearPredict += xi[j] * this.weights[j];
        }

        const prob = this.sigmoid(linearPredict);
        const sampleWeight = yi === 1 ? posWeight : negWeight;
        const error = (prob - yi) * sampleWeight;

        for (let j = 0; j < nFeatures; j++) {
          dWs[j] += error * xi[j];
        }
        dB += error;
      }

      for (let j = 0; j < nFeatures; j++) {
        const l2Gradient = l2Lambda * this.weights[j];
        this.weights[j] -= learningRate * ((dWs[j] / nSamples) + l2Gradient);
      }
      this.bias -= learningRate * (dB / nSamples);
    }
  }

  /**
   * Predicts probability P(y=1|X)
   */
  predictProbability(x: number[]): number {
    let z = this.bias;
    for (let j = 0; j < x.length; j++) {
      z += x[j] * (this.weights[j] || 0);
    }
    return this.sigmoid(z);
  }

  /**
   * Returns feature weights/coefficients.
   */
  getWeightsRecord(): Record<string, number> {
    const rec: Record<string, number> = {};
    for (let j = 0; j < this.featureKeys.length; j++) {
      rec[this.featureKeys[j]] = Math.round((this.weights[j] || 0) * 10000) / 10000;
    }
    return rec;
  }
}
