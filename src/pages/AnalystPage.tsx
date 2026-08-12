/**
 * TSUNAMISENSE AI - Gemini AI Analyst Page
 */

import React, { useState } from 'react';
import { Bot, Send, Sparkles, MessageSquare, Radio, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { AlertPanel } from '../components/AlertPanel';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/ui/Input';
import { useApp } from '../context/AppContext';
import { riskService } from '../services/risk/riskService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'analyst';
  text: string;
  timestamp: string;
}

export const AnalystPage: React.FC = () => {
  const { activeAssessment, activeExplanation } = useApp();
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'analyst',
      text: activeAssessment
        ? `Hello, I am TsunamiSense AI Analyst. I am currently holding active seismic context for ${activeAssessment.event.location_name || 'Analyzed Earthquake'} (Mw ${activeAssessment.event.magnitude.toFixed(1)}, Depth: ${activeAssessment.event.depth_km.toFixed(1)} km, Risk Score: ${activeAssessment.risk.score}/100 - ${activeAssessment.risk.level} RISK). Ask me any scientific question about this risk score, subduction fault mechanisms, or historical analogies.`
        : `Hello, I am TsunamiSense AI Analyst. I am connected to Google Gemini to explain tsunami risk assessments, seismic feature engineering, and oceanographic data. Analyze an earthquake in Global Monitoring or the Analyzer page to give me specific event context, or ask general questions!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const suggestedQuestions = activeAssessment ? [
    `Why did the model classify this event as ${activeAssessment.risk.level} RISK?`,
    `How does focal depth (${activeAssessment.event.depth_km} km) impact tsunami potential here?`,
    `What historical tsunamis occurred in this region?`,
    `What ocean buoy (DART) telemetry should be verified for this location?`
  ] : [
    'What seismic factors are most critical for tsunami generation?',
    'Why is focal depth below 70 km less likely to cause a tsunami?',
    'How do subduction megathrust earthquakes differ from strike-slip earthquakes?',
    'What role does coastal shelf bathymetry play in wave amplification?'
  ];

  const handleSendQuery = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await riskService.askAnalystQuestion(text, activeAssessment || undefined);
      const analystMsg: ChatMessage = {
        id: `analyst-${Date.now()}`,
        sender: 'analyst',
        text: response.answer || 'I evaluated the seismic features for this query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, analystMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `analyst-err-${Date.now()}`,
        sender: 'analyst',
        text: 'An error occurred while communicating with Gemini AI. Please check server connectivity or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <SectionHeader
        title="TSUNAMISENSE AI ANALYST"
        subtitle="Conversational AI reasoning engine powered by Google Gemini for explainable risk rationale and scientific synthesis."
        badge={<StatusBadge label="GEMINI 3.6 FLASH ONLINE" variant="success" size="sm" pulse />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ACTIVE CONTEXT SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="space-y-4 border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="font-display font-bold text-sm text-slate-100 uppercase">
                Active Assessment Context
              </h3>
            </div>

            {activeAssessment ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">EVENT LOCATION</span>
                  <span className="font-bold text-slate-200 text-sm">{activeAssessment.event.location_name}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">MAGNITUDE</span>
                    <span className="font-bold text-amber-400 text-sm">Mw {activeAssessment.event.magnitude.toFixed(1)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">FOCAL DEPTH</span>
                    <span className="font-bold text-cyan-300 text-sm">{activeAssessment.event.depth_km.toFixed(1)} km</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-cyan-400 block uppercase">ML RISK SCORE</span>
                    <span className="font-bold text-slate-100 text-lg">{activeAssessment.risk.score.toFixed(0)} / 100</span>
                  </div>
                  <StatusBadge label={`${activeAssessment.risk.level} RISK`} variant="danger" size="sm" pulse />
                </div>

                <div className="pt-2 text-[11px] text-slate-400 leading-relaxed font-sans border-t border-slate-800">
                  All analyst answers will synthesize these specific seismic parameters and model output.
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2 text-xs">
                <Radio className="w-6 h-6 text-slate-500 mx-auto" />
                <p className="text-slate-300 font-semibold">No Event Context Selected</p>
                <p className="text-slate-400 text-[11px]">
                  Analyze an event in the Monitor page to populate live event parameters for Gemini.
                </p>
              </div>
            )}
          </Card>

          {/* SUGGESTED PROMPTS CARD */}
          <Card className="space-y-3 border-slate-800 bg-slate-900/60">
            <span className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider block">
              Suggested Questions
            </span>
            <div className="space-y-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(q)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-cyan-200/90 text-left transition-all flex items-start gap-2 group cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0 mt-0.5" />
                  <span className="leading-snug">{q}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: MAIN CHAT INTERFACE */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="min-h-[540px] flex flex-col justify-between p-0 overflow-hidden border-slate-800 bg-slate-950">
            {/* Top Bar */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-slate-100">TSUNAMISENSE AI ANALYST</h3>
                  <p className="text-[10px] font-mono text-slate-400">Google Gemini 3.6 Flash Decision Support</p>
                </div>
              </div>
              <StatusBadge label="ACTIVE CHAT" variant="success" size="sm" pulse />
            </div>

            {/* Chat Messages Area */}
            <div className="p-6 space-y-4 flex-1 font-sans overflow-y-auto max-h-[460px] bg-[#050b16]">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xl p-4 rounded-2xl space-y-1.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-cyan-950/80 border border-cyan-700/80 text-cyan-100 rounded-tr-none'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] font-mono opacity-70">
                      <span className="font-bold uppercase">{msg.sender === 'user' ? 'ANALYST USER' : 'GEMINI ANALYST'}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-cyan-300 animate-pulse flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                    <span>Gemini is synthesizing seismic rationale & historical analog data...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuery(inputQuery);
                }}
                className="flex items-center gap-3"
              >
                <div className="flex-1">
                  <Input
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder={activeAssessment ? "Ask questions about this active earthquake risk assessment..." : "Ask general questions about tsunami risk models..."}
                    disabled={loading}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={loading || !inputQuery.trim()}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Send
                </Button>
              </form>
            </div>
          </Card>

          <AlertPanel
            type="disclaimer"
            title="RESEARCH PROTOTYPE NOTICE"
            description="TsunamiSense AI Analyst is a research decision support tool powered by Google Gemini. It does not replace official warning center statements."
          />
        </div>
      </div>
    </div>
  );
};
