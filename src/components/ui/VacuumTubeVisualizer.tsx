import React from 'react';

export interface VacuumTubeVisualizerProps {
  drive: number; // 0 to 1
  type: string;
  active?: boolean;
}

export const VacuumTubeVisualizer: React.FC<VacuumTubeVisualizerProps> = ({
  drive,
  type,
  active = true,
}) => {
  const intensity = active ? 0.3 + drive * 0.7 : 0.1;
  const heatColor =
    type === 'Tube' || type === 'Soft Clip'
      ? `rgba(249, 115, 22, ${intensity})`
      : type === 'Tape'
      ? `rgba(234, 88, 12, ${intensity * 0.9})`
      : `rgba(217, 70, 239, ${intensity * 0.8})`;

  const glowShadow = active
    ? `0 0 ${12 + drive * 20}px ${heatColor}, inset 0 0 ${8 + drive * 12}px ${heatColor}`
    : 'none';

  return (
    <div className="flex flex-col items-center select-none">
      {/* Glass Tube Container */}
      <div
        className="relative w-14 h-24 rounded-t-xl rounded-b-md border border-zinc-700/80 bg-gradient-to-b from-zinc-900/60 via-zinc-950/80 to-black p-1 shadow-inner overflow-hidden transition-all duration-300"
        style={{
          boxShadow: `${glowShadow}, inset 0 1px 3px rgba(255,255,255,0.2)`,
        }}
      >
        {/* Glass reflection highlight */}
        <div className="absolute top-1 left-1.5 w-1.5 h-16 rounded-full bg-gradient-to-b from-white/30 via-white/10 to-transparent pointer-events-none" />

        {/* Top Getter Silvering */}
        <div className="absolute top-0 inset-x-2 h-3 bg-gradient-to-b from-zinc-400/40 to-transparent rounded-t-lg pointer-events-none" />

        {/* Anode / Plate Cylinders */}
        <div className="absolute inset-x-2.5 top-5 bottom-4 border border-zinc-700/60 rounded-xs bg-zinc-900/50 flex flex-col items-center justify-between p-1">
          {/* Grid wires */}
          <div className="w-full flex flex-col gap-1 opacity-40">
            <div className="h-px bg-zinc-500 w-full" />
            <div className="h-px bg-zinc-500 w-full" />
            <div className="h-px bg-zinc-500 w-full" />
            <div className="h-px bg-zinc-500 w-full" />
            <div className="h-px bg-zinc-500 w-full" />
          </div>

          {/* Central Glowing Cathode / Heater Filament */}
          <div
            className="w-1.5 h-12 rounded-full transition-all duration-200"
            style={{
              backgroundColor: active ? (drive > 0.6 ? '#fed7aa' : '#fb923c') : '#475569',
              boxShadow: active
                ? `0 0 10px #f97316, 0 0 20px #ea580c, 0 0 30px rgba(234, 88, 12, ${drive})`
                : 'none',
              filter: `brightness(${0.8 + drive * 0.8})`,
            }}
          />

          <div className="w-full flex flex-col gap-1 opacity-40">
            <div className="h-px bg-zinc-500 w-full" />
            <div className="h-px bg-zinc-500 w-full" />
          </div>
        </div>

        {/* Bottom Bakelite Base */}
        <div className="absolute bottom-0 inset-x-1 h-3 bg-[#181310] border-t border-amber-950/80 rounded-b-sm flex justify-center items-center gap-1">
          <div className="w-1 h-1.5 bg-amber-700/60 rounded-xs" />
          <div className="w-1 h-1.5 bg-amber-700/60 rounded-xs" />
          <div className="w-1 h-1.5 bg-amber-700/60 rounded-xs" />
        </div>
      </div>

      <span className="text-[9px] font-mono font-bold text-amber-400 mt-1 uppercase">
        12AX7 {type.toUpperCase()}
      </span>
      <span className="text-[8px] font-mono text-zinc-500">
        Bias: +{(drive * 12).toFixed(1)} dB
      </span>
    </div>
  );
};
