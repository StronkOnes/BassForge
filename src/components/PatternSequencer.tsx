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
  midiToNoteName,
  THEORY_PROGRESSIONS,
  TheoryProgression,
  BassAccompanimentStyle,
} from '../engine/musicTheory';
import { bassDsp } from '../engine/audioSynth';
import { downloadBassMidiFile } from '../engine/midiFileWriter';
import { RotaryKnob } from './ui/RotaryKnob';
import {
  Play,
  Square,
  Download,
  Shuffle,
  Dices,
  BookOpen,
  ChevronRight,
  Music,
  Sliders,
  Sparkles,
  Layers,
} from 'lucide-react';

interface PatternSequencerProps {
  selectedKey: PitchClassName;
  selectedScale: ScaleTypeName;
  theme?: 'metallic' | 'wooden';
  onKeyChange: (key: PitchClassName) => void;
  onScaleChange: (scale: ScaleTypeName) => void;
  onPatternChange: (pattern: PatternStep[]) => void;
}

export const PatternSequencer: React.FC<PatternSequencerProps> = ({
  selectedKey,
  selectedScale,
  theme = 'wooden',
  onKeyChange,
  onScaleChange,
  onPatternChange,
}) => {
  const [bpm, setBpm] = useState<number>(88);
  const [swing, setSwing] = useState<number>(0.25);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [style, setStyle] = useState<BassAccompanimentStyle>('rnb-soul-pocket');
  const [safety, setSafety] = useState<SafetyLevel>('BALANCED');
  const [nonChordTones, setNonChordTones] = useState<
    'chord-tones-only' | 'diatonic-passing' | 'chromatic-approach' | 'full-expressive'
  >('chromatic-approach');
  const [motiveTransform, setMotiveTransform] = useState<
    'none' | 'inversion' | 'rhythmic-shift' | 'retrograde'
  >('none');
  const [progression, setProgression] = useState<string[]>(['Dm9', 'G13', 'Cmaj9', 'Am9']);
  const [steps, setSteps] = useState<PatternStep[]>([]);
  const [selectedStepIdx, setSelectedStepIdx] = useState<number>(0);
  const [variationIndex, setVariationIndex] = useState<number>(1);
  const [selectedProgressionId, setSelectedProgressionId] = useState<string>('rnb-neosoul-2516');

  // Regenerate pattern whenever key, scale, progression, style, safety, NCT, motive, or variationIndex changes!
  useEffect(() => {
    const newPattern = generateBassPattern({
      key: selectedKey,
      scale: selectedScale,
      progression,
      style,
      safety,
      baseOctave: 1,
      variationSeed: variationIndex * 1337 + 42,
      nonChordTones,
      subphraseTransformation: motiveTransform,
    });
    setSteps(newPattern);
    onPatternChange(newPattern);
    if (isPlaying) {
      bassDsp.startSequencer(newPattern, bpm, (step) => setActiveStep(step));
    }
  }, [selectedKey, selectedScale, progression, style, safety, nonChordTones, motiveTransform, variationIndex]);

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

  const handleVelocityChange = (index: number, vel: number) => {
    const updated = [...steps];
    updated[index].velocity = vel;
    setSteps(updated);
    onPatternChange(updated);
  };

  const handleNewVariation = () => {
    setVariationIndex((prev) => prev + 1);
    if (!isPlaying) {
      setTimeout(() => {
        const firstActive = steps.find((s) => s.active) || steps[0];
        if (firstActive) {
          const freq = 440 * Math.pow(2, (firstActive.midiNote - 69) / 12);
          bassDsp.triggerNote(freq, firstActive.velocity, 0.4, firstActive.slide);
        }
      }, 60);
    }
  };

  const handleAuditionNote = () => {
    const firstActive = steps.find((s) => s.active) || steps[0];
    if (firstActive) {
      const freq = 440 * Math.pow(2, (firstActive.midiNote - 69) / 12);
      bassDsp.triggerNote(freq, 115, 0.5, firstActive.slide);
    }
  };

  const handleLoadProgression = (progId: string) => {
    const found = THEORY_PROGRESSIONS.find((p) => p.id === progId);
    if (!found) return;
    setSelectedProgressionId(found.id);
    setProgression(found.chords);
    onKeyChange(found.key);
    onScaleChange(found.scale);
    setBpm(found.suggestedBpm);
    // Assign a matching style
    if (found.category === 'R&B / Soul') setStyle('rnb-soul-pocket');
    else if (found.category === 'Jazz & Blues') setStyle('walking-jazz');
    else if (found.category === 'Chromatic & Modern') setStyle('descending-chromatic');
    else setStyle('driving-eighths');
    setVariationIndex((prev) => prev + 1);
  };

  const handleDownloadMidi = () => {
    downloadBassMidiFile(steps, bpm, `BassForge_${selectedKey}_${style}_Var${variationIndex}.mid`);
  };

  const currentStep = steps[selectedStepIdx] || steps[0];
  const activeProg = THEORY_PROGRESSIONS.find((p) => p.id === selectedProgressionId);

  // Wooden vs Metallic color theme tokens
  const isWood = theme === 'wooden';
  const containerBg = isWood
    ? 'bg-gradient-to-b from-[#2a170d] via-[#1d1009] to-[#120804] border-[#5e341b]'
    : 'bg-gradient-to-b from-[#0c0e15] to-[#07090e] border-zinc-800';

  const accentColor = isWood ? 'amber' : 'cyan';
  const primaryBtnClass = isWood
    ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
    : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_12px_rgba(6,182,212,0.3)]';

  return (
    <div className={`${containerBg} border rounded-lg p-3 sm:p-5 space-y-4 shadow-xl select-none`}>
      {/* ----------------------------------------------------
          TOP TRANSPORT & MASTER THEORY CONSOLE
          Re-architected into responsive non-overlapping tiers
      ---------------------------------------------------- */}
      <div className="flex flex-col gap-3 border-b border-zinc-800/80 pb-3">
        {/* Tier 1: Primary Transport & Generation Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Play/Stop + New Variation + Audition */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={togglePlay}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-md font-mono font-bold text-xs transition-all cursor-pointer shadow-lg select-none shrink-0 ${
                isPlaying
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                  : primaryBtnClass
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4 fill-current" /> STOP SEQ
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> PLAY LOOP
                </>
              )}
            </button>

            {/* GENERATE NEW VARIATION BUTTON */}
            <button
              onClick={handleNewVariation}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md font-mono font-bold text-xs cursor-pointer transition-all border shrink-0 ${
                isWood
                  ? 'bg-[#3b2012] hover:bg-[#4d2a17] text-amber-300 border-amber-600/70 shadow-md active:scale-95'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border-cyan-700/80 shadow-md active:scale-95'
              }`}
              title="Generates a fresh, musically unique bassline variation based on music theory!"
            >
              <Dices className="w-4 h-4 text-amber-400" />
              <span>NEW VARIATION #{variationIndex}</span>
            </button>

            {/* Quick Audition Tone */}
            <button
              onClick={handleAuditionNote}
              className={`px-3 py-2 rounded-md border text-xs font-mono font-semibold transition-all cursor-pointer shrink-0 ${
                isWood
                  ? 'bg-[#22130a] hover:bg-[#321c0e] text-amber-300 border-amber-800/80'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
              title="Preview root tone without starting sequencer loop"
            >
              AUDITION
            </button>
          </div>

          {/* MIDI Export Action */}
          <button
            onClick={handleDownloadMidi}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md border text-xs font-mono font-semibold transition-all cursor-pointer shadow-sm shrink-0 ${
              isWood
                ? 'bg-[#2b180d] hover:bg-[#3a2012] text-amber-200 border-amber-800/80'
                : 'bg-[#080b12] hover:bg-zinc-800 text-zinc-200 border-zinc-800'
            }`}
            title="Download standard 960 PPQ .mid file for Ableton, FL Studio, Logic Pro"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>EXPORT .MID</span>
          </button>
        </div>

        {/* Tier 2: Tempo, Swing, Key & Scale Controls (Spacious & No-Overlap) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Knobs: BPM & Swing */}
          <div className="flex items-center gap-3">
            {/* Rotary BPM Dial */}
            <div className="bg-[#05060a] p-1.5 rounded-md border border-zinc-800 shadow-inner shrink-0">
              <RotaryKnob
                label="BPM"
                value={bpm}
                min={60}
                max={180}
                step={1}
                defaultValue={88}
                size="sm"
                color={accentColor}
                onChange={(val) => {
                  const nextBpm = Math.round(val);
                  setBpm(nextBpm);
                  if (isPlaying) {
                    bassDsp.startSequencer(steps, nextBpm, (step) => setActiveStep(step));
                  }
                }}
                formatValue={(v) => `${Math.round(v)}`}
              />
            </div>

            {/* Rotary Swing Dial */}
            <div className="bg-[#05060a] p-1.5 rounded-md border border-zinc-800 shadow-inner shrink-0">
              <RotaryKnob
                label="SWING"
                value={swing}
                min={0}
                max={0.75}
                step={0.01}
                defaultValue={0.25}
                unit="%"
                size="sm"
                color={isWood ? 'amber' : 'pink'}
                onChange={setSwing}
                sublabel="Groove Pocket"
              />
            </div>
          </div>

          {/* Musical Context: Key & Scale Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Key Picker */}
            <div className="flex items-center gap-1.5 bg-[#05060a] border border-zinc-800 px-3 py-1.5 rounded-md shadow-inner">
              <span className="text-[10px] font-mono text-zinc-500 font-bold">KEY:</span>
              <select
                value={selectedKey}
                onChange={(e) => onKeyChange(e.target.value as PitchClassName)}
                className={`bg-transparent text-xs font-mono font-bold cursor-pointer outline-none ${
                  isWood ? 'text-amber-400' : 'text-cyan-400'
                }`}
              >
                {PITCH_CLASSES.map((k) => (
                  <option key={k} value={k} className="bg-zinc-900 text-white">
                    {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Scale Picker */}
            <div className="flex items-center gap-1.5 bg-[#05060a] border border-zinc-800 px-3 py-1.5 rounded-md shadow-inner">
              <span className="text-[10px] font-mono text-zinc-500 font-bold">SCALE:</span>
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
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------
          MUSIC THEORY BASS ACCOMPANIMENT & PROGRESSION ENGINE
          4-Column Grid with Clear Room for Every Control
      ---------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 rounded-lg border bg-[#05060a]/90 border-zinc-800/80">
        {/* 1. Bass Theory Texture Style (Ch. 14) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-bold text-zinc-300">1. THEORY TEXTURE:</span>
            <span className="text-[9px] text-zinc-500">Ch. 14</span>
          </div>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as BassAccompanimentStyle)}
            className={`w-full text-xs font-mono font-bold p-2 rounded-md border outline-none cursor-pointer ${
              isWood
                ? 'bg-[#1e1008] border-[#5e341b] text-amber-300'
                : 'bg-[#090c14] border-zinc-700 text-cyan-300'
            }`}
          >
            <option value="rnb-soul-pocket">R&B / Neo-Soul Pocket (Ch. 14.4 & 31.7)</option>
            <option value="walking-jazz">Walking Bassline (Jazz / Blues, Ch. 14.7 & 31.8)</option>
            <option value="descending-chromatic">Descending Chromatic 1-7-b7-6-b6-5 (Ch. 21.6)</option>
            <option value="syncopated-clave">3+3+2 Syncopated Clavé (Ch. 14.6.1)</option>
            <option value="funk-syncopated">Funk Syncopated & Octave Slap (Ch. 14.7)</option>
            <option value="alberti-arpeggio">Alberti Arpeggiated Bass (Ch. 14.3.2)</option>
            <option value="trap-808-glide">Trap / 808 Pitch Glides (Sub Glide)</option>
            <option value="driving-eighths">Driving 8th Rock / Pop (Ch. 14.4.3)</option>
            <option value="ballad-one-two-and">Ballad "1 (2) &" Rhythm (Ch. 14.4.1)</option>
          </select>
        </div>

        {/* 2. Chord Progression Template (Ch. 7 & 9) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-bold text-zinc-300">2. PROGRESSION:</span>
            <span className="text-[9px] text-zinc-500">Ch. 7, 9 & 19</span>
          </div>
          <select
            value={selectedProgressionId}
            onChange={(e) => handleLoadProgression(e.target.value)}
            className="w-full bg-[#090c14] text-xs font-mono font-bold p-2 rounded-md border border-zinc-700 text-white outline-none cursor-pointer truncate"
          >
            {THEORY_PROGRESSIONS.map((prog) => (
              <option key={prog.id} value={prog.id}>
                {prog.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Non-Chord Tones Engine (Ch. 10) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-bold text-zinc-300">3. NON-CHORD TONES:</span>
            <span className="text-[9px] text-zinc-500">Ch. 10</span>
          </div>
          <select
            value={nonChordTones}
            onChange={(e) => setNonChordTones(e.target.value as any)}
            className="w-full bg-[#090c14] text-xs font-mono p-2 rounded-md border border-zinc-700 text-zinc-300 outline-none cursor-pointer"
          >
            <option value="chord-tones-only">Clean Roots & 5ths Only</option>
            <option value="diatonic-passing">Diatonic Passing Tones (pt)</option>
            <option value="chromatic-approach">Chromatic Leading Tones (Ch. 31)</option>
            <option value="full-expressive">Expressive Suspensions & Slides</option>
          </select>
        </div>

        {/* 4. Motivic Transformation (Ch. 11) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-bold text-zinc-300">4. MOTIVE (CH. 11):</span>
            <span className="text-[9px] text-zinc-500">Subphrase</span>
          </div>
          <select
            value={motiveTransform}
            onChange={(e) => setMotiveTransform(e.target.value as any)}
            className={`w-full text-xs font-mono p-2 rounded-md border outline-none cursor-pointer ${
              isWood
                ? 'bg-[#1e1008] border-[#5e341b] text-amber-200'
                : 'bg-[#090c14] border-zinc-700 text-zinc-300'
            }`}
          >
            <option value="none">Cadential Resolution (Standard)</option>
            <option value="inversion">Melodic Inversion (Ch. 11.2.1)</option>
            <option value="rhythmic-shift">Rhythmic Shift (Ch. 11.2.4)</option>
            <option value="retrograde">Retrograde Reversal (Ch. 11.2.7)</option>
          </select>
        </div>
      </div>

      {/* Chord Flow & Theory Reference Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-md bg-[#050609] border border-zinc-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-bold uppercase">HARMONIC PATH:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {progression.map((chord, i) => (
              <div key={i} className="flex items-center gap-1 shrink-0">
                <span className={`px-2.5 py-0.5 rounded font-bold border ${
                  isWood
                    ? 'bg-[#2b170c] border-amber-600/60 text-amber-300'
                    : 'bg-zinc-900 border-cyan-800/60 text-cyan-300'
                }`}>
                  {chord}
                </span>
                {i < progression.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />}
              </div>
            ))}
          </div>
        </div>

        {activeProg && (
          <div className="text-[10px] text-zinc-400 italic truncate max-w-md hidden lg:block">
            {activeProg.theoryNotes}
          </div>
        )}
      </div>

      {/* ----------------------------------------------------
          16-STEP HARDWARE PAD MATRIX
          Silicon Backlit Step Buttons with LED Indicators
      ---------------------------------------------------- */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-200">16-STEP SEQUENCER RUNNER</span>
            <span className="text-zinc-600">·</span>
            <span className="text-[10px] text-zinc-500">Click pad to toggle · Click step header for pitch & glide</span>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-xs inline-block ${isWood ? 'bg-amber-400' : 'bg-cyan-400'}`} /> Active
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-rose-400 inline-block" /> Legato Slide
            </span>
          </div>
        </div>

        {/* 16 Illuminated Pads */}
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-1.5 p-2.5 bg-[#040508] rounded-md border border-zinc-900 shadow-inner">
          {steps.map((step, idx) => {
            const isPlayingStep = isPlaying && activeStep === idx;
            const isSelected = selectedStepIdx === idx;
            const isQuarterBeat = idx % 4 === 0;
            const beatNumber = `${Math.floor(idx / 4) + 1}.${(idx % 4) + 1}`;

            return (
              <div
                key={step.step}
                className={`flex flex-col rounded-md overflow-hidden transition-all duration-100 ${
                  isPlayingStep
                    ? isWood
                      ? 'ring-2 ring-amber-400 shadow-[0_0_12px_#fbbf24]'
                      : 'ring-2 ring-cyan-400 shadow-[0_0_12px_#06b6d4]'
                    : isSelected
                    ? 'ring-1 ring-zinc-400'
                    : 'border border-zinc-800/80'
                }`}
              >
                {/* Step Header & Chaser LED */}
                <button
                  type="button"
                  onClick={() => setSelectedStepIdx(idx)}
                  className={`py-1 px-0.5 text-center text-[8px] font-mono font-bold cursor-pointer transition-colors flex items-center justify-center gap-1 ${
                    isPlayingStep
                      ? isWood
                        ? 'bg-amber-500 text-black'
                        : 'bg-cyan-500 text-black'
                      : isQuarterBeat
                      ? 'bg-zinc-800 text-zinc-200'
                      : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      isPlayingStep
                        ? 'bg-white shadow-[0_0_4px_#fff]'
                        : step.active
                        ? isWood ? 'bg-amber-400' : 'bg-cyan-500'
                        : 'bg-zinc-700'
                    }`}
                  />
                  <span>{beatNumber}</span>
                </button>

                {/* Silicone Rubber Pad Body */}
                <button
                  type="button"
                  onClick={() => handleStepToggle(idx)}
                  className={`h-16 flex flex-col justify-between p-1.5 text-center transition-all cursor-pointer relative select-none ${
                    step.active
                      ? step.slide
                        ? 'bg-gradient-to-b from-rose-950 via-rose-900 to-rose-950 text-white border-t border-rose-400 shadow-[inset_0_1px_4px_rgba(255,255,255,0.3)]'
                        : isWood
                        ? 'bg-gradient-to-b from-amber-950 via-amber-900 to-amber-950 text-amber-100 border-t border-amber-400/80 shadow-[inset_0_1px_4px_rgba(255,255,255,0.3)]'
                        : 'bg-gradient-to-b from-cyan-950 via-cyan-900 to-cyan-950 text-white border-t border-cyan-400/80 shadow-[inset_0_1px_4px_rgba(255,255,255,0.3)]'
                      : 'bg-[#06080e] hover:bg-[#0c1018] text-zinc-600'
                  }`}
                >
                  <div
                    className={`text-xs font-mono font-bold tracking-tight ${
                      step.active ? 'text-white' : 'text-zinc-600'
                    }`}
                  >
                    {step.active ? step.noteName : '·'}
                  </div>

                  {step.active && step.slide && (
                    <div className="text-[7px] font-mono font-extrabold bg-rose-600 text-white px-1 rounded-xs uppercase tracking-wider">
                      GLIDE
                    </div>
                  )}

                  {step.active && (
                    <div className="w-full bg-black/60 h-1.5 rounded-xs overflow-hidden p-0.2 border border-zinc-800">
                      <div
                        className={`h-full rounded-xs ${
                          step.slide ? 'bg-rose-400' : isWood ? 'bg-amber-400' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${(step.velocity / 127) * 100}%` }}
                      />
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Step Precision Inspector */}
      {currentStep && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-md bg-[#050609] border border-zinc-900 text-xs font-mono items-center">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-bold">STEP {currentStep.step} PITCH:</span>
            <select
              value={currentStep.midiNote}
              onChange={(e) => handlePitchChange(selectedStepIdx, parseInt(e.target.value))}
              className={`p-1 rounded border outline-none cursor-pointer font-bold ${
                isWood ? 'bg-[#22120a] border-amber-800 text-amber-300' : 'bg-[#090b12] border-zinc-700 text-cyan-300'
              }`}
            >
              {[24, 26, 28, 29, 31, 33, 35, 36, 38, 40, 41, 43, 45, 47, 48].map((m) => (
                <option key={m} value={m}>
                  {midiToNoteName(m)} (MIDI {m})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400">LEGATO GLIDE:</span>
            <button
              onClick={() => handleSlideToggle(selectedStepIdx)}
              className={`px-3 py-1 rounded font-mono font-bold text-[11px] border cursor-pointer transition-colors ${
                currentStep.slide
                  ? 'bg-rose-950 border-rose-500 text-rose-200 shadow-sm'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'
              }`}
            >
              {currentStep.slide ? 'GLIDE ENGAGED' : 'NO GLIDE'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400">VELOCITY:</span>
            <input
              type="range"
              min="1"
              max="127"
              value={currentStep.velocity}
              onChange={(e) => handleVelocityChange(selectedStepIdx, parseInt(e.target.value))}
              className={`flex-1 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none ${
                isWood ? 'accent-amber-400' : 'accent-cyan-400'
              }`}
            />
            <span className={`font-bold tabular-nums w-8 text-right ${isWood ? 'text-amber-400' : 'text-cyan-400'}`}>
              {currentStep.velocity}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
