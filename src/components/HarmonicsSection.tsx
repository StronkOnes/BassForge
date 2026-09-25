import React from 'react';
import { HarmonicsConfig } from '../types/music';
import { Waves, Sliders } from 'lucide-react';

interface HarmonicsSectionProps {
  harmonics: HarmonicsConfig;
  fundamentalFreq?: number;
  onChange: (newHarmonics: HarmonicsConfig) => void;
}

const HARMONIC_PRESETS: { name: string; config: Partial<HarmonicsConfig> }[] = [
  {
    name: 'Clean Sub',
    config: { h2: 0.1, h3: 0.05, h4: 0.0, h5: 0.0, h7: 0.0, h9: 0.0, evenOddBalance: 0.0 },
  },
  {
    name: 'Warm 2nd',
    config: { h2: 0.7, h3: 0.15, h4: 0.25, h5: 0.05, h7: 0.0, h9: 0.0, evenOddBalance: 0.5 },
  },
  {
    name: 'Punchy 3rd',
    config: { h2: 0.3, h3: 0.65, h4: 0.1, h5: 0.35, h7: 0.1, h9: 0.0, evenOddBalance: -0.4 },
  },
  {
    name: '808 Presence',
    config: { h2: 0.55, h3: 0.6, h4: 0.25, h5: 0.3, h7: 0.15, h9: 0.05, evenOddBalance: 0.0 },
  },
  {
    name: 'Speaker Bass',
    config: { h2: 0.7, h3: 0.65, h4: 0.45, h5: 0.4, h7: 0.25, h9: 0.1, evenOddBalance: 0.2 },
  },
  {
    name: 'Aggressive',
    config: { h2: 0.6, h3: 0.8, h4: 0.55, h5: 0.7, h7: 0.6, h9: 0.4, evenOddBalance: -0.3 },
  },
];

export const HarmonicsSection: React.FC<HarmonicsSectionProps> = ({
  harmonics,
  fundamentalFreq = 55.0,
  onChange,
}) => {
  const harmonicItems = [
    { key: 'h2' as const, mult: 2, label: '2nd (Octave)', type: 'Even', color: 'text-cyan-400' },
    { key: 'h3' as const, mult: 3, label: '3rd (Oct+5th)', type: 'Odd', color: 'text-blue-400' },
    { key: 'h4' as const, mult: 4, label: '4th (2 Octaves)', type: 'Even', color: 'text-indigo-400' },
    { key: 'h5' as const, mult: 5, label: '5th (2 Oct+3rd)', type: 'Odd', color: 'text-violet-400' },
    { key: 'h7' as const, mult: 7, label: '7th (Harmonic 7)', type: 'Odd', color: 'text-purple-400' },
    { key: 'h9' as const, mult: 9, label: '9th (3 Oct+2nd)', type: 'Odd', color: 'text-fuchsia-400' },
  ];

  return (
    <div className="bg-[#0b0d13] border border-zinc-800 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-violet-950 border border-violet-800 flex items-center justify-center text-violet-400">
            <Waves className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold tracking-wider text-white">
              TARGETED HARMONIC ENGINE
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              Fundamental F0: {fundamentalFreq.toFixed(1)} Hz · Controlled Harmonic Overtones
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1">
          {HARMONIC_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onChange({ ...harmonics, ...preset.config })}
              className="px-2 py-0.8 text-[10px] font-mono rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Harmonic Sliders Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {harmonicItems.map((h) => {
          const val = harmonics[h.key];
          const freq = fundamentalFreq * h.mult;
          return (
            <div
              key={h.key}
              className="bg-[#08090e] border border-zinc-800/70 p-2.5 rounded-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono font-semibold">
                  <span className={h.color}>{h.label}</span>
                  <span className="text-[9px] text-zinc-500 uppercase">{h.type}</span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                  {freq.toFixed(1)} Hz
                </div>
              </div>

              {/* Slider */}
              <div className="my-2.5">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={val}
                  onChange={(e) => onChange({ ...harmonics, [h.key]: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>{(val * 100).toFixed(0)}%</span>
                <span className="text-zinc-600">
                  {val > 0.01 ? `${(20 * Math.log10(val)).toFixed(1)} dB` : '-inf'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Macro Controls: Even/Odd Balance, Spread, Focus */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-zinc-900">
        <div className="bg-[#08090e] border border-zinc-800/70 p-2.5 rounded">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-zinc-300">Even / Odd Balance</span>
            <span className="text-cyan-400 font-semibold">
              {harmonics.evenOddBalance > 0.1
                ? 'Even (+)'
                : harmonics.evenOddBalance < -0.1
                ? 'Odd (-)'
                : 'Neutral'}
            </span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={harmonics.evenOddBalance}
            onChange={(e) => onChange({ ...harmonics, evenOddBalance: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
          />
          <div className="flex justify-between text-[9px] font-mono text-zinc-500 mt-1">
            <span>Odd (Tube/Square)</span>
            <span>Even (Warmth/Tape)</span>
          </div>
        </div>

        <div className="bg-[#08090e] border border-zinc-800/70 p-2.5 rounded">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-zinc-300">Harmonic Spread</span>
            <span className="text-blue-400 font-semibold">{(harmonics.spread * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={harmonics.spread}
            onChange={(e) => onChange({ ...harmonics, spread: parseFloat(e.target.value) })}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
          />
          <div className="text-[9px] font-mono text-zinc-500 mt-1">
            Widens high-order harmonic distribution
          </div>
        </div>

        <div className="bg-[#08090e] border border-zinc-800/70 p-2.5 rounded">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span className="text-zinc-300">Harmonic Focus</span>
            <span className="text-violet-400 font-semibold">{(harmonics.focus * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={harmonics.focus}
            onChange={(e) => onChange({ ...harmonics, focus: parseFloat(e.target.value) })}
            className="w-full accent-violet-500 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
          />
          <div className="text-[9px] font-mono text-zinc-500 mt-1">
            Concentrates energy around audible 2nd & 3rd bands
          </div>
        </div>
      </div>
    </div>
  );
};
