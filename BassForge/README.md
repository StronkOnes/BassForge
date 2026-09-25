# BassForge — Intelligent Bass Generator & Bass Preprocessor

Professional Windows 10/11 x64 VST3 audio plugin built with C++20 and JUCE.

BassForge is **not** a simple bass synthesizer and it is **not** merely a distortion plugin. It is an intelligent bass-production instrument and processor designed to help a producer create, shape, harmonize, distort, reinforce, and fit bass into an existing musical composition.

---

## Core Signal Flow Architecture

```text
SIGNAL (Osc / Sub / Body / Character)
   ↓
TONE (Multi-band Crossovers & Cutoff)
   ↓
HARMONICS (2nd, 3rd, 4th, 5th, 7th, 9th Targeted Harmonics)
   ↓
DISTORTION (8 Multi-Staged Nonlinear Algorithms)
   ↓
PREPROCESSOR (28Hz Sub-Protection & Auto Gain Match)
   ↓
HEARABILITY & MASTER (Small-Speaker Acoustic Translation)
```

---

## 3 Major Operating Modes

1. **MODE 1 — GENERATE**: Creates intelligent bass patterns from Musical Context (Key, Scale, and Chord Progression) with interpretation styles (Root, Root+5th, Movement, Groove, Octave Displacement). Includes real-time 16-step roll and Standard MIDI (.mid) 960 PPQ drag-and-drop export.
2. **MODE 2 — SHAPE**: Deep sound design with separate Sub (mono-locked, glide), Body (warmth, tone, saturation), and Character (FM, transient punch, resonance) layers.
3. **MODE 3 — PRE**: Preprocessor mode for incoming bass audio or synth tracks: Sub Protection (28Hz steep HPF) → 4-Way Crossover Split → Harmonic Injection → Multistage Saturation → Auto-Gain Parity.

---

## Technology Stack

* **Platform**: Windows 10 / Windows 11 (x64)
* **Format**: VST3 & Standalone
* **Standard**: C++20
* **Framework**: JUCE 7/8 (AudioProcessor, AudioProcessorValueTreeState, juce::dsp)
* **Build System**: CMake 3.22+

---

## Building from Source (Windows x64)

### Prerequisites

* Visual Studio 2022 (Community, Professional, or Enterprise) with C++ Desktop Development workload.
* CMake 3.22 or newer.
* Git.

### Build Steps

```cmd
git clone <repository_url>
cd BassForge
cmake -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Release
```

The compiled VST3 binary will be located in:
`build/BassForge_artefacts/Release/VST3/BassForge.vst3`

### Standard Windows VST3 Directory

Copy `BassForge.vst3` into:
`C:\Program Files\Common Files\VST3\BassForge.vst3`

---

## Acoustic Theory & Hearability Explained

### Why Sub Frequencies Disappear on Mobile Devices
Smartphone and laptop transducers physically cannot reproduce acoustic frequencies below ~200–350 Hz due to small diaphragm excursion limits. A pure 55 Hz sine wave sub is completely inaudible on consumer hardware.

### How BassForge Solves It Without Destroying the Sub
BassForge analyzes the fundamental $F_0$ and uses targeted harmonic synthesis to inject controlled **2nd ($2F_0 = 110\text{ Hz}$)** and **3rd ($3F_0 = 165\text{ Hz}$)** harmonics into the Body band. The human brain perceives the missing fundamental through the psychoacoustic phenomenon known as *residue pitch*, making the bass easily hearable on laptop and phone speakers while preserving pristine, unclipped sub energy on club systems.
