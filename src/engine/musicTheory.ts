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
  'Natural Minor': [0, 2, 3, 5, 7, 8, 10], // Aeolian (Ch. 3)
  Major: [0, 2, 4, 5, 7, 9, 11], // Ionian (Ch. 2)
  Dorian: [0, 2, 3, 5, 7, 9, 10], // Ch. 31.9.3
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10], // Dominant 7th scale (Ch. 31.9.3)
  Aeolian: [0, 2, 3, 5, 7, 8, 10],
  Locrian: [0, 1, 3, 5, 6, 8, 10],
  'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11], // Raised 7th (Ch. 3.1)
  'Melodic Minor': [0, 2, 3, 5, 7, 9, 11], // Raised 6th & 7th (Ch. 3.1)
  'Pentatonic Minor': [0, 3, 5, 7, 10],
  Blues: [0, 3, 5, 6, 7, 10], // Minor pentatonic + b5 blue note (Ch. 31.9.1)
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
  quality: 'maj' | 'min' | 'dim' | 'aug' | 'sus4' | '7' | 'maj7' | 'min7' | 'm9' | '9';
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
  if (rest.startsWith('m9') || rest.startsWith('min9') || rest.startsWith('m11')) {
    quality = 'm9';
  } else if (rest.startsWith('m7') || rest.startsWith('min7') || rest.startsWith('-7')) {
    quality = 'min7';
  } else if (rest.startsWith('maj7') || rest.startsWith('M7') || rest.startsWith('Δ7')) {
    quality = 'maj7';
  } else if (rest.startsWith('dim') || rest.startsWith('°') || rest.startsWith('o')) {
    quality = 'dim';
  } else if (rest.startsWith('aug') || rest.startsWith('+')) {
    quality = 'aug';
  } else if (rest.startsWith('sus')) {
    quality = 'sus4';
  } else if (rest.startsWith('9') || rest.startsWith('13')) {
    quality = '9';
  } else if (rest.startsWith('7')) {
    quality = '7';
  } else if (rest.startsWith('m') || rest.startsWith('min') || rest.startsWith('-')) {
    quality = 'min';
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

/**
 * Standard Harmonic Progressions catalogued from Robert Hutchinson's
 * "Music Theory for the 21st-Century Classroom" (Chapters 7, 9, 14, 19, 21, 31)
 */
export interface TheoryProgression {
  id: string;
  name: string;
  category: 'R&B / Soul' | 'Pop & Rock' | 'Jazz & Blues' | 'Classical & Baroque' | 'Chromatic & Modern';
  chords: string[];
  key: PitchClassName;
  scale: ScaleTypeName;
  suggestedBpm: number;
  chapterRef: string;
  theoryNotes: string;
}

export const THEORY_PROGRESSIONS: TheoryProgression[] = [
  // 1. R&B & Neo-Soul
  {
    id: 'rnb-neosoul-2516',
    name: 'Neo-Soul ii-V-I-vi (Dm9 - G13 - Cmaj9 - Am9)',
    category: 'R&B / Soul',
    chords: ['Dm9', 'G13', 'Cmaj9', 'Am9'],
    key: 'C',
    scale: 'Major',
    suggestedBpm: 82,
    chapterRef: 'Ch. 31.8.1 & 14.4',
    theoryNotes: 'Smooth voice-leading with extended 9ths and 13ths. Bass features chromatic leading tones on beat 4.',
  },
  {
    id: 'rnb-trapsoul-ovo',
    name: 'Trapsoul i-VI-III-VII (Fm - Db - Ab - Eb)',
    category: 'R&B / Soul',
    chords: ['Fm', 'Db', 'Ab', 'Eb'],
    key: 'F',
    scale: 'Natural Minor',
    suggestedBpm: 126,
    chapterRef: 'Ch. 9.7 & 14.6',
    theoryNotes: 'Moody minor rotation of the best-seller progression with sub-octave glides and 16th syncopations.',
  },
  {
    id: 'rnb-slowjam-90s',
    name: '90s Silk Slow Jam iv-v-i (Cm - Fm7 - Bb9 - Gm7)',
    category: 'R&B / Soul',
    chords: ['Cm', 'Fm7', 'Bb9', 'Gm7'],
    key: 'C',
    scale: 'Natural Minor',
    suggestedBpm: 90,
    chapterRef: 'Ch. 9.8 & 14.4.1',
    theoryNotes: 'Sensual slow jam harmonic movement with syncopated "1 (2) &" rhythm and laid-back groove.',
  },
  {
    id: 'rnb-bedroom-velvet',
    name: 'Velvet Bedroom Soul (Ebm9 - Ab13 - Dbmaj9 - Bbm9)',
    category: 'R&B / Soul',
    chords: ['Ebm9', 'Ab13', 'Dbmaj9', 'Bbm9'],
    key: 'Db',
    scale: 'Major',
    suggestedBpm: 78,
    chapterRef: 'Ch. 31.8.2',
    theoryNotes: 'Lush 5-voice spread voicings. Bass plays roots with 5th and minor 7th guide-tone counterpoint.',
  },

  // 2. Pop & Rock Standards
  {
    id: 'pop-bestseller',
    name: 'The "Best-Seller" Progression I-V-vi-IV (C - G - Am - F)',
    category: 'Pop & Rock',
    chords: ['C', 'G', 'Am', 'F'],
    key: 'C',
    scale: 'Major',
    suggestedBpm: 120,
    chapterRef: 'Ch. 9.7 (Fig. 9.7.1)',
    theoryNotes: 'The most ubiquitous progression in modern music. Connects Tonic to Dominant to Tonic-Prolongation to Pre-Dominant.',
  },
  {
    id: 'pop-50s-doowop',
    name: '50s Doo-Wop I-vi-ii-V (C - Am - Dm - G7)',
    category: 'Pop & Rock',
    chords: ['C', 'Am', 'Dm', 'G7'],
    key: 'C',
    scale: 'Major',
    suggestedBpm: 112,
    chapterRef: 'Ch. 9.3.2.2 & 14.4.3',
    theoryNotes: 'Classic turnaround progression with descending thirds root motion and authentic dominant resolution.',
  },
  {
    id: 'pop-andalusian-minor',
    name: 'Andalusian Minor i-VII-VI-VII (Am - G - F - G)',
    category: 'Pop & Rock',
    chords: ['Am', 'G', 'F', 'G'],
    key: 'A',
    scale: 'Natural Minor',
    suggestedBpm: 118,
    chapterRef: 'Ch. 9.8 (Fig. 9.8.1)',
    theoryNotes: 'Descending stepwise motion from tonic to subtonic to submediant, generating constant harmonic drive.',
  },

  // 3. Jazz & Blues
  {
    id: 'jazz-251-major',
    name: 'Standard Jazz ii-V-I Turnaround (Dm7 - G7 - Cmaj7 - A7)',
    category: 'Jazz & Blues',
    chords: ['Dm7', 'G7', 'Cmaj7', 'A7'],
    key: 'C',
    scale: 'Major',
    suggestedBpm: 130,
    chapterRef: 'Ch. 31.8.1 (Fig. 31.8.1)',
    theoryNotes: 'Circle of fifths jazz foundation with A7 acting as secondary dominant V7/ii (Ch. 17).',
  },
  {
    id: 'jazz-12bar-blues',
    name: 'Standard 12-Bar Blues (C7 - F7 - G7)',
    category: 'Jazz & Blues',
    chords: ['C7', 'C7', 'F7', 'C7', 'F7', 'F7', 'C7', 'C7', 'G7', 'F7', 'C7', 'G7'],
    key: 'C',
    scale: 'Blues',
    suggestedBpm: 115,
    chapterRef: 'Ch. 12.4 & 31.8.3',
    theoryNotes: 'Traditional blues form utilizing dominant 7th chords on scale degrees 1, 4, and 5 with blue notes (b3, b5).',
  },

  // 4. Classical & Chromatic
  {
    id: 'classical-circle-fifths',
    name: 'Baroque Circle of Fifths (Am - Dm - G - C - F - Bdim - E - Am)',
    category: 'Classical & Baroque',
    chords: ['Am', 'Dm', 'G', 'C', 'F', 'Bdim', 'E', 'Am'],
    key: 'A',
    scale: 'Natural Minor',
    suggestedBpm: 104,
    chapterRef: 'Ch. 9.1 (Fig. 9.1.1)',
    theoryNotes: 'Bach & Vivaldi circle of descending fifths (i - iv - VII - III - VI - ii° - V - i) with inexorable forward momentum.',
  },
  {
    id: 'chromatic-lament-ground',
    name: 'Descending Chromatic Bass Line (Cm - G/B - C7/Bb - F/A - Fm/Ab - G)',
    category: 'Chromatic & Modern',
    chords: ['Cm', 'G', 'C7', 'F', 'Fm', 'G'],
    key: 'C',
    scale: 'Harmonic Minor',
    suggestedBpm: 72,
    chapterRef: 'Ch. 21.6 (Purcell / Led Zeppelin)',
    theoryNotes: 'Stepwise chromatic bass descent 1 - 7 - b7 - 6 - b6 - 5 utilizing secondary dominants and mode mixture.',
  },
  {
    id: 'rnb-september-circle',
    name: 'Earth, Wind & Fire "September" ii-V-iii-vi (Bm7 - E7 - C#m7 - F#m7)',
    category: 'R&B / Soul',
    chords: ['Bm7', 'E', 'C#m7', 'F#m7'],
    key: 'A',
    scale: 'Major',
    suggestedBpm: 120,
    chapterRef: 'Ch. 9.3.3 (Fig. 9.3.12)',
    theoryNotes: 'The iconic rotated circle-of-fifths turnaround (ii - V - iii - vi). Upbeat syncopations with octave bass pops.',
  },
  {
    id: 'pop-creep-modemixture',
    name: 'Radiohead "Creep" Mode Mixture I - V/vi - IV - iv (G - B - C - Cm)',
    category: 'Pop & Rock',
    chords: ['G', 'B', 'C', 'Cm'],
    key: 'G',
    scale: 'Major',
    suggestedBpm: 92,
    chapterRef: 'Ch. 19.1 (Fig. 19.1.7)',
    theoryNotes: 'Major-to-minor borrowed subdominant iv (Cm) with mournful flat-6 scale degree and secondary dominant V/vi.',
  },
  {
    id: 'rnb-sirduke-chromatic',
    name: 'Stevie Wonder "Sir Duke" Soul Walk (B - G#m - C#m - F#7)',
    category: 'R&B / Soul',
    chords: ['B', 'G#m', 'C#m', 'F#'],
    key: 'B',
    scale: 'Major',
    suggestedBpm: 106,
    chapterRef: 'Ch. 11.2.5 & 14.7',
    theoryNotes: 'Infectious melodic bass ornamentations with passing chromatic runs, octave bounces, and horn-section syncopation.',
  },
  {
    id: 'gospel-leanonme-steps',
    name: 'Bill Withers "Lean on Me" Stepwise Ascent (C - Dm - Em - F)',
    category: 'R&B / Soul',
    chords: ['C', 'Dm', 'Em', 'F'],
    key: 'C',
    scale: 'Major',
    suggestedBpm: 80,
    chapterRef: 'Ch. 13.3.2 (Fig. 13.3.5)',
    theoryNotes: 'Diatonic stepwise walking bass progression connecting tonic through supertonic, mediant to subdominant.',
  },
];

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
    name: 'Neo-Soul Smooth 2-5-1-6',
    subgenre: 'Neo-Soul',
    chords: ['Dm7', 'G7', 'Cmaj7', 'Am7'],
    key: 'C',
    scale: 'Major',
    suggestedBpm: 82,
    description: 'Classic circular ii-V-I-vi progression with walking chromatic transitions.',
  },
  {
    name: 'Trapsoul Moody Glide',
    subgenre: 'Trapsoul',
    chords: ['Fm', 'Db', 'Ab', 'Eb'],
    key: 'F',
    scale: 'Natural Minor',
    suggestedBpm: 128,
    description: 'Moody minor progression featuring sustained 808 pitch glides.',
  },
  {
    name: '90s Silk Slow Jam',
    subgenre: '90s Silk',
    chords: ['Cm', 'Fm', 'Bb', 'Gm'],
    key: 'C',
    scale: 'Natural Minor',
    suggestedBpm: 92,
    description: 'Silky smooth minor iv-v-i ballad changes.',
  },
  {
    name: 'Velvet Bedroom 2-5-1',
    subgenre: 'Bedroom Soul',
    chords: ['Ebm9', 'Ab7', 'Dbmaj7', 'Bbm7'],
    key: 'Db',
    scale: 'Major',
    suggestedBpm: 78,
    description: 'Rich extended harmony with deep sub-bass pocket and scooped vocal notch.',
  },
  {
    name: 'Lo-Fi Gospel Neo-Soul',
    subgenre: 'Lo-Fi Gospel',
    chords: ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7'],
    key: 'C',
    scale: 'Major',
    suggestedBpm: 74,
    description: 'Descending stepwise diatonic progression with rich chromatic passing tones.',
  },
];

