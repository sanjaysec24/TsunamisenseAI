/**
 * TSUNAMISENSE AI — Full-Stack Express Server & API Proxy
 * 
 * Exposes core prediction & AI explanation endpoints:
 * - GET  /api/health
 * - POST /api/predict
 * - POST /api/ai/explain
 * - POST /api/ai/analyze
 * 
 * Binds strictly to 0.0.0.0:3000 and integrates Vite middleware in development mode.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { PredictionService } from './src/services/predictionService';
import { GeminiService } from './src/services/geminiService';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser middleware
app.use(express.json({ limit: '2mb' }));

// 1. GET /api/health
app.get('/api/health', (req: Request, res: Response) => {
  const geminiAvailable = GeminiService.isAvailable();
  res.json({
    status: 'ok',
    api: 'healthy',
    model: 'available',
    gemini: geminiAvailable ? 'available' : 'unavailable',
    timestamp: new Date().toISOString()
  });
});

// 2. POST /api/predict
app.post('/api/predict', (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const { magnitude, depth_km, latitude, longitude, location_name } = req.body || {};

    // Run prediction engine & validation
    const assessment = PredictionService.analyzeEarthquake({
      magnitude,
      depth_km,
      latitude,
      longitude,
      location_name
    });

    console.log(
      `[API /api/predict] Success | Mw ${magnitude} | Depth ${depth_km}km | Lat ${latitude} Lng ${longitude} | Risk: ${assessment.risk.level} (${assessment.risk.score}) | Time: ${Date.now() - startTime}ms`
    );

    res.json({
      success: true,
      risk_assessment: assessment
    });
  } catch (error: any) {
    const errorMsg = error?.message || 'Unknown prediction server error';
    console.error(`[API /api/predict] Error: ${errorMsg}`);

    const isValidationError = errorMsg.startsWith('Validation Error');
    res.status(isValidationError ? 400 : 500).json({
      success: false,
      error: errorMsg
    });
  }
});

// 3. POST /api/ai/explain
app.post('/api/ai/explain', async (req: Request, res: Response) => {
  try {
    const { risk_assessment, historical_context } = req.body || {};

    if (!risk_assessment) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameter: risk_assessment object.'
      });
      return;
    }

    if (!GeminiService.isAvailable()) {
      res.status(200).json({
        success: false,
        error: 'AI explanation temporarily unavailable. (Missing GEMINI_API_KEY)',
        explanation: null
      });
      return;
    }

    const explanation = await GeminiService.explainRiskAssessment(
      risk_assessment,
      historical_context
    );

    res.json({
      success: true,
      explanation
    });
  } catch (error: any) {
    console.error('[API /api/ai/explain] Gemini Explanation Error:', error?.message);
    res.status(200).json({
      success: false,
      error: `AI explanation temporarily unavailable: ${error?.message || 'Gemini error'}`,
      explanation: null
    });
  }
});

// 4. POST /api/ai/analyze
app.post('/api/ai/analyze', async (req: Request, res: Response) => {
  try {
    const { question, risk_assessment, historical_context } = req.body || {};

    if (!question || typeof question !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Missing required parameter: string question.'
      });
      return;
    }

    if (!risk_assessment) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameter: risk_assessment object.'
      });
      return;
    }

    if (!GeminiService.isAvailable()) {
      res.status(200).json({
        success: false,
        error: 'AI Analyst is temporarily unavailable. (Missing GEMINI_API_KEY)'
      });
      return;
    }

    const answer = await GeminiService.analyzeQuestion(
      question,
      risk_assessment,
      historical_context
    );

    res.json({
      success: true,
      answer
    });
  } catch (error: any) {
    console.error('[API /api/ai/analyze] Gemini Analyst Error:', error?.message);
    res.status(200).json({
      success: false,
      error: `AI Analyst temporarily unavailable: ${error?.message || 'Gemini error'}`
    });
  }
});

// Start Express and attach Vite Middleware in Development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TsunamiSense AI Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
