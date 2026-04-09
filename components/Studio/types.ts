export type StudioMode = 'sing' | 'play';

export type Clip = {
  id: string;
  name: string;
  startSec: number;
  durationSec: number;
  peaks: number[];
  audioUrl?: string;
};

export type Track = {
  id: string;
  name: string;
  color: string;
  volume: number;
  muted: boolean;
  clips: Clip[];
};
