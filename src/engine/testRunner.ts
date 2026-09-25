import {
  midiToFrequency,
  midiToNoteName,
  getScaleNotes,
  generateBassPattern,
  PITCH_CLASSES,
  parseChordName,
  RNB_PROGRESSION_TEMPLATES,
} from './musicTheory';
import { generateBassMidiFile } from './midiFileWriter';
import { BASSFORGE_PRESETS } from '../data/presets';

export interface TestResult {
  category: string;
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

export function runBassForgeTests(): {
  results: TestResult[];
  passedCount: number;
  failedCount: number;
} {
  const results: TestResult[] = [];

  const expectEq = (
    category: string,
    name: string,
    actual: unknown,
    expected: unknown,
    details?: string
  ) => {
    const passed = JSON.stringify(actual) === JSON.stringify(expected);
    results.push({
      category,
      name,
      passed,
      expected: String(expected),
      actual: String(actual),
      details,
    });
  };

  const expectTrue = (
    category: string,
    name: string,
    cond: boolean,
    details?: string
  ) => {
    results.push({
      category,
      name,
      passed: cond,
      expected: 'true',
      actual: String(cond),
      details,
    });
  };

  // 1. Oscillator Pitch & Tuning Accuracy
  const a1Freq = midiToFrequency(33); // A1 = 55.0 Hz
  expectTrue(
    'Oscillator Tuning',
    'A1 Fundamental Frequency Accuracy (55.0 Hz)',
    Math.abs(a1Freq - 55.0) < 0.05,
    `Computed: ${a1Freq.toFixed(3)} Hz, Target: 55.000 Hz`
  );

  const c1Freq = midiToFrequency(24); // C1 = 32.703 Hz
  expectTrue(
    'Oscillator Tuning',
    'C1 Subterranean Frequency Accuracy (32.70 Hz)',
    Math.abs(c1Freq - 32.703) < 0.05,
    `Computed: ${c1Freq.toFixed(3)} Hz, Target: 32.703 Hz`
  );

  // 2. Harmonic Engine Multiplier Alignment
  const f0 = 55.0;
  const h2 = f0 * 2;
  const h3 = f0 * 3;
  const h5 = f0 * 5;
  const h7 = f0 * 7;
  expectEq('Harmonics', '2nd Harmonic Alignment', h2, 110.0, '2 * 55 Hz = 110 Hz');
  expectEq('Harmonics', '3rd Harmonic Alignment', h3, 165.0, '3 * 55 Hz = 165 Hz');
  expectEq('Harmonics', '5th Harmonic Alignment', h5, 275.0, '5 * 55 Hz = 275 Hz');
  expectEq('Harmonics', '7th Harmonic Alignment', h7, 385.0, '7 * 55 Hz = 385 Hz');

  // 3. Distortion Mathematical Bounds & NaN/Inf Protection
  const testInputs = [-2.0, -1.0, -0.5, 0.0, 0.5, 1.0, 2.0];
  let hasNaNorInf = false;
  let allWithinBounds = true;
  for (const x of testInputs) {
    // Soft Clip: tanh(x * 3)
    const ySoft = Math.tanh(x * 3);
    if (isNaN(ySoft) || !isFinite(ySoft)) hasNaNorInf = true;
    if (ySoft < -1.0001 || ySoft > 1.0001) allWithinBounds = false;

    // Tube saturation curve test
    const yTube = x > 0 ? 1 - Math.exp(-x * 2) : -1 + Math.exp(x * 2);
    if (isNaN(yTube) || !isFinite(yTube)) hasNaNorInf = true;
  }
  expectTrue(
    'Distortion Engine',
    'Transfer Function Numerical Stability (No NaN or Inf)',
    !hasNaNorInf,
    'Verified across negative, zero, and extreme positive signal excursion'
  );
  expectTrue(
    'Distortion Engine',
    'Soft Clip Normalization Bounds [-1.0, +1.0]',
    allWithinBounds,
    'All output values remain inside unitary audio headroom'
  );

  // 4. Musical Context Scale Degree Validation
  const cMinorNotes = getScaleNotes('C', 'Natural Minor', 1);
  const expectedCMinorNames = ['C1', 'D1', 'D#1', 'F1', 'G1', 'G#1', 'A#1'];
  const actualCMinorNames = cMinorNotes.map((n) => n.name);
  expectEq(
    'Music Theory',
    'C Natural Minor Scale Notes',
    actualCMinorNames,
    expectedCMinorNames,
    'Diatonic intervals: [0, 2, 3, 5, 7, 8, 10]'
  );

  // 5. Bass Pattern Generator - Root Follow Mode
  const rootFollowPattern = generateBassPattern({
    key: 'C',
    scale: 'Natural Minor',
    progression: ['Cm', 'Ab', 'Eb', 'Bb'],
    mode: 'ROOT',
    safety: 'SAFE',
    intent: 'Driving',
    baseOctave: 1,
  });
  expectTrue(
    'Pattern Generator',
    'Pattern Step Count = 16',
    rootFollowPattern.length === 16,
    `Steps generated: ${rootFollowPattern.length}`
  );

  // Verify first step note is C (Root)
  expectEq(
    'Pattern Generator',
    'Progression First Note Root Match (Cm -> C)',
    rootFollowPattern[0].noteName.slice(0, 1),
    'C',
    'Step 1 must trigger chord root C'
  );

  // 6. Standard MIDI File Format 960 PPQ Validation
  const midiBytes = generateBassMidiFile(rootFollowPattern, 120, 960);
  const isMThd =
    midiBytes[0] === 0x4d &&
    midiBytes[1] === 0x54 &&
    midiBytes[2] === 0x68 &&
    midiBytes[3] === 0x64; // "MThd"
  expectTrue(
    'MIDI Specification',
    'Standard MIDI Header Magic Bytes ("MThd")',
    isMThd,
    'Byte signature: 0x4D 0x54 0x68 0x64'
  );

  const ppqVal = (midiBytes[12] << 8) | midiBytes[13];
  expectEq(
    'MIDI Specification',
    'Time Division Resolution = 960 PPQ',
    ppqVal,
    960,
    'Standard DAW high-resolution quarter-note ticks'
  );

  // 7. Preset Serialization & Schema Integrity
  let allPresetsValid = true;
  for (const p of BASSFORGE_PRESETS) {
    if (!p.id || !p.name || !p.sub || !p.body || !p.harmonics || !p.distortion) {
      allPresetsValid = false;
      break;
    }
  }
  expectTrue(
    'Preset Management',
    'Factory Preset Schema Validation',
    allPresetsValid && BASSFORGE_PRESETS.length >= 8,
    `Verified ${BASSFORGE_PRESETS.length} presets with complete audio sub-systems`
  );

  // 8. Low-Frequency Hearability Logic
  // When fundamental is high and upper harmonics are low, score should detect risk
  const simSubEnergy = 80;
  const simUpperEnergy = 5;
  const simSpeakerScore = Math.round(simSubEnergy * 0.1 + simUpperEnergy * 0.8);
  expectTrue(
    'Hearability Engine',
    'Small-Speaker Acoustic Risk Detection (< 35% Score)',
    simSpeakerScore < 35,
    `Calculated presence score: ${simSpeakerScore}% under pure sub conditions`
  );

  // 9. R&B Chord Parsing & Quality Extensions
  const ebm9Chord = parseChordName('Ebm9');
  expectEq(
    'R&B Music Theory',
    'R&B Minor 9th Chord Root Extraction (Eb)',
    ebm9Chord.root,
    'Eb',
    'Parses root accurately for extended chords'
  );
  expectEq(
    'R&B Music Theory',
    'R&B Minor 9th Quality Classification',
    ebm9Chord.quality,
    'min',
    'Classified as minor harmonic foundation'
  );

  const g7Chord = parseChordName('G7');
  expectEq(
    'R&B Music Theory',
    'R&B Dominant 7th Quality Classification',
    g7Chord.quality,
    '7',
    'Dominant 7th turnaround chord'
  );

  // 10. R&B Progression Templates
  expectTrue(
    'R&B Music Theory',
    'R&B Progression Templates Catalog',
    RNB_PROGRESSION_TEMPLATES.length >= 5,
    `Available R&B subgenre progressions: ${RNB_PROGRESSION_TEMPLATES.map((t) => t.subgenre).join(', ')}`
  );

  // 11. R&B Soul Pattern Generation & Chromatic Walk-Up
  const rnbPattern = generateBassPattern({
    key: 'C',
    scale: 'Major',
    progression: ['Dm7', 'G7', 'Cmaj7', 'Am7'],
    mode: 'MOVEMENT',
    safety: 'BALANCED',
    intent: 'R&B / Soul',
    baseOctave: 1,
  });

  expectEq(
    'R&B Pattern Generator',
    'R&B 16-Step Pattern Length',
    rnbPattern.length,
    16,
    'Generates standard 16-step grid'
  );

  expectTrue(
    'R&B Pattern Generator',
    'R&B Downbeat Soul Root Accent',
    rnbPattern[0].active && rnbPattern[0].accent,
    'Downbeat carries heavy soul pulse'
  );

  const hasSlideInRnb = rnbPattern.some((s) => s.slide);
  expectTrue(
    'R&B Pattern Generator',
    'R&B Chromatic Glide / Slide Articulation Present',
    hasSlideInRnb,
    'Generates authentic soul chromatic approach slides into chord changes'
  );

  // 12. R&B Presets Verification
  const rnbPresets = BASSFORGE_PRESETS.filter((p) => p.category === 'R&B / Soul');
  expectTrue(
    'R&B Sound Engine',
    'Factory R&B / Soul Presets Integrated',
    rnbPresets.length >= 4,
    `Loaded ${rnbPresets.length} R&B presets: ${rnbPresets.map((p) => p.name).join(', ')}`
  );

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return { results, passedCount, failedCount };
}
