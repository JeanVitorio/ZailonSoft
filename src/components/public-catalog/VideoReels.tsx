import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoReelsProps {
  videos?: string[];
}

export function VideoReels({ videos = [] }: VideoReelsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!videos || videos.length === 0) {
    return (
      <div className="w-full h-96 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800">
        <div className="text-center">
          <Play className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400">Sem vídeos disponíveis</p>
        </div>
      </div>
    );
  }

  const currentVideo = videos[currentIndex];

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.ended) {
      // Auto play next video
      setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
    }
  };

  return (
    <div className="space-y-4 glass-card p-3 rounded-xl">
      {/* Video Player */}
      <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          src={currentVideo}
          className="w-full h-full object-cover"
          autoPlay
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            if (isPlaying && videoRef.current) {
              videoRef.current.play();
            }
          }}
        />

        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              className="bg-slate-950/70 hover:bg-slate-950 text-amber-400 backdrop-blur"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleMute}
              className="bg-slate-950/70 hover:bg-slate-950 text-amber-400 backdrop-blur"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>

          {videos.length > 1 && (
            <div className="text-xs font-medium text-slate-300 bg-slate-950/70 backdrop-blur px-3 py-1 rounded-full">
              {currentIndex + 1} / {videos.length}
            </div>
          )}
        </div>
      </div>

      {/* Video List (Reels) */}
      {videos.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400">Mais vídeos</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {videos.map((video, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsPlaying(true);
                }}
                className={`relative w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden border-2 transition-colors ${
                  currentIndex === index
                    ? 'border-amber-500 bg-slate-900'
                    : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                }`}
              >
                <video
                  src={video}
                  className="w-full h-full object-cover"
                  onLoadedMetadata={(e) => {
                    e.currentTarget.currentTime = 0;
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Play className="w-6 h-6 text-amber-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
