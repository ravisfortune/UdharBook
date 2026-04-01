import React, { createContext, useContext } from 'react';
import { Radius, Spacing, FontFamily, FontSize } from './tokens';
import { ThemeColors, ThemeId, themeColors, themeShadows } from './themes';

export interface AppTheme {
  colors: ThemeColors;
  shadows: ReturnType<typeof themeShadows>;
  radius: typeof Radius;
  spacing: typeof Spacing;
  font: typeof FontFamily;
  fontSize: typeof FontSize;
  themeId: ThemeId;
}

export function buildTheme(themeId: ThemeId): AppTheme {
  const colors = themeColors[themeId];
  return {
    colors,
    shadows: themeShadows(colors),
    radius: Radius,
    spacing: Spacing,
    font: FontFamily,
    fontSize: FontSize,
    themeId,
  };
}

const ThemeContext = createContext<AppTheme>(buildTheme('default'));

export const ThemeProvider: React.FC<{ themeId: ThemeId; children: React.ReactNode }> = ({
  themeId,
  children,
}) => (
  <ThemeContext.Provider value={buildTheme(themeId)}>
    {children}
  </ThemeContext.Provider>
);

export const useTheme = (): AppTheme => useContext(ThemeContext);
