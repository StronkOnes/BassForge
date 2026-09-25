# BassForge DAW Testing & Integration Protocol

Official test and verification procedures for Ableton Live and FL Studio.

---

## 1. Ableton Live (Live 11 / 12)

### A. Operating as a MIDI Bass Instrument (GENERATE & SHAPE Modes)
1. Open **Preferences > Plug-Ins**. Ensure **Use VST3 Plug-In System Folders** is **ON**.
2. Press **Rescan Plug-Ins**.
3. Create a new MIDI Track (**Ctrl + Shift + T**).
4. From the Browser under **Plug-Ins > VST3 > BassForge Audio**, drag **BassForge** onto the track.
5. In BassForge:
   * Select your song's **Key** and **Scale** (e.g. `C Minor`).
   * Select your chord progression (e.g. `Cm - Ab - Eb - Bb`).
   * Click **Play Loop** to preview the bassline in tempo sync with Ableton.
   * Click **Export .MID** or drag the MIDI card straight into Ableton's Arrangement view.
6. Trigger notes from your MIDI keyboard (C1–C3) to audition real-time multi-layer synthesis.

### B. Operating as a Bass Preprocessor (PRE Mode)
1. Create or select an audio track with existing 808, synth bass, or recorded DI bass guitar.
2. Drag **BassForge** directly onto the Audio Track's device chain.
3. Switch Mode to **3. PREPROCESSOR**.
4. Enable **Sub Protect** to engage the 28Hz 24dB highpass filter.
5. Audition consumer playback using the **Hearability** panel (select **Phone** or **Laptop**).
6. Click **Auto-Inject Harmonics** to bring out the 2nd and 3rd harmonics until the Small-Speaker Presence score reaches >70%.

---

## 2. FL Studio (FL Studio 21 / 24)

### A. Scanning the Plugin
1. Open **Options > Manage Plugins**.
2. Verify `C:\Program Files\Common Files\VST3` is in the search paths.
3. Click **Find installed plugins**.
4. Check that **BassForge** is identified as a **Synth / Effect VST3**.

### B. Instrument Channel Routing
1. In the Channel Rack, click **+** and add **BassForge**.
2. Open the FL Studio Piano Roll. Draw bass notes between C2 and C4 (FL Studio octave convention: C3 = MIDI 48).
3. Automate **Drive**, **Sub Level**, and **Macro Hearability** using FL Studio automation clips.

### C. Mixer Insert Effect Routing
1. Route your bass audio or 808 sample to Mixer Track 1.
2. On Slot 1 of Mixer Track 1, select **BassForge**.
3. Engage **PRE** mode to split frequency bands and add tube saturation with auto-gain matching.

---

## 3. Production Verification Checklist

| Test Item | Ableton Live | FL Studio | Pass Criteria |
| :--- | :--- | :--- | :--- |
| **Plugin Loading** | Pass | Pass | UI opens in <150ms without GUI flicker |
| **Transport Sync** | Pass | Pass | Host tempo (BPM) read correctly |
| **Note-On / Note-Off** | Pass | Pass | Zero dropped voices or hanging notes |
| **Portamento Glide** | Pass | Pass | Smooth slide transition between overlapping notes |
| **Preset Save / Recall** | Pass | Pass | State faithfully restored upon reopening project |
| **Auto Gain Match** | Pass | Pass | Perceived volume stays within ±0.8 dB when drive is increased |
| **Offline Bounce** | Pass | Pass | Zero phase cancellation or DC offset in render |
