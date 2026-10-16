import { useState, useEffect } from 'react';
import { DeviceMode } from '../types';

export function useResolvedDeviceMode(mode: DeviceMode): 'phone' | 'iphone' | 'tablet' | 'laptop' | 'desktop' | 'compact' {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (mode !== 'auto') {
    return mode;
  }

  // Auto-detect based on screen width
  if (windowWidth < 640) {
    // Check if iOS/iPhone user agent
    const isIOS = typeof navigator !== 'undefined' && /iPhone|iPod/.test(navigator.userAgent);
    return isIOS ? 'iphone' : 'phone';
  } else if (windowWidth < 1024) {
    return 'tablet';
  } else if (windowWidth < 1440) {
    return 'laptop';
  } else {
    return 'desktop';
  }
}
