import React, { useState, useEffect } from 'react';
import { SpeakerTarget, HearabilityAnalysis, BassHealthMetrics } from '../types/music';
import { bassDsp } from '../engine/audioSynth';
import { Volume2, Sparkles, AlertTriangle, CheckCircle, ShieldCheck, Activity } from 'lucide-react';

interface HearabilityPanelProps {
  currentTarget: SpeakerTarget;
  onSelectTarget: (target: SpeakerTarget) => void;
  onAutoInjectHarmonics: () => void;
}

const TARGETS: { id: SpeakerTarget; label: string; desc: string; cutoff: string }[] = [
  { id: 'FULL RANGE', label: 'Full Range', desc: 'Studio Monitors / Subwoofer (Flat)', cutoff: '20 Hz' },
  { id: 'HEADPHONES', label: 'Headphones', desc: 'Extended Low-End with High Air', cutoff: '30 Hz' },
  { id: 'PHONE', label: 'Phone', desc: 'Smartphone Speaker Cutoff', cutoff: '350 Hz' },
  { id: 'LAPTOP', label: 'Laptop', desc: 'Notebook Internal Transducer', cutoff: '200 Hz' },
  { id: 'SMALL SPEAKER', label: 'Small Speaker', desc: 'Portable Bluetooth Pill', cutoff: '120 Hz' },
  { id: 'CAR', label: 'Car Audio', desc: 'Sub Cabin Gain + Mid Scoop', cutoff: '40 Hz' },
  { id: 'MONO CLUB', label: 'Mono Club', desc: 'Large PA System Mono Sum', cutoff: '32 Hz' },
];

export const HearabilityPanel: React.FC<HearabilityPanelProps> = ({
  currentTarget,
  onSelectTarget,
  onAutoInjectHarmonics,
}) => {
  const [analysis, setAnalysis] = useState<HearabilityAnalysis>({
    fundamentalEnergy: 45,
    bodyEnergy: 35,
    upperHarmonicEnergy: 20,
    smallSpeakerScore: 40,
    lowFrequencyDependence: 'Moderate',
    recommendation: 'Analyzing live acoustic transfer...',
  });

  const [health, setHealth] = useState<BassHealthMetrics>({
    subStability: 'Optimal',
    monoCompatibility: 1.0,
    harmonicRichness: 'Balanced',
    dynamicConsistency: 8.5,
    upperBassPresence: 'Moderate',
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setAnalysis(bassDsp.analyzeHearability());
      setHealth(bassDsp.getBassHealth());
    }, 250);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#0b0d13] border border-zinc-800 rounded-lg p-4 space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Volume2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold tracking-wider text-white">
              HEARABILITY ENGINE
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              Acoustic Translation & Small-Speaker Diagnostic Analysis
            </div>
          </div>
        </div>

        {/* Small Speaker Presence Metric */}
        <div className="flex items-center gap-3 bg-[#080a0f] border border-zinc-800 px-3 py-1.5 rounded-md">
          <span className="text-[11px] font-mono text-zinc-400">Small-Speaker Translation:</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-sm font-mono font-bold ${
                analysis.smallSpeakerScore > 65
                  ? 'text-cyan-400'
                  : analysis.smallSpeakerScore > 35
                  ? 'text-blue-400'
                  : 'text-amber-400'
              }`}
            >
              {analysis.smallSpeakerScore}%
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                analysis.smallSpeakerScore > 65
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                  : analysis.smallSpeakerScore > 35
                  ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                  : 'bg-amber-950 text-amber-300 border border-amber-800/60'
              }`}
            >
              {analysis.smallSpeakerScore > 65
                ? 'EXCELLENT'
                : analysis.smallSpeakerScore > 35
                ? 'ADEQUATE'
                : 'RISK'}
            </span>
          </div>
        </div>
      </div>

      {/* Target Speaker Audition Buttons */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-semibold text-zinc-300 uppercase tracking-wider">
            Diagnostic Monitoring Target (Real-Time Filter)
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            Click to audition how bass sounds on consumer hardware
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
          {TARGETS.map((t) => {
            const isActive = currentTarget === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTarget(t.id)}
                className={`p-2 rounded text-left transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-cyan-950/70 border-cyan-500/80 text-white shadow-sm ring-1 ring-cyan-500/30'
                    : 'bg-[#08090d] border-zinc-800/70 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <div className="text-[11px] font-mono font-bold truncate">{t.label}</div>
                <div className="text-[9px] font-mono text-zinc-500 truncate">{t.cutoff}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spectral Distribution Energy Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#080a0f] p-3 rounded border border-zinc-900">
        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-zinc-400">Fundamental (20-80 Hz)</span>
            <span className="text-cyan-400 font-semibold">{analysis.fundamentalEnergy}%</span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full transition-all duration-300"
              style={{ width: `${analysis.fundamentalEnergy}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-zinc-400">Body Warmth (80-250 Hz)</span>
            <span className="text-blue-400 font-semibold">{analysis.bodyEnergy}%</span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${analysis.bodyEnergy}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-zinc-400">Upper Harmonics (250Hz+)</span>
            <span className="text-violet-400 font-semibold">{analysis.upperHarmonicEnergy}%</span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-violet-500 h-full transition-all duration-300"
              style={{ width: `${analysis.upperHarmonicEnergy}%` }}
            />
          </div>
        </div>
      </div>

      {/* Auto Hearability Assistant & Recommendation */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#0e121a] border border-cyan-900/40">
        <div className="flex items-start gap-2.5 max-w-2xl">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-mono font-semibold text-zinc-200">
              Acoustic Diagnosis & Recommendation
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5 font-sans leading-relaxed">
              {analysis.recommendation}
            </div>
          </div>
        </div>

        <button
          onClick={onAutoInjectHarmonics}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-semibold text-xs transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Auto-Inject Harmonics
        </button>
      </div>

      {/* Bass Health Diagnostics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-zinc-900 text-xs font-mono">
        <div className="flex items-center gap-2 p-2 bg-[#08090d] rounded border border-zinc-900">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <div>
            <div className="text-[10px] text-zinc-500">Sub Stability</div>
            <div className="text-zinc-200 font-semibold">{health.subStability} (Mono)</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-[#08090d] rounded border border-zinc-900">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-zinc-500">Mono Compatibility</div>
            <div className="text-zinc-200 font-semibold">{health.monoCompatibility.toFixed(2)} Correlation</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-[#08090d] rounded border border-zinc-900">
          <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
          <div>
            <div className="text-[10px] text-zinc-500">Harmonic Profile</div>
            <div className="text-zinc-200 font-semibold">{health.harmonicRichness}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-[#08090d] rounded border border-zinc-900">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <div>
            <div className="text-[10px] text-zinc-500">Low-End Dependence</div>
            <div className="text-zinc-200 font-semibold">{analysis.lowFrequencyDependence}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
