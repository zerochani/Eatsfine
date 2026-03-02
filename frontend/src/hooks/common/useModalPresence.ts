import { useEffect, useRef, useState } from "react";

export function useModalPresence(open: boolean, durationMs = 220) {
  const [rendered, setRendered] = useState(open);
  const [entered, setEntered] = useState(false);
  const timeRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      if (timeRef.current) {
        window.clearTimeout(timeRef.current);
        timeRef.current = null;
      }
      setRendered(true);
      const raf = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);

    timeRef.current = window.setTimeout(() => {
      setRendered(false);
      timeRef.current = null;
    }, durationMs);

    return () => {
      if (timeRef.current) {
        window.clearTimeout(timeRef.current);
        timeRef.current = null;
      }
    };
  }, [open, durationMs]);

  return { rendered, entered };
}
