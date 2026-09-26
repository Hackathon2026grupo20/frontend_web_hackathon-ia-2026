import { useEffect, useState } from "react";

// Segura a propagação de um valor que muda rápido (slider arrastando, digitação) até ele parar
// de mudar por `delayMs` — evita disparar uma request por pixel/tecla contra um backend que pode
// estar acordando de um cold start (Render free tier).
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