export type BassAccompanimentStyle =
  | 'walking-jazz'
  | 'rnb-soul-pocket'
  | 'syncopated-clave'
  | 'descending-chromatic'
  | 'alberti-arpeggio'
  | 'trap-808-glide'
  | 'driving-eighths'
  | 'funk-syncopated'
  | 'ballad-one-two-and';

export interface GenerationOptions {
  key: PitchClassName;
  scale: ScaleTypeName;
  progression: string[];
  style: BassAccompanimentStyle;
  safety: SafetyLevel;
  intent: MusicalIntent;
  baseOctave: number; // e.g. 1
  variationSeed: number; // Randomizer seed to ensure every generation is fresh & unique!
  nonChordTones: 'chord-tones-only' | 'diatonic-passing' | 'chromatic-approach' | 'full-expressive';
  subphraseTransformation?: 'none' | 'inversion' | 'rhythmic-shift' | 'retrograde';
}

/**
 * High-Level Intelligent Music-Theory Bassline Generator
 * Implements Voice Leading (Ch. 26), Non-Chord Tones (Ch. 10),
 * Accompaniment Textures (Ch. 14), and Motivic Alteration (Ch. 11).
 */
export function generateBassPattern(options: {
  key: PitchClassName;
  scale: ScaleTypeName;
  progression: string[];
  mode?: InterpretationMode;
  safety?: SafetyLevel;
  intent?: MusicalIntent;
  baseOctave?: number;
  style?: BassAccompanimentStyle;
  variationSeed?: number;
  nonChordTones?: 'chord-tones-only' | 'diatonic-passing' | 'chromatic-approach' | 'full-expressive';
  subphraseTransformation?: 'none' | 'inversion' | 'rhythmic-shift' | 'retrograde';
}): PatternStep[] {
  const {
    key,
    scale,
    progression,
    safety = 'BALANCED',
    intent = 'R&B / Soul',
    baseOctave = 1,
    variationSeed = Math.floor(Math.random() * 10000),
    nonChordTones = 'chromatic-approach',
    subphraseTransformation = 'none',
  } = options;

  // Infer or map style from intent if not explicitly set
  let style: BassAccompanimentStyle = options.style ?? 'rnb-soul-pocket';
  if (!options.style) {
    if (intent === 'R&B / Soul') style = 'rnb-soul-pocket';
    else if (intent === 'Driving') style = 'driving-eighths';
    else if (intent === '808 Sub') style = 'trap-808-glide';
    else if (intent === 'Funky') style = 'funk-syncopated';
    else if (intent === 'Dark') style = 'descending-chromatic';
    else if (intent === 'Minimal') style = 'ballad-one-two-and';
  }

  // Parse chord progression
  const chords: ChordSpec[] =
    progression.length > 0 ? progression.map(parseChordName) : [parseChordName('Cm')];

  // Pseudo-random helper seeded by variationSeed
  let seed = Math.abs(variationSeed);
  const nextRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Select dynamic groove archetype (0 to 5) so every variationSeed creates a unique groove feel
  const grooveVariant = Math.abs(Math.floor(variationSeed / 13) + (variationSeed % 7)) % 6;
  const contourVariant = Math.abs(variationSeed % 5);

  const stepsPerChord = Math.max(1, Math.floor(16 / chords.length));
  const rawNotes: { midi: number; active: boolean; velocity: number; slide: boolean; accent: boolean; duration: number }[] = [];

  // Determine diatonic scale semitones for passing tones
  const scaleIntervals = SCALE_DEFINITIONS[scale] || SCALE_DEFINITIONS['Major'];
  const rootKeySemitone = PITCH_CLASS_TO_SEMITONE[key] ?? 0;
  const scaleSemitones = scaleIntervals.map((int: number) => (rootKeySemitone + int) % 12);

  // Generate 16 steps
  for (let s = 0; s < 16; s++) {
    const chordIndex = Math.min(chords.length - 1, Math.floor(s / stepsPerChord));
    const currentChord = chords[chordIndex];
    const nextChord = chords[(chordIndex + 1) % chords.length];
    const chordStep = s % stepsPerChord;
    const isChordDownbeat = chordStep === 0;
    const isMeasureDownbeat = s % 4 === 0;
    const isCadentialArrival = s === 15 || (chordStep === stepsPerChord - 1 && stepsPerChord > 1);

    const rootPitch = PITCH_CLASS_TO_SEMITONE[currentChord.root] ?? 0;
    const nextRootPitch = PITCH_CLASS_TO_SEMITONE[nextChord.root] ?? 0;
    const rootMidi = (baseOctave + 1) * 12 + rootPitch;
    const nextRootMidi = (baseOctave + 1) * 12 + nextRootPitch;

    // Chord Tone Intervals (Hutchinson Ch. 6, 8, 31)
    const isMinor = currentChord.quality === 'min' || currentChord.quality === 'min7' || currentChord.quality === 'm9';
    const thirdMidi = rootMidi + (isMinor ? 3 : 4);
    const fifthMidi =
      currentChord.quality === 'dim'
        ? rootMidi + 6
        : currentChord.quality === 'aug'
        ? rootMidi + 8
        : rootMidi + 7;
    const seventhMidi =
      currentChord.quality === 'maj7'
        ? rootMidi + 11
        : currentChord.quality === 'dim'
        ? rootMidi + 9
        : rootMidi + 10;
    const ninthMidi = rootMidi + 14;
    const sixthMidi = rootMidi + 9;
    const fourthMidi = rootMidi + 5;
    const octaveMidi = rootMidi + 12;

    let active = false;
    let noteMidi = rootMidi;
    let velocity = 90;
    let slide = false;
    let accent = false;
    let duration = 1;

    // -------------------------------------------------------------
    // STYLE 1: R&B / NEO-SOUL POCKET (Hutchinson Ch. 14.4 & 31.7)
    // 6 distinct groove variants:
    // 0: Classic laid-back pocket (D'Angelo / Pino Palladino)
    // 1: Syncopated 16th anticipations & ghost octave pops
    // 2: Gospel / Neo-Soul turnaround walk-ups
    // 3: Silk Ballad "1 (2) &" with legato slide
    // 4: Trapsoul sub bounce with delayed 16ths
    // 5: Melodic guide-tone counterpoint (3rd & 7th)
    // -------------------------------------------------------------
    if (style === 'rnb-soul-pocket') {
      if (grooveVariant === 0) {
        // Classic pocket: Downbeat root (dur 2), delayed 16th pocket on step 2, pickup slide
        if (isChordDownbeat) {
          active = true;
          noteMidi = rootMidi;
          accent = true;
          velocity = 116;
          duration = 2;
        } else if (chordStep === 2) {
          active = true;
          noteMidi = fifthMidi;
          velocity = 88;
        } else if (isCadentialArrival) {
          active = true;
          slide = true;
          noteMidi = nextRootMidi - 1; // chromatic leading tone
          velocity = 82;
        } else if (s === 6 || s === 14) {
          active = true;
          noteMidi = octaveMidi;
          velocity = 74; // ghost pop
        }
      } else if (grooveVariant === 1) {
        // Syncopated 16th anticipations:
        const hits = [0, 3, 6, 8, 11, 14];
        if (hits.includes(s)) {
          active = true;
          accent = s === 0 || s === 8;
          if (s === 0) {
            noteMidi = rootMidi;
            velocity = 120;
          } else if (s === 3 || s === 11) {
            noteMidi = thirdMidi;
            velocity = 96;
          } else if (s === 6) {
            noteMidi = fifthMidi;
            velocity = 92;
          } else if (s === 14) {
            noteMidi = nextRootMidi - 1;
            slide = true;
            velocity = 90;
          } else {
            noteMidi = rootMidi;
            velocity = 108;
          }
        }
      } else if (grooveVariant === 2) {
        // Gospel / Soul Walk: Steps 0, 1, 2, 3 have moving melodic contour
        active = chordStep === 0 || chordStep === 1 || chordStep === 3;
        if (active) {
          if (chordStep === 0) {
            noteMidi = rootMidi;
            accent = true;
            velocity = 118;
          } else if (chordStep === 1) {
            noteMidi = thirdMidi;
            velocity = 88;
          } else {
            noteMidi = nextRandom() > 0.5 ? fifthMidi : octaveMidi;
            velocity = 94;
            slide = nextRandom() > 0.4;
          }
        }
      } else if (grooveVariant === 3) {
        // Silk Ballad: 1 (2) & with long sustained fundamental and expressive fall
        if (chordStep === 0) {
          active = true;
          noteMidi = rootMidi;
          accent = true;
          velocity = 114;
          duration = 2;
        } else if (chordStep === 2) {
          active = true;
          noteMidi = octaveMidi;
          velocity = 85;
        } else if (isCadentialArrival) {
          active = true;
          slide = true;
          noteMidi = nextRootMidi + 1; // upper chromatic approach (Neapolitan)
          velocity = 80;
        }
      } else if (grooveVariant === 4) {
        // Trapsoul bounce: Double hit on downbeat + late 16th slide
        if (chordStep === 0) {
          active = true;
          noteMidi = rootMidi;
          accent = true;
          velocity = 122;
        } else if (chordStep === 1 && nextRandom() > 0.3) {
          active = true;
          noteMidi = rootMidi;
          velocity = 90;
        } else if (chordStep === stepsPerChord - 1) {
          active = true;
          slide = true;
          noteMidi = seventhMidi;
          velocity = 95;
        }
      } else {
        // Melodic guide-tone counterpoint (3rd & 7th)
        active = chordStep === 0 || chordStep === 2 || chordStep === 3;
        if (active) {
          if (chordStep === 0) {
            noteMidi = rootMidi;
            accent = true;
            velocity = 115;
          } else if (chordStep === 2) {
            noteMidi = thirdMidi;
            velocity = 92;
          } else {
            noteMidi = seventhMidi;
            velocity = 90;
            slide = true;
          }
        }
      }
    }

    // -------------------------------------------------------------
    // STYLE 2: WALKING BASS (Jazz / Blues, Hutchinson Ch. 14.7 & 31.8)
    // 4 quarters per bar with chromatic approaches & drop 16ths
    // -------------------------------------------------------------
    else if (style === 'walking-jazz') {
      const stepInBeat = s % 4;
      const isQuarter = stepInBeat === 0;
      const isEighthDrop = stepInBeat === 2 && (grooveVariant % 2 === 1 || nextRandom() > 0.4);

      if (isQuarter || isEighthDrop) {
        active = true;
        if (isChordDownbeat) {
          noteMidi = rootMidi;
          accent = true;
          velocity = 115;
        } else if (isCadentialArrival) {
          // Half-step chromatic approach to next root (Ch. 31.8)
          noteMidi = nextRandom() > 0.5 ? nextRootMidi - 1 : nextRootMidi + 1;
          velocity = 98;
          slide = nextRandom() > 0.6;
        } else if (stepInBeat === 0) {
          // Choose 3rd, 5th, or 7th depending on contour
          if (contourVariant === 0) noteMidi = thirdMidi;
          else if (contourVariant === 1) noteMidi = fifthMidi;
          else if (contourVariant === 2) noteMidi = seventhMidi;
          else if (contourVariant === 3) noteMidi = octaveMidi;
          else noteMidi = fifthMidi;
          velocity = 95;
        } else {
          // Diatonic passing tone or ghost note
          noteMidi = thirdMidi;
          velocity = 80;
        }
      }
    }

    // -------------------------------------------------------------
    // STYLE 3: 3+3+2 CLAVE & REGGAETON/HABANERA (Hutchinson Ch. 14.6)
    // -------------------------------------------------------------
    else if (style === 'syncopated-clave') {
      // 4 Clavé variations from Hutchinson Ch. 14.6:
      let claveHits: number[];
      if (grooveVariant % 3 === 0) {
        // Classic 3+3+2 in 16ths (steps 0, 3, 6, 8, 11, 14)
        claveHits = [0, 3, 6, 8, 11, 14];
      } else if (grooveVariant % 3 === 1) {
        // (3+3+2) + (3+3+2) ostinato ("All of Me" / "Clocks", Ch. 14.6.1)
        claveHits = [0, 3, 6, 8, 11, 14, 15];
      } else {
        // 3+3+4+3+3 ("Starships" / "Tik Tok", Ch. 14.6.3.1)
        claveHits = [0, 3, 6, 10, 13];
      }

      if (claveHits.includes(s)) {
        active = true;
        accent = s === 0 || s === 8;
        if (s === 0) {
          noteMidi = rootMidi;
          velocity = 122;
        } else if (s === 3 || s === 11) {
          noteMidi = fifthMidi;
          velocity = 100;
        } else if (s === 6 || s === 14) {
          noteMidi = octaveMidi;
          velocity = 95;
          slide = s === 14;
        } else {
          noteMidi = thirdMidi;
          velocity = 92;
        }
      }
    }

    // -------------------------------------------------------------
    // STYLE 4: DESCENDING CHROMATIC (Hutchinson Ch. 21.6)
    // 1 - 7 - b7 - 6 - b6 - 5 lament bass line
    // -------------------------------------------------------------
    else if (style === 'descending-chromatic') {
      const chromaticSteps = [0, -1, -2, -3, -4, -5, -6, -7];
      if (s % 2 === 0) {
        active = true;
        const chromIdx = Math.floor(s / 2) % chromaticSteps.length;
        noteMidi = rootMidi + chromaticSteps[chromIdx];
        accent = s === 0 || s === 8;
        velocity = accent ? 118 : 94;
        slide = (s === 6 || s === 14);
      } else if (grooveVariant > 2 && (s === 3 || s === 7 || s === 11 || s === 15)) {
        // Melodic passing fill
        active = true;
        noteMidi = rootMidi + chromaticSteps[Math.floor(s / 2) % chromaticSteps.length] - 1;
        velocity = 82;
      }
    }

    // -------------------------------------------------------------
    // STYLE 5: ALBERTI / ARPEGGIO (Hutchinson Ch. 14.3.2)
    // Low - High - Middle - High (Root - 5th - 3rd - 5th) or 10ths
    // -------------------------------------------------------------
    else if (style === 'alberti-arpeggio') {
      active = true;
      const subIdx = s % 4;
      if (grooveVariant % 2 === 0) {
        // Low - High - Middle - High
        if (subIdx === 0) {
          noteMidi = rootMidi;
          accent = true;
          velocity = 112;
        } else if (subIdx === 1) {
          noteMidi = fifthMidi;
          velocity = 86;
        } else if (subIdx === 2) {
          noteMidi = thirdMidi;
          velocity = 90;
        } else {
          noteMidi = fifthMidi;
          velocity = 86;
        }
      } else {
        // Tenths arpeggiation (Alicia Keys / Beethoven Ch. 14.3.1)
        if (subIdx === 0) {
          noteMidi = rootMidi;
          accent = true;
          velocity = 115;
        } else if (subIdx === 1) {
          noteMidi = thirdMidi + 12; // 10th above root!
          velocity = 92;
        } else if (subIdx === 2) {
          noteMidi = fifthMidi;
          velocity = 88;
        } else {
          noteMidi = thirdMidi + 12;
          velocity = 90;
        }
      }
    }

    // -------------------------------------------------------------
    // STYLE 6: TRAP / DRILL 808 GLIDES
    // Deep sustained foundation with sub-pitch glides
    // -------------------------------------------------------------
    else if (style === 'trap-808-glide') {
      if (isChordDownbeat) {
        active = true;
        noteMidi = rootMidi;
        accent = true;
        duration = 3;
        velocity = 125;
      } else if (s === 6 || s === 11 || s === 14) {
        active = grooveVariant > 1 || nextRandom() > 0.35;
        slide = true;
        const glideIntervals = [12, 10, 7, 15, -5];
        noteMidi = rootMidi + glideIntervals[(s + grooveVariant) % glideIntervals.length];
        velocity = 108;
      }
    }

    // -------------------------------------------------------------
    // STYLE 7: FUNK SYNCOPATED & GHOST NOTES (Hutchinson Ch. 14.4 & 14.7)
    // -------------------------------------------------------------
    else if (style === 'funk-syncopated') {
      // 3 funk patterns
      const funkGrooves = [
        [true, false, true, true, false, true, false, true, true, false, true, false, true, true, false, true],
        [true, true, false, true, false, true, true, false, true, false, true, true, false, true, true, false],
        [true, false, false, true, true, false, true, false, true, false, false, true, true, false, true, true],
      ];
      const activeMatrix = funkGrooves[grooveVariant % 3];
      active = activeMatrix[s];
      if (active) {
        if (isChordDownbeat) {
          noteMidi = rootMidi;
          accent = true;
          velocity = 124;
        } else if (s % 4 === 2) {
          noteMidi = octaveMidi;
          accent = true;
          velocity = 102;
        } else if (isCadentialArrival) {
          noteMidi = nextRootMidi - 1;
          slide = true;
          velocity = 95;
        } else {
          noteMidi = nextRandom() > 0.5 ? fifthMidi : thirdMidi;
          velocity = 82;
        }
      }
    }

    // -------------------------------------------------------------
    // STYLE 8: DRIVING EIGHTHS ROCK / POP (Hutchinson Ch. 14.4.3)
    // -------------------------------------------------------------
    else if (style === 'driving-eighths') {
      active = s % 2 === 0;
      if (active) {
        if (isChordDownbeat) {
          noteMidi = rootMidi;
          accent = true;
          velocity = 120;
        } else if (isCadentialArrival && grooveVariant % 2 === 1) {
          noteMidi = fifthMidi;
          velocity = 105;
        } else if (s === 6 || s === 14) {
          noteMidi = nextRandom() > 0.5 ? octaveMidi : fifthMidi;
          velocity = 100;
        } else {
          noteMidi = rootMidi;
          velocity = 96;
        }
      }
    }

    // -------------------------------------------------------------
    // STYLE 9: "1 (2) &" BALLAD RHYTHM (Hutchinson Ch. 14.4.1)
    // Marvin Gaye / Ed Sheeran syncopated ballad pattern
    // -------------------------------------------------------------
    else {
      const isOne = s % 4 === 0;
      const isTwoAnd = s % 4 === 3;
      if (isOne || isTwoAnd) {
        active = true;
        if (isOne) {
          noteMidi = rootMidi;
          accent = true;
          duration = 2;
          velocity = 114;
        } else {
          noteMidi = nextRandom() > 0.4 ? fifthMidi : octaveMidi;
          velocity = 90;
          slide = isCadentialArrival;
        }
      }
    }

    // Apply Non-Chord Tone enrichments (Hutchinson Chapter 10):
    if (active && !isChordDownbeat) {
      if (nonChordTones === 'chord-tones-only') {
        // Enforce pure chord tones (Root, 3rd, 5th, 7th, Octave)
        if (noteMidi !== rootMidi && noteMidi !== thirdMidi && noteMidi !== fifthMidi && noteMidi !== seventhMidi && noteMidi !== octaveMidi) {
          noteMidi = rootMidi;
        }
      } else if (nonChordTones === 'diatonic-passing') {
        // Diatonic passing tone (Ch. 10.2): Find nearest note in key scale
        const currentPitchMod = noteMidi % 12;
        if (!scaleSemitones.includes(currentPitchMod)) {
          // Adjust to closest diatonic step
          const sorted = [...scaleSemitones].sort((a, b) => Math.abs(a - currentPitchMod) - Math.abs(b - currentPitchMod));
          noteMidi = Math.floor(noteMidi / 12) * 12 + sorted[0];
        }
      } else if (nonChordTones === 'chromatic-approach') {
        // Chromatic half-step approach into next chord root (Ch. 17 & 31.8)
        if (isCadentialArrival) {
          noteMidi = nextRootMidi - 1; // Leading tone approach
          slide = true;
        }
      } else if (nonChordTones === 'full-expressive') {
        // Escape tones, appoggiaturas, and suspensions (Ch. 10.4, 10.5, 10.9)
        if (isCadentialArrival) {
          noteMidi = nextRootMidi - 1;
          slide = true;
        } else if (s === 2 || s === 10) {
          // Upper neighbor tone
          noteMidi = thirdMidi + 1;
        }
      }
    }

    // Safety Level Jitter
    if (safety === 'ADVENTUROUS' && active && !isChordDownbeat) {
      if (nextRandom() > 0.65) {
        // Expressive chromatic embellishment
        noteMidi += nextRandom() > 0.5 ? 1 : -1;
      }
    }

    // Range Clamp (C1 = 24 to C3 = 48)
    while (noteMidi < 24) noteMidi += 12;
    while (noteMidi > 50) noteMidi -= 12;

    rawNotes.push({
      midi: noteMidi,
      active,
      velocity: active ? velocity : 0,
      slide,
      accent,
      duration,
    });
  }

  // ---------------------------------------------------------------
  // Motivic Alterations (Hutchinson Chapter 11):
  // Subphrase Inversion, Rhythmic Shift, or Retrograde
  // ---------------------------------------------------------------
  let finalNotes = [...rawNotes];
  if (subphraseTransformation === 'inversion') {
    // Invert second 8 steps across pitch center (Ch. 11.2.1)
    const centerPitch = finalNotes[0].midi;
    for (let i = 8; i < 16; i++) {
      const diff = finalNotes[i].midi - centerPitch;
      finalNotes[i].midi = centerPitch - diff;
      while (finalNotes[i].midi < 24) finalNotes[i].midi += 12;
      while (finalNotes[i].midi > 50) finalNotes[i].midi -= 12;
    }
  } else if (subphraseTransformation === 'retrograde') {
    // Reverse second 8 steps (Ch. 11.2.7)
    const secondHalf = finalNotes.slice(8).reverse();
    finalNotes = [...finalNotes.slice(0, 8), ...secondHalf];
  } else if (subphraseTransformation === 'rhythmic-shift') {
    // Phase / Rhythmic shift by 1 sixteenth note (Ch. 11.2.4 & 35.2)
    const shifted = [finalNotes[7], ...finalNotes.slice(8, 15)];
    finalNotes = [...finalNotes.slice(0, 8), ...shifted];
  }

  // Map to PatternStep array
  return finalNotes.map((n, i) => {
    const noteInfo = getNoteInfo(n.midi);
    return {
      step: i + 1,
      active: n.active,
      midiNote: n.midi,
      noteName: noteInfo.name,
      velocity: n.active ? n.velocity : 90,
      durationSteps: n.duration,
      slide: n.slide,
      accent: n.accent,
    };
  });
}
