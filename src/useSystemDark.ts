import { useEffect, useState } from "react";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Whether the OS prefers a dark color scheme, kept up to date. */
export function useSystemDark() {
  const [dark, setDark] = useState(() => window.matchMedia(DARK_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(DARK_QUERY);
    const on = () => setDark(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return dark;
}
