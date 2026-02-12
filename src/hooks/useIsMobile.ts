import { useEffect, useState } from "react";

/**
 * Hook para detectar se a tela atual corresponde a uma consulta de mídia específica.
 * @param maxWidth A largura máxima para considerar a tela como mobile (ex: "768px").
 * @returns Um booleano indicando se a tela atende à consulta de mídia.
 */
export function useIsMobile(maxWidth: string = "768px"): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${maxWidth})`).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${maxWidth})`);

    setIsMobile(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, [maxWidth]);

  return isMobile;
}
