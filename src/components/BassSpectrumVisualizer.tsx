import React, { useRef, useEffect } from 'react';
import { bassDsp } from '../engine/audioSynth';
import { SpeakerTarget } from '../types/music';

interface BassSpectrumVisualizerProps {
  fundamentalFreq?: number;
  speakerTarget: SpeakerTarget;
}

export const BassSpectrumVisualizer: React.FC<BassSpectrumVisualizerProps> = ({
  fundamentalFreq = 55.0,
  speakerTarget,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const buffer = new Uint8Array(1024);

    const render = () => {
      bassDsp.getSpectrumData(buffer);
      const width = canvas.width;
      const height = canvas.height;

      // Dark background
      ctx.fillStyle = '#080a0f';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Frequency bands coloring (log-like mapping from 20Hz to 4000Hz)
      const minLog = Math.log10(20);
      const maxLog = Math.log10(4000);
      const getX = (hz: number) => {
        const val = (Math.log10(Math.max(20, hz)) - minLog) / (maxLog - minLog);
        return Math.min(width, Math.max(0, val * width));
      };

      // Band overlays
      const x80 = getX(80);
      const x180 = getX(180);
      const x600 = getX(600);

      // SUB: 20-80 Hz (Electric Cyan)
      ctx.fillStyle = 'rgba(6, 182, 212, 0.07)';
      ctx.fillRect(0, 0, x80, height);

      // BODY: 80-180 Hz (Electric Blue)
      ctx.fillStyle = 'rgba(37, 99, 235, 0.07)';
      ctx.fillRect(x80, 0, x180 - x80, height);

      // CHARACTER: 180-600 Hz (Violet)
      ctx.fillStyle = 'rgba(139, 92, 246, 0.06)';
      ctx.fillRect(x180, 0, x600 - x180, height);

      // Frequency labels & vertical dividers
      ctx.font = '9px monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.beginPath();
      ctx.moveTo(x80, 0);
      ctx.lineTo(x80, height);
      ctx.stroke();
      ctx.fillText('SUB 80Hz', 8, 14);

      ctx.strokeStyle = 'rgba(37, 99, 235, 0.2)';
      ctx.beginPath();
      ctx.moveTo(x180, 0);
      ctx.lineTo(x180, height);
      ctx.stroke();
      ctx.fillText('BODY 180Hz', x80 + 6, 14);

      ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
      ctx.beginPath();
      ctx.moveTo(x600, 0);
      ctx.lineTo(x600, height);
      ctx.stroke();
      ctx.fillText('CHARACTER 600Hz', x180 + 6, 14);
      ctx.fillText('HARMONICS 1k+', x600 + 6, 14);

      // Render Speaker Cutoff Line if active
      let cutoffHz = 0;
      if (speakerTarget === 'PHONE') cutoffHz = 350;
      else if (speakerTarget === 'LAPTOP') cutoffHz = 200;
      else if (speakerTarget === 'SMALL SPEAKER') cutoffHz = 120;

      if (cutoffHz > 0) {
        const cutX = getX(cutoffHz);
        ctx.strokeStyle = '#ef4444';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cutX, 0);
        ctx.lineTo(cutX, height);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#ef4444';
        ctx.fillText(`Target Cutoff: ${cutoffHz}Hz (Lost Below)`, Math.max(10, cutX - 90), height - 8);
      }

      // Draw FFT Spectrum curve
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#06b6d4'); // Sub cyan
      gradient.addColorStop(0.3, '#3b82f6'); // Body blue
      gradient.addColorStop(0.7, '#8b5cf6'); // Violet
      gradient.addColorStop(1, '#a855f7');

      ctx.beginPath();
      ctx.moveTo(0, height);

      const numPoints = 120;
      for (let p = 0; p < numPoints; p++) {
        const frac = p / (numPoints - 1);
        const hz = Math.pow(10, minLog + frac * (maxLog - minLog));
        const binIndex = Math.min(buffer.length - 1, Math.floor((hz / 22050) * buffer.length));
        const val = buffer[binIndex] || 0;
        const normVal = val / 255;
        const y = height - normVal * (height * 0.88) - 2;
        const x = frac * width;

        if (p === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Soft fill under curve
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      const fillGradient = ctx.createLinearGradient(0, 0, 0, height);
      fillGradient.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      fillGradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
      ctx.fillStyle = fillGradient;
      ctx.fill();

      // Draw Fundamental & Harmonic Markers
      const harmonics = [
        { label: 'F0', freq: fundamentalFreq, color: '#22d3ee' },
        { label: '2F', freq: fundamentalFreq * 2, color: '#38bdf8' },
        { label: '3F', freq: fundamentalFreq * 3, color: '#818cf8' },
        { label: '4F', freq: fundamentalFreq * 4, color: '#a78bfa' },
        { label: '5F', freq: fundamentalFreq * 5, color: '#c084fc' },
      ];

      for (const h of harmonics) {
        if (h.freq <= 4000) {
          const hX = getX(h.freq);
          ctx.strokeStyle = h.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(hX, height - 20);
          ctx.lineTo(hX, height - 4);
          ctx.stroke();

          ctx.fillStyle = h.color;
          ctx.font = '8px monospace';
          ctx.fillText(h.label, hX - 6, height - 24);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [fundamentalFreq, speakerTarget]);

  return (
    <div className="bg-[#090b10] border border-zinc-800/80 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400">
            SPECTRAL BASS ANALYZER
          </span>
          <span className="text-[10px] font-mono text-zinc-500">20 Hz – 4 kHz · Real-Time FFT</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-cyan-400 inline-block"></span>
            <span>SUB (20-80Hz)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-blue-500 inline-block"></span>
            <span>BODY (80-180Hz)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-violet-500 inline-block"></span>
            <span>CHARACTER (180-600Hz)</span>
          </div>
        </div>
      </div>

      <div className="relative w-full h-36 bg-[#07090e] rounded overflow-hidden border border-zinc-900">
        <canvas
          ref={canvasRef}
          width={800}
          height={144}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
