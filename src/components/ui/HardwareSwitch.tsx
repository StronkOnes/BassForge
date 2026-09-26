import React from 'react';

export interface HardwareSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: 'cyan' | 'pink' | 'amber' | 'emerald' | 'violet';
  sublabel?: string;
  disabled?: boolean;
  variant?: 'toggle' | 'rocker' | 'push';
}

const LED_COLORS = {
  cyan: {
    activeBg: 'bg-cyan-400',
    activeGlow: 'shadow-[0_0_8px_#06b6d4,0_0_14px_rgba(6,182,212,0.5)]',
    text: 'text-cyan-300',
    border: 'border-cyan-500/50',
  },
  pink: {
    activeBg: 'bg-pink-400',
    activeGlow: 'shadow-[0_0_8px_#ec4899,0_0_14px_rgba(236,72,153,0.5)]',
    text: 'text-pink-300',
    border: 'border-pink-500/50',
  },
  amber: {
    activeBg: 'bg-amber-400',
    activeGlow: 'shadow-[0_0_8px_#f59e0b,0_0_14px_rgba(245,158,11,0.5)]',
    text: 'text-amber-300',
    border: 'border-amber-500/50',
  },
  emerald: {
    activeBg: 'bg-emerald-400',
    activeGlow: 'shadow-[0_0_8px_#10b981,0_0_14px_rgba(16,185,129,0.5)]',
    text: 'text-emerald-300',
    border: 'border-emerald-500/50',
  },
  violet: {
    activeBg: 'bg-violet-400',
    activeGlow: 'shadow-[0_0_8px_#8b5cf6,0_0_14px_rgba(139,92,246,0.5)]',
    text: 'text-violet-300',
    border: 'border-violet-500/50',
  },
};

export const HardwareSwitch: React.FC<HardwareSwitchProps> = ({
  label,
  checked,
  onChange,
  color = 'cyan',
  sublabel,
  disabled = false,
  variant = 'rocker',
}) => {
  const styling = LED_COLORS[color] || LED_COLORS.cyan;

  if (variant === 'toggle') {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-left cursor-pointer transition-all select-none ${
          checked
            ? `bg-[#0e1420] ${styling.border} text-white shadow-sm`
            : 'bg-[#090b10] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
        } ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
      >
        {/* Jewel LED indicator */}
        <div className="relative flex items-center justify-center">
          <div
            className={`w-2.5 h-2.5 rounded-full border border-zinc-700 transition-all ${
              checked
                ? `${styling.activeBg} ${styling.activeGlow} border-transparent`
                : 'bg-zinc-800'
            }`}
          />
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-mono font-bold tracking-wide">{label}</span>
          {sublabel && <span className="text-[9px] font-mono text-zinc-500">{sublabel}</span>}
        </div>
      </button>
    );
  }

  // Hardware Rocker Switch / Beveled console latch
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`group relative flex flex-col items-center p-2 rounded-md transition-all cursor-pointer select-none border ${
        checked
          ? 'bg-gradient-to-b from-[#161c28] to-[#0c1017] border-zinc-700/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.6)]'
          : 'bg-[#090b10] border-zinc-800/80 hover:border-zinc-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]'
      } ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
    >
      {/* Jewel LED Lamp atop rocker */}
      <div className="mb-1.5 flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full border border-zinc-900 transition-all ${
            checked
              ? `${styling.activeBg} ${styling.activeGlow}`
              : 'bg-zinc-800 shadow-inner'
          }`}
        />
        <span
          className={`text-[8px] font-mono font-extrabold uppercase ${
            checked ? styling.text : 'text-zinc-600'
          }`}
        >
          {checked ? 'ENGAGED' : 'BYPASS'}
        </span>
      </div>

      {/* Switch physical body */}
      <div
        className="w-10 h-5 rounded-xs p-0.5 flex items-center bg-[#07080c] border border-zinc-800 shadow-inner transition-colors"
      >
        <div
          className={`h-full w-4.5 rounded-xs transition-transform duration-150 ${
            checked
              ? 'translate-x-4 bg-gradient-to-r from-zinc-300 to-zinc-400 border border-zinc-200 shadow-sm'
              : 'translate-x-0 bg-gradient-to-r from-zinc-700 to-zinc-600 border border-zinc-600'
          }`}
        />
      </div>

      <span className="text-[10px] font-mono font-bold text-zinc-300 mt-1.5 tracking-wider uppercase text-center">
        {label}
      </span>
      {sublabel && (
        <span className="text-[8px] font-mono text-zinc-500 text-center truncate max-w-full">
          {sublabel}
        </span>
      )}
    </button>
  );
};
