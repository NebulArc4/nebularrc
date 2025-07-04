"use client";
import { useState } from 'react';
import SettingsModal from './SettingsModal';

export default function SettingsButton() {
  const [showSettings, setShowSettings] = useState(false);
  return (
    <>
      <button
        className="fixed top-4 right-4 z-50 bg-white dark:bg-[#222] border border-gray-200 dark:border-[#444] rounded-full shadow-lg p-3 hover:bg-gray-100 dark:hover:bg-[#333] transition-all"
        onClick={() => setShowSettings(true)}
        aria-label="Open settings"
      >
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
} 