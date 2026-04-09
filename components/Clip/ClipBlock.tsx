'use client';

import { Clip, Track } from '@/components/Studio/types';

type ClipBlockProps = {
  clip: Clip;
  track: Track;
  totalSec: number;
  onDragStart: (trackId: string, clipId: string, x: number) => void;
  onResizeStart: (trackId: string, clipId: string, x: number) => void;
};

export function ClipBlock({ clip, track, totalSec, onDragStart, onResizeStart }: ClipBlockProps) {
  const left = (clip.startSec / totalSec) * 100;
  const width = Math.max(4, (clip.durationSec / totalSec) * 100);

  return (
    <div
      className="absolute top-0 h-full min-w-10 rounded-md border text-[10px] shadow-sm"
      style={{ left: `${left}%`, width: `${width}%`, background: `${track.color}33`, borderColor: `${track.color}aa` }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest('[data-resize]')) return;
        onDragStart(track.id, clip.id, e.clientX);
      }}
    >
      <div className="px-2 pt-1 text-slate-100">{clip.name}</div>
      <div className="absolute inset-0 mt-4 flex items-center gap-[1px] px-1 opacity-60">
        {clip.peaks.map((peak, idx) => (
          <span key={idx} className="w-[2px] rounded-full bg-white" style={{ height: `${Math.max(3, peak * 22)}px` }} />
        ))}
      </div>
      <button
        data-resize
        className="absolute right-0 top-0 h-full w-2 cursor-ew-resize bg-gradient-to-r from-transparent to-slate-200/35"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onResizeStart(track.id, clip.id, e.clientX);
        }}
      />
    </div>
  );
}
