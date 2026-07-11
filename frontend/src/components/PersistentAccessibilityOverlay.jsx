import React, { useState } from 'react';
import { Accessibility, Type, Contrast, Languages, EyeOff, Volume2, VolumeX, Navigation, MessageSquare, AlertOctagon, X } from 'lucide-react';

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
  onTriggerSOS,
  onTriggerAIBot,
  onTriggerTakeMeHome,
  onToggleReadingRuler,
  readingRuler
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState("");

  const toggleOverlay = () => {
    setIsOpen(!isOpen);
  };

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    if (!localQuery) return;
    onTriggerAIBot(localQuery);
    setLocalQuery("");
  };

  return (
    <>
      {/* Absolute/Fixed Left-Bottom Access Trigger - Oversize Hit Region */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={toggleOverlay}
          className="w-24 h-24 bg-silver-dark text-silver-card rounded-full flex flex-col items-center justify-center shadow-2xl border-4 border-white transition-all active:scale-90 hover:scale-105 cursor-pointer focus:ring-4 focus:ring-silver-midtone p-4"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label="Toggle Accessibility Settings Panel"
        >
          <Accessibility className="w-12 h-12 stroke-[2.5]" />
          <span className="text-sm font-black uppercase tracking-tight mt-1">ACCESS</span>
        </button>
      </div>

      {/* Slide-out Accessibility Control Console Overlay Panel */}
      {isOpen && (
        <div 
          className="fixed inset-y-0 left-0 w-full sm:w-[500px] bg-silver-bg border-r-8 border-silver-dark z-50 shadow-2xl flex flex-col justify-between font-sans text-xl leading-relaxed text-silver-dark"
          role="dialog"
          aria-modal="true"
          aria-label="Accessibility Assistance Console"
        >
          {/* Header */}
          <div className="bg-silver-dark text-silver-card p-6 flex justify-between items-center border-b-4 border-silver-midtone">
            <div className="flex items-center space-x-3">
              <Accessibility className="w-8 h-8 stroke-[2.5]" />
              <h2 className="text-2xl font-black uppercase tracking-wide">Assistive Settings</h2>
            </div>
            <button
              onClick={toggleOverlay}
              className="p-3 hover:bg-red-700 text-silver-card rounded-xl transition-colors cursor-pointer min-h-[64px] min-w-[64px] flex items-center justify-center"
              aria-label="Close settings drawer"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Scrollable Adjuster Settings Body */}
          <div className="flex-grow overflow-y-auto p-6 space-y-8">
            
            {/* Setting Grid Block */}
            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase tracking-wider text-silver-midtone border-b-2 border-silver-accent pb-1">
                Visual & Motor Helpers
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Font Adjust */}
                <button
                  onClick={onIncreaseFont}
                  className="py-4 px-4 bg-white hover:bg-silver-accent border-4 border-gray-300 rounded-2xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 text-lg"
                  aria-label="Increase Text Size"
                >
                  <Type className="w-6 h-6 shrink-0" />
                  <span>Font Size (A+)</span>
                </button>
                <button
                  onClick={onDecreaseFont}
                  className="py-4 px-4 bg-white hover:bg-silver-accent border-4 border-gray-300 rounded-2xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 text-lg"
                  aria-label="Decrease Text Size"
                >
                  <Type className="w-6 h-6 shrink-0" />
                  <span>Font Size (A-)</span>
                </button>

                {/* 2. Contrast Toggle */}
                <button
                  onClick={onToggleContrast}
                  className={`py-4 px-4 border-4 rounded-2xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 text-lg sm:col-span-2 ${
                    contrastMode !== 'standard'
                      ? 'bg-silver-dark text-silver-card border-silver-dark'
                      : 'bg-white hover:bg-silver-accent border-gray-300'
                  }`}
                  aria-label="Toggle Contrast Mode (Black & White)"
                >
                  <Contrast className="w-6 h-6 shrink-0" />
                  <span>Contrast Theme: {contrastMode === 'standard' ? 'Standard' : 'Stark Theme'}</span>
                </button>

                {/* 3. Dyslexia Font Toggle */}
                <button
                  onClick={onToggleDyslexia}
                  className={`py-4 px-4 border-4 rounded-2xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 text-lg sm:col-span-2 ${
                    dyslexiaFont 
                      ? 'bg-silver-dark text-silver-card border-silver-dark font-mono' 
                      : 'bg-white hover:bg-silver-accent border-gray-300'
                  }`}
                  aria-label="Toggle Dyslexic Font Styling"
                >
                  <Type className="w-6 h-6 shrink-0" />
                  <span>Dyslexia Font: {dyslexiaFont ? 'ON' : 'OFF'}</span>
                </button>

                {/* 4. Hide Images */}
                <button
                  onClick={onToggleHideImages}
                  className={`py-4 px-4 border-4 rounded-2xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 text-lg sm:col-span-2 ${
                    hideImages 
                      ? 'bg-silver-dark text-silver-card border-silver-dark' 
                      : 'bg-white hover:bg-silver-accent border-gray-300'
                  }`}
                  aria-label="Toggle Hide Images"
                >
                  <EyeOff className="w-6 h-6 shrink-0" />
                  <span>Hide Pill Images: {hideImages ? 'ON' : 'OFF'}</span>
                </button>

                {/* 5. Highlight Links */}
                <button
                  onClick={onToggleHighlightLinks}
                  className={`py-4 px-4 border-4 rounded-2xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 text-lg ${
                    highlightLinks
                      ? 'bg-silver-dark text-silver-card border-silver-dark'
                      : 'bg-white hover:bg-silver-accent border-gray-300'
                  }`}
                  aria-label="Toggle Link Highlights"
                >
                  <span>🔗 Links: {highlightLinks ? 'ON' : 'OFF'}</span>
                </button>

                {/* 6. Reading Ruler Panel */}
                <button
                  onClick={onToggleReadingRuler}
                  className={`py-4 px-4 border-4 rounded-2xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 text-lg ${
                    readingRuler
                      ? 'bg-silver-dark text-silver-card border-silver-dark'
                      : 'bg-white hover:bg-silver-accent border-gray-300'
                  }`}
                  aria-label="Toggle Reading Ruler Guide"
                >
                  <span>📏 Ruler: {readingRuler ? 'ON' : 'OFF'}</span>
                </button>

                {/* 7. Mute Audio */}
                <button
                  onClick={onToggleMute}
                  className={`py-4 px-4 border-4 rounded-2xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 text-lg sm:col-span-2 ${
                    isMuted 
                      ? 'bg-silver-sos text-white border-silver-sos' 
                      : 'bg-white hover:bg-silver-accent border-gray-300'
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

            {/* Shortcuts Panel Section */}
            <div className="space-y-4 border-t-4 border-silver-accent pt-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-silver-sos border-b-2 border-red-200 pb-1">
                Emergency & Assistive Shortcuts
              </h3>
              
              <div className="space-y-4">
                
                {/* 1. Take Me Home helper block */}
                <div className="bg-white border-4 border-silver-dark rounded-2xl p-4 space-y-2">
                  <span className="text-sm font-black text-silver-dark uppercase tracking-wider flex items-center space-x-2">
                    <Navigation className="w-5 h-5 text-silver-dark" />
                    <span>Navigation Helper</span>
                  </span>
                  <p className="text-base text-gray-500 font-bold">Opens map navigation directly back to registered home.</p>
                  <button
                    onClick={() => onTriggerTakeMeHome()}
                    className="w-full py-4 px-6 bg-silver-dark hover:bg-silver-midtone text-silver-card rounded-xl font-black text-lg transition-transform active:scale-95 cursor-pointer min-h-[64px] p-4"
                    aria-label="Simulate Take Me Home maps launch"
                  >
                    📍 TAKE ME HOME
                  </button>
                </div>

                {/* 2. Instant AI bot interaction interface */}
                <form onSubmit={handleQuerySubmit} className="bg-white border-4 border-silver-midtone rounded-2xl p-4 space-y-3">
                  <span className="text-sm font-black text-silver-dark uppercase tracking-wider flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-silver-midtone" />
                    <span>Assistive AI safety chat</span>
                  </span>
                  <p className="text-base text-gray-500 font-bold">Ask: "Can I take Metformin with grapefruit?"</p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Ask the AI Bot..."
                      value={localQuery}
                      onChange={(e) => setLocalQuery(e.target.value)}
                      className="flex-grow p-4 border-2 border-gray-300 rounded-xl bg-silver-bg font-semibold text-base min-h-[64px]"
                      aria-label="Input field for AI drug safety queries"
                    />
                    <button
                      type="submit"
                      className="py-4 px-5 bg-silver-midtone hover:bg-silver-dark text-white font-black rounded-xl cursor-pointer min-h-[64px] min-w-[64px] flex items-center justify-center p-4"
                      aria-label="Send query to safety bot"
                    >
                      ➔
                    </button>
                  </div>
                </form>

                {/* 3. Rapid SOS Shortcut Panic button */}
                <button
                  onClick={onTriggerSOS}
                  className="w-full py-6 px-6 bg-silver-sos hover:bg-red-800 text-silver-card rounded-2xl font-black text-2xl flex items-center justify-center space-x-3 transition-transform active:scale-95 cursor-pointer border-4 border-white shadow-lg min-h-[84px] p-4"
                  aria-label="Trigger SOS emergency alert checklist"
                >
                  <AlertOctagon className="w-8 h-8 animate-pulse shrink-0" />
                  <span>RAPID SOS PANIC BUTTON</span>
                </button>

              </div>
            </div>

          </div>
          
          {/* Footer Info */}
          <div className="p-4 bg-silver-dark text-silver-bg text-center text-sm font-semibold border-t-2 border-silver-midtone">
            Conforming with WCAG 2.1 AA Target Standards
          </div>
        </div>
      )}
    </>
  );
}
