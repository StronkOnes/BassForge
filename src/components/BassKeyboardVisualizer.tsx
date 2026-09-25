import React from 'react';
import { PitchClassName, ScaleTypeName } from '../types/music';
import { PITCH_CLASSES, SCALE_DEFINITIONS, midiToFrequency } from '../engine/musicTheory';
import { bassDsp } from '../engine/audioSynth';
import { Activity } from 'lucide-react';

interface BassKeyboardVisualizerProps {
  selectedKey: PitchClassName;
  selectedScale: ScaleTypeName;
  activeMidi?: number;
  onNoteTriggered?: (midi: number, freq: number) => void;
}

export const BassKeyboardVisualizer: React.FC<BassKeyboardVisualizerProps> = ({
  selectedKey,
  selectedScale,
  activeMidi,
  onNoteTriggered,
}) => {
  // 2 Octaves: C1 (24) to C3 (48)
  const startMidi = 24;
  const totalNotes = 25; // C1 through C3 inclusive

  const IS_BLACK = [false, true, false, true, false, false, true, false, true, false, true, false];
  const rootIndex = PITCH_CLASSES.indexOf(selectedKey);
  const scaleIntervals = SCALE_DEFINITIONS[selectedScale] || SCALE_DEFINITIONS['Natural Minor'];
  const scalePcs = new Set(scaleIntervals.map((i) => (rootIndex + i) % 12));

  const whiteKeys: { midi: number; name: string; pc: number; freq: number; isRoot: boolean; inScale: boolean }[] = [];
  const blackKeys: { midi: number; name: string; pc: number; freq: number; whiteIndex: number; isRoot: boolean; inScale: boolean }[] = [];

  let whiteCount = 0;
  for (let m = startMidi; m < startMidi + totalNotes; m++) {
    const pc = m % 12;
    const oct = Math.floor(m / 12) - 1;
    const name = `${PITCH_CLASSES[pc]}${oct}`;
    const freq = midiToFrequency(m);
    const isRoot = pc === rootIndex;
    const inScale = scalePcs.has(pc);

    if (!IS_BLACK[pc]) {
      whiteKeys.push({ midi: m, name, pc, freq, isRoot, inScale });
      whiteCount++;
    } else {
      blackKeys.push({ midi: m, name, pc, freq, whiteIndex: whiteCount, isRoot, inScale });
    }
  }

  const handleTrigger = (m: number, f: number) => {
    bassDsp.triggerNote(f, 105, 0.8);
    if (onNoteTriggered) onNoteTriggered(m, f);
  };

  const handleTestSignal = (type: '55hz' | 'drop' | 'sweep') => {
    if (type === '55hz') {
      handleTrigger(33, 55.0); // A1 55Hz
    } else if (type === 'drop') {
      bassDsp.triggerNote(65.4, 120, 1.4);
      setTimeout(() => {
        bassDsp.triggerNote(32.7, 110, 1.6, true);
      }, 100);
    } else if (type === 'sweep') {
      const sweepNotes = [24, 26, 28, 29, 31, 33, 35, 36];
      sweepNotes.forEach((n, idx) => {
        setTimeout(() => {
          handleTrigger(n, midiToFrequency(n));
        }, idx * 120);
      });
    }
  };

  return (
    <div className="bg-[#090b10] border border-zinc-800 rounded-lg p-3 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400">
            LOW-FREQUENCY BASS ROLL
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            C1 (32.7 Hz) — C3 (130.8 Hz) · Zero-Latency Audition
          </span>
        </div>

        {/* Quick Test Tone Buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-zinc-500">Test Signals:</span>
          <button
            onClick={() => handleTestSignal('55hz')}
            className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            55 Hz Tone
          </button>
          <button
            onClick={() => handleTestSignal('drop')}
            className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            808 Pitch Drop
          </button>
          <button
            onClick={() => handleTestSignal('sweep')}
            className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 hover:bg-zinc-800 text-cyan-400 hover:text-cyan-300 border border-zinc-800 transition-colors cursor-pointer"
          >
            Bass Sweep
          </button>
        </div>
      </div>

      {/* Keyboard Canvas */}
      <div className="relative h-28 bg-zinc-950 rounded overflow-hidden select-none border border-zinc-900 flex">
        {/* White Keys */}
        {whiteKeys.map((k) => {
          const isActive = activeMidi === k.midi;
          return (
            <button
              key={k.midi}
              onClick={() => handleTrigger(k.midi, k.freq)}
              className={`flex-1 h-full flex flex-col justify-end pb-2 items-center border-r border-zinc-800 text-center transition-colors cursor-pointer ${
                isActive
                  ? 'bg-cyan-500 text-black font-bold'
                  : k.isRoot
                  ? 'bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60'
                  : k.inScale
                  ? 'bg-zinc-900/90 text-zinc-200 hover:bg-zinc-800'
                  : 'bg-zinc-950 text-zinc-600 hover:bg-zinc-900'
              }`}
            >
              <span className="text-[10px] font-mono font-bold">{k.name}</span>
              <span className="text-[8px] font-mono text-zinc-500">{k.freq.toFixed(0)}Hz</span>
            </button>
          );
        })}

        {/* Black Keys */}
        {blackKeys.map((k) => {
          const isActive = activeMidi === k.midi;
          const leftPercent = ((k.whiteIndex - 0.35) / whiteKeys.length) * 100;
          const widthPercent = (0.7 / whiteKeys.length) * 100;

          return (
            <button
              key={k.midi}
              onClick={() => handleTrigger(k.midi, k.freq)}
              style={{
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
              }}
              className={`absolute top-0 h-16 z-10 rounded-b flex flex-col justify-end pb-1 items-center border border-zinc-900 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-cyan-400 text-black font-bold'
                  : k.isRoot
                  ? 'bg-cyan-900 text-cyan-200 hover:bg-cyan-800'
                  : k.inScale
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-zinc-950 text-zinc-600 hover:bg-zinc-900'
              }`}
            >
              <span className="text-[8px] font-mono font-bold leading-none">{k.name}</span>
              <span className="text-[7px] font-mono text-zinc-500 leading-none">{k.freq.toFixed(0)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
