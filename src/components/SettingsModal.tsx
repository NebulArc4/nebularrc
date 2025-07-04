import React, { useEffect, useState } from 'react';
import { usePreferences } from './PreferencesContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { prefs, setPref } = usePreferences();
  const [localPrefs, setLocalPrefs] = useState(prefs);

  useEffect(() => {
    setLocalPrefs(prefs);
  }, [prefs, isOpen]);

  const handleChange = (key: keyof typeof prefs, value: string) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }));
    setPref(key, value);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-[#18181b] rounded-xl shadow-lg p-8 w-full max-w-md relative animate-fadein">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          onClick={onClose}
          aria-label="Close settings"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Settings</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Theme</label>
            <select
              value={localPrefs.theme}
              onChange={e => handleChange('theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Output Style</label>
            <select
              value={localPrefs.outputStyle}
              onChange={e => handleChange('outputStyle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="spacious">Spacious</option>
              <option value="compact">Compact</option>
              <option value="large">Large Font</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chart Type</label>
            <select
              value={localPrefs.chartType}
              onChange={e => handleChange('chartType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="line">Line</option>
              <option value="bar">Bar</option>
              <option value="candlestick">Candlestick</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Entity Highlight Style</label>
            <select
              value={localPrefs.entityHighlight}
              onChange={e => handleChange('entityHighlight', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="color">Color</option>
              <option value="underline">Underline</option>
              <option value="icon">Icon</option>
            </select>
          </div>
        </div>
      </div>
      <style jsx>{`
        .animate-fadein { animation: fadein 0.3s; }
        @keyframes fadein { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
} 