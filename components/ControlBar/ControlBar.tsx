'use client';

type ControlBarProps = {
  playing: boolean;
  timeLabel: string;
  onPlay: () => void;
  onStop: () => void;
  onRecord: () => void;
};

export function ControlBar({ playing, timeLabel, onPlay, onStop, onRecord }: ControlBarProps) {
  return (
    <div className="flex h-16 items-center gap-3 border-t border-slate-800 bg-slate-950 px-4">
      <button className="h-9 w-9 rounded-full border border-slate-700 text-slate-200" onClick={onPlay}>
        {playing ? '⏸' : '▶'}
      </button>
      <button className="h-9 w-9 rounded-full border border-slate-700 text-slate-200" onClick={onStop}>
        ⏹
      </button>
      <button className="h-9 w-9 rounded-full border border-red-500/50 text-red-300" onClick={onRecord}>
        ⏺
      </button>
      <div className="text-xs text-slate-300">{timeLabel}</div>
      <button className="ml-auto rounded-full border border-blue-500/60 px-3 py-1 text-xs text-blue-200">Export</button>
    </div>
  );
}
