import { useState, useRef, useEffect } from 'react';

interface BackgroundMusicPlayerProps {
  musicUrl: string;
  gameName?: string;
  autoPlay?: boolean;
  loop?: boolean;
}

export function BackgroundMusicPlayer({
  musicUrl,
  gameName,
  autoPlay = false,
  loop = true,
}: BackgroundMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3); // Default to 30%
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (!loop) setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    // Auto-play if specified
    if (autoPlay) {
      audio.play().catch(() => {
        // Auto-play blocked, user needs to interact first
        setIsPlaying(false);
      });
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [musicUrl, autoPlay, loop]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error('Playback failed:', error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={musicUrl} loop={loop} />

      {/* Music Player Widget */}
      <div
        className={`border-4 border-wood-brown bg-sand-beige shadow-lg transition-all ${
          isMinimized ? 'w-16' : 'w-80'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2 bg-wood-brown">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-pixel text-[10px] text-skull-white">
              🎵
            </span>
            {!isMinimized && (
              <span className="text-pixel text-[10px] text-skull-white truncate">
                {gameName || 'Background Music'}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-pixel text-[10px] text-skull-white hover:text-pirate-gold"
          >
            {isMinimized ? '▢' : '▬'}
          </button>
        </div>

        {/* Player Controls (when expanded) */}
        {!isMinimized && (
          <div className="p-3 space-y-2">
            {/* Progress Bar */}
            <div>
              <div className="h-1 bg-ocean-dark relative">
                <div
                  className="h-full bg-treasure-green"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-pixel text-[8px] text-ocean-dark mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="btn-retro text-[10px] px-2 py-1 flex-shrink-0"
              >
                {isPlaying ? '⏸' : '▶'}
              </button>

              {/* Volume Icon */}
              <button
                onClick={toggleMute}
                className="text-pixel text-xs text-ocean-dark hover:text-pirate-gold flex-shrink-0"
              >
                {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </button>

              {/* Volume Slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-1 bg-ocean-dark appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${
                    volume * 100
                  }%, #2C5F7C ${volume * 100}%, #2C5F7C 100%)`,
                }}
              />

              {/* Loop Indicator */}
              <span
                className={`text-pixel text-[10px] flex-shrink-0 ${
                  loop ? 'text-treasure-green' : 'text-ocean-dark/50'
                }`}
              >
                🔁
              </span>
            </div>

            {/* Now Playing */}
            <div className="flex items-center gap-2 pt-1 border-t-2 border-wood-brown">
              <div
                className={`w-2 h-2 rounded-full ${
                  isPlaying ? 'bg-treasure-green animate-pulse' : 'bg-ocean-dark'
                }`}
              />
              <span className="text-pixel text-[8px] text-ocean-dark">
                {isPlaying ? 'Now Playing' : 'Paused'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
