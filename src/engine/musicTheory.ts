import {
  PitchClassName,
  ScaleTypeName,
  NoteInfo,
  PatternStep,
  InterpretationMode,
  SafetyLevel,
  MusicalIntent,
} from '../types/music';

export const PITCH_CLASSES: PitchClassName[] = [
  'C',
  'C#',
  'Db',
  'D',
  'D#',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'G#',
  'Ab',
  'A',
  'A#',
  'Bb',
  'B',
];

export const PITCH_CLASS_TO_SEMITONE: Record<PitchClassName, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
};

export const SCALE_DEFINITIONS: Record<ScaleTypeName, number[]> = {
  'Natural Minor': [0, 2, 3, 5, 7, 8, 10],
  Major: [0, 2, 4, 5, 7, 9, 11],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
  Aeolian: [0, 2, 3, 5, 7, 8, 10],
  Locrian: [0, 1, 3, 5, 6, 8, 10],
  'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
  'Melodic Minor': [0, 2, 3, 5, 7, 9, 11],
  'Pentatonic Minor': [0, 3, 5, 7, 10],
  Blues: [0, 3, 5, 6, 7, 10],
};

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function midiToNoteName(midi: number): string {
  const pitch = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${pitch}${octave}`;
}

export function getNoteInfo(midi: number): NoteInfo {
  const pitchClass = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][midi % 12] as PitchClassName;
  const octave = Math.floor(midi / 12) - 1;
  return {
    midi,
    pitchClass,
    octave,
    name: `${pitchClass}${octave}`,
    frequencyHz: midiToFrequency(midi),
  };
}

export function getScaleNotes(key: PitchClassName, scale: ScaleTypeName, octave = 1): NoteInfo[] {
  const rootIndex = PITCH_CLASS_TO_SEMITONE[key] ?? 0;
  const intervals = SCALE_DEFINITIONS[scale] || SCALE_DEFINITIONS['Natural Minor'];
  const baseMidi = (octave + 1) * 12 + rootIndex;

  return intervals.map((interval) => {
    const midi = baseMidi + interval;
    return getNoteInfo(midi);
  });
}

export interface ChordSpec {
  root: PitchClassName;
  quality: 'min' | 'maj' | 'dim' | 'aug' | 'sus4' | '7';
  displayName: string;
}

export function parseChordName(chordStr: string): ChordSpec {
  const cleaned = chordStr.trim();
  if (!cleaned) return { root: 'C', quality: 'min', displayName: 'Cm' };

  let rootPart = cleaned.charAt(0).toUpperCase();
  let rest = cleaned.slice(1);

  if (rest.startsWith('#') || rest.startsWith('b')) {
    rootPart += rest.charAt(0);
    rest = rest.slice(1);
  }

  let quality: ChordSpec['quality'] = 'maj';
  if (rest.startsWith('m7') || rest.startsWith('m9') || rest.startsWith('m11') || (rest.startsWith('m') && !rest.startsWith('maj'))) {
    quality = 'min';
  } else if (rest.startsWith('dim')) {
    quality = 'dim';
  } else if (rest.startsWith('aug')) {
    quality = 'aug';
  } else if (rest.startsWith('sus')) {
    quality = 'sus4';
  } else if (rest.startsWith('7') || rest.startsWith('9') || rest.startsWith('13')) {
    quality = '7';
  }

  const validRoot = (PITCH_CLASS_TO_SEMITONE[rootPart as PitchClassName] !== undefined)
    ? (rootPart as PitchClassName)
    : 'C';

  return {
    root: validRoot,
    quality,
    displayName: cleaned,
  };
}

export interface RnbProgressionTemplate {
  name: string;
  subgenre: string;
  chords: string[];
  key: PitchClassName;
  scale: ScaleTypeName;
  suggestedBpm: number;
  description: string;
}

export const RNB_PROGRESSION_TEMPLATES: RnbProgressionTemplate[] = [
  {
    name: 'Neo-Soul Silk ii-V-I-vi',
    subgenre: 'Neo-Soul',
    chords: ['Dm7', 'G7', 'Cmaj7', 'Am7'],
    key: 'C',
    scale: 'Major',
    suggestedBpm: 82,
    description: 'Classic velvety neo-soul progression with warm chromatic bass walks and sweet resolving cadences.',
  },
  {
    name: 'Trapsoul Midnight i-VI-III-VII',
    subgenre: 'Trapsoul',
    chords: ['Fm', 'Db', 'Ab', 'Eb'],
    key: 'F',
    scale: 'Natural Minor',
    suggestedBpm: 128,
    description: 'Moody, emotive half-time minor progression popular in contemporary OVO & Bryson Tiller trapsoul.',
  },
  {
    name: '90s Golden Era R&B iv-v-i',
    subgenre: '90s R&B',
    chords: ['Cm', 'Fm', 'Bb', 'Gm'],
    key: 'C',
    scale: 'Natural Minor',
    suggestedBpm: 92,
    description: 'Smooth, nostalgic slow jam changes inspired by Babyface, Boyz II Men, and Teddy Riley.',
  },
  {
    name: 'Velvet Bedroom Soul 2-5-1-6',
    subgenre: 'Modern Bedroom R&B',
    chords: ['Ebm9', 'Ab7', 'Dbmaj7', 'Bbm7'],
    key: 'Db',
    scale: 'Major',
    suggestedBpm: 78,
    description: 'Lush extended minor 9th and major 7th harmony crafted for intimate chill vocal mixes.',
  },
  {
    name: 'Gospel-Inflected R&B Turnaround',
    subgenre: 'Soul / Gospel',
    chords: ['Abmaj7', 'Gm7', 'Fm7', 'Ebmaj7'],
    key: 'Eb',
    scale: 'Major',
    suggestedBpm: 75,
    description: 'Step-wise descending gospel/soul movement with rich bass counter-melodies.',
  },
];

// Generate an intelligent 16-step bass pattern
export function generateBassPattern(options: {
  key: PitchClassName;
  scale: ScaleTypeName;
  progression: string[];
  mode: InterpretationMode;
  safety: SafetyLevel;
  intent: MusicalIntent;
  baseOctave: number; // e.g. 1 (C1 = MIDI 24 or 36)
}): PatternStep[] {
  const { key, scale, progression, mode, safety, intent, baseOctave } = options;
  const chords = progression.length > 0 ? progression.map(parseChordName) : [parseChordName('Cm')];
  const scaleNotes = getScaleNotes(key, scale, baseOctave);
  const rootIndex = PITCH_CLASSES.indexOf(key);

  const steps: PatternStep[] = [];
  const stepsPerChord = Math.max(1, Math.floor(16 / chords.length));

  // Determine rhythmic density and accents based on Intent
  let defaultActiveDensity = 0.6;
  if (intent === 'Driving') defaultActiveDensity = 0.85;
  if (intent === 'Minimal') defaultActiveDensity = 0.35;
  if (intent === 'Aggressive') defaultActiveDensity = 0.75;
  if (intent === '808 Sub') defaultActiveDensity = 0.4;
  if (intent === 'Funky') defaultActiveDensity = 0.7;
  if (intent === 'R&B / Soul') defaultActiveDensity = 0.55;

  for (let s = 0; s < 16; s++) {
    const chordIndex = Math.min(chords.length - 1, Math.floor(s / stepsPerChord));
    const currentChord = chords[chordIndex];
    const chordStep = s % stepsPerChord;

    // Is step active?
    let isActive = false;
    let isAccent = false;
    let isSlide = false;
    let noteMidi = (baseOctave + 1) * 12 + (PITCH_CLASS_TO_SEMITONE[currentChord.root] ?? 0);

    // Basic cadence logic
    if (chordStep === 0) {
      isActive = true;
      isAccent = true;
    } else if (intent === 'Driving') {
      isActive = true;
      if (chordStep % 2 === 0) isAccent = true;
    } else if (intent === '808 Sub') {
      isActive = chordStep === 0 || (chordStep === 2 && s > 8);
      isSlide = chordStep === 2;
    } else if (intent === 'Funky') {
      const syncPattern = [true, false, true, true, false, true, false, true];
      isActive = syncPattern[s % 8];
      isAccent = chordStep === 0 || chordStep === 3;
    } else if (intent === 'R&B / Soul') {
      // Authentic R&B soul pocket: heavy root downbeat, syncopated offbeat tap, and chromatic glide into chord change
      if (chordStep === 0) {
        isActive = true;
        isAccent = true;
      } else if (stepsPerChord >= 4 && chordStep === 2) {
        isActive = true;
      } else if (chordStep === stepsPerChord - 1 && stepsPerChord > 2) {
        isActive = true;
        isSlide = true;
      } else if (s === 6 || s === 14) {
        isActive = true;
      }
    } else {
      // Balanced rhythm
      isActive = chordStep === 0 || chordStep === 2 || (chordStep === 3 && s % 4 === 3);
    }

    // Determine Pitch based on Interpretation Mode and Safety
    const chordRootMidi = (baseOctave + 1) * 12 + (PITCH_CLASS_TO_SEMITONE[currentChord.root] ?? 0);
    const fifthMidi = chordRootMidi + 7;
    const octaveMidi = chordRootMidi + 12;
    const thirdInterval = currentChord.quality === 'min' ? 3 : 4;
    const thirdMidi = chordRootMidi + thirdInterval;

    if (mode === 'ROOT') {
      noteMidi = chordRootMidi;
      // Slight octave lift on last step of chord if balanced or adventurous
      if (chordStep === stepsPerChord - 1 && safety !== 'SAFE' && chordStep > 0) {
        noteMidi = octaveMidi;
      }
    } else if (mode === 'ROOT + FIFTH') {
      if (chordStep === 0) {
        noteMidi = chordRootMidi;
      } else if (chordStep % 2 === 1) {
        noteMidi = fifthMidi;
      } else {
        noteMidi = chordRootMidi;
      }
    } else if (mode === 'ROOT + OCTAVE') {
      noteMidi = chordStep % 2 === 0 ? chordRootMidi : octaveMidi;
    } else if (mode === 'MOVEMENT') {
      if (chordStep === 0) {
        noteMidi = chordRootMidi;
      } else if (chordStep === 1) {
        noteMidi = thirdMidi;
      } else if (chordStep === 2) {
        noteMidi = fifthMidi;
      } else {
        // Passing tone / leading tone depending on safety
        if (safety === 'ADVENTUROUS') {
          // Approach next chord root
          const nextChordIndex = (chordIndex + 1) % chords.length;
          const nextRootMidi = (baseOctave + 1) * 12 + (PITCH_CLASS_TO_SEMITONE[chords[nextChordIndex].root] ?? 0);
          noteMidi = nextRootMidi > chordRootMidi ? nextRootMidi - 1 : nextRootMidi + 1;
        } else {
          noteMidi = thirdMidi;
        }
      }
    } else if (mode === 'GROOVE') {
      if (chordStep === 0) {
        noteMidi = chordRootMidi;
      } else if (chordStep === 1) {
        noteMidi = chordRootMidi;
      } else if (chordStep === 2) {
        noteMidi = fifthMidi;
      } else if (chordStep === 3) {
        noteMidi = safety === 'SAFE' ? octaveMidi : chordRootMidi + 10; // minor 7th funk bounce
      }
    }

    if (intent === 'R&B / Soul') {
      const nextChordIndex = (chordIndex + 1) % chords.length;
      const nextRootMidi = (baseOctave + 1) * 12 + (PITCH_CLASS_TO_SEMITONE[chords[nextChordIndex].root] ?? 0);
      if (chordStep === 0) {
        noteMidi = chordRootMidi;
      } else if (chordStep === stepsPerChord - 1 && stepsPerChord > 1) {
        // Soul chromatic approach into upcoming chord root
        noteMidi = nextRootMidi > chordRootMidi ? nextRootMidi - 1 : nextRootMidi + 1;
        isSlide = true;
      } else if (chordStep === 2) {
        noteMidi = fifthMidi;
      } else if (chordStep === 1) {
        noteMidi = thirdMidi;
      } else {
        noteMidi = chordRootMidi + (currentChord.quality === 'min' ? 10 : 9); // smooth 7th/6th pocket
      }
    }

    // Keep within musical bass range (MIDI 24 / C1 to 48 / C3)
    while (noteMidi < 24) noteMidi += 12;
    while (noteMidi > 50) noteMidi -= 12;

    let velocity = isAccent ? 120 : isActive ? 95 : 0;
    if (intent === 'R&B / Soul' && isActive) {
      if (isAccent) {
        velocity = 114;
      } else if (isSlide) {
        velocity = 88;
      } else {
        velocity = 82; // mellow dynamic soul ghost note
      }
    }

    const noteInfo = getNoteInfo(noteMidi);

    steps.push({
      step: s + 1,
      active: isActive,
      midiNote: noteMidi,
      noteName: noteInfo.name,
      velocity: isActive ? velocity : 90,
      durationSteps: intent === '808 Sub' ? 2 : intent === 'R&B / Soul' ? (chordStep === 0 ? 2 : 1) : 1,
      slide: isSlide,
      accent: isAccent,
    });
  }

  return steps;
}
