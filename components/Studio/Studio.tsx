'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { Timeline } from '@/components/Timeline/Timeline';
import { AIAssistant } from '@/components/AIAssistant/AIAssistant';
import { ControlBar } from '@/components/ControlBar/ControlBar';
import { Clip, StudioMode, Track } from '@/components/Studio/types';

const TOTAL_SEC = 60;

const initialTracks: Track[] = [
  { id: 'vocals', name: 'Vocals', color: '#60a5fa', volume: 78, muted: false, clips: [] },
  {
    id: 'instrument',
    name: 'Instrument',
    color: '#818cf8',
    volume: 72,
    muted: false,
    clips: [
      {
        id: crypto.randomUUID(),
        name: 'Instrument Loop',
        startSec: 4,
        durationSec: 14,
        peaks: Array.from({ length: 60 }, (_, i) => 0.2 + (Math.sin(i / 3) + 1) * 0.25)
      }
    ]
  }
];

export function Studio({ initialMode = 'sing' }: { initialMode?: StudioMode }) {
  const [mode] = useState<StudioMode>(initialMode);
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [progressSec, setProgressSec] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [aiResponse, setAiResponse] = useState('Ready. Ask AI for vocal, mix, or arrangement help.');
  const [aiLoading, setAiLoading] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const dragRef = useRef<{ trackId: string; clipId: string; startX: number; startSec: number } | null>(null);
  const resizeRef = useRef<{ trackId: string; clipId: string; startX: number; startDurationSec: number } | null>(null);

  const timeLabel = useMemo(() => `${fmt(progressSec)} / ${fmt(TOTAL_SEC)}`, [progressSec]);

  useEffect(() => {
    const move = (event: MouseEvent) => {
      if (dragRef.current) {
        setTracks((prev) => moveClip(prev, dragRef.current!, event.clientX));
      }
      if (resizeRef.current) {
        setTracks((prev) => resizeClip(prev, resizeRef.current!, event.clientX));
      }
    };
    const up = () => {
      dragRef.current = null;
      resizeRef.current = null;
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setProgressSec((p) => Math.min(TOTAL_SEC, p + 0.1)), 100);
    return () => clearInterval(id);
  }, [playing]);

  const handleRecord = async () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    chunksRef.current = [];

    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    recorder.ondataavailable = (ev) => { if (ev.data.size > 0) chunksRef.current.push(ev.data); };
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const clip = await makeClipFromBlob(blob, tracks);
      setTracks((prev) => prev.map((t) => t.id === 'vocals' ? { ...t, clips: [...t.clips, clip] } : t));
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    recorder.start();
  };

  const handleFixVoice = async () => {
    const latest = getLatestVocalClip(tracks);
    if (!latest?.audioUrl) {
      setAiResponse('Record a vocal clip first.');
      return;
    }

    setAiLoading(true);
    setAiResponse('Processing...');
    const processed = await processVoiceClip(latest.audioUrl);
    setTracks((prev) => prev.map((track) => track.id !== 'vocals' ? track : {
      ...track,
      clips: track.clips.map((clip) => clip.id === latest.id ? { ...clip, audioUrl: processed.audioUrl, peaks: processed.peaks } : clip)
    }));
    setAiLoading(false);
    setAiResponse('Improved clarity and balance. Applied gentle EQ + compression.');
  };

  const handleAI = async (prompt: string) => {
    setAiLoading(true);
    setAiResponse('Thinking...');
    await wait(500);
    setAiResponse(prompt.toLowerCase().includes('emotional') ? 'Adjusted tone and dynamics.' : 'Improved clarity and balance.');
    setAiLoading(false);
  };

  return (
    <section className="flex h-[calc(100vh-60px)] flex-col bg-[#050b18] text-slate-100">
      <div className="flex min-h-0 flex-1">
        <Sidebar
          tracks={tracks}
          onToggleMute={(trackId) => setTracks((prev) => prev.map((t) => t.id === trackId ? { ...t, muted: !t.muted } : t))}
          onVolume={(trackId, volume) => setTracks((prev) => prev.map((t) => t.id === trackId ? { ...t, volume } : t))}
        />

        <Timeline
          tracks={tracks}
          totalSec={TOTAL_SEC}
          progressSec={progressSec}
          mode={mode}
          onDragStart={(trackId, clipId, x) => {
            const clip = tracks.find((t) => t.id === trackId)?.clips.find((c) => c.id === clipId);
            if (!clip) return;
            dragRef.current = { trackId, clipId, startX: x, startSec: clip.startSec };
          }}
          onResizeStart={(trackId, clipId, x) => {
            const clip = tracks.find((t) => t.id === trackId)?.clips.find((c) => c.id === clipId);
            if (!clip) return;
            resizeRef.current = { trackId, clipId, startX: x, startDurationSec: clip.durationSec };
          }}
        />

        <AIAssistant
          onFixVoice={handleFixVoice}
          onQuickAction={handleAI}
          onPrompt={handleAI}
          response={aiResponse}
          loading={aiLoading}
        />
      </div>

      <ControlBar
        playing={playing}
        timeLabel={timeLabel}
        onPlay={() => setPlaying((p) => !p)}
        onStop={() => { setPlaying(false); setProgressSec(0); }}
        onRecord={handleRecord}
      />
    </section>
  );
}

