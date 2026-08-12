/**
 * TSUNAMISENSE AI - Gemini AI Analyst Service Boundary
 * 
 * ARCHITECTURE BOUNDARY:
 * Frontend  -->  Backend API (/api/ai/explain)  -->  Gemini 2.5 Flash
 * 
 * Gemini receives structured factual event parameters & risk assessments.
 * Gemini does NOT independently calculate tsunami physics or risk scores.
 */

import { AIExplainApiRequest, AIExplainApiResponse } from '../../types';
import { ERROR_MESSAGES } from '../../lib/errors/appErrors';

export interface IAIService {
  explainRisk(request: AIExplainApiRequest): Promise<AIExplainApiResponse>;
}

export class AIService implements IAIService {
  async explainRisk(_request: AIExplainApiRequest): Promise<AIExplainApiResponse> {
    return {
      status: 'DISCONNECTED',
      message: ERROR_MESSAGES.AI_SERVICE_UNAVAILABLE,
      explanation: null,
      phase: 'Phase 4 Required'
    };
  }
}

export const aiService = new AIService();
