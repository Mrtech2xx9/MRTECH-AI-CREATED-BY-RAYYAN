import React, { useState } from 'react';
import { Columns, Send, Sparkles, AlertCircle } from 'lucide-react';
import { ChatMessageRenderer } from './ChatMessageRenderer';

export const CompareView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [instructionA, setInstructionA] = useState('Concise & Technical');
  const [instructionB, setInstructionB] = useState('Detailed & Architectural');
  const [outputA, setOutputA] = useState<string | null>(null);
  const [outputB, setOutputB] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setOutputA(null);
    setOutputB(null);

    try {
      // Execute both AI engine calls side-by-side
      const [resA, resB] = await Promise.all([
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: `${prompt}\n[Instruction Variant A: ${instructionA}]`,
              },
            ],
            stream: false,
          }),
        }),
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: `${prompt}\n[Instruction Variant B: ${instructionB}]`,
              },
            ],
            stream: false,
          }),
        }),
      ]);

      const dataA = await resA.json().catch(() => ({}));
      const dataB = await resB.json().catch(() => ({}));

      if (!resA.ok) {
        throw new Error(dataA.error || `Variant A request failed (${resA.status})`);
      }
      if (!resB.ok) {
        throw new Error(dataB.error || `Variant B request failed (${resB.status})`);
      }

      setOutputA(dataA.reply || dataA.text || 'No response generated');
      setOutputB(dataB.reply || dataB.text || 'No response generated');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('failed to fetch')) {
        setError('Unable to reach the server. Please check your connection and try again.');
      } else {
        setError(msg || 'Comparison failed. Please check connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-full flex flex-col p-4 sm:p-6 lg:p-8 bg-[#090d16] text-slate-100">
      <div className="pb-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
            <Columns className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
              Compare Mode
            </h1>
            <span className="text-xs font-mono text-cyan-400">
              Side-by-Side Dual AI Output & Prompt Variation Evaluation
            </span>
          </div>
        </div>
      </div>

      {/* Input area */}
      <form onSubmit={handleCompare} className="mt-6 flex flex-col gap-4 max-w-4xl">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Test Prompt to Compare
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="e.g. Explain OAuth 2.0 PKCE flow with a sequence diagram..."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100 resize-none"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Variant A Directive</label>
              <input
                type="text"
                value={instructionA}
                onChange={(e) => setInstructionA(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Variant B Directive</label>
              <input
                type="text"
                value={instructionB}
                onChange={(e) => setInstructionB(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-50 flex items-center justify-center gap-2 self-start mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Running Comparison...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Run Side-by-Side Evaluation</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comparison Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Output A */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3 min-h-[300px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-cyan-300 font-mono uppercase">Variant A ({instructionA})</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">AI 1</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {outputA ? (
              <ChatMessageRenderer content={outputA} />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                Output for Variant A will appear here
              </div>
            )}
          </div>
        </div>

        {/* Output B */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-3 min-h-[300px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-teal-300 font-mono uppercase">Variant B ({instructionB})</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">AI 1</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {outputB ? (
              <ChatMessageRenderer content={outputB} />
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                Output for Variant B will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
