import React, { useState, useEffect } from 'react';
import {
  PitchClassName,
  ScaleTypeName,
  OperatingMode,
  SpeakerTarget,
  HarmonicsConfig,
  DistortionConfig,
  SubLayerConfig,
  BodyLayerConfig,
  CharacterLayerConfig,
  PatternStep,
  PreprocessorConfig,
} from '../types/music';
import { bassDsp, DEFAULT_SYNTH_PARAMS } from '../engine/audioSynth';
import { BASSFORGE_PRESETS } from '../data/presets';
import { RNB_PROGRESSION_TEMPLATES } from '../engine/musicTheory';
import { BassSpectrumVisualizer } from './BassSpectrumVisualizer';
import { HarmonicsSection } from './HarmonicsSection';
import { DistortionSection } from './DistortionSection';
import { HearabilityPanel } from './HearabilityPanel';
import { PatternSequencer } from './PatternSequencer';
import { BassKeyboardVisualizer } from './BassKeyboardVisualizer';
import {
  Sliders,
  Sparkles,
  Shuffle,
  Volume2,
  Layers,
  Activity,
  Shield,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Check,
  HeartHandshake,
  Disc3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface HardwarePluginViewProps {
  onOpenDawGuide: () => void;
}

export const HardwarePluginView: React.FC<HardwarePluginViewProps> = ({
  onOpenDawGuide,
}) => {
  // Master Operating Mode
  const [activeMode, setActiveMode] = useState<OperatingMode>('GENERATE');

  // Musical Context
  const [selectedKey, setSelectedKey] = useState<PitchClassName>('C');
  const [selectedScale, setSelectedScale] = useState<ScaleTypeName>('Natural Minor');
  const [fundamentalFreq, setFundamentalFreq] = useState<number>(55.0); // A1 / C1

  // Macro Controls
  const [macroSub, setMacroSub] = useState<number>(0.85);
  const [macroBody, setMacroBody] = useState<number>(0.65);
  const [macroBite, setMacroBite] = useState<number>(0.35);
  const [macroGrowl, setMacroGrowl] = useState<number>(0.2);
  const [macroDrive, setMacroDrive] = useState<number>(0.35);
  const [macroHarmonics, setMacroHarmonics] = useState<number>(0.4);
  const [macroPunch, setMacroPunch] = useState<number>(0.5);
  const [macroWidth, setMacroWidth] = useState<number>(0.2);
  const [macroHearability, setMacroHearability] = useState<number>(0.6);

  // Synth Layers
  const [subLayer, setSubLayer] = useState<SubLayerConfig>(DEFAULT_SYNTH_PARAMS.sub);
  const [bodyLayer, setBodyLayer] = useState<BodyLayerConfig>(DEFAULT_SYNTH_PARAMS.body);
  const [characterLayer, setCharacterLayer] = useState<CharacterLayerConfig>(
    DEFAULT_SYNTH_PARAMS.character
  );
  const [harmonics, setHarmonics] = useState<HarmonicsConfig>(DEFAULT_SYNTH_PARAMS.harmonics);
  const [distortion, setDistortion] = useState<DistortionConfig>(DEFAULT_SYNTH_PARAMS.distortion);

  // Diagnostic Monitoring Target & Preprocessor
  const [speakerTarget, setSpeakerTarget] = useState<SpeakerTarget>('FULL RANGE');
  const [autoGainMatch, setAutoGainMatch] = useState<boolean>(true);
  const [subProtect, setSubProtect] = useState<boolean>(true);
  const [activePattern, setActivePattern] = useState<PatternStep[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('rnb-neo-soul-p-bass');
  const [vocalPocketCarver, setVocalPocketCarver] = useState<boolean>(false);
  const [rnbLabOpen, setRnbLabOpen] = useState<boolean>(true);

  // A/B Comparison States
  const [activeState, setActiveState] = useState<'A' | 'B'>('A');
  const [stateSnapshotB, setStateSnapshotB] = useState<typeof DEFAULT_SYNTH_PARAMS | null>(null);

  const toggleVocalPocketCarver = () => {
    const nextVal = !vocalPocketCarver;
    setVocalPocketCarver(nextVal);
    if (nextVal) {
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

  const handleWarmHarmonicsBoost = () => {
    setHarmonics((prev) => ({
      ...prev,
      h2: Math.min(1, prev.h2 + 0.2),
      h3: Math.min(1, prev.h3 + 0.12),
      evenOddBalance: 0.4,
    }));
    setDistortion((prev) => ({
      ...prev,
      type: 'Tape',
      drive: Math.min(1, Math.max(0.2, prev.drive)),
      mix: Math.min(1, Math.max(0.25, prev.mix)),
    }));
  };

  // Sync state to audio engine
  useEffect(() => {
    bassDsp.updateParams({
      sub: subLayer,
      body: bodyLayer,
      character: characterLayer,
      harmonics,
      distortion,
      targetSpeaker: speakerTarget,
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
    autoGainMatch,
    subProtect,
  ]);

  // Handle Macro Adjustments
  const handleMacroChange = (name: string, value: number) => {
    switch (name) {
      case 'sub':
        setMacroSub(value);
        setSubLayer((prev) => ({ ...prev, level: value }));
        break;
      case 'body':
        setMacroBody(value);
        setBodyLayer((prev) => ({ ...prev, level: value }));
        break;
      case 'bite':
        setMacroBite(value);
        setCharacterLayer((prev) => ({ ...prev, bite: value }));
        break;
      case 'growl':
        setMacroGrowl(value);
        setCharacterLayer((prev) => ({ ...prev, growl: value }));
        break;
      case 'drive':
        setMacroDrive(value);
        setDistortion((prev) => ({ ...prev, drive: value }));
        break;
      case 'harmonics':
        setMacroHarmonics(value);
        setHarmonics((prev) => ({
          ...prev,
          h2: Math.min(1, value * 1.1),
          h3: Math.min(1, value * 0.9),
          h4: Math.min(1, value * 0.6),
          h5: Math.min(1, value * 0.5),
        }));
        break;
      case 'punch':
        setMacroPunch(value);
        setCharacterLayer((prev) => ({ ...prev, punch: value }));
        break;
      case 'width':
        setMacroWidth(value);
        setBodyLayer((prev) => ({ ...prev, width: value }));
        break;
      case 'hearability':
        setMacroHearability(value);
        setHarmonics((prev) => ({
          ...prev,
          h2: Math.max(prev.h2, value * 0.8),
          h3: Math.max(prev.h3, value * 0.9),
          h5: Math.max(prev.h5, value * 0.4),
        }));
        setDistortion((prev) => ({
          ...prev,
          drive: Math.max(prev.drive, value * 0.4),
        }));
        break;
    }
  };

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
    setMacroHearability(found.hearabilityMacro);
    setMacroSub(found.sub.level);
    setMacroBody(found.body.level);
    setMacroDrive(found.distortion.drive);
    setMacroHarmonics(found.harmonics.h3);
    setMacroBite(found.character.bite);
    setMacroGrowl(found.character.growl);
  };

  // Auto-Inject Harmonics Assistant
  const handleAutoInjectHarmonics = () => {
    setHarmonics((prev) => ({
      ...prev,
      h2: Math.min(1, prev.h2 + 0.35),
      h3: Math.min(1, prev.h3 + 0.45),
      h4: Math.min(1, prev.h4 + 0.15),
      h5: Math.min(1, prev.h5 + 0.2),
      evenOddBalance: 0.1,
    }));
    setDistortion((prev) => ({
      ...prev,
      drive: Math.min(1, prev.drive + 0.15),
      mix: Math.min(1, prev.mix + 0.1),
    }));
    setMacroHearability(0.85);
  };

  // Randomize features within musically safe bounds
  const handleRandomize = (target: 'tone' | 'harmonics' | 'distortion' | 'all') => {
    if (target === 'tone' || target === 'all') {
      const waveforms = ['sine', 'triangle', 'sawtooth'] as const;
      setSubLayer((prev) => ({
        ...prev,
        level: 0.7 + Math.random() * 0.25,
        waveform: Math.random() > 0.4 ? 'sine' : 'triangle',
        glide: 0.02 + Math.random() * 0.12,
      }));
      setBodyLayer((prev) => ({
        ...prev,
        level: 0.4 + Math.random() * 0.45,
        tone: 0.3 + Math.random() * 0.5,
        saturation: 0.2 + Math.random() * 0.5,
      }));
    }

    if (target === 'harmonics' || target === 'all') {
      setHarmonics({
        h2: 0.2 + Math.random() * 0.6,
        h3: 0.15 + Math.random() * 0.6,
        h4: Math.random() * 0.3,
        h5: Math.random() * 0.35,
        h7: Math.random() * 0.2,
        h9: Math.random() * 0.1,
        evenOddBalance: (Math.random() - 0.5) * 0.8,
        spread: 0.2 + Math.random() * 0.6,
        focus: 0.4 + Math.random() * 0.4,
      });
    }

    if (target === 'distortion' || target === 'all') {
      const types = ['Soft Clip', 'Tube', 'Tape', 'Diode', 'Transistor', 'Wavefold'] as const;
      const randomType = types[Math.floor(Math.random() * types.length)];
      setDistortion({
        type: randomType,
        drive: 0.2 + Math.random() * 0.5,
        bias: (Math.random() - 0.5) * 0.3,
        tone: 0.4 + Math.random() * 0.4,
        mix: 0.3 + Math.random() * 0.4,
        stage: Math.floor(Math.random() * 3) + 1,
      });
    }
  };

  // "INSPIRE ME": Synthesize complete coherent bass preset
  const handleInspireMe = () => {
    handleRandomize('all');
    const keys: PitchClassName[] = ['C', 'D', 'Eb', 'F', 'G', 'A', 'Bb'];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    setSelectedKey(randomKey);
  };

  // Toggle A/B Snapshot
  const handleToggleAB = () => {
    if (activeState === 'A') {
      // Save current state as snapshot B if not yet saved, then toggle
      if (!stateSnapshotB) {
        setStateSnapshotB(bassDsp.getParams());
      }
      setActiveState('B');
    } else {
      setActiveState('A');
    }
  };

  const macros = [
    { id: 'sub', label: 'SUB', val: macroSub, min: 0, max: 1, step: 0.01, color: 'accent-cyan-400' },
    { id: 'body', label: 'BODY', val: macroBody, min: 0, max: 1, step: 0.01, color: 'accent-blue-500' },
    { id: 'bite', label: 'BITE', val: macroBite, min: 0, max: 1, step: 0.01, color: 'accent-violet-500' },
    { id: 'growl', label: 'GROWL', val: macroGrowl, min: 0, max: 1, step: 0.01, color: 'accent-purple-500' },
    { id: 'drive', label: 'DRIVE', val: macroDrive, min: 0, max: 1, step: 0.01, color: 'accent-amber-500' },
    { id: 'harmonics', label: 'HARMONICS', val: macroHarmonics, min: 0, max: 1, step: 0.01, color: 'accent-cyan-400' },
    { id: 'punch', label: 'PUNCH', val: macroPunch, min: 0, max: 1, step: 0.01, color: 'accent-blue-400' },
    { id: 'width', label: 'WIDTH', val: macroWidth, min: 0, max: 1, step: 0.01, color: 'accent-indigo-400' },
    { id: 'hearability', label: 'HEARABILITY', val: macroHearability, min: 0, max: 1, step: 0.01, color: 'accent-emerald-400' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Laboratory Control Bar */}
      <div className="bg-[#0b0d13] border border-zinc-800 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Preset Selector */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            Preset:
          </span>
          <select
            value={selectedPresetId}
            onChange={(e) => handleLoadPreset(e.target.value)}
            className="bg-[#08090e] text-cyan-300 font-mono font-bold text-xs px-3 py-1.5 rounded border border-zinc-700 outline-none cursor-pointer max-w-[240px] truncate"
          >
            {BASSFORGE_PRESETS.map((p) => (
              <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                {p.category.toUpperCase()} · {p.name}
              </option>
            ))}
          </select>

          {/* Inspire Me Button */}
          <button
            onClick={handleInspireMe}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-800/80 text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Inspire Me
          </button>
        </div>

        {/* Operating Modes Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#08090e] border border-zinc-800 rounded-lg">
          <button
            onClick={() => setActiveMode('GENERATE')}
            className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors ${
              activeMode === 'GENERATE'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            1. GENERATE
          </button>
          <button
            onClick={() => setActiveMode('SHAPE')}
            className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors ${
              activeMode === 'SHAPE'
                ? 'bg-blue-950 text-blue-300 border border-blue-800 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            2. SHAPE
          </button>
          <button
            onClick={() => setActiveMode('PRE')}
            className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors ${
              activeMode === 'PRE'
                ? 'bg-violet-950 text-violet-300 border border-violet-800 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            3. PREPROCESSOR
          </button>
        </div>

        {/* Master Controls: A/B, Auto Gain Match, Sub Protect */}
        <div className="flex items-center gap-2">
          {/* A/B Switch */}
          <button
            onClick={handleToggleAB}
            className="px-2.5 py-1 text-xs font-mono rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 cursor-pointer flex items-center gap-1"
          >
            <span>State</span>
            <span className="font-bold text-cyan-400">[{activeState}]</span>
          </button>

          {/* Auto Gain Match */}
          <button
            onClick={() => setAutoGainMatch(!autoGainMatch)}
            className={`px-2.5 py-1 text-xs font-mono rounded border cursor-pointer transition-colors ${
              autoGainMatch
                ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300 font-semibold'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
            title="Auto Gain Match prevents loudness bias from misleading the ear"
          >
            Gain Match
          </button>

          {/* Sub Protect */}
          <button
            onClick={() => setSubProtect(!subProtect)}
            className={`px-2.5 py-1 text-xs font-mono rounded border cursor-pointer transition-colors ${
              subProtect
                ? 'bg-cyan-950/70 border-cyan-800 text-cyan-300 font-semibold'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
            title="28Hz steep sub-protect filter to block subsonic DC mud"
          >
            Sub Protect
          </button>
        </div>
      </div>

      {/* R&B / Soul Bass Laboratory Suite */}
      <div className="bg-gradient-to-r from-[#0c0d18] via-[#0e101f] to-[#0c0d18] border border-violet-900/40 rounded-lg p-3.5 space-y-3 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-900/30 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-violet-950/80 border border-violet-700/60 flex items-center justify-center text-pink-400">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider text-pink-200">
                  R&B / SOUL BASS INTEGRATION
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-pink-950/60 text-pink-300 border border-pink-800/40">
                  VOCAL POCKET · NEO-SOUL · TRAPSOUL · 90s SILK
                </span>
              </div>
              <p className="text-[10px] font-mono text-zinc-400">
                Engineered for warm soul pocket, smooth legato glides, and unhindered lead vocal clarity.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Vocal Pocket Carver Toggle */}
            <button
              onClick={toggleVocalPocketCarver}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer border ${
                vocalPocketCarver
                  ? 'bg-pink-950/80 border-pink-500 text-pink-200 font-bold shadow-sm'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Carves a 300-500Hz mid scoop so vocals sit on top while 60Hz sub stays solid"
            >
              <Disc3 className={`w-3.5 h-3.5 ${vocalPocketCarver ? 'text-pink-400 animate-spin' : 'text-zinc-500'}`} />
              <span>Vocal Pocket Carver:</span>
              <span className="font-bold">{vocalPocketCarver ? 'ACTIVE' : 'OFF'}</span>
            </button>

            {/* Warm Harmonics Boost */}
            <button
              onClick={handleWarmHarmonicsBoost}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-violet-950/60 hover:bg-violet-900/80 border border-violet-800/60 text-violet-200 text-xs font-mono cursor-pointer transition-colors"
              title="Injects even 2nd & 4th harmonics with tape saturation for iPhone & earbud clarity"
            >
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>Warm 2nd Harmonic</span>
            </button>

            {/* Toggle Drawer */}
            <button
              onClick={() => setRnbLabOpen(!rnbLabOpen)}
              className="p-1 text-zinc-400 hover:text-white rounded bg-zinc-900/60 border border-zinc-800 cursor-pointer"
            >
              {rnbLabOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {rnbLabOpen && (
          <div className="space-y-2.5">
            {/* 5 Instant R&B Sound Models */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'rnb-neo-soul-p-bass', label: 'Neo-Soul P-Bass', sub: 'Warm Tube Body' },
                { id: 'rnb-trapsoul-glide-808', label: 'Trapsoul 808', sub: 'Long Pitch Glide' },
                { id: 'rnb-90s-silk-moog', label: '90s Silk Moog', sub: '2-Pole Cream Sub' },
                { id: 'rnb-velvet-pocket-sub', label: 'Velvet Pocket Sub', sub: 'Mid-Scoop Vocals' },
                { id: 'rnb-bedroom-lofi-warmth', label: 'Bedroom Lo-Fi', sub: 'Saturated Soul' },
              ].map((m) => {
                const isSelected = selectedPresetId === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleLoadPreset(m.id)}
                    className={`p-2 rounded text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-violet-950/90 border-pink-500/80 text-white shadow-md'
                        : 'bg-[#090b14] border-zinc-800/80 hover:border-violet-700/60 text-zinc-300 hover:text-white'
                    }`}
                  >
                    <div className="text-[11px] font-mono font-bold truncate flex items-center justify-between">
                      <span>{m.label}</span>
                      {isSelected && <Check className="w-3 h-3 text-pink-400" />}
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500 truncate mt-0.5">
                      {m.sub}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* R&B Soul Specific Controls Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 bg-[#090b14] p-2.5 rounded border border-zinc-900 text-xs font-mono">
              {/* Soul Glide Time */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-400">Soul Legato Glide:</span>
                  <span className="text-pink-300 font-bold">{(subLayer.glide * 1000).toFixed(0)} ms</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.2"
                  step="0.005"
                  value={subLayer.glide}
                  onChange={(e) => {
                    const g = parseFloat(e.target.value);
                    setSubLayer((prev) => ({ ...prev, glide: g }));
                  }}
                  className="w-full accent-pink-400 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
                />
                <span className="text-[9px] text-zinc-500 block">
                  Smooth pitch glide for soulful octave leaps & drops
                </span>
              </div>

              {/* R&B Body Warmth Cutoff */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-400">Body Lowpass Warmth:</span>
                  <span className="text-pink-300 font-bold">{(bodyLayer.tone * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.01"
                  value={bodyLayer.tone}
                  onChange={(e) => {
                    const t = parseFloat(e.target.value);
                    setBodyLayer((prev) => ({ ...prev, tone: t }));
                  }}
                  className="w-full accent-violet-400 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
                />
                <span className="text-[9px] text-zinc-500 block">
                  Shapes roundness vs finger attack on bass strings
                </span>
              </div>

              {/* Even Harmonic Warmth (2nd Overtone) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-400">2nd Harmonic (2x F₀):</span>
                  <span className="text-pink-300 font-bold">{(harmonics.h2 * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={harmonics.h2}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setHarmonics((prev) => ({ ...prev, h2: val }));
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
                />
                <span className="text-[9px] text-zinc-500 block">
                  Essential for earbud perception without muddying the vocal pocket
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 9 Large Bass Design Macros (Section 41) */}
      <div className="bg-[#0b0d13] border border-zinc-800 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-zinc-300 tracking-wider uppercase">
            Bass Design Macros
          </span>
          <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
            <span>Intelligent multi-parameter coupling</span>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
          {macros.map((m) => (
            <div
              key={m.id}
              className="bg-[#08090e] border border-zinc-800/80 p-2 rounded flex flex-col justify-between"
            >
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="font-bold text-zinc-300">{m.label}</span>
                <span className="text-zinc-500 font-mono">{(m.val * 100).toFixed(0)}%</span>
              </div>
              <div className="my-2">
                <input
                  type="range"
                  min={m.min}
                  max={m.max}
                  step={m.step}
                  value={m.val}
                  onChange={(e) => handleMacroChange(m.id, parseFloat(e.target.value))}
                  className={`w-full ${m.color} cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Operating Mode Views */}
      {activeMode === 'GENERATE' && (
        <div className="space-y-4">
          <PatternSequencer
            selectedKey={selectedKey}
            selectedScale={selectedScale}
            onKeyChange={setSelectedKey}
            onScaleChange={setSelectedScale}
            onPatternChange={setActivePattern}
          />
        </div>
      )}

      {activeMode === 'SHAPE' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sub Layer Panel */}
          <div className="bg-[#0b0d13] border border-zinc-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-mono font-bold text-cyan-400">SUB LAYER (20-80 Hz)</span>
              <span className="text-[10px] font-mono text-emerald-400">Mono-Locked</span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Level</span>
                  <span className="text-cyan-300">{(subLayer.level * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={subLayer.level}
                  onChange={(e) => setSubLayer({ ...subLayer, level: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Waveform</span>
                  <span className="text-white capitalize">{subLayer.waveform}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['sine', 'triangle', 'square'] as const).map((w) => (
                    <button
                      key={w}
                      onClick={() => setSubLayer({ ...subLayer, waveform: w })}
                      className={`py-1 text-[10px] capitalize rounded border cursor-pointer ${
                        subLayer.waveform === w
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Octave Transpose</span>
                  <span className="text-cyan-300">{subLayer.octave} Oct</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {([-2, -1, 0] as const).map((oct) => (
                    <button
                      key={oct}
                      onClick={() => setSubLayer({ ...subLayer, octave: oct })}
                      className={`py-1 text-[10px] rounded border cursor-pointer ${
                        subLayer.octave === oct
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {oct}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Portamento Glide</span>
                  <span className="text-cyan-300">{(subLayer.glide * 1000).toFixed(0)} ms</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.4"
                  step="0.01"
                  value={subLayer.glide}
                  onChange={(e) => setSubLayer({ ...subLayer, glide: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Sub Decay</span>
                  <span className="text-cyan-300">{subLayer.decay.toFixed(2)} s</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3"
                  step="0.05"
                  value={subLayer.decay}
                  onChange={(e) => setSubLayer({ ...subLayer, decay: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
                />
              </div>
            </div>
          </div>

          {/* Body Layer Panel */}
          <div className="bg-[#0b0d13] border border-zinc-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-mono font-bold text-blue-400">BODY LAYER (80-200 Hz)</span>
              <span className="text-[10px] font-mono text-zinc-400">Physical Punch</span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Level</span>
                  <span className="text-blue-300">{(bodyLayer.level * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={bodyLayer.level}
                  onChange={(e) => setBodyLayer({ ...bodyLayer, level: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Waveform</span>
                  <span className="text-white capitalize">{bodyLayer.waveform}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {(['sawtooth', 'square', 'triangle'] as const).map((w) => (
                    <button
                      key={w}
                      onClick={() => setBodyLayer({ ...bodyLayer, waveform: w })}
                      className={`py-1 text-[10px] capitalize rounded border cursor-pointer ${
                        bodyLayer.waveform === w
                          ? 'bg-blue-950 border-blue-500 text-blue-300 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Tone / Lowpass</span>
                  <span className="text-blue-300">{(bodyLayer.tone * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={bodyLayer.tone}
                  onChange={(e) => setBodyLayer({ ...bodyLayer, tone: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Stereo Width (Above Sub)</span>
                  <span className="text-blue-300">{(bodyLayer.width * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={bodyLayer.width}
                  onChange={(e) => setBodyLayer({ ...bodyLayer, width: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Body Attack / Release</span>
                  <span className="text-zinc-400">
                    {(bodyLayer.attack * 1000).toFixed(0)}ms / {(bodyLayer.release * 1000).toFixed(0)}ms
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="range"
                    min="0.005"
                    max="0.1"
                    step="0.005"
                    value={bodyLayer.attack}
                    onChange={(e) => setBodyLayer({ ...bodyLayer, attack: parseFloat(e.target.value) })}
                    className="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
                  />
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={bodyLayer.release}
                    onChange={(e) => setBodyLayer({ ...bodyLayer, release: parseFloat(e.target.value) })}
                    className="w-full accent-blue-500 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Character Layer Panel */}
          <div className="bg-[#0b0d13] border border-zinc-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-mono font-bold text-violet-400">
                CHARACTER LAYER (FM & Texture)
              </span>
              <span className="text-[10px] font-mono text-zinc-400">Bite & Growl</span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>FM Modulator Amount</span>
                  <span className="text-violet-300">{(characterLayer.fmAmount * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={characterLayer.fmAmount}
                  onChange={(e) =>
                    setCharacterLayer({ ...characterLayer, fmAmount: parseFloat(e.target.value) })
                  }
                  className="w-full accent-violet-500 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Transient Punch Click</span>
                  <span className="text-violet-300">{(characterLayer.punch * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={characterLayer.punch}
                  onChange={(e) =>
                    setCharacterLayer({ ...characterLayer, punch: parseFloat(e.target.value) })
                  }
                  className="w-full accent-violet-500 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Filter Cutoff</span>
                  <span className="text-violet-300">{characterLayer.cutoff.toFixed(0)} Hz</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="50"
                  value={characterLayer.cutoff}
                  onChange={(e) =>
                    setCharacterLayer({ ...characterLayer, cutoff: parseFloat(e.target.value) })
                  }
                  className="w-full accent-violet-500 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1">
                  <span>Resonance (Q)</span>
                  <span className="text-violet-300">{characterLayer.resonance.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.1"
                  value={characterLayer.resonance}
                  onChange={(e) =>
                    setCharacterLayer({ ...characterLayer, resonance: parseFloat(e.target.value) })
                  }
                  className="w-full accent-violet-500 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeMode === 'PRE' && (
        <div className="bg-[#0b0d13] border border-zinc-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div>
              <span className="text-xs font-mono font-bold text-white tracking-wider">
                BASS PREPROCESSOR SIGNAL ARCHITECTURE
              </span>
              <div className="text-[11px] font-mono text-zinc-400">
                Sub Protection · Multi-Band Split · Harmonic Enrichment · Controlled Output
              </div>
            </div>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
              NON-DESTRUCTIVE SIGNAL CHAIN
            </span>
          </div>

          {/* Interactive Visual Signal Flow Diagram */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <div className="p-3 rounded bg-[#08090e] border border-zinc-800 text-center">
              <div className="text-[10px] font-mono text-zinc-500">STAGE 1</div>
              <div className="text-xs font-mono font-bold text-zinc-200 mt-1">INPUT GAIN</div>
              <div className="text-[10px] font-mono text-cyan-400 mt-1">0.0 dB</div>
            </div>

            <div className="p-3 rounded bg-[#08090e] border border-cyan-800/60 text-center">
              <div className="text-[10px] font-mono text-cyan-500">STAGE 2</div>
              <div className="text-xs font-mono font-bold text-cyan-300 mt-1">SUB PROTECT</div>
              <div className="text-[10px] font-mono text-zinc-400 mt-1">28 Hz 24dB HPF</div>
            </div>

            <div className="p-3 rounded bg-[#08090e] border border-blue-800/60 text-center">
              <div className="text-[10px] font-mono text-blue-500">STAGE 3</div>
              <div className="text-xs font-mono font-bold text-blue-300 mt-1">4-WAY SPLIT</div>
              <div className="text-[10px] font-mono text-zinc-400 mt-1">80 / 180 / 600 Hz</div>
            </div>

            <div className="p-3 rounded bg-[#08090e] border border-violet-800/60 text-center">
              <div className="text-[10px] font-mono text-violet-500">STAGE 4</div>
              <div className="text-xs font-mono font-bold text-violet-300 mt-1">HARMONIC INJECT</div>
              <div className="text-[10px] font-mono text-zinc-400 mt-1">2nd & 3rd Focus</div>
            </div>

            <div className="p-3 rounded bg-[#08090e] border border-amber-800/60 text-center">
              <div className="text-[10px] font-mono text-amber-500">STAGE 5</div>
              <div className="text-xs font-mono font-bold text-amber-300 mt-1">DISTORTION</div>
              <div className="text-[10px] font-mono text-zinc-400 mt-1">{distortion.type}</div>
            </div>

            <div className="p-3 rounded bg-[#08090e] border border-emerald-800/60 text-center">
              <div className="text-[10px] font-mono text-emerald-500">STAGE 6</div>
              <div className="text-xs font-mono font-bold text-emerald-300 mt-1">GAIN MATCH</div>
              <div className="text-[10px] font-mono text-zinc-400 mt-1">True RMS Parity</div>
            </div>
          </div>
        </div>
      )}

      {/* Center Deck: Spectrum & Multi-Band Analyzer */}
      <BassSpectrumVisualizer
        fundamentalFreq={fundamentalFreq}
        speakerTarget={speakerTarget}
      />

      {/* Harmonic Engine & Distortion Processing Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HarmonicsSection
          harmonics={harmonics}
          fundamentalFreq={fundamentalFreq}
          onChange={setHarmonics}
        />

        <DistortionSection
          distortion={distortion}
          onChange={setDistortion}
        />
      </div>

      {/* Hearability Diagnostic Panel */}
      <HearabilityPanel
        currentTarget={speakerTarget}
        onSelectTarget={setSpeakerTarget}
        onAutoInjectHarmonics={handleAutoInjectHarmonics}
      />

      {/* Low-Frequency Audition Bass Roll */}
      <BassKeyboardVisualizer
        selectedKey={selectedKey}
        selectedScale={selectedScale}
        onNoteTriggered={(midi, freq) => setFundamentalFreq(freq)}
      />
    </div>
  );
};
