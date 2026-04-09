'use client';

import { ClipBlock } from '@/components/Clip/ClipBlock';
import { Track } from '@/components/Studio/types';

type TimelineProps = {
  tracks: Track[];
  totalSec: number;
  progressSec: number;
  mode: string;
  onDragStart: (trackId: string, clipId: string, x: number) => void;
  onResizeStart: (trackId: string, clipId: string, x: number) => void;
};

export function Timeline({ tracks, totalSec, progressSec, mode, onDragStart, onResizeStart }: TimelineProps) {
  const playhead = (progressSec / totalSec) * 100;

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-3 p-3">
      <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
        <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-2 py-0.5 text-blue-200">Arrangement</span>
        <span className="rounded-full border border-slate-700 px-2 py-0.5">Piano Roll</span>
        <span className="ml-auto rounded-full border border-slate-700 px-2 py-0.5">{mode === 'play' ? 'Play Mode' : 'Sing Mode'}</span>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-3">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:calc(100%/16)_100%]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:calc(100%/4)_100%]" />

        <div className="mb-2 grid grid-cols-8 text-[10px] text-slate-500">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i}>Bar {i + 1}</span>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-2 w-[2px] bg-blue-400" style={{ left: `${playhead}%` }} />

        <div className="space-y-2">
          {tracks.map((track) => (
            <div className="flex h-12 items-center gap-2" key={track.id}>
              <div className="w-16 text-xs text-slate-300">{track.name}</div>
              <div className="relative h-10 flex-1 overflow-hidden rounded border border-blue-950/60" data-track-id={track.id}>
                {track.clips.map((clip) => (
                  <ClipBlock
                    key={clip.id}
                    clip={clip}
                    track={track}
                    totalSec={totalSec}
                    onDragStart={onDragStart}
                    onResizeStart={onResizeStart}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
