'use client';

import { Track } from '@/components/Studio/types';

type SidebarProps = {
  tracks: Track[];
  onToggleMute: (trackId: string) => void;
  onVolume: (trackId: string, value: number) => void;
};

export function Sidebar({ tracks, onToggleMute, onVolume }: SidebarProps) {
  return (
    <aside className="w-[270px] border-r border-slate-800 bg-slate-950/80 p-3">
      <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">Tracks</p>
      <div className="space-y-2">
        {tracks.map((track) => (
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-2" key={track.id}>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: track.color }} />
              <span className="flex-1 text-xs text-slate-200">{track.name}</span>
              <button
                className={`rounded px-2 py-0.5 text-[11px] ${track.muted ? 'bg-red-500/20 text-red-200' : 'bg-slate-800 text-slate-300'}`}
                onClick={() => onToggleMute(track.id)}
              >
                {track.muted ? 'Muted' : 'Mute'}
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={track.volume}
              className="w-full accent-blue-500"
              onChange={(e) => onVolume(track.id, Number(e.target.value))}
            />
          </div>
        ))}
      </div>
    </aside>
  );
}
