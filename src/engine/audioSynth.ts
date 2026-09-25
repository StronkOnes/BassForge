import {
  SubLayerConfig,
  BodyLayerConfig,
  CharacterLayerConfig,
  HarmonicsConfig,
  DistortionConfig,
  DistortionType,
  SpeakerTarget,
  HearabilityAnalysis,
  BassHealthMetrics,
  PatternStep,
} from '../types/music';

export interface SynthParams {
  sub: SubLayerConfig;
  body: BodyLayerConfig;
  character: CharacterLayerConfig;
  harmonics: HarmonicsConfig;
  distortion: DistortionConfig;
  targetSpeaker: SpeakerTarget;
  masterVolume: number;
  autoGainMatch: boolean;
  subProtect: boolean;
}

export const DEFAULT_SYNTH_PARAMS: SynthParams = {
  sub: {
    level: 0.85,
    waveform: 'sine',
    octave: -1,
    glide: 0.05,
    decay: 1.2,
    monoLock: true,
  },
  body: {
    level: 0.65,
    waveform: 'sawtooth',
    tone: 0.5,
    saturation: 0.3,
    attack: 0.01,
    decay: 0.8,
    sustain: 0.6,
    release: 0.25,
    width: 0.2,
  },
  character: {
    fmAmount: 0.2,
    bite: 0.35,
    growl: 0.15,
    punch: 0.4,
    cutoff: 1200,
    resonance: 3.5,
  },
  harmonics: {
    h2: 0.4,
    h3: 0.3,
    h4: 0.15,
    h5: 0.2,
    h7: 0.1,
    h9: 0.05,
    evenOddBalance: 0.0,
    spread: 0.3,
    focus: 0.6,
  },
  distortion: {
    type: 'Tube',
    drive: 0.35,
    bias: 0.1,
    tone: 0.6,
    mix: 0.45,
    stage: 2,
  },
  targetSpeaker: 'FULL RANGE',
  masterVolume: 0.8,
  autoGainMatch: true,
  subProtect: true,
};

class BassDspEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private subProtectFilter: BiquadFilterNode | null = null;
  private speakerFilter: BiquadFilterNode | null = null;
  private dryWetGain: GainNode | null = null;

  // Active voice nodes for cleanup / slide
  private currentFrequency = 55.0; // A1
  private targetFrequency = 55.0;
  private isNotePlaying = false;
  private activeVoices: {
    oscillators: (OscillatorNode | AudioNode)[];
    gains: GainNode[];
    startTime: number;
  }[] = [];

  // Sequencer loop timer
  private sequencerTimer: number | null = null;
  private currentStepIndex = 0;
  private isSequencerRunning = false;
  private onStepCallback: ((step: number) => void) | null = null;

  private params: SynthParams = { ...DEFAULT_SYNTH_PARAMS };

  public init() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.85;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.params.masterVolume, this.ctx.currentTime);

      // Sub protection filter (steep 28Hz high-pass to prevent subsonic DC excursion)
      this.subProtectFilter = this.ctx.createBiquadFilter();
      this.subProtectFilter.type = 'highpass';
      this.subProtectFilter.frequency.setValueAtTime(28, this.ctx.currentTime);
      this.subProtectFilter.Q.setValueAtTime(0.707, this.ctx.currentTime);

      // Target speaker diagnostic monitoring filter
      this.speakerFilter = this.ctx.createBiquadFilter();
      this.updateSpeakerTargetFilter(this.params.targetSpeaker);

      // Signal routing: Master -> SubProtect -> SpeakerSim -> Analyser -> Output
      this.masterGain.connect(this.subProtectFilter);
      this.subProtectFilter.connect(this.speakerFilter);
      this.speakerFilter.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateParams(newParams: Partial<SynthParams>) {
    this.params = { ...this.params, ...newParams };
    if (!this.ctx) return;

    if (newParams.targetSpeaker && this.speakerFilter) {
      this.updateSpeakerTargetFilter(newParams.targetSpeaker);
    }

    if (newParams.masterVolume !== undefined && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.params.masterVolume, this.ctx.currentTime, 0.03);
    }
  }

  public getParams(): SynthParams {
    return { ...this.params };
  }

  private updateSpeakerTargetFilter(target: SpeakerTarget) {
    if (!this.speakerFilter || !this.ctx) return;
    const now = this.ctx.currentTime;

    switch (target) {
      case 'PHONE':
        // Typical small phone: cuts everything below 350 Hz, peaks around 1200 Hz
        this.speakerFilter.type = 'highpass';
        this.speakerFilter.frequency.setTargetAtTime(350, now, 0.05);
        this.speakerFilter.Q.setTargetAtTime(1.8, now, 0.05);
        break;
      case 'LAPTOP':
        // Laptop speaker: cuts below 200 Hz
        this.speakerFilter.type = 'highpass';
        this.speakerFilter.frequency.setTargetAtTime(200, now, 0.05);
        this.speakerFilter.Q.setTargetAtTime(1.2, now, 0.05);
        break;
      case 'SMALL SPEAKER':
        // Bluetooth pill: roll-off at 120 Hz
        this.speakerFilter.type = 'highpass';
        this.speakerFilter.frequency.setTargetAtTime(120, now, 0.05);
        this.speakerFilter.Q.setTargetAtTime(1.0, now, 0.05);
        break;
      case 'HEADPHONES':
        // Low shelf warmth
        this.speakerFilter.type = 'lowshelf';
        this.speakerFilter.frequency.setTargetAtTime(70, now, 0.05);
        this.speakerFilter.gain.setTargetAtTime(2.5, now, 0.05);
        break;
      case 'CAR':
        // Sub boost + scooped mid
        this.speakerFilter.type = 'lowshelf';
        this.speakerFilter.frequency.setTargetAtTime(80, now, 0.05);
        this.speakerFilter.gain.setTargetAtTime(4.0, now, 0.05);
        break;
      case 'MONO CLUB':
        // Hard lowpass + sub weight
        this.speakerFilter.type = 'peaking';
        this.speakerFilter.frequency.setTargetAtTime(55, now, 0.05);
        this.speakerFilter.Q.setTargetAtTime(1.4, now, 0.05);
        this.speakerFilter.gain.setTargetAtTime(3.0, now, 0.05);
        break;
      case 'FULL RANGE':
      default:
        // Transparent flat response
        this.speakerFilter.type = 'allpass';
        this.speakerFilter.frequency.setTargetAtTime(1000, now, 0.05);
        break;
    }
  }

  // Create waveshaping transfer curve for distortion
  private createDistortionCurve(type: DistortionType, drive: number, bias: number): Float32Array {
    const samples = 2048;
    const curve = new Float32Array(samples);
    const k = Math.max(0.01, drive * 50);

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      const xBiased = x + bias * 0.4;

      let y = 0;
      switch (type) {
        case 'Soft Clip':
          // Classical hyperbolic tangent saturation
          y = Math.tanh(xBiased * (1 + drive * 4));
          break;

        case 'Hard Clip':
          // Brickwall clipping
          const amplified = xBiased * (1 + drive * 6);
          y = Math.max(-1, Math.min(1, amplified));
          break;

        case 'Tube':
          // Asymmetric cubic saturation emphasizing 2nd harmonic
          const xt = xBiased * (1 + drive * 3);
          if (xt > 0) {
            y = 1 - Math.exp(-xt);
          } else {
            y = -1 + Math.exp(xt);
          }
          y = y * 0.9 + 0.1 * (xBiased * xBiased - 0.2);
          break;

        case 'Tape':
          // Symmetrical soft compression with gentle odd overtones
          const xTape = xBiased * (1 + drive * 3.5);
          y = (3 * xTape) / (2 * (1 + Math.abs(xTape)));
          break;

        case 'Diode':
          // Rectifying diode crossover
          if (xBiased > 0.2) {
            y = Math.min(1, (xBiased - 0.2) * (1 + drive * 4));
          } else {
            y = Math.max(-0.4, xBiased * 0.5);
          }
          break;

        case 'Transistor':
          // Harsh crossover distortion and asymmetrical squashing
          const xTrans = xBiased * (1 + drive * 7);
          y = xTrans > 0.6 ? 1.0 : xTrans < -0.6 ? -1.0 : xTrans * 1.5;
          break;

        case 'Wavefold':
          // Trigonometric folding
          const xFold = xBiased * (1 + drive * 5);
          y = Math.sin(xFold * Math.PI * 0.7);
          break;

        case 'Bit Reduction':
          // Quantized steps
          const steps = Math.max(4, Math.floor(32 * (1 - drive * 0.85)));
          y = Math.round(xBiased * steps) / steps;
          break;

        default:
          y = xBiased;
      }
      curve[i] = Math.max(-1, Math.min(1, y));
    }
    return curve;
  }

  // Play a single synthesized bass note with all layers
  public triggerNote(
    freq: number,
    velocity = 100,
    durationSec = 1.0,
    isSlide = false
  ) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const velScale = velocity / 127;

    // Handle Glide / Portamento if note is already sounding
    if (isSlide && this.isNotePlaying) {
      this.targetFrequency = freq;
      const glideTime = Math.max(0.02, this.params.sub.glide);
      // Smooth frequency transition across active oscillators
      for (const voice of this.activeVoices) {
        for (const osc of voice.oscillators) {
          if ('frequency' in osc && osc.frequency instanceof AudioParam) {
            osc.frequency.setTargetAtTime(freq, now, glideTime);
          }
        }
      }
      return;
    }

    // Otherwise stop prior active notes smoothly to avoid clicks
    this.stopNote(0.04);

    this.currentFrequency = freq;
    this.targetFrequency = freq;
    this.isNotePlaying = true;

    const voiceOscillators: (OscillatorNode | AudioNode)[] = [];
    const voiceGains: GainNode[] = [];

    // Voice Master Gain Node
    const voiceMasterGain = this.ctx.createGain();
    voiceMasterGain.gain.setValueAtTime(0, now);
    voiceGains.push(voiceMasterGain);

    // ==========================================
    // 1. SUB LAYER (20 - 80 Hz)
    // ==========================================
    const subFreq = freq * Math.pow(2, this.params.sub.octave);
    const subOsc = this.ctx.createOscillator();
    subOsc.type = this.params.sub.waveform;
    subOsc.frequency.setValueAtTime(subFreq, now);

    const subGain = this.ctx.createGain();
    const subTargetGain = this.params.sub.level * 0.75 * velScale;
    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(subTargetGain, now + 0.008);
    subGain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, subTargetGain * 0.7),
      now + this.params.sub.decay
    );

    subOsc.connect(subGain);
    subGain.connect(voiceMasterGain);
    voiceOscillators.push(subOsc);
    voiceGains.push(subGain);

    // ==========================================
    // 2. BODY LAYER (60 - 180 Hz)
    // ==========================================
    const bodyOsc = this.ctx.createOscillator();
    bodyOsc.type = this.params.body.waveform;
    bodyOsc.frequency.setValueAtTime(freq, now);

    const bodyFilter = this.ctx.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    const bodyCutoff = 100 + this.params.body.tone * 1800;
    bodyFilter.frequency.setValueAtTime(bodyCutoff, now);

    const bodyGain = this.ctx.createGain();
    const bodyTargetGain = this.params.body.level * 0.6 * velScale;
    const bAttack = Math.max(0.005, this.params.body.attack);
    const bDecay = Math.max(0.05, this.params.body.decay);
    const bSustain = Math.max(0.01, this.params.body.sustain * bodyTargetGain);

    bodyGain.gain.setValueAtTime(0, now);
    bodyGain.gain.linearRampToValueAtTime(bodyTargetGain, now + bAttack);
    bodyGain.gain.exponentialRampToValueAtTime(bSustain, now + bAttack + bDecay);

    bodyOsc.connect(bodyFilter);
    bodyFilter.connect(bodyGain);
    bodyGain.connect(voiceMasterGain);
    voiceOscillators.push(bodyOsc);
    voiceGains.push(bodyGain);

    // ==========================================
    // 3. CHARACTER LAYER (FM & Bite)
    // ==========================================
    if (this.params.character.fmAmount > 0.01 || this.params.character.bite > 0.01) {
      const charCarrier = this.ctx.createOscillator();
      charCarrier.type = 'sawtooth';
      charCarrier.frequency.setValueAtTime(freq, now);

      // FM Modulator
      const fmMod = this.ctx.createOscillator();
      fmMod.type = 'sine';
      // Modulator frequency at 2x or 3x for distinct growl
      fmMod.frequency.setValueAtTime(freq * 2, now);

      const fmDepth = this.ctx.createGain();
      const depthAmount = this.params.character.fmAmount * freq * 4;
      fmDepth.gain.setValueAtTime(depthAmount, now);
      fmDepth.gain.exponentialRampToValueAtTime(0.1, now + 0.35);

      fmMod.connect(fmDepth);
      fmDepth.connect(charCarrier.frequency);

      const charFilter = this.ctx.createBiquadFilter();
      charFilter.type = 'lowpass';
      charFilter.frequency.setValueAtTime(this.params.character.cutoff, now);
      charFilter.Q.setValueAtTime(this.params.character.resonance, now);

      const charGain = this.ctx.createGain();
      const charTarget = (this.params.character.bite + this.params.character.growl) * 0.45 * velScale;
      charGain.gain.setValueAtTime(0, now);
      charGain.gain.linearRampToValueAtTime(charTarget, now + 0.01);
      charGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      charCarrier.connect(charFilter);
      charFilter.connect(charGain);
      charGain.connect(voiceMasterGain);

      voiceOscillators.push(charCarrier);
      voiceOscillators.push(fmMod);
      voiceGains.push(charGain);
      voiceGains.push(fmDepth);

      fmMod.start(now);
      charCarrier.start(now);
    }

    // ==========================================
    // 4. DEDICATED HARMONIC OVERTONES (2nd, 3rd, 4th, 5th, 7th, 9th)
    // ==========================================
    const harmonicRatios = [
      { mult: 2, level: this.params.harmonics.h2, isEven: true },
      { mult: 3, level: this.params.harmonics.h3, isEven: false },
      { mult: 4, level: this.params.harmonics.h4, isEven: true },
      { mult: 5, level: this.params.harmonics.h5, isEven: false },
      { mult: 7, level: this.params.harmonics.h7, isEven: false },
      { mult: 9, level: this.params.harmonics.h9, isEven: false },
    ];

    const { evenOddBalance } = this.params.harmonics;

    for (const h of harmonicRatios) {
      if (h.level > 0.01) {
        const hOsc = this.ctx.createOscillator();
        hOsc.type = 'sine';
        hOsc.frequency.setValueAtTime(freq * h.mult, now);

        // Apply even/odd weighting
        let weighting = 1.0;
        if (h.isEven && evenOddBalance < 0) {
          weighting = 1 + evenOddBalance; // reduces even
        } else if (!h.isEven && evenOddBalance > 0) {
          weighting = 1 - evenOddBalance; // reduces odd
        }

        const hGain = this.ctx.createGain();
        const effectiveGain = h.level * weighting * 0.25 * velScale;
        hGain.gain.setValueAtTime(0, now);
        hGain.gain.linearRampToValueAtTime(effectiveGain, now + 0.01);
        hGain.gain.exponentialRampToValueAtTime(
          Math.max(0.0001, effectiveGain * 0.3),
          now + durationSec * 0.8
        );

        hOsc.connect(hGain);
        hGain.connect(voiceMasterGain);
        voiceOscillators.push(hOsc);
        voiceGains.push(hGain);

        hOsc.start(now);
      }
    }

    // ==========================================
    // 5. DISTORTION STAGING & AUTO GAIN MATCH
    // ==========================================
    if (this.params.distortion.drive > 0.02 && this.params.distortion.mix > 0.02) {
      const shaper = this.ctx.createWaveShaper();
      shaper.curve = this.createDistortionCurve(
        this.params.distortion.type,
        this.params.distortion.drive,
        this.params.distortion.bias
      ) as unknown as Float32Array<ArrayBuffer>;
      shaper.oversample = '4x';

      const distGain = this.ctx.createGain();
      const dryGain = this.ctx.createGain();
      const distMix = this.params.distortion.mix;

      // Auto Gain Match attenuation to prevent volume jumping
      const compensation = this.params.autoGainMatch ? 1 / (1 + this.params.distortion.drive * 1.5) : 1;
      distGain.gain.setValueAtTime(distMix * compensation, now);
      dryGain.gain.setValueAtTime(1 - distMix * 0.5, now);

      voiceMasterGain.connect(shaper);
      shaper.connect(distGain);
      distGain.connect(this.masterGain);

      voiceMasterGain.connect(dryGain);
      dryGain.connect(this.masterGain);
    } else {
      voiceMasterGain.connect(this.masterGain);
    }

    // Envelope master ramp
    voiceMasterGain.gain.setValueAtTime(1.0, now);
    voiceMasterGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + durationSec + Math.max(0.05, this.params.body.release)
    );

    // Start primary oscillators
    subOsc.start(now);
    bodyOsc.start(now);

    const voiceRecord = {
      oscillators: voiceOscillators,
      gains: voiceGains,
      startTime: now,
    };
    this.activeVoices.push(voiceRecord);

    // Auto schedule stop after duration
    const stopTime = now + durationSec + Math.max(0.05, this.params.body.release) + 0.1;
    setTimeout(() => {
      this.cleanupVoice(voiceRecord);
    }, (stopTime - now) * 1000);
  }

  public stopNote(fadeSec = 0.05) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (const voice of this.activeVoices) {
      for (const gain of voice.gains) {
        try {
          gain.gain.cancelScheduledValues(now);
          gain.gain.linearRampToValueAtTime(0.0001, now + fadeSec);
        } catch {
          // ignore
        }
      }
      setTimeout(() => {
        this.cleanupVoice(voice);
      }, (fadeSec + 0.02) * 1000);
    }
    this.isNotePlaying = false;
  }

  private cleanupVoice(voice: {
    oscillators: (OscillatorNode | AudioNode)[];
    gains: GainNode[];
    startTime: number;
  }) {
    for (const osc of voice.oscillators) {
      if ('stop' in osc && typeof osc.stop === 'function') {
        try {
          osc.stop();
        } catch {
          // already stopped
        }
      }
    }
    const idx = this.activeVoices.indexOf(voice);
    if (idx !== -1) {
      this.activeVoices.splice(idx, 1);
    }
  }

  // ==========================================
  // REAL-TIME HEARABILITY & SPECTRUM ANALYSIS
  // ==========================================
  public getSpectrumData(buffer: Uint8Array): void {
    if (!this.analyser) return;
    this.analyser.getByteFrequencyData(buffer as unknown as Uint8Array<ArrayBuffer>);
  }

  public analyzeHearability(): HearabilityAnalysis {
    if (!this.analyser || !this.ctx) {
      return {
        fundamentalEnergy: 40,
        bodyEnergy: 30,
        upperHarmonicEnergy: 15,
        smallSpeakerScore: 35,
        lowFrequencyDependence: 'Moderate',
        recommendation: 'Engine idle. Play a note to analyze acoustic translation.',
      };
    }

    const binCount = this.analyser.frequencyBinCount;
    const freqData = new Uint8Array(binCount);
    this.analyser.getByteFrequencyData(freqData as unknown as Uint8Array<ArrayBuffer>);

    const sampleRate = this.ctx.sampleRate;
    const binSize = sampleRate / this.analyser.fftSize;

    let subSum = 0;
    let subCount = 0;
    let bodySum = 0;
    let bodyCount = 0;
    let upperSum = 0;
    let upperCount = 0;

    for (let i = 0; i < binCount; i++) {
      const freq = i * binSize;
      const val = freqData[i];

      if (freq >= 20 && freq < 85) {
        subSum += val;
        subCount++;
      } else if (freq >= 85 && freq < 250) {
        bodySum += val;
        bodyCount++;
      } else if (freq >= 250 && freq < 1600) {
        upperSum += val;
        upperCount++;
      }
    }

    const avgSub = subCount > 0 ? (subSum / subCount / 255) * 100 : 0;
    const avgBody = bodyCount > 0 ? (bodySum / bodyCount / 255) * 100 : 0;
    const avgUpper = upperCount > 0 ? (upperSum / upperCount / 255) * 100 : 0;

    // Small speaker score evaluates presence in the 120Hz - 800Hz audible range
    // Phone/laptop speakers have high cutoffs; if bass is all < 80Hz, it vanishes!
    const speakerScore = Math.min(100, Math.round(avgBody * 0.6 + avgUpper * 0.8));

    let dependence: 'Balanced' | 'Moderate' | 'High' = 'Balanced';
    let recommendation = 'Bass has healthy harmonic balance across full and small speaker targets.';

    if (avgSub > 15 && avgBody < 8 && avgUpper < 5) {
      dependence = 'High';
      recommendation =
        'High low-frequency dependence. Fundamental will disappear on phone/laptop speakers. Inject 2nd and 3rd harmonics.';
    } else if (avgBody < 15 && avgUpper < 10) {
      dependence = 'Moderate';
      recommendation =
        'Moderate hearability. Consider increasing body saturation or 3rd/5th harmonics for small bluetooth speaker punch.';
    } else if (speakerScore > 75) {
      recommendation = 'Rich upper presence. Excellent translation on mobile and laptop transducers.';
    }

    return {
      fundamentalEnergy: Math.round(avgSub),
      bodyEnergy: Math.round(avgBody),
      upperHarmonicEnergy: Math.round(avgUpper),
      smallSpeakerScore: speakerScore,
      lowFrequencyDependence: dependence,
      recommendation,
    };
  }

  public getBassHealth(): BassHealthMetrics {
    const analysis = this.analyzeHearability();
    return {
      subStability: this.params.sub.monoLock ? 'Optimal' : 'Caution',
      monoCompatibility: this.params.sub.monoLock ? 1.0 : 0.82,
      harmonicRichness:
        analysis.upperHarmonicEnergy > 40
          ? 'Rich'
          : analysis.upperHarmonicEnergy > 15
          ? 'Balanced'
          : 'Pure Sine',
      dynamicConsistency: 8.5,
      upperBassPresence:
        analysis.smallSpeakerScore > 65
          ? 'Optimal'
          : analysis.smallSpeakerScore > 35
          ? 'Moderate'
          : 'Low',
    };
  }

  // ==========================================
  // PATTERN SEQUENCER ENGINE
  // ==========================================
  public startSequencer(
    pattern: PatternStep[],
    bpm: number,
    onStep: (step: number) => void
  ) {
    this.init();
    this.stopSequencer();
    this.isSequencerRunning = true;
    this.onStepCallback = onStep;
    this.currentStepIndex = 0;

    const stepIntervalMs = (60 / bpm / 4) * 1000; // 16th note steps

    const runStep = () => {
      if (!this.isSequencerRunning) return;

      const step = pattern[this.currentStepIndex];
      if (step && step.active) {
        const freq = 440 * Math.pow(2, (step.midiNote - 69) / 12);
        const duration = (step.durationSteps * stepIntervalMs) / 1000;
        this.triggerNote(freq, step.velocity, duration, step.slide);
      }

      if (this.onStepCallback) {
        this.onStepCallback(this.currentStepIndex);
      }

      this.currentStepIndex = (this.currentStepIndex + 1) % 16;
      this.sequencerTimer = window.setTimeout(runStep, stepIntervalMs);
    };

    runStep();
  }

  public stopSequencer() {
    this.isSequencerRunning = false;
    if (this.sequencerTimer !== null) {
      clearTimeout(this.sequencerTimer);
      this.sequencerTimer = null;
    }
    this.stopNote(0.05);
  }

  public isRunning(): boolean {
    return this.isSequencerRunning;
  }
}

export const bassDsp = new BassDspEngine();
