import React, { useState } from 'react';
import { Accessibility, Type, Contrast, EyeOff, Volume2, VolumeX, X } from 'lucide-react';

export default function PersistentAccessibilityOverlay({
  onIncreaseFont,
  onDecreaseFont,
  onToggleContrast,
  contrastMode,
  onToggleDyslexia,
  dyslexiaFont,
  onToggleHideImages,
  hideImages,
  onToggleHighlightLinks,
  highlightLinks,
  onToggleMute,
  isMuted,
  onToggleReadingRuler,
  readingRuler
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOverlay = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Fixed Left-Bottom Access Trigger - Oversize Hit Region (No Border) */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={toggleOverlay}
          className="w-24 h-24 bg-silver-dark text-silver-card rounded-full flex flex-col items-center justify-center shadow-2xl transition-all active:scale-90 hover:scale-105 cursor-pointer focus:ring-4 focus:ring-silver-midtone p-4"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label="Toggle Accessibility Settings Panel"
        >
          <Accessibility className="w-12 h-12 stroke-[2.5]" />
          <span className="text-sm font-black uppercase tracking-tight mt-1">ACCESS</span>
        </button>
      </div>

      {/* Slide-out Accessibility Control Console Overlay Panel (Border removed) */}
      {isOpen && (
        <div 
          className="fixed inset-y-0 left-0 w-full sm:w-[500px] bg-silver-bg z-50 shadow-2xl flex flex-col justify-between font-sans text-xl leading-relaxed text-silver-dark"
          role="dialog"
          aria-modal="true"
          aria-label="Accessibility Assistance Console"
        >
          {/* Header (Border removed) */}
          <div className="bg-silver-dark text-silver-card p-6 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Accessibility className="w-8 h-8 stroke-[2.5]" />
              <h2 className="text-2xl font-black uppercase tracking-wide">Assistive Settings</h2>
            </div>
            <button
              onClick={toggleOverlay}
              className="p-3 hover:bg-red-700 text-silver-card rounded-xl transition-colors cursor-pointer min-h-[64px] min-w-[64px] flex items-center justify-center font-black border-none"
              aria-label="Close settings drawer"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Scrollable Adjuster Settings Body */}
          <div className="flex-grow overflow-y-auto p-6 space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase tracking-wider text-silver-midtone pb-1">
                Visual & Motor Helpers
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Font Adjust (Borders removed) */}
                <button
                  onClick={onIncreaseFont}
                  className="py-4 px-4 bg-white hover:bg-silver-accent rounded-2xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 text-lg"
                  aria-label="Increase Text Size"
                >
                  <Type className="w-6 h-6 shrink-0" />
                  <span>Font Size (A+)</span>
                </button>
                <button
                  onClick={onDecreaseFont}
                  className="py-4 px-4 bg-white hover:bg-silver-accent rounded-2xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 text-lg"
                  aria-label="Decrease Text Size"
                >
                  <Type className="w-6 h-6 shrink-0" />
                  <span>Font Size (A-)</span>
                </button>

                {/* 2. Contrast Toggle (Borders removed) */}
                <button
                  onClick={onToggleContrast}
                  className={`py-4 px-4 rounded-2xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 text-lg sm:col-span-2 ${
                    contrastMode !== 'standard'
                      ? 'bg-silver-dark text-silver-card'
                      : 'bg-white hover:bg-silver-accent'
                  }`}
                  aria-label="Toggle Contrast Mode (Black & White)"
                >
                  <Contrast className="w-6 h-6 shrink-0" />
                  <span>Contrast Theme: {contrastMode === 'standard' ? 'Standard' : 'Stark Theme'}</span>
                </button>

                {/* 3. Dyslexia Font Toggle (Borders removed) */}
                <button
                  onClick={onToggleDyslexia}
                  className={`py-4 px-4 rounded-2xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 text-lg sm:col-span-2 ${
                    dyslexiaFont 
                      ? 'bg-silver-dark text-silver-card font-mono' 
                      : 'bg-white hover:bg-silver-accent'
                  }`}
                  aria-label="Toggle Dyslexic Font Styling"
                >
                  <Type className="w-6 h-6 shrink-0" />
                  <span>Dyslexia Font: {dyslexiaFont ? 'ON' : 'OFF'}</span>
                </button>

                {/* 4. Hide Images (Borders removed) */}
                <button
                  onClick={onToggleHideImages}
                  className={`py-4 px-4 rounded-2xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 text-lg sm:col-span-2 ${
                    hideImages 
                      ? 'bg-silver-dark text-silver-card' 
                      : 'bg-white hover:bg-silver-accent'
                  }`}
                  aria-label="Toggle Hide Images"
                >
                  <EyeOff className="w-6 h-6 shrink-0" />
                  <span>Hide Pill Images: {hideImages ? 'ON' : 'OFF'}</span>
                </button>

                {/* 5. Highlight Links (Borders removed) */}
                <button
                  onClick={onToggleHighlightLinks}
                  className={`py-4 px-4 rounded-2xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 text-lg ${
                    highlightLinks
                      ? 'bg-silver-dark text-silver-card'
                      : 'bg-white hover:bg-silver-accent'
                  }`}
                  aria-label="Toggle Link Highlights"
                >
                  <span>🔗 Links: {highlightLinks ? 'ON' : 'OFF'}</span>
                </button>

                {/* 6. Reading Ruler Panel (Borders removed) */}
                <button
                  onClick={onToggleReadingRuler}
                  className={`py-4 px-4 rounded-2xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 text-lg ${
                    readingRuler
                      ? 'bg-silver-dark text-silver-card'
                      : 'bg-white hover:bg-silver-accent'
                  }`}
                  aria-label="Toggle Reading Ruler Guide"
                >
                  <span>📏 Ruler: {readingRuler ? 'ON' : 'OFF'}</span>
                </button>

                {/* 7. Mute Audio (Borders removed) */}
                <button
                  onClick={onToggleMute}
                  className={`py-4 px-4 rounded-2xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 text-lg sm:col-span-2 ${
                    isMuted 
                      ? 'bg-silver-sos text-white' 
                      : 'bg-white hover:bg-silver-accent'
                  }`}
                  aria-label="Mute Audio Alerts"
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-6 h-6 shrink-0" />
                      <span>Audio Alerts: MUTED</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-6 h-6 shrink-0" />
                      <span>Audio Alerts: ACTIVE</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Footer Info (Borders removed) */}
          <div className="p-4 bg-silver-dark text-silver-bg text-center text-sm font-semibold">
            Conforming with WCAG 2.1 AA Target Standards
          </div>
        </div>
      )}
    </>
  );
}
