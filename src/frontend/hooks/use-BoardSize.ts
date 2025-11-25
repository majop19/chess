import { useEffect, useState } from "react";

export function useBoardSize() {
  const [breakpoint, setBreakpoint] = useState(6);

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      if (width < 1180) {
        setBreakpoint(0);
      } else if (width >= 1180 && width < 1400) {
        setBreakpoint(2);
      } else if (width >= 1400 && width < 1536) {
        setBreakpoint(4);
      } else {
        setBreakpoint(6);
      }
    };

    updateBreakpoint();

    window.addEventListener("resize", updateBreakpoint);

    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
}
