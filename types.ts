export interface Song {
  id: string;
  name: string;
  size: string;
  mimeType: string;
  createdTime?: string;
  blobUrl?: string; // For playback
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
}

export enum RepeatMode {
  OFF = 'OFF',
  ALL = 'ALL',
  ONE = 'ONE',
}

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
}