import { useEffect, useRef } from "react";

export function usePrevious<T>(previous: T) {
  const p = useRef<T>();

  useEffect(() => {
    p.current = previous;
  }, [previous]);

  return p.current;
}
