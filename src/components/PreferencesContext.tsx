"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

const defaultPrefs = {
  theme: 'system',
  outputStyle: 'spacious',
  chartType: 'line',
  entityHighlight: 'color',
};

type Prefs = typeof defaultPrefs;

const PreferencesContext = createContext<{
  prefs: Prefs;
  setPref: (key: keyof Prefs, value: string) => void;
} | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);

  useEffect(() => {
    const stored = localStorage.getItem('user-prefs');
    if (stored) setPrefs(JSON.parse(stored));
  }, []);

  const setPref = (key: keyof Prefs, value: string) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    localStorage.setItem('user-prefs', JSON.stringify(newPrefs));
  };

  return (
    <PreferencesContext.Provider value={{ prefs, setPref }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
} 