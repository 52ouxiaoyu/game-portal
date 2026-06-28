import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
  src: string;
  initialTime?: number;
  onTimeUpdate?: (time: number) => void;
}

export const HlsPlayer: React.FC<HlsPlayerProps> = ({ src, initialTime, onTimeUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    const isMp4 = src.toLowerCase().includes('.mp4');

    if (!isMp4 && Hls.isSupported()) {
      hls = new Hls({
        debug: false,
        enableWorker: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (initialTime && initialTime > 0) {
          video.currentTime = initialTime;
        }
        video.play().catch(e => console.log('Auto-play prevented:', e));
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.warn('HLS error, trying native playback...');
          video.src = src;
        }
      });
    } else {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        if (initialTime && initialTime > 0) {
          video.currentTime = initialTime;
        }
        video.play().catch(e => console.log('Auto-play prevented:', e));
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onTimeUpdate) return;
    
    let lastTime = 0;
    const handleTimeUpdate = () => {
      // Throttle updates to every 5 seconds
      if (Math.abs(video.currentTime - lastTime) > 5) {
        lastTime = video.currentTime;
        onTimeUpdate(video.currentTime);
      }
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [onTimeUpdate]);

  return (
    <video
      ref={videoRef}
      controls
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        borderRadius: '8px'
      }}
    />
  );
};
