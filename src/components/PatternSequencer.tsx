import React, { useState, useEffect } from 'react';
import {
  PitchClassName,
  ScaleTypeName,
  InterpretationMode,
  SafetyLevel,
  MusicalIntent,
  PatternStep,
} from '../types/music';
import {
  PITCH_CLASSES,
  SCALE_DEFINITIONS,
  generateBassPattern,
  getScaleNotes,
  midiToNoteName,
  RNB_PROGRESSION_TEMPLATES,
} from '../engine/musicTheory';
import { bassDsp } from '../engine/audioSynth';
import { downloadBassMidiFile } from '../engine/midiFileWriter';
import {
  Play,
  Square,
  Download,
  Shuffle,
  Music,
  ArrowRight,
  Sparkles,
  Sliders,
  MoveRight,
  HeartHandshake,
} from 'lucide-react';

interface PatternSequencerProps {
  selectedKey: PitchClassName;
  selectedScale: ScaleTypeName;
  onKeyChange: (key: PitchClassName) => void;
  onScaleChange: (scale: ScaleTypeName) => void;
  onPatternChange: (pattern: PatternStep[]) => void;
}

const COMMON_PROGRESSIONS = [
  { name: 'R&B Neo-Soul ii-V-I-vi (Dm7-G7-Cmaj7-Am7)', chords: ['Dm7', 'G7', 'Cmaj7', 'Am7'], key: 'C' as PitchClassName, scale: 'Major' as ScaleTypeName, intent: 'R&B / Soul' as MusicalIntent, bpm: 82 },
  { name: 'R&B Trapsoul i-VI-III-VII (Fm-Db-Ab-Eb)', chords: ['Fm', 'Db', 'Ab', 'Eb'], key: 'F' as PitchClassName, scale: 'Natural Minor' as ScaleTypeName, intent: 'R&B / Soul' as MusicalIntent, bpm: 128 },
  { name: 'R&B 90s Slow Jam iv-v-i (Cm-Fm-Bb-Gm)', chords: ['Cm', 'Fm', 'Bb', 'Gm'], key: 'C' as PitchClassName, scale: 'Natural Minor' as ScaleTypeName, intent: 'R&B / Soul' as MusicalIntent, bpm: 92 },
  { name: 'R&B Velvet Bedroom 2-5-1 (Ebm9-Ab7-Dbmaj7-Bbm7)', chords: ['Ebm9', 'Ab7', 'Dbmaj7', 'Bbm7'], key: 'Db' as PitchClassName, scale: 'Major' as ScaleTypeName, intent: 'R&B / Soul' as MusicalIntent, bpm: 78 },
  { name: 'i - VI - III - VII (Trap / Melodic)', chords: ['Cm', 'Ab', 'Eb', 'Bb'], key: 'C' as PitchClassName, scale: 'Natural Minor' as ScaleTypeName, intent: 'Driving' as MusicalIntent, bpm: 124 },
  { name: 'i - VI - iv - v (Dark Techno)', chords: ['Am', 'F', 'Dm', 'Em'], key: 'A' as PitchClassName, scale: 'Natural Minor' as ScaleTypeName, intent: 'Dark' as MusicalIntent, bpm: 130 },
  { name: 'i - iv - v (Blues / Rock)', chords: ['Em', 'Am', 'Bm'], key: 'E' as PitchClassName, scale: 'Natural Minor' as ScaleTypeName, intent: 'Funky' as MusicalIntent, bpm: 110 },
  { name: 'I - V - vi - IV (Pop Classic)', chords: ['C', 'G', 'Am', 'F'], key: 'C' as PitchClassName, scale: 'Major' as ScaleTypeName, intent: 'Driving' as MusicalIntent, bpm: 120 },
];

