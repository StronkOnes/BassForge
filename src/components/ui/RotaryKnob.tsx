import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface RotaryKnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  unit?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'cyan' | 'blue' | 'amber' | 'violet' | 'emerald' | 'pink' | 'rose';
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
  sublabel?: string;
  disabled?: boolean;
}

const COLOR_MAP = {
  cyan: {
    arc: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.4)',
    text: 'text-cyan-400',
    indicator: '#22d3ee',
  },
  blue: {
    arc: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
    text: 'text-blue-400',
    indicator: '#60a5fa',
  },
  amber: {
    arc: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    text: 'text-amber-400',
    indicator: '#fbbf24',
  },
  violet: {
    arc: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.4)',
    text: 'text-violet-400',
    indicator: '#a78bfa',
  },
  emerald: {
    arc: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    text: 'text-emerald-400',
    indicator: '#34d399',
  },
  pink: {
    arc: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.4)',
    text: 'text-pink-400',
    indicator: '#f472b6',
  },
  rose: {
    arc: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.4)',
    text: 'text-rose-400',
    indicator: '#fb7185',
  },
};

const SIZE_CONFIG = {
  sm: { diameter: 40, strokeWidth: 3, radius: 16, fontSize: 'text-[9px]', valSize: 'text-[10px]' },
  md: { diameter: 52, strokeWidth: 3.5, radius: 21, fontSize: 'text-[10px]', valSize: 'text-[11px]' },
  lg: { diameter: 64, strokeWidth: 4, radius: 26, fontSize: 'text-[11px]', valSize: 'text-xs' },
  xl: { diameter: 78, strokeWidth: 4.5, radius: 32, fontSize: 'text-xs', valSize: 'text-sm' },
};

