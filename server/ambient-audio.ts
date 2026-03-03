const SAMPLE_RATE = 22050;
const CHANNELS = 1;
const BITS_PER_SAMPLE = 16;
const BYTES_PER_SAMPLE = BITS_PER_SAMPLE / 8;

interface ToneLayer {
  frequency: number;
  amplitude: number;
  detuneHz?: number;
  vibratoRate?: number;
  vibratoDepth?: number;
}

interface TrackDefinition {
  id: string;
  name: string;
  description: string;
  durationSeconds: number;
  layers: ToneLayer[];
  fadeSeconds: number;
  swellRate: number;
  premium: boolean;
}

export const AMBIENT_TRACKS: TrackDefinition[] = [
  {
    id: "morning-peace",
    name: "Morning Peace",
    description: "Gentle tones for starting your day in prayer",
    durationSeconds: 30,
    layers: [
      { frequency: 261.63, amplitude: 0.12, detuneHz: 0.5, vibratoRate: 0.15, vibratoDepth: 1.5 },
      { frequency: 329.63, amplitude: 0.08, detuneHz: 0.3, vibratoRate: 0.12, vibratoDepth: 1.0 },
      { frequency: 392.0, amplitude: 0.06, detuneHz: 0.4, vibratoRate: 0.1, vibratoDepth: 0.8 },
      { frequency: 130.81, amplitude: 0.07, detuneHz: 0.2, vibratoRate: 0.08, vibratoDepth: 0.5 },
    ],
    fadeSeconds: 3,
    swellRate: 0.08,
    premium: false,
  },
  {
    id: "still-waters",
    name: "Still Waters",
    description: "Calm, flowing sounds inspired by Psalm 23",
    durationSeconds: 30,
    layers: [
      { frequency: 196.0, amplitude: 0.1, detuneHz: 0.6, vibratoRate: 0.2, vibratoDepth: 2.0 },
      { frequency: 293.66, amplitude: 0.08, detuneHz: 0.4, vibratoRate: 0.15, vibratoDepth: 1.5 },
      { frequency: 349.23, amplitude: 0.05, detuneHz: 0.3, vibratoRate: 0.18, vibratoDepth: 1.2 },
      { frequency: 98.0, amplitude: 0.06, detuneHz: 0.15, vibratoRate: 0.06, vibratoDepth: 0.3 },
      { frequency: 440.0, amplitude: 0.03, detuneHz: 0.5, vibratoRate: 0.22, vibratoDepth: 1.8 },
    ],
    fadeSeconds: 4,
    swellRate: 0.06,
    premium: false,
  },
  {
    id: "quiet-prayer",
    name: "Quiet Prayer",
    description: "Deep, warm tones for meditation and prayer",
    durationSeconds: 30,
    layers: [
      { frequency: 146.83, amplitude: 0.11, detuneHz: 0.3, vibratoRate: 0.1, vibratoDepth: 1.0 },
      { frequency: 220.0, amplitude: 0.09, detuneHz: 0.25, vibratoRate: 0.08, vibratoDepth: 0.8 },
      { frequency: 110.0, amplitude: 0.07, detuneHz: 0.15, vibratoRate: 0.05, vibratoDepth: 0.4 },
      { frequency: 330.0, amplitude: 0.04, detuneHz: 0.35, vibratoRate: 0.13, vibratoDepth: 1.2 },
    ],
    fadeSeconds: 5,
    swellRate: 0.05,
    premium: false,
  },
  {
    id: "evening-rest",
    name: "Evening Rest",
    description: "Soothing low tones for winding down with Scripture",
    durationSeconds: 30,
    layers: [
      { frequency: 130.81, amplitude: 0.1, detuneHz: 0.4, vibratoRate: 0.07, vibratoDepth: 0.6 },
      { frequency: 164.81, amplitude: 0.08, detuneHz: 0.3, vibratoRate: 0.09, vibratoDepth: 0.7 },
      { frequency: 196.0, amplitude: 0.06, detuneHz: 0.2, vibratoRate: 0.06, vibratoDepth: 0.5 },
      { frequency: 65.41, amplitude: 0.05, detuneHz: 0.1, vibratoRate: 0.04, vibratoDepth: 0.2 },
    ],
    fadeSeconds: 4,
    swellRate: 0.04,
    premium: true,
  },
  {
    id: "grace",
    name: "Grace",
    description: "Ethereal, uplifting harmonics for worship",
    durationSeconds: 30,
    layers: [
      { frequency: 220.0, amplitude: 0.1, detuneHz: 0.5, vibratoRate: 0.12, vibratoDepth: 1.5 },
      { frequency: 261.63, amplitude: 0.08, detuneHz: 0.4, vibratoRate: 0.14, vibratoDepth: 1.3 },
      { frequency: 329.63, amplitude: 0.07, detuneHz: 0.35, vibratoRate: 0.16, vibratoDepth: 1.6 },
      { frequency: 440.0, amplitude: 0.04, detuneHz: 0.6, vibratoRate: 0.2, vibratoDepth: 2.0 },
      { frequency: 110.0, amplitude: 0.05, detuneHz: 0.2, vibratoRate: 0.05, vibratoDepth: 0.3 },
    ],
    fadeSeconds: 4,
    swellRate: 0.07,
    premium: true,
  },
];