export const PatternSequencer: React.FC<PatternSequencerProps> = ({
  selectedKey,
  selectedScale,
  onKeyChange,
  onScaleChange,
  onPatternChange,
}) => {
  const [bpm, setBpm] = useState<number>(124);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [mode, setMode] = useState<InterpretationMode>('MOVEMENT');
  const [safety, setSafety] = useState<SafetyLevel>('BALANCED');
  const [intent, setIntent] = useState<MusicalIntent>('Driving');
  const [progression, setProgression] = useState<string[]>(['Cm', 'Ab', 'Eb', 'Bb']);
  const [steps, setSteps] = useState<PatternStep[]>([]);
  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(0);

  // Generate initial pattern
  useEffect(() => {
    const newPattern = generateBassPattern({
      key: selectedKey,
      scale: selectedScale,
      progression,
      mode,
      safety,
      intent,
      baseOctave: 1,
    });
    setSteps(newPattern);
    onPatternChange(newPattern);
  }, [selectedKey, selectedScale, progression, mode, safety, intent]);

  // Handle Playback Loop
  const togglePlay = () => {
    if (isPlaying) {
      bassDsp.stopSequencer();
      setIsPlaying(false);
      setActiveStep(0);
    } else {
      setIsPlaying(true);
      bassDsp.startSequencer(steps, bpm, (step) => {
        setActiveStep(step);
      });
    }
  };

  useEffect(() => {
    return () => {
      bassDsp.stopSequencer();
    };
  }, []);

  const handleStepToggle = (index: number) => {
    const updated = [...steps];
    updated[index].active = !updated[index].active;
    setSteps(updated);
    onPatternChange(updated);
    setSelectedStepIdx(index);
    if (!isPlaying && updated[index].active) {
      const freq = 440 * Math.pow(2, (updated[index].midiNote - 69) / 12);
      bassDsp.triggerNote(freq, updated[index].velocity, 0.4, updated[index].slide);
    }
  };

  const handlePitchChange = (index: number, newMidi: number) => {
    const updated = [...steps];
    updated[index].midiNote = newMidi;
    updated[index].noteName = midiToNoteName(newMidi);
    setSteps(updated);
    onPatternChange(updated);
    const freq = 440 * Math.pow(2, (newMidi - 69) / 12);
    bassDsp.triggerNote(freq, updated[index].velocity, 0.4, updated[index].slide);
  };

  const handleSlideToggle = (index: number) => {
    const updated = [...steps];
    updated[index].slide = !updated[index].slide;
    setSteps(updated);
    onPatternChange(updated);
  };

  const handleRegenerate = () => {
    const newPattern = generateBassPattern({
      key: selectedKey,
      scale: selectedScale,
      progression,
      mode,
      safety,
      intent,
      baseOctave: 1,
    });
    setSteps(newPattern);
    onPatternChange(newPattern);
    if (isPlaying) {
      bassDsp.startSequencer(newPattern, bpm, (step) => setActiveStep(step));
    }
  };

  const handleDownloadMidi = () => {
    downloadBassMidiFile(steps, bpm, `BassForge_${selectedKey}_${intent.replace(/\s+/g, '_')}.mid`);
  };

  const currentStep = steps[selectedStepIdx] || steps[0];

  return (
    <div className="bg-[#0b0d13] border border-zinc-800 rounded-lg p-4 space-y-4">
      {/* Top Header & Transport */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-2 px-4 py-2 rounded font-mono font-bold text-xs transition-colors cursor-pointer shadow-sm ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-cyan-500 hover:bg-cyan-400 text-black'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" /> STOP
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> PLAY LOOP
              </>
            )}
          </button>

          {/* BPM Control */}
          <div className="flex items-center gap-2 bg-[#08090e] border border-zinc-800 px-3 py-1.5 rounded">
            <span className="text-[11px] font-mono text-zinc-400">TEMPO:</span>
            <input
              type="number"
              min="60"
              max="200"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
              className="w-14 bg-zinc-900 text-white text-xs font-mono font-bold px-1.5 py-0.5 rounded border border-zinc-700 text-center"
            />
            <span className="text-[10px] font-mono text-zinc-500">BPM</span>
          </div>

          {/* MIDI Export */}
          <button
            onClick={handleDownloadMidi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800 text-xs font-mono transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export .MID
          </button>
        </div>

        {/* Musical Context Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Key */}
          <div className="flex items-center gap-1.5 bg-[#08090e] border border-zinc-800 px-2 py-1 rounded">
            <span className="text-[10px] font-mono text-zinc-500">KEY:</span>
            <select
              value={selectedKey}
              onChange={(e) => onKeyChange(e.target.value as PitchClassName)}
              className="bg-transparent text-xs font-mono font-bold text-cyan-400 cursor-pointer outline-none"
            >
              {PITCH_CLASSES.map((k) => (
                <option key={k} value={k} className="bg-zinc-900 text-white">
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Scale */}
          <div className="flex items-center gap-1.5 bg-[#08090e] border border-zinc-800 px-2 py-1 rounded">
            <span className="text-[10px] font-mono text-zinc-500">SCALE:</span>
            <select
              value={selectedScale}
              onChange={(e) => onScaleChange(e.target.value as ScaleTypeName)}
              className="bg-transparent text-xs font-mono font-bold text-white cursor-pointer outline-none"
            >
              {Object.keys(SCALE_DEFINITIONS).map((s) => (
                <option key={s} value={s} className="bg-zinc-900 text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Progression Preset */}
          <div className="flex items-center gap-1.5 bg-[#08090e] border border-zinc-800 px-2 py-1 rounded">
            <span className="text-[10px] font-mono text-zinc-500">PROGRESSION:</span>
            <select
              onChange={(e) => {
                const found = COMMON_PROGRESSIONS.find((p) => p.name === e.target.value);
                if (found) {
                  setProgression(found.chords);
                  if (found.key) onKeyChange(found.key);
                  if (found.scale) onScaleChange(found.scale);
                  if (found.intent) setIntent(found.intent);
                  if (found.bpm) setBpm(found.bpm);
                }
              }}
              className="bg-transparent text-xs font-mono text-zinc-300 cursor-pointer outline-none max-w-[140px] truncate"
            >
              {COMMON_PROGRESSIONS.map((p) => (
                <option key={p.name} value={p.name} className="bg-zinc-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* R&B Quick Soul Triggers Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#080c16] border border-cyan-900/40 rounded">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-1 shrink-0 uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5 text-pink-400" /> R&B Soul Forge:
          </span>
          {RNB_PROGRESSION_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              onClick={() => {
                setProgression(tmpl.chords);
                onKeyChange(tmpl.key);
                onScaleChange(tmpl.scale);
                setIntent('R&B / Soul');
                setBpm(tmpl.suggestedBpm);
              }}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 hover:bg-cyan-950/90 text-zinc-300 hover:text-cyan-300 border border-zinc-800 hover:border-cyan-700 transition-colors cursor-pointer"
              title={`${tmpl.name} · Chords: ${tmpl.chords.join(' → ')} (${tmpl.suggestedBpm} BPM)\n${tmpl.description}`}
            >
              {tmpl.subgenre}
            </button>
          ))}
        </div>
        <span className="text-[9px] font-mono text-zinc-500 hidden sm:inline">
          1-Click chord progression, key, tempo & chromatic soul pocket
        </span>
      </div>

      {/* Chord Flow Display */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider shrink-0">
          Harmonic Path:
        </span>
        {progression.map((chord, i) => (
          <div key={i} className="flex items-center gap-1.5 shrink-0">
            <div className="px-2.5 py-1 rounded bg-[#0e121a] border border-cyan-800/40 text-cyan-300 font-mono font-bold text-xs">
              {chord}
            </div>
            {i < progression.length - 1 && (
              <ArrowRight className="w-3 h-3 text-zinc-600" />
            )}
          </div>
        ))}
      </div>

      {/* Interpretation & Safety Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 bg-[#08090e] p-2.5 rounded border border-zinc-900 text-xs font-mono">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase">Interpretation Mode:</span>
          <div className="grid grid-cols-3 gap-1 mt-1">
            {(['ROOT', 'ROOT + FIFTH', 'MOVEMENT'] as InterpretationMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-1.5 py-1 rounded text-[10px] truncate transition-colors cursor-pointer border ${
                  mode === m
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[10px] text-zinc-500 uppercase">Musical Safety:</span>
          <div className="grid grid-cols-3 gap-1 mt-1">
            {(['SAFE', 'BALANCED', 'ADVENTUROUS'] as SafetyLevel[]).map((s) => (
              <button
                key={s}
                onClick={() => setSafety(s)}
                className={`px-1.5 py-1 rounded text-[10px] truncate transition-colors cursor-pointer border ${
                  safety === s
                    ? 'bg-blue-950 border-blue-500 text-blue-300'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[10px] text-zinc-500 uppercase">Musical Intent:</span>
          <div className="flex items-center gap-1.5 mt-1">
            <select
              value={intent}
              onChange={(e) => setIntent(e.target.value as MusicalIntent)}
              className="flex-1 bg-zinc-900 text-zinc-200 text-xs font-mono px-2 py-1 rounded border border-zinc-800 outline-none cursor-pointer"
            >
              <option value="R&B / Soul">R&B / Soul (Neo-Soul / Pocket Walk)</option>
              <option value="Driving">Driving</option>
              <option value="808 Sub">808 Sub (Trap / Drill)</option>
              <option value="Dark">Dark Melodic</option>
              <option value="Aggressive">Aggressive</option>
              <option value="Funky">Funky / Syncopated</option>
              <option value="Minimal">Minimal Hypnotic</option>
              <option value="Reese">Reese Drone</option>
              <option value="Cinematic">Cinematic</option>
            </select>

            <button
              onClick={handleRegenerate}
              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-400 transition-colors cursor-pointer"
              title="Regenerate Pattern with current settings"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 16-Step Bass Sequencer Grid */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span>16-STEP BASS ROLL</span>
          <span>Click step to toggle · Click number to edit pitch & slide</span>
        </div>

        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
          {steps.map((step, idx) => {
            const isCurrentPlaying = isPlaying && activeStep === idx;
            const isSelected = selectedStepIdx === idx;
            const isQuarterBeat = idx % 4 === 0;

            return (
              <div
                key={step.step}
                className={`flex flex-col rounded border transition-all ${
                  isCurrentPlaying
                    ? 'ring-2 ring-cyan-400 border-cyan-400'
                    : isSelected
                    ? 'border-zinc-500'
                    : isQuarterBeat
                    ? 'border-zinc-700/80'
                    : 'border-zinc-800/60'
                }`}
              >
                {/* Step Header Button */}
                <button
                  onClick={() => setSelectedStepIdx(idx)}
                  className={`text-[9px] font-mono py-0.5 text-center cursor-pointer transition-colors ${
                    isCurrentPlaying
                      ? 'bg-cyan-500 text-black font-bold'
                      : isQuarterBeat
                      ? 'bg-zinc-800/80 text-zinc-300'
                      : 'bg-zinc-900/60 text-zinc-500'
                  }`}
                >
                  {step.step}
                </button>

                {/* Note Trigger Button */}
                <button
                  onClick={() => handleStepToggle(idx)}
                  className={`h-16 flex flex-col justify-between p-1 text-center transition-all cursor-pointer ${
                    step.active
                      ? step.accent
                        ? 'bg-cyan-600/90 text-white font-bold'
                        : 'bg-cyan-950/80 text-cyan-200 border-t border-cyan-800/60'
                      : 'bg-[#08090d] text-zinc-600 hover:bg-zinc-900'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold truncate">
                    {step.active ? step.noteName : '·'}
                  </div>

                  {step.active && (
                    <div className="w-full space-y-0.5">
                      {step.slide && (
                        <div className="text-[7px] font-mono bg-violet-900/80 text-violet-200 px-0.5 rounded truncate">
                          SLIDE
                        </div>
                      )}
                      <div className="w-full bg-zinc-950/60 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-400 h-full"
                          style={{ width: `${(step.velocity / 127) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Step Inspector */}
      {currentStep && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded bg-[#08090e] border border-zinc-900 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-zinc-500">Step {currentStep.step} Settings:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 text-[11px]">Pitch:</span>
              <select
                value={currentStep.midiNote}
                onChange={(e) => handlePitchChange(selectedStepIdx, parseInt(e.target.value))}
                className="bg-zinc-900 text-cyan-300 font-bold px-2 py-0.5 rounded border border-zinc-800 outline-none cursor-pointer"
              >
                {[24, 26, 28, 29, 31, 33, 35, 36, 38, 40, 41, 43, 45, 47, 48].map((m) => (
                  <option key={m} value={m}>
                    {midiToNoteName(m)} (MIDI {m})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleSlideToggle(selectedStepIdx)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                currentStep.slide
                  ? 'bg-violet-950 border-violet-500 text-violet-200'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'
              }`}
            >
              Glide / Slide
            </button>
          </div>

          <div className="text-[11px] text-zinc-500">
            Velocity: <span className="text-zinc-300 font-bold">{currentStep.velocity}</span> · Duration:{' '}
            <span className="text-zinc-300 font-bold">{currentStep.durationSteps} Step(s)</span>
          </div>
        </div>
      )}
    </div>
  );
};
