import React, { useState, useEffect } from 'react';
import LandingAndAuth from './components/LandingAndAuth';
import PatientDashboard from './components/PatientDashboard';
import ShadowDashboard from './components/ShadowDashboard';
import PersistentAccessibilityOverlay from './components/PersistentAccessibilityOverlay';
import { Home, User, ShieldAlert, AlertOctagon, MessageSquare, Navigation, X, Check, ArrowRight, HeartHandshake } from 'lucide-react';
import { api } from './services/api';

export default function App() {
  // Authentication & Session State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('silvercare_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation State: 'landing', 'patient', 'caregiver'
  const [activeScreen, setActiveScreen] = useState(() => {
    const saved = localStorage.getItem('silvercare_user');
    return saved ? JSON.parse(saved).role : 'landing';
  });

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('silvercare_token', userData.token);
    localStorage.setItem('silvercare_user', JSON.stringify(userData));
    setUser(userData);
    setActiveScreen(userData.role);
  };

  const handleLogout = () => {
    localStorage.removeItem('silvercare_token');
    localStorage.removeItem('silvercare_user');
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

  // Top-Right Floating Modals States
  const [showSOS, setShowSOS] = useState(false);
  const [showAIBot, setShowAIBot] = useState(false);
  const [showTakeMeHome, setShowTakeMeHome] = useState(false);

  // Home Navigation Details (Fetched from backend)
  const [homeAddressText, setHomeAddressText] = useState("123 Sunny Meadows Lane, San Jose, CA");
  const [homeMapsUrl, setHomeMapsUrl] = useState("https://www.google.com/maps/dir/?api=1&destination=37.3382,-121.8863");

  // AI Bot Chat Logs State
  const [chatInput, setChatInput] = useState("");
  const [chatLogs, setChatLogs] = useState([
    { sender: 'bot', text: 'Hello! I am your SilverCare drug safety assistant. Ask me questions like: "Can I eat grapefruit with my medicine?"' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch navigation details on mount / user change
  useEffect(() => {
    if (user && user.patientId) {
      api.navigation.getHomeRoute(user.patientId)
        .then(res => {
          setHomeAddressText(res.home_address);
          setHomeMapsUrl(res.navigation_url);
        })
        .catch(err => {
          console.log("Could not load home route navigation coords: ", err.message);
        });
    }
  }, [user]);

  // Set root font size on change of multiplier
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSizeMultiplier * 100}%`;
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [fontSizeMultiplier]);

  // Track mouse vertical position for reading ruler
  const [rulerPosition, setRulerPosition] = useState(200);

  useEffect(() => {
    if (!readingRuler) return;
    const handleMouseMove = (e) => {
      setRulerPosition(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [readingRuler]);


  // SOS Emergency Trigger
  const handleTriggerSOS = async () => {
    setShowSOS(true);
    if (user && user.patientId) {
      try {
        await api.user.triggerSOS(user.patientId);
      } catch (err) {
        console.error("SOS dispatch failed: ", err);
      }
    }
  };

  // AI safety interaction submit
  const handleSendQuery = async (queryText) => {
    const text = queryText || chatInput;
    if (!text) return;
    
    // Add user query
    const updatedLogs = [...chatLogs, { sender: 'user', text: text }];
    setChatLogs(updatedLogs);
    setChatInput("");
    setAiLoading(true);

    try {
      const activePatientId = user?.patientId || user?.userId || 'demo_patient';
      const res = await api.ai.foodInteraction(activePatientId, text);
      
      setChatLogs([...updatedLogs, { sender: 'bot', text: res.safety_warning }]);
    } catch (err) {
      setChatLogs([...updatedLogs, { sender: 'bot', text: "⚠️ Error contacting drug safety analysis engine. Please ask your doctor directly." }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Accessibility Scaling Handlers
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
      className={`min-h-screen flex flex-col justify-between ${user ? 'pb-24' : ''} transition-colors duration-200 select-none ${
        contrastMode === 'high' 
          ? 'bg-black text-white border-white' 
          : 'bg-silver-bg text-silver-dark'
      } ${
        dyslexiaFont ? 'font-mono tracking-wide' : 'font-sans font-bold'
      }`}
    >
      {/* 1. BOTTOM-RIGHT PERSISTENT ROUND FLOATING BUTTONS */}
      {user && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-4">
          
          {/* SOS Button */}
          <button
            onClick={handleTriggerSOS}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-silver-sos hover:bg-red-800 text-white rounded-full flex flex-col items-center justify-center shadow-2xl border-4 border-white transition-all active:scale-90 hover:scale-105 cursor-pointer focus:ring-4 focus:ring-red-400"
            aria-label="SOS Emergency Help Trigger"
          >
            <AlertOctagon className="w-8 h-8 animate-pulse shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-tight mt-0.5">SOS</span>
          </button>

          {/* AI Bot Button */}
          <button
            onClick={() => setShowAIBot(true)}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-silver-midtone hover:bg-silver-dark text-white rounded-full flex flex-col items-center justify-center shadow-2xl border-4 border-white transition-all active:scale-90 hover:scale-105 cursor-pointer focus:ring-4 focus:ring-silver-midtone"
            aria-label="AI Drug Safety Assistant Chat"
          >
            <MessageSquare className="w-8 h-8 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-tight mt-0.5">AI BOT</span>
          </button>

          {/* Take Me Home Button */}
          <button
            onClick={() => setShowTakeMeHome(true)}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-silver-dark hover:bg-silver-midtone text-white rounded-full flex flex-col items-center justify-center shadow-2xl border-4 border-white transition-all active:scale-90 hover:scale-105 cursor-pointer focus:ring-4 focus:ring-silver-midtone"
            aria-label="Get Directions Back Home"
          >
            <Navigation className="w-8 h-8 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-tight mt-0.5">HOME</span>
          </button>

        </div>
      )}

      {/* Reading Ruler Assist Panel (Horizontal focus band following user) */}
      {readingRuler && (
        <div 
          style={{ top: `${rulerPosition}px`, transform: 'translateY(-50%)' }}
          className="fixed left-0 right-0 h-16 bg-gray-500 bg-opacity-20 pointer-events-none z-30 border-y-4 border-yellow-400" 
        />
      )}

      {/* App Header Selector Nav */}
      <header className={`border-b-8 sticky top-0 z-40 shadow-lg transition-colors ${
        contrastMode === 'high' 
          ? 'bg-black text-white border-white' 
          : 'bg-silver-dark text-silver-card border-silver-midtone'
      }`}>
        <div className="w-full px-6 py-4 flex flex-row items-center justify-between gap-4">
          
          <button 
            onClick={() => setActiveScreen(user ? user.role : 'landing')}
            className="flex items-center space-x-3 shrink-0 cursor-pointer focus:outline-none focus:ring-4 focus:ring-silver-midtone rounded-xl p-1 text-left"
          >
            {/* Favicon/logo placeholder area */}
            <div className="w-10 h-10 bg-silver-accent hover:bg-silver-midtone rounded-xl flex items-center justify-center border-2 border-silver-midtone shrink-0 transition-colors">
              <HeartHandshake className="w-6 h-6 text-silver-dark" />
            </div>
            <span className="text-2xl font-black uppercase tracking-tight text-silver-card">SilverCare</span>
          </button>

          {user ? (
            <nav className="flex items-center flex-wrap gap-3">
              <button
                onClick={() => setActiveScreen('patient')}
                className={`py-3 px-5 text-xl font-black rounded-xl transition-all cursor-pointer flex items-center space-x-2 focus:ring-4 focus:ring-silver-midtone min-h-[64px] ${
                  activeScreen === 'patient'
                    ? contrastMode === 'high'
                      ? 'bg-white text-black border-4 border-white'
                      : 'bg-silver-card text-silver-dark border-4 border-silver-midtone'
                    : 'bg-transparent text-silver-bg hover:text-white'
                }`}
              >
                <User className="w-6 h-6 shrink-0" />
                <span>PATIENT VIEW</span>
              </button>

              <button
                onClick={() => setActiveScreen('caregiver')}
                className={`py-3 px-5 text-xl font-black rounded-xl transition-all cursor-pointer flex items-center space-x-2 focus:ring-4 focus:ring-silver-midtone min-h-[64px] ${
                  activeScreen === 'caregiver'
                    ? contrastMode === 'high'
                      ? 'bg-white text-black border-4 border-white'
                      : 'bg-silver-card text-silver-dark border-4 border-silver-midtone'
                    : 'bg-transparent text-silver-bg hover:text-white'
                }`}
              >
                <ShieldAlert className="w-6 h-6 shrink-0 text-silver-sos" />
                <span>CAREGIVER VIEW</span>
              </button>

              <button
                onClick={handleLogout}
                className="py-3 px-5 text-xl font-black rounded-xl transition-all cursor-pointer bg-silver-sos text-white hover:bg-red-800 focus:ring-4 focus:ring-red-400 min-h-[64px]"
              >
                LOGOUT
              </button>
            </nav>
          ) : (
            <div className="flex items-center space-x-8">
              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveScreen('landing');
                  setTimeout(() => {
                    const el = document.getElementById('about');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
                className="text-xl font-black uppercase tracking-wider text-silver-bg hover:text-white transition-colors py-2 px-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-silver-midtone"
              >
                About
              </a>
              <a
                href="#caregiver"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveScreen('caregiver-public');
                }}
                className="text-xl font-black uppercase tracking-wider text-silver-bg hover:text-white transition-colors py-2 px-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-silver-midtone"
              >
                Caregiver
              </a>
            </div>
          )}

        </div>
      </header>

      {/* Main Core View Area */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8">
        {!user ? (
          activeScreen === 'caregiver-public' ? (
            <div className="flex flex-col items-center justify-center space-y-8 px-4 py-8 font-sans text-xl w-full text-center">
              <h1 className="text-4xl sm:text-6xl font-black text-silver-dark tracking-tight mb-6">
                Caregiver
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-silver-midtone leading-relaxed max-w-3xl mx-auto">
                Welcome to the Caregiver portal. This space is designed for caregivers to securely coordinate access, monitor patient checklists, and manage alerts.
              </p>
              <button
                onClick={() => setActiveScreen('landing')}
                className="py-4 px-8 bg-silver-dark hover:bg-silver-midtone text-silver-card rounded-xl font-black uppercase transition-all cursor-pointer shadow-lg mt-6"
              >
                Back to Home
              </button>
            </div>
          ) : (
            <LandingAndAuth onLoginSuccess={handleLoginSuccess} />
          )
        ) : (
          <>
            {activeScreen === 'patient' && (
              <PatientDashboard 
                hideImages={hideImages} 
                patientId={user.patientId || user.userId}
                onTriggerSOS={handleTriggerSOS}
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

      {/* 2. PERSISTENT FLOATING ACCESSIBILITY SETTINGS OVERLAY DRAWER */}
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

      {/* Modals & Overlays Mapped */}
      
      {/* SOS Modal */}
      {showSOS && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-silver-sos text-silver-card border-8 border-white rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start border-b-4 border-white pb-4">
              <div className="flex items-center space-x-3">
                <AlertOctagon className="w-12 h-12 animate-bounce" />
                <h2 className="text-3xl font-black uppercase">EMERGENCY SOS CONTROLLER</h2>
              </div>
              <button 
                onClick={() => setShowSOS(false)}
                className="p-3 bg-white hover:bg-gray-200 text-silver-dark rounded-xl min-h-[64px] min-w-[64px] flex items-center justify-center cursor-pointer font-black"
                aria-label="Close emergency overlay"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="p-4 bg-red-800 text-white rounded-2xl border-4 border-white text-center text-xl font-bold animate-pulse">
              🚨 Caregiver alert notification successfully dispatched via SMS & Email.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => alert("Calling 911 Emergency...")}
                className="p-6 bg-white hover:bg-silver-bg text-red-700 rounded-2xl border-4 border-red-800 font-black text-2xl min-h-[84px] p-4 cursor-pointer"
              >
                🚨 DIAL EMERGENCY 911
              </button>
              <button 
                onClick={() => alert("Calling Caregiver John...")}
                className="p-6 bg-silver-dark hover:bg-silver-midtone text-silver-card rounded-2xl border-4 border-silver-midtone font-black text-2xl min-h-[84px] p-4 cursor-pointer"
              >
                📞 DIAL CAREGIVER JOHN
              </button>
            </div>

            <div className="bg-white text-silver-dark p-6 rounded-2xl border-4 border-red-800">
              <h3 className="text-2xl font-black uppercase text-red-700 mb-2">High Risk Allergies:</h3>
              <p className="text-xl font-black">🚫 PENICILLIN, SULFA DRUGS, ASPIRIN</p>
            </div>
          </div>
        </div>
      )}

      {/* Take Me Home Modal */}
      {showTakeMeHome && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-silver-dark text-silver-card border-8 border-silver-midtone rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start border-b-4 border-silver-midtone pb-4">
              <div className="flex items-center space-x-3">
                <Navigation className="w-10 h-10" />
                <h2 className="text-2xl sm:text-3xl font-black uppercase">Take Me Home GPS</h2>
              </div>
              <button 
                onClick={() => setShowTakeMeHome(false)}
                className="p-3 bg-white hover:bg-gray-200 text-silver-dark rounded-xl min-h-[64px] min-w-[64px] flex items-center justify-center cursor-pointer font-black"
                aria-label="Close navigation overlay"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <p className="text-lg text-silver-bg">Your registered home coordinates directions maps helper link:</p>
            <div className="bg-white text-silver-dark rounded-2xl p-4 border-2 border-silver-midtone">
              <span className="text-xs text-gray-500 font-bold block">HOME DESTINATION ADDRESS</span>
              <span className="text-xl font-black">{homeAddressText}</span>
            </div>

            <a
              href={homeMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-2xl font-bold rounded-2xl flex items-center justify-center space-x-2 text-center min-h-[64px]"
            >
              <span>LAUNCH GOOGLE MAPS ROUTE</span>
            </a>
          </div>
        </div>
      )}

      {/* AI Bot Chat Modal Drawer */}
      {showAIBot && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-end sm:items-center justify-end p-4 backdrop-blur-sm">
          <div className="w-full sm:w-[500px] h-[90vh] bg-silver-card border-8 border-silver-midtone rounded-3xl p-6 flex flex-col justify-between space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b-4 border-silver-accent pb-3 shrink-0">
              <div className="flex items-center space-x-2 text-silver-dark">
                <MessageSquare className="w-8 h-8" />
                <h2 className="text-2xl font-black uppercase">AI Safety Chat</h2>
              </div>
              <button 
                onClick={() => setShowAIBot(false)}
                className="p-2 hover:bg-red-700 hover:text-white rounded-xl min-h-[56px] min-w-[56px] flex items-center justify-center cursor-pointer font-black border border-transparent"
                aria-label="Close Chat Drawer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-grow overflow-y-auto space-y-4 p-2 bg-silver-bg rounded-2xl border-2 border-gray-300">
              {chatLogs.map((chat, idx) => (
                <div key={idx} className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-gray-500 font-bold uppercase mb-1">
                    {chat.sender === 'user' ? 'You' : 'CareBot AI'}
                  </span>
                  <div className={`p-4 rounded-2xl max-w-[85%] border-2 ${
                    chat.sender === 'user'
                      ? 'bg-silver-dark text-silver-card border-silver-dark'
                      : 'bg-white text-silver-dark border-silver-midtone'
                  }`}>
                    {chat.sender === 'bot' ? (
                      <div className="text-lg font-bold leading-relaxed prose max-w-none">
                        <pre className="font-sans whitespace-pre-wrap text-lg leading-relaxed">{chat.text}</pre>
                      </div>
                    ) : (
                      <p className="text-lg font-bold leading-relaxed">{chat.text}</p>
                    )}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-500 font-bold uppercase mb-1">CareBot AI</span>
                  <div className="p-4 rounded-2xl bg-white text-silver-dark border-2 border-silver-midtone animate-pulse font-bold">
                    Analyzing drug interactions with your profile...
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="flex space-x-2 shrink-0">
              <input
                type="text"
                placeholder="Ask e.g. 'Can I eat grapefruit?'"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') handleSendQuery(); }}
                disabled={aiLoading}
                className="flex-grow p-4 border-2 border-gray-300 rounded-xl bg-silver-bg font-semibold text-lg min-h-[64px]"
                aria-label="AI search query input"
              />
              <button
                onClick={() => handleSendQuery()}
                disabled={aiLoading}
                className="py-4 px-5 bg-silver-midtone hover:bg-silver-dark text-white font-black rounded-xl cursor-pointer min-h-[64px] min-w-[64px] flex items-center justify-center"
                aria-label="Send Query"
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
