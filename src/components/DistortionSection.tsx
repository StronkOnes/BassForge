import React from 'react';
import { DistortionConfig, DistortionType } from '../types/music';
import { RotaryKnob } from './ui/RotaryKnob';
import { VacuumTubeVisualizer } from './ui/VacuumTubeVisualizer';
import { Flame, Layers, Radio } from 'lucide-react';

interface DistortionSectionProps {
  distortion: DistortionConfig;
  onChange: (newDistortion: DistortionConfig) => void;
}

const DISTORTION_TYPES: { id: DistortionType; label: string; desc: string; harmonics: string }[] = [
  { id: 'Tube', label: '12AX7 Triode', desc: 'Asymmetric saturation rich in warm 2nd harmonic', harmonics: 'Even dominant' },
  { id: 'Tape', label: 'Studer Tape', desc: 'Warm saturation with subtle soft-knee compression', harmonics: 'Odd & 3rd' },
  { id: 'Soft Clip', label: 'Tanh Soft', desc: 'Hyperbolic tangent musical rolloff', harmonics: 'Gradual' },
  { id: 'Diode', label: 'Germanium', desc: 'Rectifying diode clipping for aggressive bite', harmonics: 'Sharp' },
  { id: 'Hard Clip', label: 'Brickwall', desc: 'Hard square-wave digital clipper', harmonics: 'All' },
  { id: 'Transistor', label: 'Class-A', desc: 'Symmetrical silicon crossover crunch', harmonics: 'Crisp' },
  { id: 'Wavefold', label: 'Wavefolder', desc: 'West Coast mathematical folding', harmonics: 'Complex' },
  { id: 'Bit Reduction', label: 'Bit Crusher', desc: 'Step quantizer digital lo-fi grit', harmonics: 'Aliased' },
];

export const DistortionSection: React.FC<DistortionSectionProps> = ({
  distortion,
  onChange,
}) => {
  return (
    <div className="bg-gradient-to-b from-[#0c0e15] to-[#08090e] border border-zinc-800 rounded-lg p-4 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold tracking-wider text-white">
              ANALOG SATURATION & WAVESHAPING BAY
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              Thermionic Valve & Tape Physics Emulation
            </div>
          </div>
        </div>

        {/* Multi-Stage Selector */}
        <div className="flex items-center gap-2 bg-[#06080d] border border-zinc-800/90 px-3 py-1.5 rounded-md">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-mono text-zinc-400">OVERSAMPLING / STAGE:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                onClick={() => onChange({ ...distortion, stage: s })}
                className={`w-5 h-5 rounded-xs text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                  distortion.stage === s
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Body: Algorithm Picker & Vacuum Tube Stage */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Left: Algorithm Grid */}
        <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DISTORTION_TYPES.map((t) => {
            const isActive = distortion.type === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChange({ ...distortion, type: t.id })}
                className={`p-2.5 rounded-md text-left transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-gradient-to-b from-amber-950/70 to-amber-950/30 border-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50'
                    : 'bg-[#080a10] border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <div className="text-xs font-mono font-bold truncate flex items-center justify-between">
                  <span>{t.label}</span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />}
                </div>
                <div className="text-[9px] font-mono text-zinc-500 truncate mt-0.5">{t.desc}</div>
                <div className="text-[8px] font-mono text-amber-500/80 mt-1 uppercase font-semibold">
                  {t.harmonics}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Vintage Vacuum Tube Stage Visualizer */}
        <div className="flex flex-col items-center justify-center p-2.5 bg-[#06080d] border border-zinc-900 rounded-md">
          <VacuumTubeVisualizer
            drive={distortion.drive}
            type={distortion.type}
            active={distortion.mix > 0.05}
          />
        </div>
      </div>

      {/* Hardware Dials Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-800/80 bg-[#06080d] p-3 rounded-md">
        <RotaryKnob
          label="DRIVE GAIN"
          value={distortion.drive}
          min={0}
          max={1}
          step={0.01}
          defaultValue={0.35}
          unit="%"
          size="md"
          color="amber"
          onChange={(val) => onChange({ ...distortion, drive: val })}
          sublabel="Input Saturation Push"
        />

        <RotaryKnob
          label="TUBE BIAS"
          value={distortion.bias}
          min={-0.5}
          max={0.5}
          step={0.01}
          defaultValue={0.1}
          size="md"
          color="amber"
          onChange={(val) => onChange({ ...distortion, bias: val })}
          formatValue={(v) => (v === 0 ? 'Center' : `${v > 0 ? '+' : ''}${(v * 100).toFixed(0)}%`)}
          sublabel="Asymmetry & 2nd Overtone"
        />

        <RotaryKnob
          label="SATURATION TONE"
          value={distortion.tone}
          min={0}
          max={1}
          step={0.01}
          defaultValue={0.6}
          unit="%"
          size="md"
          color="amber"
          onChange={(val) => onChange({ ...distortion, tone: val })}
          sublabel="High Frequency Rolloff"
        />

        <RotaryKnob
          label="DRY / WET MIX"
          value={distortion.mix}
          min={0}
          max={1}
          step={0.01}
          defaultValue={0.45}
          unit="%"
          size="md"
          color="amber"
          onChange={(val) => onChange({ ...distortion, mix: val })}
          sublabel="Parallel Blend"
        />
      </div>
    </div>
  );
};
