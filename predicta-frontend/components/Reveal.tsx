"use client";

import { useEffect, useRef, useState } from "react";

// Fade + slide suave quando a seção entra na tela, via IntersectionObserver puro (sem lib de
// animação). Respeita prefers-reduced-motion: nesse caso, aparece direto, sem transição.
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      className={`${reduced ? "" : "transition-all duration-700 ease-out"} ${
        visible ? "opacity-100 translate-y-0" : reduced ? "" : "opacity-0 translate-y-6"
      } ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
