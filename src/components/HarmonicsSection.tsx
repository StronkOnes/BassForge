import React from 'react';
import { HarmonicsConfig } from '../types/music';
import { RotaryKnob } from './ui/RotaryKnob';
import { Waves, Sparkles } from 'lucide-react';

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
    name: 'R&B Warm 2nd',
    config: { h2: 0.75, h3: 0.18, h4: 0.3, h5: 0.08, h7: 0.0, h9: 0.0, evenOddBalance: 0.45 },
  },
  {
    name: 'Punchy 3rd',
    config: { h2: 0.3, h3: 0.65, h4: 0.1, h5: 0.35, h7: 0.1, h9: 0.0, evenOddBalance: -0.4 },
  },
  {
    name: '808 Earbud Presence',
    config: { h2: 0.55, h3: 0.6, h4: 0.25, h5: 0.3, h7: 0.15, h9: 0.05, evenOddBalance: 0.1 },
  },
  {
    name: 'Speaker Translation',
    config: { h2: 0.7, h3: 0.65, h4: 0.45, h5: 0.4, h7: 0.25, h9: 0.1, evenOddBalance: 0.2 },
  },
  {
    name: 'Aggressive Grit',
    config: { h2: 0.6, h3: 0.8, h4: 0.55, h5: 0.7, h7: 0.6, h9: 0.4, evenOddBalance: -0.3 },
  },
];

export const HarmonicsSection: React.FC<HarmonicsSectionProps> = ({
  harmonics,
  fundamentalFreq = 55.0,
  onChange,
}) => {
  const harmonicItems = [
    { key: 'h2' as const, mult: 2, label: '2nd (Octave)', type: 'Even', color: 'cyan' as const },
    { key: 'h3' as const, mult: 3, label: '3rd (Oct+5th)', type: 'Odd', color: 'blue' as const },
    { key: 'h4' as const, mult: 4, label: '4th (2 Oct)', type: 'Even', color: 'violet' as const },
    { key: 'h5' as const, mult: 5, label: '5th (2 Oct+3)', type: 'Odd', color: 'pink' as const },
    { key: 'h7' as const, mult: 7, label: '7th (Harm 7)', type: 'Odd', color: 'rose' as const },
    { key: 'h9' as const, mult: 9, label: '9th (3 Oct+2)', type: 'Odd', color: 'amber' as const },
  ];

  return (
    <div className="bg-gradient-to-b from-[#0c0e15] to-[#08090e] border border-zinc-800 rounded-lg p-4 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
            <Waves className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold tracking-wider text-white">
              ADDITIVE HARMONIC OVERTONE MATRIX
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              Fundamental F₀: <span className="text-cyan-400 font-bold">{fundamentalFreq.toFixed(1)} Hz</span> · Controlled Spectral Injection
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          {HARMONIC_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onChange({ ...harmonics, ...preset.config })}
              className="px-2.5 py-1 text-[10px] font-mono rounded bg-[#090c14] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Rotary Knobs Grid for Overtones */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 py-2 bg-[#06080d] p-3 rounded-md border border-zinc-900 shadow-inner">
        {harmonicItems.map((h) => {
          const val = harmonics[h.key];
          const freq = fundamentalFreq * h.mult;
          return (
            <div
              key={h.key}
              className="flex flex-col items-center bg-[#090b12] border border-zinc-800/80 p-2.5 rounded-md"
            >
              <RotaryKnob
                label={h.label}
                value={val}
                min={0}
                max={1}
                step={0.01}
                unit="%"
                size="md"
                color={h.color}
                onChange={(newVal) => onChange({ ...harmonics, [h.key]: newVal })}
                sublabel={`${freq.toFixed(0)} Hz`}
              />
            </div>
          );
        })}
      </div>

      {/* Global Harmonic Coupling Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-800/80">
        <div className="flex items-center justify-between bg-[#07090e] border border-zinc-800/80 p-2.5 rounded-md">
          <RotaryKnob
            label="EVEN/ODD BALANCE"
            value={harmonics.evenOddBalance}
            min={-1}
            max={1}
            step={0.02}
            defaultValue={0}
            size="sm"
            color="amber"
            onChange={(val) => onChange({ ...harmonics, evenOddBalance: val })}
            formatValue={(v) => (v < 0 ? `Odd ${Math.abs(Math.round(v * 100))}%` : v > 0 ? `Even ${Math.round(v * 100)}%` : 'Center')}
            sublabel="Even (Tube/Warm) vs Odd (Tape/Bite)"
          />
        </div>

        <div className="flex items-center justify-between bg-[#07090e] border border-zinc-800/80 p-2.5 rounded-md">
          <RotaryKnob
            label="HARMONIC SPREAD"
            value={harmonics.spread}
            min={0}
            max={1}
            step={0.01}
            defaultValue={0.3}
            unit="%"
            size="sm"
            color="cyan"
            onChange={(val) => onChange({ ...harmonics, spread: val })}
            sublabel="Diffusion across overtone series"
          />
        </div>

        <div className="flex items-center justify-between bg-[#07090e] border border-zinc-800/80 p-2.5 rounded-md">
          <RotaryKnob
            label="SPECTRAL FOCUS"
            value={harmonics.focus}
            min={0}
            max={1}
            step={0.01}
            defaultValue={0.6}
            unit="%"
            size="sm"
            color="violet"
            onChange={(val) => onChange({ ...harmonics, focus: val })}
            sublabel="Resonance peaking around 2nd-3rd"
          />
        </div>
      </div>
    </div>
  );
};
