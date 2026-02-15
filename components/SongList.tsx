import React from 'react';
import { Song } from '../types';
import { Play, Clock, Music } from 'lucide-react';

interface SongListProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onSongClick: (song: Song) => void;
}

export const SongList: React.FC<SongListProps> = ({ songs, currentSong, isPlaying, onSongClick }) => {
  
  const formatSize = (bytes: string) => {
    const b = parseInt(bytes, 10);
    if (isNaN(b)) return '-';
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <Music className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">Your library is empty</p>
        <p className="text-sm">Upload music to the /SchoolMusic folder</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto pb-32">
       {/* Header */}
       <div className="sticky top-0 bg-slate-950/95 backdrop-blur z-10 border-b border-slate-800 px-6 py-3 grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
         <div className="col-span-1 text-center">#</div>
         <div className="col-span-8">Title</div>
         <div className="col-span-3 text-right">Size</div>
       </div>

       <div className="px-2">
         {songs.map((song, index) => {
           const isCurrent = currentSong?.id === song.id;
           
           return (
             <div 
               key={song.id}
               onClick={() => onSongClick(song)}
               className={`group grid grid-cols-12 gap-4 px-4 py-3 items-center rounded-lg cursor-pointer transition-colors text-sm
                 ${isCurrent ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-300 hover:bg-slate-900'}`}
             >
               <div className="col-span-1 flex justify-center text-slate-500 font-mono w-6">
                 {isCurrent && isPlaying ? (
                    <div className="flex items-end gap-[1px] h-3">
                      <span className="w-1 bg-indigo-500 h-1.5 animate-[bounce_1s_infinite]"></span>
                      <span className="w-1 bg-indigo-500 h-3 animate-[bounce_1.2s_infinite]"></span>
                      <span className="w-1 bg-indigo-500 h-2 animate-[bounce_0.8s_infinite]"></span>
                    </div>
                 ) : (
                    <span className="group-hover:hidden">{index + 1}</span>
                 )}
                 <Play className={`w-3 h-3 hidden ${!isCurrent && 'group-hover:block text-white'}`} />
               </div>
               
               <div className="col-span-8 font-medium truncate">
                 {song.name.replace(/\.mp3$/i, '')}
               </div>
               
               <div className="col-span-3 text-right text-slate-500 font-mono text-xs">
                 {formatSize(song.size)}
               </div>
             </div>
           );
         })}
       </div>
    </div>
  );
};