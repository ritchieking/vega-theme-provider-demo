import { useEffect } from "react";
import { useVegaTheme, type ResolvedVegaTheme } from "@ritchieking/react-vega";

/** Reads the theme in effect at this point in the tree with useVegaTheme() and reports it. */
export function ThemeProbe({ onResolved }: { onResolved: (t: ResolvedVegaTheme) => void }) {
  const resolved = useVegaTheme();
  useEffect(() => {
    onResolved(resolved);
  }, [resolved, onResolved]);
  return null;
}
