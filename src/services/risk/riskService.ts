/**
 * TSUNAMISENSE AI — API Client & Service Boundary
 * 
 * Interacts with backend Express API endpoints:
 * - POST /api/predict
 * - POST /api/ai/explain
 * - POST /api/ai/analyze
 * - GET /api/health
 * 
 * Includes client-side prediction fallback if local API server is unreachable.
 */

import { EarthquakeInput } from '../../types';
import { RiskAssessment, GeminiExplanation, TsunamiRiskPrediction } from '../../ml/types';
import { PredictionService } from '../predictionService';

export interface HealthStatusResponse {
  status: string;
  api: string;
  model: string;
  gemini: 'available' | 'unavailable';
  timestamp?: string;
}

export interface PredictResponse {
  success: boolean;
  risk_assessment: RiskAssessment;
  error?: string;
}

export interface ExplainResponse {
  success: boolean;
  explanation: GeminiExplanation | null;
  error?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  answer?: string;
  error?: string;
}

export class RiskService {
  /**
   * Health check endpoint probe
   */
  async checkHealth(): Promise<HealthStatusResponse> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Ignore network errors
    }
    return {
      status: 'degraded',
      api: 'offline',
      model: 'available',
      gemini: 'unavailable'
    };
  }

  /**
   * Evaluates earthquake tsunami risk via POST /api/predict
   */
  async evaluateRiskAssessment(input: EarthquakeInput): Promise<RiskAssessment> {
    const payload = {
      magnitude: Number(input.magnitude),
      depth_km: Number(input.depthKm),
      latitude: Number(input.latitude),
      longitude: Number(input.longitude),
      location_name: input.locationName || null
    };

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Prediction server returned an error.');
      }

      return data.risk_assessment as RiskAssessment;
    } catch (err: any) {
      // Client-side fallback to direct local ML prediction engine
      console.warn('Network call to /api/predict failed. Executing client-side prediction engine fallback.', err);
      return PredictionService.analyzeEarthquake(payload);
    }
  }

  /**
   * Legacy method signature wrapper for backward compatibility
   */
  async evaluateRisk(input: EarthquakeInput): Promise<TsunamiRiskPrediction> {
    const assessment = await this.evaluateRiskAssessment(input);
    return {
      risk_score: assessment.risk.score,
      risk_level: assessment.risk.level,
      model_probability: assessment.risk.model_probability,
      model_version: assessment.model.version,
      selected_model_name: assessment.model.name,
      evaluation_metrics: assessment.model.metrics || ({} as any),
      features_calculated: assessment.engineered_features,
      contributing_factors: assessment.factors,
      disclaimer: assessment.limitations.join(' '),
      timestamp: assessment.generated_at,
      input_parameters: {
        magnitude: assessment.event.magnitude,
        depth_km: assessment.event.depth_km,
        latitude: assessment.event.latitude,
        longitude: assessment.event.longitude,
        location_name: assessment.event.location_name || undefined
      }
    };
  }

  /**
   * Requests Gemini AI scientific explanation via POST /api/ai/explain
   */
  async getAIExplanation(
    assessment: RiskAssessment,
    historicalContext?: string
  ): Promise<ExplainResponse> {
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          risk_assessment: assessment,
          historical_context: historicalContext
        })
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        explanation: null,
        error: `Network error connecting to AI explanation server: ${err?.message || 'Failed to fetch'}`
      };
    }
  }

  /**
   * Sends user questions to AI Scientific Analyst via POST /api/ai/analyze
   */
  async askAIAnalyst(
    question: string,
    assessment?: RiskAssessment,
    historicalContext?: string
  ): Promise<AnalyzeResponse> {
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          risk_assessment: assessment || null,
          historical_context: historicalContext
        })
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: `Network error connecting to AI Analyst server: ${err?.message || 'Failed to fetch'}`
      };
    }
  }

  /**
   * Convenience alias for AI Analyst queries
   */
  async askAnalystQuestion(
    question: string,
    assessment?: RiskAssessment
  ): Promise<AnalyzeResponse> {
    return this.askAIAnalyst(question, assessment);
  }
}

export const riskService = new RiskService();
