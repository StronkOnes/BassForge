import React, { useState, useEffect } from 'react';
import {
  PitchClassName,
  ScaleTypeName,
  SpeakerTarget,
  HarmonicsConfig,
  DistortionConfig,
  SubLayerConfig,
  BodyLayerConfig,
  CharacterLayerConfig,
} from '../types/music';
import { bassDsp, DEFAULT_SYNTH_PARAMS } from '../engine/audioSynth';
import { BASSFORGE_PRESETS } from '../data/presets';
import { THEORY_PROGRESSIONS } from '../engine/musicTheory';
import { OscilloscopeDisplay } from './OscilloscopeDisplay';
import { HarmonicsSection } from './HarmonicsSection';
import { DistortionSection } from './DistortionSection';
import { PatternSequencer } from './PatternSequencer';
import { BassKeyboardVisualizer } from './BassKeyboardVisualizer';
import { RotaryKnob } from './ui/RotaryKnob';
import { VuMeter } from './ui/VuMeter';
import {
  Sliders,
  Sparkles,
  Shuffle,
  Activity,
  Layers,
  Flame,
  Music,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Palette,
} from 'lucide-react';

interface HardwarePluginViewProps {
  onOpenDawGuide: () => void;
}

export const HardwarePluginView: React.FC<HardwarePluginViewProps> = ({
  onOpenDawGuide,
}) => {
  // Theme state: 'metallic' | 'wooden'
  const [chassisTheme, setChassisTheme] = useState<'metallic' | 'wooden'>('wooden');

  // Musical Context
  const [selectedKey, setSelectedKey] = useState<PitchClassName>('C');
  const [selectedScale, setSelectedScale] = useState<ScaleTypeName>('Natural Minor');
  const [fundamentalFreq, setFundamentalFreq] = useState<number>(55.0); // A1

  // Master Volume & Engine Parameters
  const [masterVolume, setMasterVolume] = useState<number>(0.8);
  const [speakerTarget, setSpeakerTarget] = useState<SpeakerTarget>('FULL RANGE');
  const [autoGainMatch, setAutoGainMatch] = useState<boolean>(true);
  const [subProtect, setSubProtect] = useState<boolean>(true);

  // Synth Layers
  const [subLayer, setSubLayer] = useState<SubLayerConfig>(DEFAULT_SYNTH_PARAMS.sub);
  const [bodyLayer, setBodyLayer] = useState<BodyLayerConfig>(DEFAULT_SYNTH_PARAMS.body);
  const [characterLayer, setCharacterLayer] = useState<CharacterLayerConfig>(
    DEFAULT_SYNTH_PARAMS.character
  );
  const [harmonics, setHarmonics] = useState<HarmonicsConfig>(DEFAULT_SYNTH_PARAMS.harmonics);
  const [distortion, setDistortion] = useState<DistortionConfig>(DEFAULT_SYNTH_PARAMS.distortion);

  // R&B Soul Features
  const [vocalPocketCarver, setVocalPocketCarver] = useState<boolean>(true);

  // Presets & Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('rnb-neo-soul-p-bass');

  // A/B Comparison States
  const [activeState, setActiveState] = useState<'A' | 'B'>('A');
  const [stateSnapshotB, setStateSnapshotB] = useState<typeof DEFAULT_SYNTH_PARAMS | null>(null);

  // Active Bottom Workspace Bay
  const [activeBay, setActiveBay] = useState<'sequencer' | 'harmonics' | 'distortion' | 'keybed' | 'preprocessor'>('sequencer');

  // Sync state to audio engine
  useEffect(() => {
    bassDsp.updateParams({
      sub: subLayer,
      body: bodyLayer,
      character: characterLayer,
      harmonics,
      distortion,
      targetSpeaker: speakerTarget,
      masterVolume,
      autoGainMatch,
      subProtect,
    });
  }, [
    subLayer,
    bodyLayer,
    characterLayer,
    harmonics,
    distortion,
    speakerTarget,
    masterVolume,
    autoGainMatch,
    subProtect,
  ]);

  // Load Preset
  const handleLoadPreset = (presetId: string) => {
    const found = BASSFORGE_PRESETS.find((p) => p.id === presetId);
    if (!found) return;

    setSelectedPresetId(found.id);
    setSelectedKey(found.recommendedKey);
    setSelectedScale(found.recommendedScale);
    setSubLayer(found.sub);
    setBodyLayer(found.body);
    setCharacterLayer(found.character);
    setHarmonics(found.harmonics);
    setDistortion(found.distortion);
  };

  // Next / Prev Preset
  const handleStepPreset = (direction: 'next' | 'prev') => {
    const currentIndex = BASSFORGE_PRESETS.findIndex((p) => p.id === selectedPresetId);
    if (currentIndex === -1) return;
    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % BASSFORGE_PRESETS.length
        : (currentIndex - 1 + BASSFORGE_PRESETS.length) % BASSFORGE_PRESETS.length;
    handleLoadPreset(BASSFORGE_PRESETS[nextIndex].id);
  };

  // Toggle Vocal Pocket Carver (R&B feature)
  const toggleVocalPocket = (engaged: boolean) => {
    setVocalPocketCarver(engaged);
    if (engaged) {
      setCharacterLayer((prev) => ({
        ...prev,
        cutoff: Math.min(prev.cutoff, 480),
        resonance: Math.min(prev.resonance, 1.2),
      }));
      setHarmonics((prev) => ({
        ...prev,
        h2: Math.min(1, prev.h2 + 0.25),
        evenOddBalance: Math.max(prev.evenOddBalance, 0.35),
      }));
      setDistortion((prev) => ({
        ...prev,
        type: 'Tape',
        drive: Math.min(1, Math.max(prev.drive, 0.22)),
        mix: Math.min(1, Math.max(prev.mix, 0.25)),
      }));
    }
  };

  // Inspire Me: picks a coherent musical sound + progression
  const handleInspireMe = () => {
    const keys: PitchClassName[] = ['C', 'D', 'Eb', 'F', 'G', 'A', 'Bb'];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    setSelectedKey(randomKey);

    const randomProg = THEORY_PROGRESSIONS[Math.floor(Math.random() * THEORY_PROGRESSIONS.length)];
    setSelectedKey(randomProg.key);
    setSelectedScale(randomProg.scale);

    setSubLayer((prev) => ({
      ...prev,
      level: 0.75 + Math.random() * 0.2,
      waveform: Math.random() > 0.5 ? 'sine' : 'triangle',
      glide: 0.03 + Math.random() * 0.1,
    }));

    setBodyLayer((prev) => ({
      ...prev,
      level: 0.5 + Math.random() * 0.4,
      tone: 0.3 + Math.random() * 0.5,
      width: 0.1 + Math.random() * 0.4,
    }));

    setHarmonics((prev) => ({
      ...prev,
      h2: 0.3 + Math.random() * 0.5,
      h3: 0.2 + Math.random() * 0.5,
      evenOddBalance: (Math.random() - 0.5) * 0.6,
    }));

    setDistortion((prev) => ({
      ...prev,
      drive: 0.2 + Math.random() * 0.4,
      mix: 0.3 + Math.random() * 0.35,
    }));
  };

  // Toggle A/B Snapshot
  const handleToggleAB = () => {
    if (activeState === 'A') {
      if (!stateSnapshotB) {
        setStateSnapshotB(bassDsp.getParams());
      }
      setActiveState('B');
    } else {
      setActiveState('A');
    }
  };

  // Filtered Presets
  const filteredPresets =
    selectedCategory === 'all'
      ? BASSFORGE_PRESETS
      : BASSFORGE_PRESETS.filter((p) => p.category.toLowerCase().includes(selectedCategory));

  const isWood = chassisTheme === 'wooden';

  return (
    <div className="space-y-4">
      {/* ========================================================
          CHASSIS VIBE SWITCHER BAR (Metallic vs Wooden Console)
      ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a0c12] border border-zinc-800 p-2.5 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Palette className={`w-4 h-4 ${isWood ? 'text-amber-400' : 'text-cyan-400'}`} />
          <span className="text-xs font-mono font-bold text-zinc-300">CHASSIS AESTHETIC VIBE:</span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#050609] border border-zinc-800 rounded-md">
          <button
            onClick={() => setChassisTheme('metallic')}
            className={`px-3 py-1 text-xs font-mono font-bold rounded cursor-pointer transition-all ${
              !isWood
                ? 'bg-zinc-800 text-cyan-300 border border-cyan-700/80 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            METALLIC RACK (TITANIUM)
          </button>
          <button
            onClick={() => setChassisTheme('wooden')}
            className={`px-3 py-1 text-xs font-mono font-bold rounded cursor-pointer transition-all ${
              isWood
                ? 'bg-gradient-to-r from-amber-700 to-amber-900 text-amber-200 border border-amber-600/90 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            WOODEN CONSOLE (OILED WALNUT)
          </button>
        </div>
      </div>

      {/* ========================================================
          19" RACK / VINTAGE WOODEN CHASSIS
      ======================================================== */}
      <div
        className={`relative rounded-xl border p-4 md:p-6 transition-all duration-300 shadow-2xl ${
          isWood
            ? 'bg-gradient-to-b from-[#2e190e] via-[#21120a] to-[#140b06] border-[#5a331a] shadow-[0_25px_70px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,200,150,0.18)]'
            : 'bg-gradient-to-b from-[#161a24] via-[#0f121a] to-[#0a0d13] border-zinc-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.12)]'
        }`}
      >
        {/* Wooden Side Cheek Trim Blocks (when in wooden mode) */}
        {isWood && (
          <>
            <div className="absolute top-0 bottom-0 left-0 w-3 rounded-l-xl bg-gradient-to-r from-[#1c0e07] to-[#452414] border-r border-[#5c331a] pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-3 rounded-r-xl bg-gradient-to-l from-[#1c0e07] to-[#452414] border-l border-[#5c331a] pointer-events-none" />
          </>
        )}

        {/* 4 Corner Screws (Brass in wood mode, Stainless hex in metallic mode) */}
        <div
          className={`absolute top-3 left-3 w-3.5 h-3.5 rounded-full border shadow-inner flex items-center justify-center pointer-events-none ${
            isWood
              ? 'bg-gradient-to-br from-amber-300 via-amber-600 to-amber-900 border-amber-950'
              : 'bg-gradient-to-br from-zinc-400 to-zinc-700 border-zinc-800'
          }`}
        >
          <div className={`w-2 h-0.5 rotate-45 ${isWood ? 'bg-amber-950' : 'bg-zinc-900'}`} />
        </div>
        <div
          className={`absolute top-3 right-3 w-3.5 h-3.5 rounded-full border shadow-inner flex items-center justify-center pointer-events-none ${
            isWood
              ? 'bg-gradient-to-br from-amber-300 via-amber-600 to-amber-900 border-amber-950'
              : 'bg-gradient-to-br from-zinc-400 to-zinc-700 border-zinc-800'
          }`}
        >
          <div className={`w-2 h-0.5 -rotate-45 ${isWood ? 'bg-amber-950' : 'bg-zinc-900'}`} />
        </div>
        <div
          className={`absolute bottom-3 left-3 w-3.5 h-3.5 rounded-full border shadow-inner flex items-center justify-center pointer-events-none ${
            isWood
              ? 'bg-gradient-to-br from-amber-300 via-amber-600 to-amber-900 border-amber-950'
              : 'bg-gradient-to-br from-zinc-400 to-zinc-700 border-zinc-800'
          }`}
        >
          <div className={`w-2 h-0.5 -rotate-30 ${isWood ? 'bg-amber-950' : 'bg-zinc-900'}`} />
        </div>
        <div
          className={`absolute bottom-3 right-3 w-3.5 h-3.5 rounded-full border shadow-inner flex items-center justify-center pointer-events-none ${
            isWood
              ? 'bg-gradient-to-br from-amber-300 via-amber-600 to-amber-900 border-amber-950'
              : 'bg-gradient-to-br from-zinc-400 to-zinc-700 border-zinc-800'
          }`}
        >
          <div className={`w-2 h-0.5 rotate-60 ${isWood ? 'bg-amber-950' : 'bg-zinc-900'}`} />
        </div>

        {/* ----------------------------------------------------
            MASTER HEADER: Brand Plate + Preset Browser + Master Section
            Flexible non-overlapping layout
        ---------------------------------------------------- */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 pb-4 border-b border-zinc-800/90">
          {/* Brand Name Plate */}
          <div className="shrink-0 flex items-center gap-3">
            <div
              className={`p-2.5 rounded-md border shadow-md ${
                isWood
                  ? 'bg-gradient-to-b from-[#3a2013] to-[#1d1009] border-amber-700/60 shadow-[inset_0_1px_1px_rgba(255,200,150,0.2)]'
                  : 'bg-gradient-to-b from-[#222938] to-[#121620] border-zinc-600/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-base tracking-widest text-amber-100 uppercase">
                  BASSFORGE
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold border ${
                    isWood
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                  }`}
                >
                  {isWood ? 'WALNUT EDITION' : 'PRO VST3'}
                </span>
              </div>
              <div className="text-[9px] font-mono text-zinc-400 tracking-wider">
                JUCE · C++20 · MUSIC THEORY BASS
              </div>
            </div>
          </div>

          {/* Preset Manager Bay */}
          <div
            className={`flex-1 min-w-0 p-2.5 rounded-lg border shadow-inner flex flex-col gap-2 ${
              isWood ? 'bg-[#180d07] border-amber-950' : 'bg-[#07090f] border-zinc-800/90'
            }`}
          >
            {/* Quick Category Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: 'all', label: 'ALL' },
                { id: 'r&b', label: 'R&B / SOUL' },
                { id: '808', label: '808 GLIDE' },
                { id: 'sub', label: 'SUB PUNCH' },
                { id: 'synth', label: 'SYNTH' },
                { id: 'funk', label: 'FUNK' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded cursor-pointer transition-colors shrink-0 ${
                    selectedCategory === cat.id
                      ? isWood
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : 'bg-cyan-500 text-black shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Current Preset Selector & Navigation */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleStepPreset('prev')}
                className={`p-1.5 rounded border text-zinc-300 hover:text-white cursor-pointer transition-colors shrink-0 ${
                  isWood ? 'bg-[#29160d] hover:bg-[#381f12] border-amber-800' : 'bg-[#0f131c] hover:bg-zinc-800 border-zinc-700'
                }`}
                title="Previous Preset"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={selectedPresetId}
                onChange={(e) => handleLoadPreset(e.target.value)}
                className={`flex-1 min-w-0 font-mono font-bold text-xs px-3 py-1.5 rounded border outline-none cursor-pointer truncate ${
                  isWood
                    ? 'bg-[#120904] text-amber-300 border-amber-700/80'
                    : 'bg-[#0c0f18] text-cyan-300 border-zinc-700'
                }`}
              >
                {filteredPresets.map((p) => (
                  <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                    {p.name} [{p.category.toUpperCase()}]
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleStepPreset('next')}
                className={`p-1.5 rounded border text-zinc-300 hover:text-white cursor-pointer transition-colors shrink-0 ${
                  isWood ? 'bg-[#29160d] hover:bg-[#381f12] border-amber-800' : 'bg-[#0f131c] hover:bg-zinc-800 border-zinc-700'
                }`}
                title="Next Preset"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleInspireMe}
                className={`flex items-center gap-1 px-3 py-1.5 rounded border text-[11px] font-mono font-bold transition-all cursor-pointer shadow-sm shrink-0 ${
                  isWood
                    ? 'bg-gradient-to-b from-amber-700 to-amber-900 text-amber-100 border-amber-500 hover:brightness-110'
                    : 'bg-gradient-to-b from-cyan-950 to-cyan-900 text-cyan-300 border-cyan-700 hover:from-cyan-900 hover:to-cyan-800'
                }`}
                title="Inspire me with complete musical settings"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isWood ? 'text-amber-300' : 'text-cyan-400'}`} />
                <span>INSPIRE</span>
              </button>
            </div>
          </div>

          {/* Master Output Section & Metering (Dedicated card container) */}
          <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 p-2 rounded-lg bg-[#05060b] border border-zinc-800/80">
            {/* Toggle Switches */}
            <div className="flex flex-col gap-1 shrink-0">
              <button
                onClick={handleToggleAB}
                className="px-2 py-0.8 text-[10px] font-mono rounded bg-[#0a0d14] hover:bg-zinc-800 text-zinc-300 border border-zinc-800 cursor-pointer flex items-center justify-between gap-1.5 shrink-0"
              >
                <span>STATE</span>
                <span className={`font-bold ${isWood ? 'text-amber-400' : 'text-cyan-400'}`}>
                  [{activeState}]
                </span>
              </button>

              <button
                onClick={() => setAutoGainMatch(!autoGainMatch)}
                className={`px-2 py-0.8 text-[9px] font-mono rounded border cursor-pointer transition-colors shrink-0 ${
                  autoGainMatch
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 font-bold'
                    : 'bg-[#0a0d14] border-zinc-800 text-zinc-500'
                }`}
              >
                GAIN MATCH
              </button>

              <button
                onClick={() => setSubProtect(!subProtect)}
                className={`px-2 py-0.8 text-[9px] font-mono rounded border cursor-pointer transition-colors shrink-0 ${
                  subProtect
                    ? isWood
                      ? 'bg-amber-950 border-amber-700 text-amber-300 font-bold'
                      : 'bg-cyan-950 border-cyan-700 text-cyan-300 font-bold'
                    : 'bg-[#0a0d14] border-zinc-800 text-zinc-500'
                }`}
                title="28Hz 24dB steep high-pass filter blocks subsonic cone blowout"
              >
                SUB PROTECT
              </button>
            </div>

            {/* Master Volume Dial */}
            <div className="shrink-0">
              <RotaryKnob
                label="MASTER"
                value={masterVolume}
                min={0}
                max={1}
                step={0.01}
                defaultValue={0.8}
                size="md"
                color={isWood ? 'amber' : 'cyan'}
                onChange={setMasterVolume}
                formatValue={(v) => `${(v * 100).toFixed(0)}%`}
              />
            </div>

            {/* Live Dual Stereo VU Meter */}
            <div className="shrink-0">
              <VuMeter label="OUT" size="md" />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------
            TOP CONTROL DECK: 4 Hardware Sound Sculptor Bays
        ---------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 py-4 border-b border-zinc-800/90">
          {/* BAY 1: SUB OSCILLATOR */}
          <div
            className={`border rounded-lg p-3 space-y-3 shadow-md ${
              isWood
                ? 'bg-gradient-to-b from-[#24130a] to-[#170c06] border-amber-900/50'
                : 'bg-gradient-to-b from-[#0f131d] to-[#090c13] border-cyan-900/40'
            }`}
          >
            <div className="flex items-center justify-between border-b border-zinc-800/70 pb-1.5">
              <span className={`text-[11px] font-mono font-bold tracking-wider ${isWood ? 'text-amber-400' : 'text-cyan-400'}`}>
                1. SUB OSCILLATOR
              </span>
              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                20-80 Hz
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#050609] p-1 rounded border border-zinc-800">
              {(['sine', 'triangle', 'square'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setSubLayer({ ...subLayer, waveform: w })}
                  className={`flex-1 py-1 text-[9px] font-mono uppercase font-bold rounded cursor-pointer transition-colors ${
                    subLayer.waveform === w
                      ? isWood ? 'bg-amber-500 text-stone-950' : 'bg-cyan-500 text-black'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <RotaryKnob
                label="SUB LEVEL"
                value={subLayer.level}
                min={0}
                max={1}
                step={0.01}
                defaultValue={0.85}
                unit="%"
                size="sm"
                color={isWood ? 'amber' : 'cyan'}
                onChange={(val) => setSubLayer({ ...subLayer, level: val })}
              />

              <RotaryKnob
                label="OCTAVE"
                value={subLayer.octave}
                min={-2}
                max={0}
                step={1}
                defaultValue={-1}
                size="sm"
                color={isWood ? 'amber' : 'cyan'}
                onChange={(val) => setSubLayer({ ...subLayer, octave: Math.round(val) as -2 | -1 | 0 })}
                formatValue={(v) => `${v} Oct`}
              />

              <RotaryKnob
                label="GLIDE"
                value={subLayer.glide}
                min={0.01}
                max={0.3}
                step={0.005}
                defaultValue={0.05}
                unit="ms"
                size="sm"
                color={isWood ? 'amber' : 'cyan'}
                onChange={(val) => setSubLayer({ ...subLayer, glide: val })}
                formatValue={(v) => `${(v * 1000).toFixed(0)}ms`}
              />

              <RotaryKnob
                label="SUB DECAY"
                value={subLayer.decay}
                min={0.2}
                max={3.0}
                step={0.05}
                defaultValue={1.2}
                unit="s"
                size="sm"
                color={isWood ? 'amber' : 'cyan'}
                onChange={(val) => setSubLayer({ ...subLayer, decay: val })}
              />
            </div>
          </div>

          {/* BAY 2: BODY & PUNCH */}
          <div
            className={`border rounded-lg p-3 space-y-3 shadow-md ${
              isWood
                ? 'bg-gradient-to-b from-[#24130a] to-[#170c06] border-amber-900/50'
                : 'bg-gradient-to-b from-[#0f131d] to-[#090c13] border-blue-900/40'
            }`}
          >
            <div className="flex items-center justify-between border-b border-zinc-800/70 pb-1.5">
              <span className={`text-[11px] font-mono font-bold tracking-wider ${isWood ? 'text-amber-300' : 'text-blue-400'}`}>
                2. BODY & PUNCH
              </span>
              <span className="text-[8px] font-mono text-zinc-500">80 - 200 Hz</span>
            </div>

            <div className="flex items-center justify-between bg-[#050609] p-1 rounded border border-zinc-800">
              {(['sawtooth', 'square', 'triangle'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setBodyLayer({ ...bodyLayer, waveform: w })}
                  className={`flex-1 py-1 text-[9px] font-mono uppercase font-bold rounded cursor-pointer transition-colors ${
                    bodyLayer.waveform === w
                      ? isWood ? 'bg-amber-500 text-stone-950' : 'bg-blue-500 text-black'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {w.slice(0, 4)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <RotaryKnob
                label="BODY LEVEL"
                value={bodyLayer.level}
                min={0}
                max={1}
                step={0.01}
                defaultValue={0.65}
                unit="%"
                size="sm"
                color={isWood ? 'amber' : 'blue'}
                onChange={(val) => setBodyLayer({ ...bodyLayer, level: val })}
              />

              <RotaryKnob
                label="TONE / LP"
                value={bodyLayer.tone}
                min={0}
                max={1}
                step={0.01}
                defaultValue={0.5}
                unit="%"
                size="sm"
                color={isWood ? 'amber' : 'blue'}
                onChange={(val) => setBodyLayer({ ...bodyLayer, tone: val })}
              />

              <RotaryKnob
                label="WIDTH"
                value={bodyLayer.width}
                min={0}
                max={1}
                step={0.01}
                defaultValue={0.2}
                unit="%"
                size="sm"
                color={isWood ? 'amber' : 'blue'}
                onChange={(val) => setBodyLayer({ ...bodyLayer, width: val })}
              />

              <RotaryKnob
                label="RELEASE"
                value={bodyLayer.release}
                min={0.05}
                max={1.0}
                step={0.02}
                defaultValue={0.25}
                unit="s"
                size="sm"
                color={isWood ? 'amber' : 'blue'}
                onChange={(val) => setBodyLayer({ ...bodyLayer, release: val })}
              />
            </div>
          </div>

          {/* BAY 3: CHARACTER & MODULATION */}
          <div
            className={`border rounded-lg p-3 space-y-3 shadow-md ${
              isWood
                ? 'bg-gradient-to-b from-[#24130a] to-[#170c06] border-amber-900/50'
                : 'bg-gradient-to-b from-[#0f131d] to-[#090c13] border-violet-900/40'
            }`}
          >
            <div className="flex items-center justify-between border-b border-zinc-800/70 pb-1.5">
              <span className={`text-[11px] font-mono font-bold tracking-wider ${isWood ? 'text-amber-300' : 'text-violet-400'}`}>
                3. CHARACTER & BITE
              </span>
              <span className="text-[8px] font-mono text-zinc-500">FM & Filters</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <RotaryKnob
                label="FM MOD"
                value={characterLayer.fmAmount}
                min={0}
                max={1}
                step={0.01}
                defaultValue={0.2}
                unit="%"
                size="sm"
                color="violet"
                onChange={(val) => setCharacterLayer({ ...characterLayer, fmAmount: val })}
              />

              <RotaryKnob
                label="PUNCH"
                value={characterLayer.punch}
                min={0}
                max={1}
                step={0.01}
                defaultValue={0.4}
                unit="%"
                size="sm"
                color="violet"
                onChange={(val) => setCharacterLayer({ ...characterLayer, punch: val })}
              />

              <RotaryKnob
                label="CUTOFF"
                value={characterLayer.cutoff}
                min={200}
                max={4500}
                step={25}
                defaultValue={1200}
                unit="Hz"
                size="sm"
                color="violet"
                onChange={(val) => setCharacterLayer({ ...characterLayer, cutoff: val })}
              />

              <RotaryKnob
                label="RESONANCE"
                value={characterLayer.resonance}
                min={0.5}
                max={8.0}
                step={0.1}
                defaultValue={3.5}
                size="sm"
                color="violet"
                onChange={(val) => setCharacterLayer({ ...characterLayer, resonance: val })}
                formatValue={(v) => `Q ${v.toFixed(1)}`}
              />
            </div>
          </div>

          {/* BAY 4: R&B / NEO-SOUL VOCAL POCKET */}
          <div
            className={`border rounded-lg p-3 space-y-3 shadow-md ${
              isWood
                ? 'bg-gradient-to-b from-[#2b160b] to-[#1a0d06] border-amber-800'
                : 'bg-gradient-to-b from-[#18101a] via-[#120c15] to-[#0c080e] border-pink-900/40'
            }`}
          >
            <div className="flex items-center justify-between border-b border-zinc-800/70 pb-1.5">
              <div className="flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-[11px] font-mono font-bold text-pink-300 tracking-wider">
                  4. R&B SOUL STATION
                </span>
              </div>
              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-pink-950 text-pink-300 border border-pink-800">
                POCKET SCULPT
              </span>
            </div>

            <div className="bg-[#05060a] p-2 rounded-md border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono font-bold text-pink-200">
                  VOCAL POCKET CARVER
                </div>
                <div className="text-[8px] font-mono text-zinc-500">
                  350-500Hz mid notch for vocals
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleVocalPocket(!vocalPocketCarver)}
                className={`px-2.5 py-1 text-[9px] font-mono font-extrabold rounded cursor-pointer transition-all border ${
                  vocalPocketCarver
                    ? 'bg-pink-500 text-black border-pink-400 shadow-[0_0_8px_#ec4899]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}
              >
                {vocalPocketCarver ? 'ENGAGED' : 'BYPASS'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <RotaryKnob
                label="WARM 2ND H"
                value={harmonics.h2}
                min={0}
                max={1}
                step={0.01}
                defaultValue={0.4}
                unit="%"
                size="sm"
                color="pink"
                onChange={(val) => setHarmonics({ ...harmonics, h2: val })}
                sublabel="Earbud Tone"
              />

              <RotaryKnob
                label="SOUL GLIDE"
                value={subLayer.glide}
                min={0.02}
                max={0.2}
                step={0.005}
                defaultValue={0.07}
                unit="ms"
                size="sm"
                color="pink"
                onChange={(val) => setSubLayer({ ...subLayer, glide: val })}
                formatValue={(v) => `${(v * 1000).toFixed(0)}ms`}
                sublabel="Legato Octave"
              />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------
            CENTER DECK: High-Resolution Oscilloscope & Spectrum Display
        ---------------------------------------------------- */}
        <div className="py-4 border-b border-zinc-800/90">
          <OscilloscopeDisplay
            fundamentalFreq={fundamentalFreq}
            speakerTarget={speakerTarget}
            onSelectSpeakerTarget={setSpeakerTarget}
          />
        </div>

        {/* ----------------------------------------------------
            BOTTOM WORKSPACE DECK: Modular Studio Bays
        ---------------------------------------------------- */}
        <div className="pt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#05060a] rounded-lg border border-zinc-800">
              <button
                onClick={() => setActiveBay('sequencer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-md cursor-pointer transition-all shrink-0 ${
                  activeBay === 'sequencer'
                    ? isWood
                      ? 'bg-amber-500 text-stone-950 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                      : 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>GROOVE SEQUENCER</span>
              </button>

              <button
                onClick={() => setActiveBay('harmonics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-md cursor-pointer transition-all shrink-0 ${
                  activeBay === 'harmonics'
                    ? 'bg-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>HARMONICS MATRIX</span>
              </button>

              <button
                onClick={() => setActiveBay('distortion')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-md cursor-pointer transition-all shrink-0 ${
                  activeBay === 'distortion'
                    ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>VALVE TUBES</span>
              </button>

              <button
                onClick={() => setActiveBay('keybed')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-md cursor-pointer transition-all shrink-0 ${
                  activeBay === 'keybed'
                    ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>KEYBED AUDITION</span>
              </button>

              <button
                onClick={() => setActiveBay('preprocessor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-md cursor-pointer transition-all shrink-0 ${
                  activeBay === 'preprocessor'
                    ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>PREPROCESSOR</span>
              </button>
            </div>

            <button
              onClick={onOpenDawGuide}
              className={`text-xs font-mono underline cursor-pointer shrink-0 ${
                isWood ? 'text-amber-400 hover:text-amber-300' : 'text-cyan-400 hover:text-cyan-300'
              }`}
            >
              DAW Setup Guide →
            </button>
          </div>

          {/* Bay Contents */}
          <div className="transition-all">
            {activeBay === 'sequencer' && (
              <PatternSequencer
                selectedKey={selectedKey}
                selectedScale={selectedScale}
                theme={chassisTheme}
                onKeyChange={setSelectedKey}
                onScaleChange={setSelectedScale}
                onPatternChange={() => {}}
              />
            )}

            {activeBay === 'harmonics' && (
              <HarmonicsSection
                harmonics={harmonics}
                fundamentalFreq={fundamentalFreq}
                onChange={setHarmonics}
              />
            )}

            {activeBay === 'distortion' && (
              <DistortionSection
                distortion={distortion}
                onChange={setDistortion}
              />
            )}

            {activeBay === 'keybed' && (
              <BassKeyboardVisualizer
                selectedKey={selectedKey}
                selectedScale={selectedScale}
                onNoteTriggered={(_midi, freq) => setFundamentalFreq(freq)}
              />
            )}

            {activeBay === 'preprocessor' && (
              <div className="bg-[#05060a] border border-zinc-800 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-mono font-bold text-white tracking-wider">
                    ACOUSTIC SIGNAL PREPROCESSOR CHAIN
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    REAL-TIME TRANSLATION ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs font-mono">
                  <div className="p-3 rounded bg-[#090c14] border border-zinc-800">
                    <div className="text-[10px] text-zinc-500">STAGE 1</div>
                    <div className="font-bold text-white mt-1">INPUT GAIN</div>
                    <div className="text-[10px] text-cyan-400 mt-1">0.0 dB</div>
                  </div>
                  <div className="p-3 rounded bg-[#090c14] border border-cyan-800/60">
                    <div className="text-[10px] text-cyan-500">STAGE 2</div>
                    <div className="font-bold text-cyan-300 mt-1">SUB PROTECT</div>
                    <div className="text-[10px] text-zinc-400 mt-1">28Hz 24dB HPF</div>
                  </div>
                  <div className="p-3 rounded bg-[#090c14] border border-blue-800/60">
                    <div className="text-[10px] text-blue-500">STAGE 3</div>
                    <div className="font-bold text-blue-300 mt-1">LINKWITZ-RILEY</div>
                    <div className="text-[10px] text-zinc-400 mt-1">80 / 180 / 600 Hz</div>
                  </div>
                  <div className="p-3 rounded bg-[#090c14] border border-violet-800/60">
                    <div className="text-[10px] text-violet-500">STAGE 4</div>
                    <div className="font-bold text-violet-300 mt-1">OVERTONES</div>
                    <div className="text-[10px] text-zinc-400 mt-1">2nd & 3rd Focus</div>
                  </div>
                  <div className="p-3 rounded bg-[#090c14] border border-amber-800/60">
                    <div className="text-[10px] text-amber-500">STAGE 5</div>
                    <div className="font-bold text-amber-300 mt-1">SATURATION</div>
                    <div className="text-[10px] text-zinc-400 mt-1">{distortion.type}</div>
                  </div>
                  <div className="p-3 rounded bg-[#090c14] border border-emerald-800/60">
                    <div className="text-[10px] text-emerald-500">STAGE 6</div>
                    <div className="font-bold text-emerald-300 mt-1">GAIN MATCH</div>
                    <div className="text-[10px] text-zinc-400 mt-1">True RMS Parity</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
