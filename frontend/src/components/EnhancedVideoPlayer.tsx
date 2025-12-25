import { useState, useRef, useEffect } from 'react';

interface EnhancedVideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  title?: string;
}

export function EnhancedVideoPlayer({ videoUrl, posterUrl, title }: EnhancedVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative border-4 border-wood-brown bg-black group"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        className="w-full h-full"
        onClick={togglePlay}
      />

      {/* Title Overlay */}
      {title && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <h3 className="text-pixel text-sm text-skull-white">{title}</h3>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress Bar */}
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-ocean-dark appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${
                (currentTime / duration) * 100
              }%, #2C5F7C ${(currentTime / duration) * 100}%, #2C5F7C 100%)`,
            }}
          />
          <div className="flex justify-between text-pixel text-[10px] text-skull-white mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="btn-retro text-xs px-3 py-1 bg-treasure-green"
            >
              {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
            </button>

            {/* Volume */}
            <button
              onClick={toggleMute}
              className="btn-retro text-xs px-2 py-1"
            >
              {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-ocean-dark appearance-none cursor-pointer"
            />
          </div>

          {/* Right Controls */}
          <div>
            <button
              onClick={toggleFullscreen}
              className="btn-retro text-xs px-2 py-1"
            >
              {isFullscreen ? '⛶ EXIT' : '⛶ FULL'}
            </button>
          </div>
        </div>
      </div>

      {/* Play Button Overlay (when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-20 h-20 bg-pirate-gold/80 hover:bg-pirate-gold rounded-full flex items-center justify-center text-4xl text-skull-white transition-colors"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}
