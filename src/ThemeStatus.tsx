import { createContext, useContext } from "react";

/** Lets charts tell the app whether the current resolved theme embedded cleanly. */
export type ThemeStatus = { id: number; ok: (id: number) => void; fail: (id: number, message: string) => void };

export const ThemeStatusContext = createContext<ThemeStatus>({ id: 0, ok: () => {}, fail: () => {} });
export const useThemeStatus = () => useContext(ThemeStatusContext);
