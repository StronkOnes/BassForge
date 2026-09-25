import React, { useState, useEffect } from 'react';
import { runBassForgeTests, TestResult } from '../engine/testRunner';
import { CheckCircle2, XCircle, RefreshCw, Terminal, Check } from 'lucide-react';

export const TestConsole: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [passedCount, setPassedCount] = useState<number>(0);
  const [failedCount, setFailedCount] = useState<number>(0);

  const executeTests = () => {
    const { results, passedCount: passed, failedCount: failed } = runBassForgeTests();
    setTestResults(results);
    setPassedCount(passed);
    setFailedCount(failed);
  };

  useEffect(() => {
    executeTests();
  }, []);

  const total = testResults.length;

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl border border-zinc-800 bg-[#0b0d13] p-5 shadow-2xl font-mono text-zinc-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4 mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            BassForge Verification Suite & DSP Invariant Tests
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Automated validation of oscillator frequency precision, harmonic overtone ratios, distortion stability, MIDI 960 PPQ encoding, and hearability.
          </p>
        </div>

        <button
          onClick={executeTests}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 hover:border-cyan-500 text-xs text-cyan-400 font-bold transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Rerun Verification
        </button>
      </div>

      {/* Summary Scoreboard */}
      <div className="grid grid-cols-3 gap-3 mb-5 text-center">
        <div className="bg-[#08090e] border border-zinc-800/80 p-3 rounded-lg">
          <div className="text-[11px] text-zinc-400 uppercase">Total Tests</div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">{total}</div>
        </div>
        <div className="bg-emerald-950/40 border border-emerald-800/80 p-3 rounded-lg">
          <div className="text-[11px] text-emerald-400 uppercase">Passed</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">{passedCount}</div>
        </div>
        <div className="bg-rose-950/40 border border-rose-800/80 p-3 rounded-lg">
          <div className="text-[11px] text-rose-400 uppercase">Failed</div>
          <div className="text-2xl font-bold text-rose-400 mt-1 tabular-nums">{failedCount}</div>
        </div>
      </div>

      {/* Test List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {testResults.map((t, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border flex flex-col gap-1 transition ${
              t.passed
                ? 'bg-[#08090e] border-zinc-800/90'
                : 'bg-rose-950/20 border-rose-900/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {t.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className="text-xs font-semibold text-white">{t.name}</span>
              </div>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                {t.category}
              </span>
            </div>

            {t.details && <div className="text-[11px] text-zinc-400 pl-6">{t.details}</div>}

            {!t.passed && (
              <div className="text-xs pl-6 mt-1 text-rose-300">
                <div>Expected: {t.expected}</div>
                <div>Actual: {t.actual}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
