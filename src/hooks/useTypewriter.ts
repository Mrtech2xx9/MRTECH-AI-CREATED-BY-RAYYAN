import { useState, useEffect, useRef } from 'react';

/**
 * Hook providing a smooth, high-velocity typewriter streaming effect for AI text responses.
 * Characters and tokens stream in with fluid natural pacing without artificial delay.
 * Catches up aggressively so answers appear instantly without stalling.
 */
export function useTypewriter(targetText: string, isStreaming: boolean = false): string {
  const [displayedText, setDisplayedText] = useState<string>(() => (isStreaming ? '' : targetText));
  const targetRef = useRef<string>(targetText);
  targetRef.current = targetText;

  useEffect(() => {
    // If not streaming (historical message or finished generating), sync instantly
    if (!isStreaming) {
      setDisplayedText(targetText);
      return;
    }

    // High-frequency, snappy interval for rapid token reveal (8ms interval)
    const intervalId = setInterval(() => {
      const target = targetRef.current;
      setDisplayedText((current) => {
        if (current.length >= target.length) {
          return target;
        }

        const delta = target.length - current.length;
        // High-velocity adaptive stepping so answers arrive fast and seamlessly
        let step = 3;
        if (delta > 100) step = 25;
        else if (delta > 50) step = 14;
        else if (delta > 20) step = 8;
        else if (delta > 8) step = 5;

        const nextLen = Math.min(current.length + step, target.length);
        return target.slice(0, nextLen);
      });
    }, 10);

    return () => clearInterval(intervalId);
  }, [isStreaming, targetText]);

  // When not streaming, always display the exact final text immediately
  return isStreaming ? displayedText : targetText;
}

