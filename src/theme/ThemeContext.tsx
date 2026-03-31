import React, { createContext, useContext } from 'react';
import { Colors, Shadows, Radius, Spacing, FontFamily, FontSize } from './tokens';

export interface AppTheme {
  colors: typeof Colors;
  shadows: typeof Shadows;
  radius: typeof Radius;
  spacing: typeof Spacing;
  font: typeof FontFamily;
  fontSize: typeof FontSize;
}

const defaultTheme: AppTheme = {
  colors: Colors,
  shadows: Shadows,
  radius: Radius,
  spacing: Spacing,
  font: FontFamily,
  fontSize: FontSize,
};

const ThemeContext = createContext<AppTheme>(defaultTheme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeContext.Provider value={defaultTheme}>{children}</ThemeContext.Provider>
);

export const useTheme = (): AppTheme => useContext(ThemeContext);
