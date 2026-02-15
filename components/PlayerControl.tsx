import React, { useRef, useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, VolumeX, List 
} from 'lucide-react';
import { Song, PlayerState, RepeatMode } from '../types';

interface PlayerControlProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
}

export const PlayerControl: React.FC<PlayerControlProps> = ({
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onShuffleToggle,
  onRepeatToggle,
  repeatMode,
  isShuffle,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange
}) => {
  
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRepeatIcon = () => {
    switch(repeatMode) {
      case RepeatMode.ONE: return <Repeat className="w-5 h-5 text-indigo-400 relative z-10" />;
      case RepeatMode.ALL: return <Repeat className="w-5 h-5 text-indigo-400" />;
      default: return <Repeat className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="h-24 bg-slate-900 border-t border-slate-800 flex items-center px-6 shrink-0 z-50">
      {/* Song Info */}
      <div className="w-1/4 min-w-[200px]">
        {currentSong ? (
          <div>
            <div className="font-medium text-white truncate text-sm">{currentSong.name.replace(/\.mp3$/i, '')}</div>
            <div className="text-xs text-slate-400">Local Music</div>
          </div>
        ) : (
          <div className="text-sm text-slate-500 italic">No song playing</div>
        )}
      </div>

      {/* Main Controls */}
      <div className="flex-1 flex flex-col items-center max-w-2xl mx-auto">
        <div className="flex items-center gap-6 mb-2">
          <button 
            onClick={onShuffleToggle}
            className={`transition-colors ${isShuffle ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button onClick={onPrev} className="text-slate-300 hover:text-white transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>

          <button 
            onClick={onPlayPause}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
            disabled={!currentSong}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-slate-900 fill-current" />
            ) : (
              <Play className="w-5 h-5 text-slate-900 fill-current ml-0.5" />
            )}
          </button>

          <button onClick={onNext} className="text-slate-300 hover:text-white transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>

          <button 
            onClick={onRepeatToggle}
            className={`transition-colors relative flex items-center justify-center w-8 h-8 rounded-full ${repeatMode !== RepeatMode.OFF ? 'bg-indigo-500/10' : ''}`}
            title="Repeat"
          >
            {repeatMode === RepeatMode.ONE && (
               <span className="absolute text-[8px] font-bold text-indigo-400 -top-0 right-0">1</span>
            )}
            {getRepeatIcon()}
          </button>
        </div>

        {/* Seek Bar */}
        <div className="w-full flex items-center gap-3 text-xs text-slate-400 font-medium">
          <span className="w-8 text-right">{formatTime(currentTime)}</span>
          <div className="relative flex-1 group h-1 cursor-pointer">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute w-full h-full opacity-0 cursor-pointer z-20"
              disabled={!currentSong}
            />
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-700 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-white group-hover:bg-indigo-400 transition-colors"
                 style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
               />
            </div>
            {/* Thumb on hover simulation */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
              style={{ left: `${(currentTime / (duration || 1)) * 100}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
          <span className="w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Controls */}
      <div className="w-1/4 min-w-[200px] flex items-center justify-end gap-3">
         <button onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}>
           {volume === 0 ? <VolumeX className="w-5 h-5 text-slate-500" /> : <Volume2 className="w-5 h-5 text-slate-300" />}
         </button>
         <div className="w-24 h-1 bg-slate-700 rounded-full relative group cursor-pointer">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${volume * 100}%` }}
            />
         </div>
         {/* Simple playlist toggle placeholder */}
         {/* <button className="text-slate-400 hover:text-white ml-2">
           <List className="w-5 h-5" />
         </button> */}
      </div>
    </div>
  );
};