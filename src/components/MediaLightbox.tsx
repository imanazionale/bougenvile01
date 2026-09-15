import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Film,
  Camera,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { MediaItem } from '../types';

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  mediaList: MediaItem[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  isOpen,
  onClose,
  mediaList,
  currentIndex,
  onSelectIndex,
}) => {
  const currentMedia = mediaList[currentIndex];
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Image zoom state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mediaError, setMediaError] = useState(false);

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setZoomLevel(1);
    setIsPlaying(false);
    onSelectIndex(currentIndex > 0 ? currentIndex - 1 : mediaList.length - 1);
  }, [currentIndex, mediaList.length, onSelectIndex]);

  const handleNext = useCallback(() => {
    setZoomLevel(1);
    setIsPlaying(false);
    onSelectIndex(currentIndex < mediaList.length - 1 ? currentIndex + 1 : 0);
  }, [currentIndex, mediaList.length, onSelectIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ' && currentMedia?.type === 'video') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrev, handleNext, currentMedia?.type, onClose]);

  // Reset zoom and video state on index change
  useEffect(() => {
    setZoomLevel(1);
    setIsPlaying(false);
    setCurrentTime(0);
    setMediaError(false);
  }, [currentIndex]);

  if (!isOpen || !currentMedia) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  // Touch gestures for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swiped left -> Next
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> Prev
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-neutral-950/95 backdrop-blur-xl text-white select-none animate-in fade-in duration-200"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-neutral-900/60 backdrop-blur-md z-30">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-md shrink-0">
            {currentIndex + 1} / {mediaList.length}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white truncate">
              {currentMedia.title}
            </h3>
            <p className="text-[11px] text-neutral-400 hidden sm:block truncate">
              {currentMedia.badge} • Rumah Dikontrakkan Taman Jaya, Cipayung – Depok
            </p>
          </div>
        </div>

        {/* Action icons & Close */}
        <div className="flex items-center gap-2">
          {currentMedia.type === 'photo' && (
            <div className="hidden sm:flex items-center gap-1 bg-neutral-800/80 rounded-lg p-0.5 border border-white/10 text-neutral-300 text-xs mr-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                className="p-1.5 hover:text-white hover:bg-neutral-700/50 rounded transition"
                title="Perkecil"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-1 text-[11px] font-mono">{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                className="p-1.5 hover:text-white hover:bg-neutral-700/50 rounded transition"
                title="Perbesar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              {zoomLevel !== 1 && (
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="p-1.5 hover:text-amber-400 hover:bg-neutral-700/50 rounded transition"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-white/10 transition"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800/90 hover:bg-rose-600 text-neutral-200 hover:text-white border border-white/10 transition shadow-lg"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Media Stage */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {/* Left / Prev Button */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-white/20 shadow-2xl hover:scale-110 active:scale-95 transition-all backdrop-blur-md cursor-pointer"
          title="Sebelumnya (Panah Kiri)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Right / Next Button */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-3 sm:p-3.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-white/20 shadow-2xl hover:scale-110 active:scale-95 transition-all backdrop-blur-md cursor-pointer"
          title="Selanjutnya (Panah Kanan)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Center Media Container */}
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          {mediaError || !currentMedia.url ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-neutral-900/90 rounded-2xl border border-white/10 text-center max-w-md shadow-2xl">
              <Camera className="w-12 h-12 text-neutral-500 mb-3" />
              <h4 className="text-base font-bold text-neutral-200">Belum ada foto/video</h4>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs">{currentMedia.title}</p>
            </div>
          ) : currentMedia.type === 'photo' ? (
            <div className="relative max-w-5xl max-h-[75vh] sm:max-h-[82vh] overflow-hidden rounded-xl">
              <img
                src={currentMedia.url}
                alt={currentMedia.title}
                onError={() => setMediaError(true)}
                style={{ transform: `scale(${zoomLevel})` }}
                className="max-h-[75vh] sm:max-h-[82vh] w-auto max-w-full object-contain transition-transform duration-150 select-none shadow-2xl rounded-xl"
                draggable={false}
              />
            </div>
          ) : (
            <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10">
              <video
                ref={videoRef}
                src={currentMedia.url}
                onError={() => setMediaError(true)}
                className="w-full max-h-[70vh] sm:max-h-[75vh] object-contain cursor-pointer"
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
                playsInline
                autoPlay
              />

              {/* Video Player Control Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-2 z-20">
                {/* Progress bar */}
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => {
                    const time = Number(e.target.value);
                    if (videoRef.current) {
                      videoRef.current.currentTime = time;
                      setCurrentTime(time);
                    }
                  }}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-1.5 rounded-lg bg-amber-500 text-neutral-950 font-bold hover:bg-amber-400 transition"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-200 transition"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <span className="text-neutral-300 font-mono text-[11px]">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded font-semibold">
                      Video Asli Properti
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Description & Thumbnail Strip */}
      <div className="border-t border-white/10 bg-neutral-900/80 backdrop-blur-md px-4 sm:px-6 py-3 z-30">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Caption / Description */}
          <div className="text-xs text-neutral-300 max-w-xl">
            <span className="font-bold text-amber-400 mr-2">{currentMedia.badge}:</span>
            <span>{currentMedia.description || currentMedia.title}</span>
          </div>

          {/* Quick thumbnail selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {mediaList.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setZoomLevel(1);
                  setIsPlaying(false);
                  onSelectIndex(idx);
                }}
                className={`relative w-12 h-9 rounded-md overflow-hidden shrink-0 border transition-all ${
                  idx === currentIndex
                    ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105'
                    : 'border-white/15 opacity-60 hover:opacity-100'
                }`}
              >
                {item.type === 'photo' ? (
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                    <Film className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                )}
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Play className="w-2.5 h-2.5 text-white fill-current" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
