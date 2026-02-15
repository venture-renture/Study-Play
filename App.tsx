import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { SongList } from './components/SongList';
import { PlayerControl } from './components/PlayerControl';
import { 
  initGoogleScripts, 
  handleLogin, 
  checkAndCreateFolder, 
  listSongs, 
  uploadFile, 
  fetchFileBlob,
  GOOGLE_CLIENT_ID
} from './services/googleService';
import { Song, RepeatMode } from './types';

// Global to hold the audio element
const audio = new Audio();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Start loading while scripts init
  const [error, setError] = useState<string | null>(null);
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Player State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.OFF);
  const [isShuffle, setIsShuffle] = useState(false);
  const [shuffledQueue, setShuffledQueue] = useState<Song[]>([]);

  const currentBlobUrl = useRef<string | null>(null);

  // Initialize scripts on mount
  useEffect(() => {
    // Prevent init if client ID is not set
    if (GOOGLE_CLIENT_ID === 'YOUR_CLIENT_ID_HERE') {
      setLoading(false);
      return;
    }

    initGoogleScripts(
      GOOGLE_CLIENT_ID,
      () => {
        // Scripts loaded successfully
        setLoading(false);
      },
      (errMsg) => {
        setError(errMsg);
        setLoading(false);
      }
    );
  }, []);

  const attemptLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await handleLogin(); // This opens the popup
      setIsAuthenticated(true);
      await initializeLibrary();
    } catch (err: any) {
      console.error("Login failed", err);
      // If error is just closed popup or access denied, stay on login
      setError("Login failed or cancelled. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const initializeLibrary = async () => {
    try {
      const fId = await checkAndCreateFolder();
      setFolderId(fId);
      const songList = await listSongs(fId);
      setSongs(songList);
    } catch (err: any) {
      console.error("Failed to init library", err);
      setError("Failed to access 'SchoolMusic' folder.");
    }
  };

  // Upload Logic
  const handleUpload = async (fileList: FileList) => {
    if (!folderId) return;
    setIsUploading(true);
    try {
      const files = Array.from(fileList);
      for (const file of files) {
        if (file.type.includes('audio')) {
           await uploadFile(folderId, file);
        }
      }
      // Refresh list
      const updatedList = await listSongs(folderId);
      setSongs(updatedList);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Some uploads failed.");
    } finally {
      setIsUploading(false);
    }
  };

  // Playback Logic
  const playSong = async (song: Song) => {
    try {
      // If playing the same song, just toggle play
      if (currentSong?.id === song.id) {
        if (isPlaying) {
          audio.pause();
        } else {
          audio.play();
        }
        setIsPlaying(!isPlaying);
        return;
      }

      // Cleanup old url
      if (currentBlobUrl.current) {
        URL.revokeObjectURL(currentBlobUrl.current);
        currentBlobUrl.current = null;
      }

      // New song
      audio.pause();
      setIsPlaying(false); // UI pause while loading
      setCurrentSong(song);
      setCurrentTime(0);

      // Fetch blob
      const blob = await fetchFileBlob(song.id);
      const url = URL.createObjectURL(blob);
      currentBlobUrl.current = url;
      
      audio.src = url;
      audio.load();
      audio.play();
      setIsPlaying(true);

    } catch (err) {
      console.error("Playback error", err);
      alert("Failed to play song. Check internet connection.");
      setIsPlaying(false);
    }
  };

  const handleNext = useCallback(() => {
    if (!currentSong || songs.length === 0) return;

    const currentList = isShuffle ? shuffledQueue : songs;
    const currentIndex = currentList.findIndex(s => s.id === currentSong.id);
    
    let nextIndex = currentIndex + 1;
    if (nextIndex >= currentList.length) {
      if (repeatMode === RepeatMode.ALL) {
        nextIndex = 0;
      } else {
        // Stop playback if end of playlist and no repeat
        setIsPlaying(false);
        audio.pause();
        return;
      }
    }
    
    playSong(currentList[nextIndex]);
  }, [currentSong, songs, isShuffle, shuffledQueue, repeatMode]);

  const handlePrev = useCallback(() => {
    if (!currentSong || songs.length === 0) return;
    
    // If we are more than 3 seconds in, just restart song
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    const currentList = isShuffle ? shuffledQueue : songs;
    const currentIndex = currentList.findIndex(s => s.id === currentSong.id);
    
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = currentList.length - 1; 
    }
    
    playSong(currentList[prevIndex]);
  }, [currentSong, songs, isShuffle, shuffledQueue]);

  // Audio Event Listeners
  useEffect(() => {
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => {
      if (repeatMode === RepeatMode.ONE) {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);
    
    // Set initial volume
    audio.volume = volume;

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [handleNext, repeatMode, volume]);

  // Shuffle Logic
  useEffect(() => {
    if (isShuffle) {
      // Create shuffled copy
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      setShuffledQueue(shuffled);
    }
  }, [isShuffle, songs]);

  // Controls
  const togglePlayPause = () => {
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (time: number) => {
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolume = (vol: number) => {
    setVolume(vol);
    audio.volume = vol;
  };

  if (!isAuthenticated) {
    return <Login onLogin={attemptLogin} isLoading={loading} error={error} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          onUpload={handleUpload} 
          isUploading={isUploading} 
          libraryCount={songs.length}
        />
        <main className="flex-1 relative flex flex-col min-w-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
           <SongList 
             songs={songs} 
             currentSong={currentSong} 
             isPlaying={isPlaying}
             onSongClick={playSong}
           />
        </main>
      </div>

      <PlayerControl 
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPause={togglePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        onShuffleToggle={() => setIsShuffle(!isShuffle)}
        onRepeatToggle={() => {
           const modes = [RepeatMode.OFF, RepeatMode.ALL, RepeatMode.ONE];
           const idx = modes.indexOf(repeatMode);
           setRepeatMode(modes[(idx + 1) % modes.length]);
        }}
        repeatMode={repeatMode}
        isShuffle={isShuffle}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={handleVolume}
      />
    </div>
  );
}

export default App;