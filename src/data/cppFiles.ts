export interface CppFileItem {
  path: string;
  category:
    | 'CMake'
    | 'Plugin'
    | 'DSP Engine'
    | 'Analysis'
    | 'Musical Context'
    | 'MIDI Engine'
    | 'Presets'
    | 'Tests'
    | 'Documentation';
  description: string;
}

export const CPP_FILES_CATALOG: CppFileItem[] = [
  {
    path: 'BassForge/CMakeLists.txt',
    category: 'CMake',
    description: 'Root CMake configuration integrating JUCE 8 via FetchContent, target BassForge with VST3 & Standalone formats, MSVC /O2 /fp:fast and C++20 flags.',
  },
  {
    path: 'BassForge/Tests/CMakeLists.txt',
    category: 'CMake',
    description: 'CMake build script for the standalone C++ automated unit test executable.',
  },
  {
    path: 'BassForge/Source/Plugin/PluginProcessor.h',
    category: 'Plugin',
    description: 'juce::AudioProcessor declaration hosting AudioProcessorValueTreeState (APVTS), sub protection filter, real-time lock-free audio buffer loop, and preset recall.',
  },
  {
    path: 'BassForge/Source/Plugin/PluginProcessor.cpp',
    category: 'Plugin',
    description: 'PluginProcessor implementation with MIDI note event handling, multi-layer synthesis, harmonic generation, distortion, and XML state persistence.',
  },
  {
    path: 'BassForge/Source/Plugin/PluginEditor.h',
    category: 'Plugin',
    description: 'juce::AudioProcessorEditor with hardware dark charcoal / cyan LookAndFeel, APVTS slider attachments, and real-time spectrum drawing.',
  },
  {
    path: 'BassForge/Source/Plugin/PluginEditor.cpp',
    category: 'Plugin',
    description: 'Editor UI implementation with rotary sliders, distortion selector, sub protect toggle, and 25Hz meter animation timer.',
  },
  {
    path: 'BassForge/Source/DSP/SubOscillator.h',
    category: 'DSP Engine',
    description: 'Bandlimited sub-bass oscillator header supporting Sine, Triangle, Square waveforms, octave transpose (-2..0), and portamento glide smoothing.',
  },
  {
    path: 'BassForge/Source/DSP/SubOscillator.cpp',
    category: 'DSP Engine',
    description: 'Sub-bass generator implementation with 1-pole glide smoothing, continuous phase accumulation, and strict mono sub routing.',
  },
  {
    path: 'BassForge/Source/DSP/HarmonicEngine.h',
    category: 'DSP Engine',
    description: 'Targeted harmonic overtone generator synthesizing 2nd (2F0), 3rd (3F0), 4th, 5th, 7th, 9th harmonics from the fundamental frequency.',
  },
  {
    path: 'BassForge/Source/DSP/HarmonicEngine.cpp',
    category: 'DSP Engine',
    description: 'Harmonic overtone implementation with even/odd weighting balance, spread, and Nyquist cutoff protection.',
  },
  {
    path: 'BassForge/Source/DSP/DistortionEngine.h',
    category: 'DSP Engine',
    description: 'Waveshaper header with 8 saturation models: Soft Clip, Hard Clip, Tube, Tape, Diode, Transistor, Wavefold, and Bit Reduction.',
  },
  {
    path: 'BassForge/Source/DSP/DistortionEngine.cpp',
    category: 'DSP Engine',
    description: 'Distortion engine implementation with asymmetric transfer curves, post-tone lowpass filtering, and auto gain match normalization.',
  },
  {
    path: 'BassForge/Source/DSP/FrequencySplitter.h',
    category: 'DSP Engine',
    description: '4-way crossover splitting bass signal into Sub (20-80Hz), Body (80-180Hz), Character (180-600Hz), and Upper Harmonics (600Hz+).',
  },
  {
    path: 'BassForge/Source/DSP/FrequencySplitter.cpp',
    category: 'DSP Engine',
    description: 'Phase-coherent cascaded crossover implementation for multi-band preprocessor mode.',
  },
  {
    path: 'BassForge/Source/Analysis/HearabilityAnalyzer.h',
    category: 'Analysis',
    description: 'Real-time acoustic translation analyzer measuring fundamental energy, body energy, upper harmonics, and small-speaker perceptibility index.',
  },
  {
    path: 'BassForge/Source/Analysis/HearabilityAnalyzer.cpp',
    category: 'Analysis',
    description: 'RMS power integration window computing consumer speaker translation score (0-100%) and low-frequency dependence.',
  },
  {
    path: 'BassForge/Source/MusicalContext/BassContextEngine.h',
    category: 'Musical Context',
    description: 'Music theory context engine handling Key, Diatonic scales (Minor, Major, Dorian, Phrygian, Blues, etc.), and chord progression interpretations.',
  },
  {
    path: 'BassForge/Source/MusicalContext/BassContextEngine.cpp',
    category: 'Musical Context',
    description: 'Pattern generator implementation calculating Root, Root+5th, Movement (chord tones), and Groove syncopated voice lines.',
  },
  {
    path: 'BassForge/Source/MIDI/BassMidiGenerator.h',
    category: 'MIDI Engine',
    description: 'Standard MIDI File (SMF Type 0, 960 PPQ) writer header for generating DAW-ready bassline files.',
  },
  {
    path: 'BassForge/Source/MIDI/BassMidiGenerator.cpp',
    category: 'MIDI Engine',
    description: 'Binary MIDI file serializer with variable-length quantity (VLQ) delta timing, tempo meta events, and note on/off track events.',
  },
  {
    path: 'BassForge/Source/Presets/PresetManager.h',
    category: 'Presets',
    description: 'Preset management system header with factory presets catalog and bounded intelligent randomization.',
  },
  {
    path: 'BassForge/Source/Presets/PresetManager.cpp',
    category: 'Presets',
    description: 'Preset manager implementation with 6 curated factory presets (Sub, 808, Reese, 303, UKG) and parameter randomization.',
  },
  {
    path: 'BassForge/Tests/BassForgeTests.cpp',
    category: 'Tests',
    description: 'Standalone C++20 automated test runner validating pitch tuning accuracy, harmonic overtone ratios, distortion bounds, and scale intervals.',
  },
  {
    path: 'BassForge/README.md',
    category: 'Documentation',
    description: 'Complete architecture manual, acoustic theory guide (why sub disappears on small speakers), and Visual Studio 2022 build instructions.',
  },
  {
    path: 'BassForge/DAW_TESTING.md',
    category: 'Documentation',
    description: 'Integration protocol for Ableton Live 11/12 and FL Studio 21/24 with channel routing and production testing checklists.',
  },
];
