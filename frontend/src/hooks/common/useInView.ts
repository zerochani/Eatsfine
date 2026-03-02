import { useEffect, useRef, useState } from "react";

type Options = {
  threshold?: number | number[];
  rootMargin?: string;
  once?: boolean;
};

export function useInView<T extends HTMLElement = HTMLElement>({
  threshold = 0.3,
  rootMargin = "0px 0px -10% 0px",
  once = true,
}: Options = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry], obs) => {
        if (once) {
          if (entry.isIntersecting) {
            setInView(true);
            obs.disconnect();
          }
        } else {
          setInView(entry.isIntersecting);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
