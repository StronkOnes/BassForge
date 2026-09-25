import React from 'react';
import { DistortionConfig, DistortionType } from '../types/music';
import { Flame, Layers } from 'lucide-react';

interface DistortionSectionProps {
  distortion: DistortionConfig;
  onChange: (newDistortion: DistortionConfig) => void;
}

const DISTORTION_TYPES: { id: DistortionType; label: string; desc: string }[] = [
  { id: 'Soft Clip', label: 'Soft Clip', desc: 'Tanh analog curve with smooth rolloff' },
  { id: 'Tube', label: 'Tube Triode', desc: 'Asymmetric saturation emphasizing 2nd harmonic' },
  { id: 'Tape', label: 'Tape Drive', desc: 'Warm saturation with subtle dynamic compression' },
  { id: 'Diode', label: 'Diode Asym', desc: 'Rectifying clipping for aggressive bite' },
  { id: 'Hard Clip', label: 'Hard Clip', desc: 'Digital brickwall clipping with hard edges' },
  { id: 'Transistor', label: 'Transistor', desc: 'Crossover distortion with gritty edge' },
  { id: 'Wavefold', label: 'Wavefolder', desc: 'Trigonometric folding producing complex overtones' },
  { id: 'Bit Reduction', label: 'Bit Crusher', desc: 'Step quantizer for industrial digital grit' },
];

export const DistortionSection: React.FC<DistortionSectionProps> = ({
  distortion,
  onChange,
}) => {
  return (
    <div className="bg-[#0b0d13] border border-zinc-800 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold tracking-wider text-white">
              MULTI-ALGORITHM DISTORTION ENGINE
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              Harmonic Saturation & Waveshaping Staging
            </div>
          </div>
        </div>

        {/* Staging Indicator */}
        <div className="flex items-center gap-1.5 bg-[#08090e] border border-zinc-800 px-2.5 py-1 rounded">
          <Layers className="w-3 h-3 text-zinc-400" />
          <span className="text-[10px] font-mono text-zinc-400">Stage:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                onClick={() => onChange({ ...distortion, stage: s })}
                className={`w-4 h-4 rounded-xs text-[9px] font-mono font-bold cursor-pointer transition-colors ${
                  distortion.stage === s
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Algorithm Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {DISTORTION_TYPES.map((t) => {
          const isActive = distortion.type === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange({ ...distortion, type: t.id })}
              className={`p-2 rounded text-left transition-all cursor-pointer border ${
                isActive
                  ? 'bg-amber-950/40 border-amber-500/70 text-white shadow-sm ring-1 ring-amber-500/30'
                  : 'bg-[#08090e] border-zinc-800/70 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <div className="text-xs font-mono font-bold truncate">{t.label}</div>
              <div className="text-[9px] font-mono text-zinc-500 truncate mt-0.5">{t.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-900">
        <div className="bg-[#08090e] border border-zinc-800/70 p-2.5 rounded">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-zinc-300">Drive</span>
            <span className="text-amber-400 font-semibold">{(distortion.drive * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={distortion.drive}
            onChange={(e) => onChange({ ...distortion, drive: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
          />
          <div className="text-[9px] font-mono text-zinc-500 mt-1">
            Input pre-gain & harmonic threshold
          </div>
        </div>

        <div className="bg-[#08090e] border border-zinc-800/70 p-2.5 rounded">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-zinc-300">Asymmetry / Bias</span>
            <span className="text-amber-400 font-semibold">{(distortion.bias * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.02"
            value={distortion.bias}
            onChange={(e) => onChange({ ...distortion, bias: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
          />
          <div className="text-[9px] font-mono text-zinc-500 mt-1">
            Shifts DC bias for even harmonics
          </div>
        </div>

        <div className="bg-[#08090e] border border-zinc-800/70 p-2.5 rounded">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-zinc-300">Tone</span>
            <span className="text-amber-400 font-semibold">{(distortion.tone * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={distortion.tone}
            onChange={(e) => onChange({ ...distortion, tone: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
          />
          <div className="text-[9px] font-mono text-zinc-500 mt-1">
            Post-distortion high frequency filter
          </div>
        </div>

        <div className="bg-[#08090e] border border-zinc-800/70 p-2.5 rounded">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-zinc-300">Mix (Dry / Wet)</span>
            <span className="text-amber-400 font-semibold">{(distortion.mix * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={distortion.mix}
            onChange={(e) => onChange({ ...distortion, mix: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
          />
          <div className="text-[9px] font-mono text-zinc-500 mt-1">
            Parallel saturation blend
          </div>
        </div>
      </div>
    </div>
  );
};