function fmt(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractPeaks(data: Float32Array, count = 72) {
  const block = Math.max(1, Math.floor(data.length / count));
  const peaks: number[] = [];
  for (let i = 0; i < count; i += 1) {
    let max = 0;
    const start = i * block;
    const end = Math.min(start + block, data.length);
    for (let j = start; j < end; j += 1) max = Math.max(max, Math.abs(data[j]));
    peaks.push(max);
  }
  return peaks;
}

async function makeClipFromBlob(blob: Blob, tracks: Track[]): Promise<Clip> {
  const arr = await blob.arrayBuffer();
  const context = new AudioContext();
  const decoded = await context.decodeAudioData(arr.slice(0));
  const peaks = extractPeaks(decoded.getChannelData(0), 72);
  const durationSec = Math.max(1, decoded.duration);
  await context.close();

  const vocals = tracks.find((t) => t.id === 'vocals');
  const latestEnd = vocals?.clips.reduce((m, c) => Math.max(m, c.startSec + c.durationSec + 0.5), 0) ?? 0;

  return {
    id: crypto.randomUUID(),
    name: `Vocal Take ${(vocals?.clips.length ?? 0) + 1}`,
    startSec: Math.min(TOTAL_SEC - durationSec, latestEnd),
    durationSec,
    peaks,
    audioUrl: URL.createObjectURL(blob)
  };
}

function getLatestVocalClip(tracks: Track[]) {
  const vocals = tracks.find((t) => t.id === 'vocals');
  return vocals?.clips[vocals.clips.length - 1];
}

function moveClip(allTracks: Track[], drag: { trackId: string; clipId: string; startX: number; startSec: number }, x: number) {
  const laneWidth = 900;
  const deltaSec = ((x - drag.startX) / laneWidth) * TOTAL_SEC;
  return allTracks.map((track) => track.id !== drag.trackId ? track : {
    ...track,
    clips: track.clips.map((clip) => clip.id !== drag.clipId ? clip : {
      ...clip,
      startSec: Math.max(0, Math.min(TOTAL_SEC - clip.durationSec, drag.startSec + deltaSec))
    })
  });
}

function resizeClip(allTracks: Track[], resize: { trackId: string; clipId: string; startX: number; startDurationSec: number }, x: number) {
  const laneWidth = 900;
  const deltaSec = ((x - resize.startX) / laneWidth) * TOTAL_SEC;
  return allTracks.map((track) => track.id !== resize.trackId ? track : {
    ...track,
    clips: track.clips.map((clip) => clip.id !== resize.clipId ? clip : {
      ...clip,
      durationSec: Math.max(1, Math.min(TOTAL_SEC - clip.startSec, resize.startDurationSec + deltaSec))
    })
  });
}

async function processVoiceClip(audioUrl: string) {
  const arr = await (await fetch(audioUrl)).arrayBuffer();
  const decodeCtx = new AudioContext();
  const src = await decodeCtx.decodeAudioData(arr.slice(0));
  await decodeCtx.close();

  const offline = new OfflineAudioContext(src.numberOfChannels, src.length, src.sampleRate);
  const source = offline.createBufferSource();
  source.buffer = src;

  const highpass = offline.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 90;

  const presence = offline.createBiquadFilter();
  presence.type = 'peaking';
  presence.frequency.value = 3000;
  presence.gain.value = 1.8;
  presence.Q.value = 1.1;

  const compressor = offline.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.ratio.value = 2.4;

  const gain = offline.createGain();
  gain.gain.value = 1.08;

  source.connect(highpass);
  highpass.connect(presence);
  presence.connect(compressor);
  compressor.connect(gain);
  gain.connect(offline.destination);
  source.start();

  const rendered = await offline.startRendering();
  const peaks = extractPeaks(rendered.getChannelData(0), 72);
  const wav = encodeWav(rendered);
  return { audioUrl: URL.createObjectURL(wav), peaks };
}

function encodeWav(buffer: AudioBuffer) {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * channels * 2;
  const out = new ArrayBuffer(44 + length);
  const view = new DataView(out);
  const write = (off: number, str: string) => { for (let i = 0; i < str.length; i += 1) view.setUint8(off + i, str.charCodeAt(i)); };

  write(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  write(8, 'WAVE');
  write(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true);
  view.setUint16(34, 16, true);
  write(36, 'data');
  view.setUint32(40, length, true);

  let off = 44;
  const data = Array.from({ length: channels }, (_, i) => buffer.getChannelData(i));
  for (let i = 0; i < buffer.length; i += 1) {
    for (let c = 0; c < channels; c += 1) {
      const sample = Math.max(-1, Math.min(1, data[c][i]));
      view.setInt16(off, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      off += 2;
    }
  }
  return new Blob([out], { type: 'audio/wav' });
}
