import { PatternStep } from '../types/music';

// Helper: encode variable length quantity (VLQ)
function writeVLQ(value: number): number[] {
  let buffer = value & 0x7f;
  const bytes: number[] = [];
  while ((value >>= 7) > 0) {
    buffer <<= 8;
    buffer |= 0x80;
    buffer += value & 0x7f;
  }
  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) buffer >>= 8;
    else break;
  }
  return bytes;
}

function writeString(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}

function write32Bit(val: number): number[] {
  return [(val >> 24) & 0xff, (val >> 16) & 0xff, (val >> 8) & 0xff, val & 0xff];
}

function write16Bit(val: number): number[] {
  return [(val >> 8) & 0xff, val & 0xff];
}

export function generateBassMidiFile(
  steps: PatternStep[],
  bpm = 120,
  ppq = 960
): Uint8Array {
  const trackBytes: number[] = [];

  // 1. Meta Event: Set Tempo (microsec per quarter note = 60,000,000 / BPM)
  const mpqn = Math.round(60000000 / bpm);
  trackBytes.push(0x00, 0xff, 0x51, 0x03, (mpqn >> 16) & 0xff, (mpqn >> 8) & 0xff, mpqn & 0xff);

  // 2. Meta Event: Time Signature (4/4)
  trackBytes.push(0x00, 0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08);

  // 3. Meta Event: Track Name
  const trackName = writeString('BassForge MIDI Pattern');
  trackBytes.push(0x00, 0xff, 0x03, trackName.length, ...trackName);

  // 16th note step = ppq / 4 = 240 ticks at 960 PPQ
  const stepTicks = Math.round(ppq / 4);

  // Accumulate events
  let lastEventTick = 0;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepStartTick = i * stepTicks;

    if (step.active) {
      const deltaOn = stepStartTick - lastEventTick;
      trackBytes.push(...writeVLQ(deltaOn));
      // Note On, channel 1 (0x90)
      trackBytes.push(0x90, step.midiNote & 0x7f, step.velocity & 0x7f);
      lastEventTick = stepStartTick;

      // Note duration: gate length (e.g. 90% of step to allow articulation or full step for slide)
      const durationTicks = step.slide
        ? stepTicks * step.durationSteps
        : Math.round(stepTicks * step.durationSteps * 0.88);

      const noteOffTick = stepStartTick + durationTicks;
      const deltaOff = noteOffTick - lastEventTick;
      trackBytes.push(...writeVLQ(deltaOff));
      // Note Off, channel 1 (0x80)
      trackBytes.push(0x80, step.midiNote & 0x7f, 0x00);
      lastEventTick = noteOffTick;
    }
  }

  // Pad to end of 16-step bar if needed
  const totalBarTicks = 16 * stepTicks;
  if (lastEventTick < totalBarTicks) {
    const deltaEnd = totalBarTicks - lastEventTick;
    trackBytes.push(...writeVLQ(deltaEnd));
  } else {
    trackBytes.push(0x00);
  }

  // End of Track Meta Event
  trackBytes.push(0xff, 0x2f, 0x00);

  // Build Final MIDI File
  const fileBytes: number[] = [];

  // MThd Header Chunk
  fileBytes.push(...writeString('MThd'));
  fileBytes.push(...write32Bit(6)); // Header length
  fileBytes.push(...write16Bit(0)); // Format 0 (single track)
  fileBytes.push(...write16Bit(1)); // 1 track
  fileBytes.push(...write16Bit(ppq)); // Division: 960 ticks per quarter note

  // MTrk Track Chunk
  fileBytes.push(...writeString('MTrk'));
  fileBytes.push(...write32Bit(trackBytes.length));
  fileBytes.push(...trackBytes);

  return new Uint8Array(fileBytes);
}

export function downloadBassMidiFile(
  steps: PatternStep[],
  bpm = 120,
  filename = 'BassForge_Pattern.mid'
): void {
  const midiData = generateBassMidiFile(steps, bpm);
  const blob = new Blob([midiData as unknown as BlobPart], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function createBassMidiBlobUrl(steps: PatternStep[], bpm = 120): string {
  const midiData = generateBassMidiFile(steps, bpm);
  const blob = new Blob([midiData as unknown as BlobPart], { type: 'audio/midi' });
  return URL.createObjectURL(blob);
}
