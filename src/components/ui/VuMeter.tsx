import React, { useEffect, useState } from 'react';
import { bassDsp } from '../../engine/audioSynth';

export interface VuMeterProps {
  label?: string;
  size?: 'sm' | 'md';
}

const LED_STEPS = [
  { db: -48, color: 'emerald' },
  { db: -36, color: 'emerald' },
  { db: -24, color: 'emerald' },
  { db: -18, color: 'emerald' },
  { db: -12, color: 'emerald' },
  { db: -6, color: 'emerald' },
  { db: -3, color: 'amber' },
  { db: 0, color: 'amber' },
  { db: +3, color: 'red' }, // CLIP
];

export const VuMeter: React.FC<VuMeterProps> = ({ label = 'MASTER OUT', size = 'md' }) => {
  const [levelL, setLevelL] = useState<number>(0);
  const [levelR, setLevelR] = useState<number>(0);
  const [peakL, setPeakL] = useState<number>(0);
  const [peakR, setPeakR] = useState<number>(0);

  useEffect(() => {
    let animId: number;
    const buffer = new Uint8Array(256);

    const update = () => {
      bassDsp.getSpectrumData(buffer);

      // Compute RMS from low & mid bins
      let sum = 0;
      let maxVal = 0;
      for (let i = 0; i < 64; i++) {
        const v = buffer[i] || 0;
        sum += v * v;
        if (v > maxVal) maxVal = v;
      }
      const rms = Math.sqrt(sum / 64) / 255;
      const peak = maxVal / 255;

      // Small stereo differentiation
      const currentL = rms;
      const currentR = rms * 0.94;

      setLevelL((prev) => prev * 0.7 + currentL * 0.3);
      setLevelR((prev) => prev * 0.7 + currentR * 0.3);

      setPeakL((prev) => Math.max(currentL, prev * 0.95));
      setPeakR((prev) => Math.max(currentR, prev * 0.95));

      animId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animId);
  }, []);

  const getLedStyle = (stepIdx: number, val: number, isPeak: boolean, color: string) => {
    const threshold = stepIdx / (LED_STEPS.length - 1);
    const isActive = val >= threshold * 0.85;
    const isClip = stepIdx === LED_STEPS.length - 1 && val > 0.92;

    if (isClip) {
      return 'bg-rose-500 shadow-[0_0_6px_#f43f5e] opacity-100';
    }

    if (isActive) {
      if (color === 'emerald') {
        return 'bg-emerald-400 shadow-[0_0_4px_#34d399] opacity-100';
      }
      if (color === 'amber') {
        return 'bg-amber-400 shadow-[0_0_4px_#fbbf24] opacity-100';
      }
      return 'bg-rose-400 shadow-[0_0_4px_#fb7185] opacity-100';
    }

    return 'bg-zinc-800/80 opacity-30';
  };

  return (
    <div className="flex flex-col items-center bg-[#07090e] border border-zinc-800/90 rounded-md p-2 shadow-inner select-none">
      <div className="flex items-center justify-between w-full mb-1 px-0.5">
        <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[8px] font-mono text-zinc-500">RMS / PEAK</span>
      </div>

      <div className="flex items-center gap-1.5 bg-[#05060a] p-1.5 rounded border border-zinc-900">
        {/* dB Scale Labels */}
        <div className="flex flex-col justify-between h-20 text-[7px] font-mono text-zinc-600 text-right pr-0.5">
          <span>+3</span>
          <span>0</span>
          <span>-6</span>
          <span>-18</span>
          <span>-48</span>
        </div>

        {/* Left Channel Ladder */}
        <div className="flex flex-col-reverse justify-between h-20 w-2.5 bg-[#090b12] p-0.5 rounded-xs border border-zinc-900">
          {LED_STEPS.map((step, idx) => (
            <div
              key={idx}
              className={`h-1.5 w-full rounded-xs transition-opacity duration-75 ${getLedStyle(
                idx,
                levelL,
                peakL >= idx / (LED_STEPS.length - 1),
                step.color
              )}`}
            />
          ))}
        </div>

        {/* Right Channel Ladder */}
        <div className="flex flex-col-reverse justify-between h-20 w-2.5 bg-[#090b12] p-0.5 rounded-xs border border-zinc-900">
          {LED_STEPS.map((step, idx) => (
            <div
              key={idx}
              className={`h-1.5 w-full rounded-xs transition-opacity duration-75 ${getLedStyle(
                idx,
                levelR,
                peakR >= idx / (LED_STEPS.length - 1),
                step.color
              )}`}
            />
          ))}
        </div>

        <div className="flex flex-col justify-between h-20 text-[8px] font-mono text-zinc-500 pl-0.5">
          <span className="text-[7px] text-zinc-500">L</span>
          <span className="text-[7px] text-zinc-500">R</span>
        </div>
      </div>
    </div>
  );
};
