import React, { useRef, useEffect, useState } from 'react';
import { bassDsp } from '../engine/audioSynth';
import { SpeakerTarget } from '../types/music';
import { Activity, Radio, Eye, Layers } from 'lucide-react';

export interface OscilloscopeDisplayProps {
  fundamentalFreq: number;
  speakerTarget: SpeakerTarget;
  onSelectSpeakerTarget?: (target: SpeakerTarget) => void;
}

export const OscilloscopeDisplay: React.FC<OscilloscopeDisplayProps> = ({
  fundamentalFreq = 55.0,
  speakerTarget,
  onSelectSpeakerTarget,
}) => {
  const [displayMode, setDisplayMode] = useState<'SPECTRUM' | 'SCOPE' | 'DUAL'>('DUAL');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fftBuffer = new Uint8Array(1024);
    const scopeBuffer = new Float32Array(512);

    const minLog = Math.log10(20);
    const maxLog = Math.log10(4000);
    const getX = (hz: number, width: number) => {
      const val = (Math.log10(Math.max(20, hz)) - minLog) / (maxLog - minLog);
      return Math.min(width, Math.max(0, val * width));
    };

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark CRT glass background
      ctx.fillStyle = '#05070c';
      ctx.fillRect(0, 0, width, height);

      // CRT phosphor faint background glow
      const radialGlow = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        width * 0.6
      );
      radialGlow.addColorStop(0, 'rgba(6, 182, 212, 0.04)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Studio Graticule Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const stepY = height / 6;
      for (let y = stepY; y < height; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Frequency Bands
      const x80 = getX(80, width);
      const x180 = getX(180, width);
      const x350 = getX(350, width); // R&B vocal pocket lower
      const x600 = getX(600, width); // R&B vocal pocket upper

      // 1. SUB ZONE (20-80 Hz)
      ctx.fillStyle = 'rgba(6, 182, 212, 0.06)';
      ctx.fillRect(0, 0, x80, height);

      // 2. BODY ZONE (80-180 Hz)
      ctx.fillStyle = 'rgba(59, 130, 246, 0.06)';
      ctx.fillRect(x80, 0, x180 - x80, height);

      // 3. VOCAL POCKET NOTCH (300-600 Hz) - highlighted for R&B
      ctx.fillStyle = 'rgba(236, 72, 153, 0.05)';
      ctx.fillRect(x350, 0, x600 - x350, height);

      // Grid dividers & labels
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.beginPath();
      ctx.moveTo(x80, 0);
      ctx.lineTo(x80, height);
      ctx.stroke();
      ctx.fillText('SUB 80Hz', 8, 14);

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
      ctx.beginPath();
      ctx.moveTo(x180, 0);
      ctx.lineTo(x180, height);
      ctx.stroke();
      ctx.fillText('PUNCH 180Hz', x80 + 6, 14);

      ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)';
      ctx.beginPath();
      ctx.moveTo(x350, 0);
      ctx.lineTo(x350, height);
      ctx.stroke();
      ctx.fillText('VOCAL POCKET', x350 + 6, 14);

      ctx.fillText('UPPER HARMONICS', x600 + 10, 14);

      // Speaker Target Cutoff line
      let cutoffHz = 0;
      if (speakerTarget === 'PHONE') cutoffHz = 350;
      else if (speakerTarget === 'LAPTOP') cutoffHz = 200;
      else if (speakerTarget === 'SMALL SPEAKER') cutoffHz = 120;
      else if (speakerTarget === 'CAR') cutoffHz = 40;

      if (cutoffHz > 0) {
        const cutX = getX(cutoffHz, width);
        ctx.strokeStyle = '#f43f5e';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cutX, 0);
        ctx.lineTo(cutX, height);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#f43f5e';
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillText(`CUTOFF ${cutoffHz}Hz (Lost Below)`, Math.max(12, cutX - 90), height - 8);
      }

      // --- SPECTRUM RENDER ---
      if (displayMode === 'SPECTRUM' || displayMode === 'DUAL') {
        bassDsp.getSpectrumData(fftBuffer);

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#06b6d4'); // Sub cyan
        gradient.addColorStop(0.3, '#3b82f6'); // Body blue
        gradient.addColorStop(0.65, '#ec4899'); // Vocal pocket pink
        gradient.addColorStop(1, '#a855f7'); // Violet air

        ctx.beginPath();
        ctx.moveTo(0, height);

        const numPoints = 140;
        for (let p = 0; p < numPoints; p++) {
          const frac = p / (numPoints - 1);
          const hz = Math.pow(10, minLog + frac * (maxLog - minLog));
          const binIndex = Math.min(fftBuffer.length - 1, Math.floor((hz / 22050) * fftBuffer.length));
          const val = fftBuffer[binIndex] || 0;
          const normVal = val / 255;
          const y = height - normVal * (height * 0.85) - 2;
          const x = frac * width;

          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // Shaded area
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        const fillGrad = ctx.createLinearGradient(0, 0, 0, height);
        fillGrad.addColorStop(0, 'rgba(6, 182, 212, 0.22)');
        fillGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
        ctx.fillStyle = fillGrad;
        ctx.fill();

        // Harmonic markers
        const markers = [
          { label: 'F0', freq: fundamentalFreq, color: '#22d3ee' },
          { label: '2F (Warmth)', freq: fundamentalFreq * 2, color: '#38bdf8' },
          { label: '3F (Punch)', freq: fundamentalFreq * 3, color: '#818cf8' },
          { label: '4F', freq: fundamentalFreq * 4, color: '#f472b6' },
        ];

        for (const m of markers) {
          if (m.freq <= 4000) {
            const mx = getX(m.freq, width);
            ctx.strokeStyle = m.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(mx, height - 22);
            ctx.lineTo(mx, height - 6);
            ctx.stroke();

            ctx.fillStyle = m.color;
            ctx.font = '8px "JetBrains Mono", monospace';
            ctx.fillText(m.label, mx - 8, height - 26);
          }
        }
      }

      // --- OSCILLOSCOPE TIME DOMAIN RENDER ---
      if (displayMode === 'SCOPE' || displayMode === 'DUAL') {
        const centerY = displayMode === 'DUAL' ? height * 0.45 : height * 0.5;
        const scopeHeight = displayMode === 'DUAL' ? height * 0.35 : height * 0.7;

        // Fetch waveform time data or generate live synthesis preview based on fundamental
        ctx.strokeStyle = displayMode === 'DUAL' ? '#34d399' : '#22d3ee';
        ctx.lineWidth = displayMode === 'DUAL' ? 1.5 : 2;
        ctx.shadowColor = displayMode === 'DUAL' ? 'rgba(52, 211, 153, 0.5)' : 'rgba(34, 211, 238, 0.6)';
        ctx.shadowBlur = 4;

        ctx.beginPath();
        const time = performance.now() * 0.003;
        const cycles = 3;
        for (let x = 0; x < width; x += 2) {
          const t = (x / width) * cycles * Math.PI * 2 + time;
          // Sub fundamental + 2nd + 3rd harmonic waveform
          const w =
            Math.sin(t) * 0.65 +
            Math.sin(t * 2) * 0.25 +
            Math.sin(t * 3) * 0.15;
          const y = centerY - w * (scopeHeight * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      // Scanline effect overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      for (let sl = 0; sl < height; sl += 3) {
        ctx.fillRect(0, sl, width, 1);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [fundamentalFreq, speakerTarget, displayMode]);

  return (
    <div className="bg-gradient-to-b from-[#0c0e15] to-[#07090e] border border-zinc-800 rounded-lg p-3 shadow-2xl relative overflow-hidden select-none">
      {/* Top Display Bezel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4] animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-400">
            HIGH-RESOLUTION ANALYZER & OSCILLOSCOPE
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            20 Hz – 4 kHz · Real-Time Vector
          </span>
        </div>

        {/* Display Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#05070c] border border-zinc-800 p-0.5 rounded">
          <button
            onClick={() => setDisplayMode('DUAL')}
            className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer transition-colors ${
              displayMode === 'DUAL'
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/80 shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            DUAL
          </button>
          <button
            onClick={() => setDisplayMode('SPECTRUM')}
            className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer transition-colors ${
              displayMode === 'SPECTRUM'
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/80 shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            SPECTRUM
          </button>
          <button
            onClick={() => setDisplayMode('SCOPE')}
            className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer transition-colors ${
              displayMode === 'SCOPE'
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/80 shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            SCOPE
          </button>
        </div>
      </div>

      {/* Glass CRT Display Screen */}
      <div className="relative w-full h-44 rounded-md overflow-hidden border border-zinc-800/90 shadow-[inset_0_2px_10px_rgba(0,0,0,0.9)] bg-[#05070c]">
        <canvas ref={canvasRef} width={960} height={176} className="w-full h-full block" />

        {/* Corner glass glare highlights */}
        <div className="absolute top-0 right-0 w-32 h-16 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* Target Monitor Switcher Bar */}
      {onSelectSpeakerTarget && (
        <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>TRANSLATION MONITOR TARGET:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {(
              [
                { id: 'FULL RANGE', label: 'STUDIO 20Hz' },
                { id: 'HEADPHONES', label: 'CANS 30Hz' },
                { id: 'PHONE', label: 'SMARTPHONE 350Hz' },
                { id: 'LAPTOP', label: 'LAPTOP 200Hz' },
                { id: 'CAR', label: 'CAR CABIN' },
                { id: 'MONO CLUB', label: 'CLUB PA' },
              ] as const
            ).map((tgt) => (
              <button
                key={tgt.id}
                onClick={() => onSelectSpeakerTarget(tgt.id as SpeakerTarget)}
                className={`px-2 py-1 text-[9px] font-mono font-bold rounded cursor-pointer transition-all border ${
                  speakerTarget === tgt.id
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                    : 'bg-[#08090e] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {tgt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
