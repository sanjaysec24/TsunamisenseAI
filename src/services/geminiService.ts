/**
 * TSUNAMISENSE AI — Gemini Scientific Explanation & Analyst Service
 * 
 * Provides server-side Gemini 3.6 Flash integration for generating scientific
 * explanations of ML model predictions and answering user Q&A as an AI Scientific Analyst.
 * 
 * STRICT RULES:
 * 1. Gemini NEVER predicts or overrides tsunami occurrence / risk scores.
 * 2. Gemini NEVER invents fake measurements, wave heights, or warnings.
 * 3. Gemini clearly distinguishes model estimates, observations, and uncertainties.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { RiskAssessment, GeminiExplanation } from '../ml/types';

const GEMINI_SYSTEM_INSTRUCTION = `You are the TsunamiSense AI scientific explanation assistant.
You explain structured earthquake-risk analysis produced by the TsunamiSense ML engine.
You do not independently predict tsunami occurrence.
You do not override model outputs.
You do not invent measurements, observations, historical events, wave heights, probabilities, or warnings.
You clearly distinguish:
- model-estimated risk
- observed data
- historical evidence
- uncertainty
You must communicate that TsunamiSense AI is a research/decision-support prototype and not an official tsunami warning authority.
When asked to guarantee a tsunami or generate an official warning, politely refuse or reframe, advising the user to check official authority warning centers (e.g. NOAA PTWC, JMA).`;

export class GeminiService {
  private static getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GeminiService: GEMINI_API_KEY environment variable is missing.');
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }

  /**
   * Generates a structured scientific explanation of a RiskAssessment.
   */
  static async explainRiskAssessment(
    assessment: RiskAssessment,
    historicalContext?: string
  ): Promise<GeminiExplanation> {
    const client = this.getClient();
    if (!client) {
      throw new Error('Gemini API key unavailable.');
    }

    const payloadContext = {
      earthquake: {
        magnitude: assessment.event.magnitude,
        depth_km: assessment.event.depth_km,
        latitude: assessment.event.latitude,
        longitude: assessment.event.longitude,
        location_name: assessment.event.location_name || 'Unspecified region'
      },
      risk_assessment: {
        score: assessment.risk.score,
        level: assessment.risk.level,
        model_probability: assessment.risk.model_probability
      },
      model_info: {
        name: assessment.model.name,
        version: assessment.model.version
      },
      contributing_factors: assessment.factors.map((f) => ({
        factor: f.factor_name,
        value: f.raw_value,
        direction: f.impact_direction,
        impact_pct: f.impact_percentage,
        rationale: f.rationale
      })),
      engineered_features: assessment.engineered_features,
      historical_context: historicalContext || 'Historical comparison unavailable for this analysis.',
      observations: 'Ocean observation validation is not currently connected.',
      limitations: assessment.limitations
    };

    const prompt = `Analyze and scientifically explain the following structured ML tsunami risk assessment:
${JSON.stringify(payloadContext, null, 2)}

Provide a concise, professional scientific interpretation explaining why the ML model assigned this risk level, key contributing geological factors, sources of uncertainty, recommended verification steps, and a research disclaimer.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'Brief 1-2 sentence executive summary of the model evaluation.'
            },
            risk_interpretation: {
              type: Type.STRING,
              description: 'Detailed scientific explanation of why the model arrived at this risk score.'
            },
            key_factors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Bullet list of primary seismic/tectonic features driving the result.'
            },
            uncertainty: {
              type: Type.STRING,
              description: 'Key physical uncertainties (e.g. lack of real-time bathymetry, slip distribution).'
            },
            recommended_verification: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Actionable verification steps with official monitoring authorities.'
            },
            disclaimer: {
              type: Type.STRING,
              description: 'Clear statement that TsunamiSense AI is a research decision-support prototype.'
            }
          },
          required: [
            'summary',
            'risk_interpretation',
            'key_factors',
            'uncertainty',
            'recommended_verification',
            'disclaimer'
          ]
        }
      }
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
      throw new Error('Gemini API returned empty response text.');
    }

    const parsed: GeminiExplanation = JSON.parse(jsonText);
    return parsed;
  }

  /**
   * Answers scientific analyst questions about a RiskAssessment.
   */
  static async analyzeQuestion(
    question: string,
    assessment: RiskAssessment,
    historicalContext?: string
  ): Promise<string> {
    const client = this.getClient();
    if (!client) {
      throw new Error('Gemini API key unavailable.');
    }

    const promptContext = {
      earthquake: assessment.event,
      risk_assessment: assessment.risk,
      model: assessment.model,
      factors: assessment.factors,
      engineered_features: assessment.engineered_features,
      historical_context: historicalContext || 'Historical comparison unavailable for this analysis.',
      observations: 'Ocean observation validation is not currently connected.'
    };

    const prompt = `User Question: "${question}"

Factual Risk Assessment Context:
${JSON.stringify(promptContext, null, 2)}

Respond directly to the user's question as a scientific analyst. Adhere strictly to the model's factual assessment. Do not override model scores or invent measurements.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: GEMINI_SYSTEM_INSTRUCTION
      }
    });

    return response.text || 'Unable to generate analysis response.';
  }

  /**
   * Health check helper for Gemini API key availability.
   */
  static isAvailable(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }
}