const audioCache = new Map<string, Buffer>();

function generateAmbientWav(track: TrackDefinition): Buffer {
  const cached = audioCache.get(track.id);
  if (cached) return cached;

  const totalSamples = SAMPLE_RATE * track.durationSeconds;
  const dataSize = totalSamples * CHANNELS * BYTES_PER_SAMPLE;
  const headerSize = 44;
  const buffer = Buffer.alloc(headerSize + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(CHANNELS, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * CHANNELS * BYTES_PER_SAMPLE, 28);
  buffer.writeUInt16LE(CHANNELS * BYTES_PER_SAMPLE, 32);
  buffer.writeUInt16LE(BITS_PER_SAMPLE, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  const fadeSamples = track.fadeSeconds * SAMPLE_RATE;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    for (const layer of track.layers) {
      const swell = 0.5 + 0.5 * Math.sin(2 * Math.PI * track.swellRate * t);
      const vibrato = layer.vibratoDepth
        ? layer.vibratoDepth * Math.sin(2 * Math.PI * (layer.vibratoRate || 0.1) * t)
        : 0;
      const freq = layer.frequency + vibrato;
      const mainWave = Math.sin(2 * Math.PI * freq * t);
      let detuned = 0;
      if (layer.detuneHz) {
        detuned =
          0.3 * Math.sin(2 * Math.PI * (freq + layer.detuneHz) * t) +
          0.3 * Math.sin(2 * Math.PI * (freq - layer.detuneHz) * t) +
          0.15 * Math.sin(2 * Math.PI * (freq + layer.detuneHz * 2.1) * t) +
          0.15 * Math.sin(2 * Math.PI * (freq - layer.detuneHz * 1.9) * t);
      }
      sample += layer.amplitude * swell * (mainWave * 0.5 + detuned * 0.5);
    }

    let envelope = 1.0;
    if (i < fadeSamples) {
      envelope = i / fadeSamples;
      envelope = envelope * envelope;
    } else if (i > totalSamples - fadeSamples) {
      envelope = (totalSamples - i) / fadeSamples;
      envelope = envelope * envelope;
    }

    sample *= envelope;
    sample = Math.max(-0.95, Math.min(0.95, sample));
    const intSample = Math.round(sample * 32767);
    buffer.writeInt16LE(intSample, headerSize + i * BYTES_PER_SAMPLE);
  }

  audioCache.set(track.id, buffer);
  return buffer;
}

export function getTrackList() {
  return AMBIENT_TRACKS.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    durationSeconds: t.durationSeconds,
    premium: t.premium,
  }));
}

export function streamTrack(trackId: string): Buffer | null {
  const track = AMBIENT_TRACKS.find((t) => t.id === trackId);
  if (!track) return null;
  return generateAmbientWav(track);
}
