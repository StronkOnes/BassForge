import React, { useState } from 'react';
import { PitchClassName, ScaleTypeName } from '../types/music';
import { PITCH_CLASSES, SCALE_DEFINITIONS, midiToFrequency } from '../engine/musicTheory';
import { bassDsp } from '../engine/audioSynth';
import { Activity, Volume2 } from 'lucide-react';

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
  const [octaveOffset, setOctaveOffset] = useState<number>(0);
  const [pressedMidi, setPressedMidi] = useState<number | null>(null);

  // 2 Octaves: base C1 (24) + octaveOffset * 12
  const startMidi = 24 + octaveOffset * 12;
  const totalNotes = 25; // 2 octaves + 1 note

  const IS_BLACK = [false, true, false, true, false, false, true, false, true, false, true, false];
  const rootIndex = PITCH_CLASSES.indexOf(selectedKey);
  const scaleIntervals = SCALE_DEFINITIONS[selectedScale] || SCALE_DEFINITIONS['Natural Minor'];
  const scalePcs = new Set(scaleIntervals.map((i) => (rootIndex + i) % 12));

  const whiteKeys: { midi: number; name: string; pc: number; freq: number; isRoot: boolean; inScale: boolean; whiteIndex: number }[] = [];
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
      whiteKeys.push({ midi: m, name, pc, freq, isRoot, inScale, whiteIndex: whiteCount });
      whiteCount++;
    } else {
      blackKeys.push({ midi: m, name, pc, freq, whiteIndex: whiteCount, isRoot, inScale });
    }
  }

  const handleTrigger = (m: number, f: number) => {
    setPressedMidi(m);
    bassDsp.triggerNote(f, 105, 0.8);
    if (onNoteTriggered) onNoteTriggered(m, f);
    setTimeout(() => {
      setPressedMidi(null);
    }, 280);
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
    <div className="bg-gradient-to-b from-[#0c0e15] to-[#07090e] border border-zinc-800 rounded-lg p-3 space-y-3 shadow-xl select-none">
      {/* Top Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-white">
              STUDIO LOW-END KEYBED & AUDITION ROLL
            </span>
            <div className="text-[10px] font-mono text-zinc-400">
              Fundamental F₀ Pitch Trigger · Octave {octaveOffset + 1} ({midiToFrequency(startMidi).toFixed(1)} Hz - {midiToFrequency(startMidi + totalNotes - 1).toFixed(1)} Hz)
            </div>
          </div>
        </div>

        {/* Octave Shift & Test Signals */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Octave Shifter */}
          <div className="flex items-center gap-1 bg-[#06080d] border border-zinc-800 px-2 py-1 rounded">
            <span className="text-[10px] font-mono text-zinc-500">OCT:</span>
            <button
              onClick={() => setOctaveOffset((prev) => Math.max(-1, prev - 1))}
              className="w-5 h-5 rounded-xs bg-zinc-800 text-white font-mono font-bold text-xs flex items-center justify-center hover:bg-zinc-700 cursor-pointer"
            >
              -
            </button>
            <span className="text-xs font-mono font-bold text-cyan-400 w-4 text-center">
              {octaveOffset >= 0 ? `+${octaveOffset}` : octaveOffset}
            </span>
            <button
              onClick={() => setOctaveOffset((prev) => Math.min(2, prev + 1))}
              className="w-5 h-5 rounded-xs bg-zinc-800 text-white font-mono font-bold text-xs flex items-center justify-center hover:bg-zinc-700 cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Test Signal Triggers */}
          <button
            onClick={() => handleTestSignal('55hz')}
            className="px-2.5 py-1 rounded text-[10px] font-mono bg-[#080b12] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            55Hz Sub Tone
          </button>
          <button
            onClick={() => handleTestSignal('drop')}
            className="px-2.5 py-1 rounded text-[10px] font-mono bg-[#080b12] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            808 Pitch Drop
          </button>
          <button
            onClick={() => handleTestSignal('sweep')}
            className="px-2.5 py-1 rounded text-[10px] font-mono bg-[#080b12] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            Octave Sweep
          </button>
        </div>
      </div>

      {/* Realistic Weighted Keyboard Bed */}
      <div className="relative w-full h-36 bg-[#040508] p-1.5 rounded-md border border-zinc-800 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Felt Red Rail behind keys */}
        <div className="absolute top-1.5 inset-x-1.5 h-1.5 bg-rose-950 border-b border-rose-900/60 pointer-events-none" />

        {/* White Keys Row */}
        <div className="relative w-full h-full flex pt-1.5">
          {whiteKeys.map((k) => {
            const isPressed = pressedMidi === k.midi || activeMidi === k.midi;
            return (
              <button
                key={k.midi}
                type="button"
                onMouseDown={() => handleTrigger(k.midi, k.freq)}
                className={`relative flex-1 h-full rounded-b-sm border-r border-zinc-400/40 last:border-r-0 transition-all cursor-pointer flex flex-col justify-end pb-1.5 items-center select-none ${
                  isPressed
                    ? 'bg-gradient-to-b from-cyan-200 via-cyan-100 to-cyan-300 translate-y-0.5 shadow-none ring-1 ring-cyan-500'
                    : k.isRoot
                    ? 'bg-gradient-to-b from-cyan-50 via-slate-100 to-cyan-100 hover:brightness-105 shadow-[0_3px_5px_rgba(0,0,0,0.5),inset_0_-2px_2px_rgba(0,0,0,0.2)]'
                    : k.inScale
                    ? 'bg-gradient-to-b from-slate-100 via-zinc-100 to-slate-200 hover:brightness-105 shadow-[0_3px_5px_rgba(0,0,0,0.5),inset_0_-2px_2px_rgba(0,0,0,0.2)]'
                    : 'bg-gradient-to-b from-zinc-200 via-zinc-300 to-zinc-400 opacity-60 shadow-[0_3px_5px_rgba(0,0,0,0.5)]'
                }`}
              >
                {/* Scale & Root Highlight dot */}
                {k.isRoot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mb-1 shadow-[0_0_4px_#06b6d4]" />
                )}
                <span
                  className={`text-[9px] font-mono font-bold leading-tight ${
                    isPressed
                      ? 'text-cyan-900 font-extrabold'
                      : k.isRoot
                      ? 'text-cyan-700'
                      : 'text-zinc-800'
                  }`}
                >
                  {k.name}
                </span>
                <span className="text-[7px] font-mono text-zinc-500 leading-none">
                  {k.freq.toFixed(0)}Hz
                </span>
              </button>
            );
          })}
        </div>

        {/* Black Keys Row (Floating Over White Keys) */}
        {blackKeys.map((k) => {
          const isPressed = pressedMidi === k.midi || activeMidi === k.midi;
          // Position black key right between white keys
          const leftPercent = ((k.whiteIndex - 0.36) / whiteCount) * 100;
          const widthPercent = (0.72 / whiteCount) * 100;

          return (
            <button
              key={k.midi}
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleTrigger(k.midi, k.freq);
              }}
              className={`absolute top-3 h-22 rounded-b-sm border border-black/80 transition-all cursor-pointer flex flex-col justify-end pb-1 items-center z-10 select-none ${
                isPressed
                  ? 'bg-gradient-to-b from-cyan-600 via-cyan-500 to-cyan-700 translate-y-0.5 shadow-none'
                  : k.isRoot
                  ? 'bg-gradient-to-b from-zinc-800 via-cyan-950 to-black hover:brightness-125 shadow-[0_4px_8px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.2)]'
                  : 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-black hover:brightness-125 shadow-[0_4px_8px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.2)]'
              }`}
              style={{
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
              }}
            >
              {k.isRoot && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mb-0.5 shadow-[0_0_4px_#06b6d4]" />
              )}
              <span
                className={`text-[8px] font-mono font-bold leading-tight ${
                  isPressed ? 'text-white' : k.isRoot ? 'text-cyan-300' : 'text-zinc-300'
                }`}
              >
                {k.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
