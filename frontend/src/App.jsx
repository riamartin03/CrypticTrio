import React, { useState, useEffect } from 'react';
import LandingAndAuth from './components/LandingAndAuth';
import PatientDashboard from './components/PatientDashboard';
import ShadowDashboard from './components/ShadowDashboard';
import PersistentAccessibilityOverlay from './components/PersistentAccessibilityOverlay';
import SOSOverlay from './components/SOSOverlay';
import { Home, User, ShieldAlert, AlertOctagon, MessageSquare, Navigation, X, Check, ArrowRight, HeartHandshake } from 'lucide-react';
import { api } from './services/api';

export default function App() {
  // Session State ('landing', 'patient', 'caregiver')
  const [user, setUser] = useState(null);
  const [activeScreen, setActiveScreen] = useState('landing');

  // Unified patient data for critical triggers (like SOS button)
  const [profileData] = useState({
    name: "Ramesh Kumar",
    gender: "Male",
    bloodGroup: "O+",
    allergies: ["Penicillin", "Sulfa Antibiotics", "Aspirin"],
    conditions: ["Early-stage Dementia", "Type 2 Diabetes", "Hypertension"],
    surgicalHistory: [
      { id: 1, surgery: "Appendectomy", year: "1988", hospital: "City General" },
      { id: 2, surgery: "Knee Replacement", year: "2019", hospital: "Orthopedic Center" }
    ]
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setActiveScreen(userData.role);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveScreen('landing');
  };

  // Accessibility States
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0);
  const [contrastMode, setContrastMode] = useState('standard'); // 'standard', 'high'
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [hideImages, setHideImages] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [readingRuler, setReadingRuler] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Dynamic Root Sizing effect
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSizeMultiplier * 100}%`;
  }, [fontSizeMultiplier]);

  // Reading Ruler cursor-following coordinator
  const [rulerTop, setRulerTop] = useState(300);

  useEffect(() => {
    if (!readingRuler) return;

    const handleMouseMove = (e) => {
      setRulerTop(e.clientY - 32);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [readingRuler]);

  // Floating Action Modals
  const [showSOS, setShowSOS] = useState(false);
  const [showAIBot, setShowAIBot] = useState(false);
  const [showTakeMeHome, setShowTakeMeHome] = useState(false);

  // AI Chat Bot Logs (Mock interaction response logs)
  const [chatInput, setChatInput] = useState("");
  const [chatLogs, setChatLogs] = useState([
    { sender: 'bot', text: 'Hello! I am your SilverCare drug safety assistant. Ask me questions like: "Can I eat grapefruit with my medicine?"' }
  ]);

  const handleSendQuery = (queryText) => {
    const text = queryText || chatInput;
    if (!text) return;
    
    const updatedLogs = [...chatLogs, { sender: 'user', text: text }];
    setChatLogs(updatedLogs);
    setChatInput("");

    setTimeout(() => {
      let botResponse = "I have checked your active medications. Avoid consuming alcohol or grapefruit juice with cholesterol drugs like Atorvastatin. Consult your doctor.";
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes("grapefruit")) {
        botResponse = "⚠️ Warning: Grapefruit juice interacts critically with Atorvastatin (your cholesterol medicine). It can increase the drug concentration in your blood to dangerous levels.";
      } else if (lowerText.includes("milk") || lowerText.includes("calcium")) {
        botResponse = "ℹ️ Note: Calcium/Milk can reduce the absorption of certain medications. If taking thyroid or antibiotic medications, space them at least 2 hours apart.";
      } else if (lowerText.includes("alcohol")) {
        botResponse = "⚠️ Warning: Alcohol increases the risk of stomach irritation and drowsiness when taken with Aspirin or Metformin.";
      } else if (lowerText.includes("metformin")) {
        botResponse = "Metformin 500mg should be taken with breakfast. Avoid taking it on an empty stomach to prevent nausea.";
      }

      setChatLogs([...updatedLogs, { sender: 'bot', text: botResponse }]);
    }, 800);
  };

  // Accessibility actions
  const increaseFont = () => setFontSizeMultiplier(prev => Math.min(2.0, prev + 0.15));
  const decreaseFont = () => setFontSizeMultiplier(prev => Math.max(0.75, prev - 0.15));
  const toggleContrast = () => setContrastMode(prev => prev === 'standard' ? 'high' : 'standard');
  const toggleDyslexia = () => setDyslexiaFont(prev => !prev);
  const toggleHideImages = () => setHideImages(prev => !prev);
  const toggleHighlightLinks = () => setHighlightLinks(prev => !prev);
  const toggleReadingRuler = () => setReadingRuler(prev => !prev);
  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (!isMuted) alert("Audio alerts muted.");
  };

  return (
    <div 
      className={`min-h-screen flex flex-col justify-between transition-colors duration-200 select-none ${
        contrastMode === 'high' 
          ? 'bg-black text-white border-white' 
          : 'bg-silver-bg text-silver-dark border-none'
      } ${
        dyslexiaFont ? 'font-mono tracking-wide' : 'font-sans font-bold'
      }`}
    >
      {/* 1. App Header Selector Navigation */}
      <header className={`border-b-8 sticky top-0 z-40 shadow-lg transition-colors ${
        contrastMode === 'high' 
          ? 'bg-black text-white border-white' 
          : 'bg-silver-dark text-silver-card border-silver-midtone'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3 shrink-0 text-white">
            <HeartHandshake className="w-8 h-8 text-silver-accent stroke-[2.5]" />
            <span className="text-2xl font-black uppercase tracking-tight">SilverCare Portal</span>
          </div>

          {user ? (
            <nav className="flex items-center flex-wrap gap-3">
              <button
                onClick={handleLogout}
                className="py-3 px-5 text-xl font-black rounded-xl transition-all cursor-pointer bg-silver-sos text-white hover:bg-red-800 focus:ring-4 focus:ring-red-400 min-h-[64px]"
              >
                LOGOUT
              </button>
            </nav>
          ) : (
            <nav className="flex items-center gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById('about');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-2 px-4 text-lg font-black rounded-xl transition-all cursor-pointer bg-transparent text-silver-card hover:bg-silver-midtone min-h-[48px]"
              >
                ABOUT
              </button>
              <button
                onClick={() => {
                  setUser({
                    userId: 'demo-caregiver-id',
                    role: 'caregiver',
                    name: 'John Caregiver',
                    patientId: 'demo-patient-id'
                  });
                  setActiveScreen('caregiver');
                }}
                className="py-2 px-4 text-lg font-black rounded-xl transition-all cursor-pointer bg-silver-midtone text-white hover:bg-silver-dark min-h-[48px]"
              >
                CAREGIVER
              </button>
            </nav>
          )}

        </div>
      </header>

      {/* 2. Main Core View Area (Cleaned from inner containers) */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        {!user ? (
          <LandingAndAuth onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            {activeScreen === 'patient' && (
              <PatientDashboard 
                hideImages={hideImages} 
                patientId={user.patientId || user.userId} 
              />
            )}
            {activeScreen === 'caregiver' && (
              <ShadowDashboard 
                patientId={user.patientId} 
              />
            )}
          </>
        )}
      </main>

      {/* 3. Floating Quick Assist Emergency & Chat safety anchors */}
      {user && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-4 font-sans text-xl leading-relaxed">
          {/* Active Navigation maps tracker */}
          <button
            onClick={() => setShowTakeMeHome(true)}
            className="w-24 h-24 bg-[#567C8D] hover:bg-[#2F4156] text-white rounded-full flex flex-col items-center justify-center shadow-2xl transition-all active:scale-90 hover:scale-105 cursor-pointer focus:ring-4 focus:ring-silver-midtone p-4"
            aria-label="Launch Home Directions maps window"
          >
            <Navigation className="w-12 h-12 stroke-[2.5]" />
            <span className="text-[10px] font-black uppercase tracking-tight mt-1 text-center leading-none">TAKE ME HOME</span>
          </button>

          {/* Safety AI assistant */}
          <button
            onClick={() => setShowAIBot(true)}
            className="w-24 h-24 bg-silver-dark text-silver-card rounded-full flex flex-col items-center justify-center shadow-2xl transition-all active:scale-90 hover:scale-105 cursor-pointer focus:ring-4 focus:ring-silver-midtone p-4"
            aria-label="Open AI Safety chatbot"
          >
            <MessageSquare className="w-12 h-12 stroke-[2.5]" />
            <span className="text-[10px] font-black uppercase tracking-tight mt-1 text-center leading-none">AI Safety Bot</span>
          </button>

          {/* Emergency SOS Panic */}
          <button
            onClick={() => setShowSOS(true)}
            className="w-24 h-24 bg-silver-sos text-white rounded-full flex flex-col items-center justify-center shadow-2xl transition-all active:scale-90 hover:scale-105 cursor-pointer focus:ring-4 focus:ring-red-400 p-4 animate-pulse"
            aria-label="Trigger Critical emergency details dashboard"
          >
            <AlertOctagon className="w-12 h-12 stroke-[2.5]" />
            <span className="text-[10px] font-black uppercase tracking-tight mt-1 text-center leading-none">SOS Panic</span>
          </button>
        </div>
      )}

      {/* 4. Reading Ruler focus overlay */}
      {readingRuler && (
        <div 
          style={{ top: `${rulerTop}px` }}
          className="fixed left-0 right-0 h-16 bg-gray-500 bg-opacity-20 pointer-events-none z-30 border-y-4 border-yellow-400 transition-all duration-75" 
        />
      )}

      {/* 5. Accessibility Adjustment Drawer overlay panel */}
      {user && (
        <PersistentAccessibilityOverlay 
          onIncreaseFont={increaseFont}
          onDecreaseFont={decreaseFont}
          onToggleContrast={toggleContrast}
          contrastMode={contrastMode}
          onToggleDyslexia={toggleDyslexia}
          dyslexiaFont={dyslexiaFont}
          onToggleHideImages={toggleHideImages}
          hideImages={hideImages}
          onToggleHighlightLinks={toggleHighlightLinks}
          highlightLinks={highlightLinks}
          onToggleMute={toggleMute}
          isMuted={isMuted}
          onToggleReadingRuler={toggleReadingRuler}
          readingRuler={readingRuler}
        />
      )}

      {/* SOS Overlay Panel (Functional SOS Wiring) */}
      <SOSOverlay
        isOpen={showSOS}
        onClose={() => setShowSOS(false)}
        profileData={profileData}
      />

      {/* Take Me Home Dialog with Integrated Mock Map Screen */}
      {showTakeMeHome && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-silver-dark text-silver-card rounded-[36px] p-8 space-y-6 relative">
            <button 
              onClick={() => setShowTakeMeHome(false)}
              className="fixed top-6 right-6 z-50 py-3 px-5 bg-white hover:bg-gray-200 text-silver-dark rounded-xl font-black text-lg transition-all cursor-pointer flex items-center space-x-1"
            >
              <X className="w-6 h-6" />
              <span>CLOSE</span>
            </button>
            <div className="flex items-center space-x-3 pb-2 border-b border-silver-midtone">
              <Navigation className="w-10 h-10 text-white animate-bounce" />
              <h2 className="text-3xl font-black uppercase text-white">Directions Home</h2>
            </div>
            
            {/* Integrated Google Maps Embed */}
            <div className="bg-sky-100 h-80 rounded-2xl relative overflow-hidden shadow-inner border-2 border-white">
              <iframe
                title="Google Maps Directions"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src="https://maps.google.com/maps?q=123+Sunny+Meadows+Lane,San+Jose,CA&t=&z=14&ie=UTF8&iwloc=&output=embed"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>

            <div className="bg-white text-silver-dark rounded-2xl p-4">
              <span className="text-xs text-gray-500 font-bold block uppercase">DESTINATION</span>
              <span className="text-lg font-black">123 Sunny Meadows Lane, San Jose, CA</span>
            </div>
          </div>
        </div>
      )}

      {/* AI Bot Dialog */}
      {showAIBot && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-end sm:items-center justify-end p-4 backdrop-blur-sm">
          <div className="w-full sm:w-[500px] h-[90vh] bg-silver-card rounded-[36px] p-6 flex flex-col justify-between space-y-4 relative">
            <button 
              onClick={() => setShowAIBot(false)}
              className="fixed top-6 right-6 z-50 py-3 px-5 bg-white hover:bg-gray-200 text-silver-dark rounded-xl font-black text-lg transition-all cursor-pointer flex items-center space-x-1"
            >
              <X className="w-6 h-6" />
              <span>CLOSE</span>
            </button>
            
            <div className="flex items-center space-x-2 text-silver-dark pb-3 shrink-0">
              <MessageSquare className="w-8 h-8" />
              <h2 className="text-2xl font-black uppercase">AI Safety Chat</h2>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 p-2 bg-silver-bg rounded-2xl">
              {chatLogs.map((chat, idx) => (
                <div key={idx} className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-gray-500 font-bold uppercase mb-1">
                    {chat.sender === 'user' ? 'You' : 'CareBot AI'}
                  </span>
                  <div className={`p-4 rounded-2xl max-w-[85%] ${
                    chat.sender === 'user'
                      ? 'bg-silver-dark text-silver-card'
                      : 'bg-white text-silver-dark'
                  }`}>
                    <p className="text-lg font-bold leading-relaxed">{chat.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-2 shrink-0">
              <input
                type="text"
                placeholder="Ask e.g. 'Can I eat grapefruit?'"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') handleSendQuery(); }}
                className="flex-grow p-4 rounded-xl bg-silver-bg font-semibold text-lg min-h-[64px] focus:outline-none"
                aria-label="AI search query input"
              />
              <button
                onClick={() => handleSendQuery()}
                className="py-4 px-5 bg-silver-midtone hover:bg-silver-dark text-white font-black rounded-xl cursor-pointer min-h-[64px] min-w-[64px] flex items-center justify-center"
              >
                <ArrowRight className="w-6 h-6 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accessibility Compliant Footer */}
      <footer className="bg-silver-card border-t-8 border-silver-accent text-center py-6 px-4 text-base font-bold text-silver-dark shrink-0 font-sans">
        <p>© 2026 All rights reserved to CrypticTrio</p>
      </footer>

    </div>
  );
}