export const RotaryKnob: React.FC<RotaryKnobProps> = ({
  label,
  value,
  min,
  max,
  step = 0.01,
  defaultValue,
  unit = '',
  size = 'md',
  color = 'cyan',
  onChange,
  formatValue,
  sublabel,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartValue = useRef(0);
  const knobRef = useRef<HTMLDivElement>(null);

  const colors = COLOR_MAP[color] || COLOR_MAP.cyan;
  const cfg = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  // 270 degree sweep: from -135 to +135 deg
  const clampedValue = Math.min(max, Math.max(min, value));
  const norm = max === min ? 0 : (clampedValue - min) / (max - min);
  const angle = -135 + norm * 270;

  // Arc calculation for SVG
  const startAngle = (-135 * Math.PI) / 180;
  const currentAngle = (angle * Math.PI) / 180;
  const endAngle = (135 * Math.PI) / 180;

  const polarToCartesian = (cx: number, cy: number, r: number, angleInRad: number) => ({
    x: cx + r * Math.sin(angleInRad),
    y: cy - r * Math.cos(angleInRad),
  });

  const center = cfg.diameter / 2;
  const arcRadius = cfg.radius;

  // Background track arc (-135 to +135 deg)
  const bgStart = polarToCartesian(center, center, arcRadius, startAngle);
  const bgEnd = polarToCartesian(center, center, arcRadius, endAngle);
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${arcRadius} ${arcRadius} 0 1 1 ${bgEnd.x} ${bgEnd.y}`;

  // Active value arc (-135 to currentAngle)
  const valStart = polarToCartesian(center, center, arcRadius, startAngle);
  const valEnd = polarToCartesian(center, center, arcRadius, currentAngle);
  const largeArcFlag = norm > 0.5 ? 1 : 0;
  const valPath =
    norm <= 0.005
      ? ''
      : `M ${valStart.x} ${valStart.y} A ${arcRadius} ${arcRadius} 0 ${largeArcFlag} 1 ${valEnd.x} ${valEnd.y}`;

  const updateValueFromDelta = useCallback(
    (deltaY: number, isFine: boolean) => {
      const range = max - min;
      const sensitivity = isFine ? 400 : 150; // pixels for full range
      const stepVal = step || (range > 10 ? 1 : 0.01);
      const deltaVal = (-deltaY / sensitivity) * range;
      let nextVal = dragStartValue.current + deltaVal;

      // Quantize to step
      nextVal = Math.round(nextVal / stepVal) * stepVal;
      nextVal = Math.min(max, Math.max(min, nextVal));
      onChange(Number(nextVal.toFixed(4)));
    },
    [max, min, onChange, step]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartValue.current = clampedValue;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - dragStartY.current;
      updateValueFromDelta(deltaY, moveEvent.shiftKey);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleDoubleClick = () => {
    if (disabled) return;
    if (defaultValue !== undefined) {
      onChange(defaultValue);
    } else {
      onChange(min + (max - min) * 0.5);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (disabled) return;
    e.preventDefault();
    const range = max - min;
    const stepVal = step || (range > 10 ? 1 : 0.01);
    const direction = e.deltaY < 0 ? 1 : -1;
    const fineFactor = e.shiftKey ? 0.2 : 1;
    let nextVal = clampedValue + direction * stepVal * fineFactor;
    nextVal = Math.round(nextVal / stepVal) * stepVal;
    nextVal = Math.min(max, Math.max(min, nextVal));
    onChange(Number(nextVal.toFixed(4)));
  };

  const displayString = formatValue
    ? formatValue(clampedValue)
    : unit === '%'
    ? `${Math.round(clampedValue * 100)}%`
    : unit === 'Hz'
    ? clampedValue >= 1000
      ? `${(clampedValue / 1000).toFixed(1)}k`
      : `${Math.round(clampedValue)}Hz`
    : unit === 'ms'
    ? `${Math.round(clampedValue)}ms`
    : unit === 'dB'
    ? `${clampedValue > 0 ? '+' : ''}${clampedValue.toFixed(1)}dB`
    : unit === 's'
    ? `${clampedValue.toFixed(2)}s`
    : `${clampedValue.toFixed(2)}${unit}`;

  return (
    <div
      className={`flex flex-col items-center select-none ${
        disabled ? 'opacity-40 pointer-events-none' : ''
      }`}
    >
      {/* Label */}
      <span
        className={`${cfg.fontSize} font-mono font-bold tracking-wider text-zinc-400 uppercase text-center truncate max-w-full mb-1`}
        title={label}
      >
        {label}
      </span>

      {/* Interactive Dial */}
      <div
        ref={knobRef}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        className="relative cursor-ns-resize touch-none group"
        style={{ width: cfg.diameter, height: cfg.diameter }}
        title={`${label}: ${displayString} (Click & drag vertically, Shift for fine-tuning, Double-click to reset)`}
      >
        {/* Outer Bezel SVG Ring */}
        <svg
          width={cfg.diameter}
          height={cfg.diameter}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Background Track */}
          <path
            d={bgPath}
            fill="none"
            stroke="#1c202a"
            strokeWidth={cfg.strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Colored Arc */}
          {valPath && (
            <path
              d={valPath}
              fill="none"
              stroke={colors.arc}
              strokeWidth={cfg.strokeWidth}
              strokeLinecap="round"
              style={{
                filter: isDragging ? `drop-shadow(0 0 4px ${colors.glow})` : undefined,
              }}
            />
          )}
        </svg>

        {/* Center Milled Metal Cap */}
        <div
          className={`absolute rounded-full transition-transform ${
            isDragging ? 'scale-[1.02]' : 'group-hover:scale-[1.01]'
          }`}
          style={{
            top: cfg.strokeWidth + 3,
            left: cfg.strokeWidth + 3,
            right: cfg.strokeWidth + 3,
            bottom: cfg.strokeWidth + 3,
            background:
              'radial-gradient(circle at 35% 30%, #323846 0%, #1a1e27 60%, #0d1017 100%)',
            boxShadow:
              'inset 0 1px 1px rgba(255,255,255,0.18), inset 0 -2px 3px rgba(0,0,0,0.8), 0 3px 6px rgba(0,0,0,0.6)',
            border: '1px solid #2a3040',
          }}
        >
          {/* Subtle knurling ring */}
          <div
            className="absolute inset-0.5 rounded-full border border-dashed border-zinc-700/40 pointer-events-none"
            style={{ borderRadius: '50%' }}
          />

          {/* Indicator Notch */}
          <div
            className="absolute top-1/2 left-1/2 w-0.5 origin-bottom pointer-events-none"
            style={{
              height: '42%',
              transform: `translate(-50%, -100%) rotate(${angle}deg)`,
              backgroundColor: colors.indicator,
              boxShadow: `0 0 4px ${colors.glow}`,
              borderRadius: '1px',
            }}
          />

          {/* Center axis cap */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #475569 0%, #0f172a 100%)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)',
            }}
          />
        </div>
      </div>

      {/* Value Readout Display */}
      <div className="mt-1.5 px-1.5 py-0.5 bg-[#080a0f] border border-zinc-800 rounded text-center min-w-[38px] shadow-inner">
        <span className={`${cfg.valSize} font-mono font-bold ${colors.text} tabular-nums`}>
          {displayString}
        </span>
      </div>

      {sublabel && (
        <span className="text-[8px] font-mono text-zinc-500 mt-0.5 truncate max-w-full">
          {sublabel}
        </span>
      )}
    </div>
  );
};
