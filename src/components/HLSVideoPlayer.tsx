import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

interface HLSVideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
  onMediaLoaded?: () => void;
  className?: string;
}

const optimizeVideoUrl = (originalUrl: string) => {
  if (!originalUrl || !originalUrl.includes('cloudinary.com')) return originalUrl;
  
  // Replace extension to .m3u8
  let transformedUrl = originalUrl.replace(/\.(mp4|mov|webm)$/i, '.m3u8');
  
  if (transformedUrl.includes('/upload/')) {
    const parts = transformedUrl.split('/upload/');
    transformedUrl = `${parts[0]}/upload/sp_auto,q_auto,f_auto/${parts[1]}`;
  }
  
  return transformedUrl;
};

export const HLSVideoPlayer: React.FC<HLSVideoPlayerProps> = ({ 
  src, 
  poster, 
  onMediaLoaded, 
  className,
  ...props 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const optimizedSrc = optimizeVideoUrl(src);

  // Initialize and destroy HLS / Native playback
  const loadSource = React.useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    setIsLoading(true);

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        maxMaxBufferLength: 30, // Limit buffer to save memory
        enableWorker: true,
      });
      hlsRef.current = hls;

      hls.loadSource(optimizedSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (onMediaLoaded) onMediaLoaded();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('HLS network error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('HLS media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              // Cannot recover, destroy and retry
              hls.destroy();
              if (retryCount < 3) {
                setTimeout(() => {
                  setRetryCount(prev => prev + 1);
                }, 2000);
              }
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = optimizedSrc;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (onMediaLoaded) onMediaLoaded();
      });
      video.addEventListener('error', () => {
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        }
      });
    }
  }, [optimizedSrc, onMediaLoaded, retryCount]);

  const destroySource = React.useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.removeAttribute('src');
      videoRef.current.load(); // Reset video element
    }
    setIsLoading(true);
  }, []);

  // Effect to re-run loadSource if retryCount increments while in view
  useEffect(() => {
    if (retryCount > 0 && retryCount <= 3) {
      loadSource();
    }
  }, [retryCount, loadSource]);

  useEffect(() => {
    if (!containerRef.current || !videoRef.current) return;

    // preload/destroy observer (rootMargin 500px)
    const preloadObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!hlsRef.current && !videoRef.current?.src) {
            loadSource();
          }
        } else {
          destroySource();
        }
      });
    }, { rootMargin: '500px' });

    // autoplay observer (threshold 0.5)
    const playObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              playPromise.catch((err) => {
                console.warn('Autoplay prevented:', err);
              });
            }
          }
        } else {
          if (videoRef.current) {
            videoRef.current.pause();
          }
        }
      });
    }, { threshold: 0.5 });

    preloadObserver.observe(containerRef.current);
    playObserver.observe(containerRef.current);

    return () => {
      preloadObserver.disconnect();
      playObserver.disconnect();
      destroySource();
    };
  }, [loadSource, destroySource]);

  // Handle canplay / playing generic events for loading state UX fallback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => setIsLoading(false);
    const handlePlaying = () => setIsLoading(false);

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full h-full overflow-hidden bg-black", className)}>
      <video
        ref={videoRef}
        poster={poster}
        preload="auto"
        className="w-full h-full object-cover"
        muted
        loop
        playsInline
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
          <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-white animate-spin opacity-80" />
        </div>
      )}
    </div>
  );
};
