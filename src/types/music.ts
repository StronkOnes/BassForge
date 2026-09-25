export type PitchClassName =
  | 'C'
  | 'C#'
  | 'Db'
  | 'D'
  | 'D#'
  | 'Eb'
  | 'E'
  | 'F'
  | 'F#'
  | 'Gb'
  | 'G'
  | 'G#'
  | 'Ab'
  | 'A'
  | 'A#'
  | 'Bb'
  | 'B';

export type ScaleTypeName =
  | 'Natural Minor'
  | 'Major'
  | 'Dorian'
  | 'Phrygian'
  | 'Lydian'
  | 'Mixolydian'
  | 'Aeolian'
  | 'Locrian'
  | 'Harmonic Minor'
  | 'Melodic Minor'
  | 'Pentatonic Minor'
  | 'Blues';

export type OperatingMode = 'GENERATE' | 'SHAPE' | 'PRE';

export type SpeakerTarget =
  | 'FULL RANGE'
  | 'HEADPHONES'
  | 'PHONE'
  | 'LAPTOP'
  | 'SMALL SPEAKER'
  | 'CAR'
  | 'MONO CLUB';

export type DistortionType =
  | 'Soft Clip'
  | 'Hard Clip'
  | 'Tube'
  | 'Tape'
  | 'Diode'
  | 'Transistor'
  | 'Wavefold'
  | 'Bit Reduction';

export type MusicalIntent =
  | 'Driving'
  | 'Dark'
  | 'Aggressive'
  | '808 Sub'
  | 'Melodic'
  | 'Minimal'
  | 'Funky'
  | 'Hypnotic'
  | 'Reese'
  | 'Cinematic'
  | 'R&B / Soul';

export type SafetyLevel = 'SAFE' | 'BALANCED' | 'ADVENTUROUS';

export type InterpretationMode =
  | 'ROOT'
  | 'ROOT + FIFTH'
  | 'ROOT + OCTAVE'
  | 'MOVEMENT'
  | 'GROOVE';

export interface NoteInfo {
  midi: number;
  pitchClass: PitchClassName;
  octave: number;
  name: string; // e.g. "C1"
  frequencyHz: number;
}

export interface PatternStep {
  step: number;
  active: boolean;
  midiNote: number;
  noteName: string;
  velocity: number; // 0 - 127
  durationSteps: number; // 1 to 4
  slide: boolean;
  accent: boolean;
}

export interface HarmonicsConfig {
  h2: number; // 2nd harmonic (2x) 0 - 1
  h3: number; // 3rd harmonic (3x) 0 - 1
  h4: number; // 4th harmonic (4x) 0 - 1
  h5: number; // 5th harmonic (5x) 0 - 1
  h7: number; // 7th harmonic (7x) 0 - 1
  h9: number; // 9th harmonic (9x) 0 - 1
  evenOddBalance: number; // -1 (odd) to +1 (even)
  spread: number; // 0 - 1
  focus: number; // 0 - 1
}

export interface DistortionConfig {
  type: DistortionType;
  drive: number; // 0 - 1
  bias: number; // -1 to 1
  tone: number; // 0 - 1
  mix: number; // 0 - 1
  stage: number; // 1 to 4
}

export interface SubLayerConfig {
  level: number; // 0 - 1
  waveform: 'sine' | 'triangle' | 'square';
  octave: -2 | -1 | 0;
  glide: number; // 0 - 1 (seconds: 0 to 0.4s)
  decay: number; // 0.1 to 3s
  monoLock: boolean;
}

export interface BodyLayerConfig {
  level: number; // 0 - 1
  waveform: 'sawtooth' | 'square' | 'triangle';
  tone: number; // 0 - 1 (LPF cutoff 80Hz - 2500Hz)
  saturation: number; // 0 - 1
  attack: number; // 0.005 - 0.2s
  decay: number; // 0.1 - 2.0s
  sustain: number; // 0 - 1
  release: number; // 0.05 - 1.5s
  width: number; // 0 - 1 (mono below crossover)
}

export interface CharacterLayerConfig {
  fmAmount: number; // 0 - 1
  bite: number; // 0 - 1
  growl: number; // 0 - 1
  punch: number; // 0 - 1
  cutoff: number; // Hz (100 - 6000)
  resonance: number; // 0.5 - 12
}

export interface HearabilityAnalysis {
  fundamentalEnergy: number; // 0 - 100
  bodyEnergy: number; // 0 - 100
  upperHarmonicEnergy: number; // 0 - 100
  smallSpeakerScore: number; // 0 - 100%
  lowFrequencyDependence: 'Balanced' | 'Moderate' | 'High';
  recommendation: string;
}

export interface BassHealthMetrics {
  subStability: 'Optimal' | 'Caution' | 'Phase Risk';
  monoCompatibility: number; // 0 - 1.0 (correlation)
  harmonicRichness: 'Pure Sine' | 'Balanced' | 'Rich' | 'Saturated';
  dynamicConsistency: number; // dB crest factor
  upperBassPresence: 'Low' | 'Moderate' | 'Optimal' | 'Aggressive';
}

export interface PreprocessorConfig {
  inputGain: number; // -12dB to +12dB
  subProtectFreq: number; // 25Hz - 45Hz
  subProtectActive: boolean;
  subCrossoverFreq: number; // 80Hz
  bodyCrossoverFreq: number; // 180Hz
  charCrossoverFreq: number; // 600Hz
  autoGainMatch: boolean;
  dryWetMix: number; // 0 - 1
}

export interface BassPreset {
  id: string;
  name: string;
  category:
    | 'Sub'
    | '808'
    | 'Reese'
    | 'Synth Bass'
    | 'Distorted'
    | 'Modern Electronic'
    | 'Hip-Hop / Trap'
    | 'Cinematic'
    | 'R&B / Soul';
  description: string;
  mode: OperatingMode;
  recommendedKey: PitchClassName;
  recommendedScale: ScaleTypeName;
  intent: MusicalIntent;
  sub: SubLayerConfig;
  body: BodyLayerConfig;
  character: CharacterLayerConfig;
  harmonics: HarmonicsConfig;
  distortion: DistortionConfig;
  hearabilityMacro: number;
}
