import React, { useState } from 'react';
import { HeartHandshake, User, ShieldAlert, UserPlus, Mail, Lock, Key } from 'lucide-react';
import { api } from '../services/api';

export default function LandingAndAuth({ onLoginSuccess }) {
  
  const [showLogin, setShowLogin] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient'); // 'patient' or 'caregiver'
  const [linkUserId, setLinkUserId] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-seeds Caregiver and Patient accounts + default medications & profiles
  const handleQuickDemo = async (targetRole) => {
    setError(null);
    setLoading(true);
    try {
      let cgToken, cgId;
      // 1. Ensure John Caregiver exists
      try {
        const res = await api.auth.login('caregiver@test.com', 'securepassword123');
        cgToken = res.access_token;
        cgId = res.user_id;
      } catch (e) {
        const res = await api.auth.signup({
          email: 'caregiver@test.com',
          name: 'John Caregiver',
          password: 'securepassword123',
          role: 'caregiver'
        });
        cgId = res.id;
        const loginRes = await api.auth.login('caregiver@test.com', 'securepassword123');
        cgToken = loginRes.access_token;
      }

      // 2. Ensure Ramesh Kumar Patient exists, linked to John Caregiver
      let patToken, patId;
      try {
        const res = await api.auth.login('patient@test.com', 'patientpassword123');
        patToken = res.access_token;
        patId = res.user_id;
      } catch (e) {
        const res = await api.auth.signup({
          email: 'patient@test.com',
          name: 'Ramesh Kumar',
          password: 'patientpassword123',
          role: 'patient',
          link_user_id: cgId
        });
        patId = res.id;
        const loginRes = await api.auth.login('patient@test.com', 'patientpassword123');
        patToken = loginRes.access_token;
      }

      // 3. Seed default medications & profile coordinates for Ramesh Kumar
      try {
        const medicines = await api.scheduler.getMedicines(patId);
        if (medicines.length === 0) {
          await api.scheduler.createMedicine({
            patient_id: patId,
            name: 'Lisinopril 10mg',
            visual_identifiers: { shape: 'Oval', color: 'Pink' },
            scheduled_times: ['Morning'],
            custom_instructions: 'Take 1 pill after breakfast',
            is_critical: true
          });
          await api.scheduler.createMedicine({
            patient_id: patId,
            name: 'Metformin 500mg',
            visual_identifiers: { shape: 'Capsule', color: 'White' },
            scheduled_times: ['Afternoon'],
            custom_instructions: 'Take 1 capsule with lunch',
            is_critical: false
          });
          await api.scheduler.createMedicine({
            patient_id: patId,
            name: 'Atorvastatin 20mg',
            visual_identifiers: { shape: 'Round', color: 'White' },
            scheduled_times: ['Night'],
            custom_instructions: 'Take 1 pill before bedtime',
            is_critical: false
          });
          // Update profile coordinates
          await api.user.updateProfile({
            patient_id: patId,
            emergency_contacts: [
              { name: 'John Caregiver', phone: '+15550199', relationship: 'Caregiver' }
            ],
            medical_history: ['Hypertension', 'Type 2 Diabetes', 'Coronary Artery Disease'],
            allergies: ['Penicillin', 'Sulfa Antibiotics', 'Aspirin'],
            home_address: {
              address_text: '123 Sunny Meadows Lane, San Jose, CA',
              latitude: 37.3382,
              longitude: -121.8863
            }
          });
        }
      } catch (err) {
        console.error("Failed to seed default patient medications/profile: ", err);
      }

      // 4. Log in as the requested demo role
      if (targetRole === 'caregiver') {
        onLoginSuccess({
          token: cgToken,
          userId: cgId,
          role: 'caregiver',
          name: 'John Caregiver',
          patientId: patId // Keep reference to patient
        });
      } else {
        onLoginSuccess({
          token: patToken,
          userId: patId,
          role: 'patient',
          name: 'Ramesh Kumar',
          patientId: patId
        });
      }
    } catch (err) {
      setError(err.message || "Failed to log in to Quick Demo");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAuthSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authTab === 'login') {
        const res = await api.auth.login(email, password);
        onLoginSuccess({
          token: res.access_token,
          userId: res.user_id,
          role: res.role,
          name: res.name,
          patientId: res.role === 'patient' ? res.user_id : null
        });
      } else {
        // Sign Up
        const signupData = { email, name, password, role };
        if (role === 'patient' && linkUserId) {
          signupData.link_user_id = linkUserId;
        }
        const res = await api.auth.signup(signupData);
        // Automatically login after signup
        const loginRes = await api.auth.login(email, password);
        onLoginSuccess({
          token: loginRes.access_token,
          userId: loginRes.user_id,
          role: loginRes.role,
          name: loginRes.name,
          patientId: loginRes.role === 'patient' ? loginRes.user_id : null
        });
      }
    } catch (err) {
      setError(err.message || "Authentication request failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!showLogin) {
    return (
      <div className="flex flex-col items-center justify-center space-y-16 px-4 py-8 font-sans text-xl w-full">
        
        {/* Hero Section Container */}
        <div className="w-full max-w-5xl text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-silver-accent rounded-full border-4 border-silver-midtone">
              <HeartHandshake className="w-20 h-20 text-silver-dark" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-silver-dark tracking-tight mb-6">
            SilverCare
          </h1>
          <p className="text-2xl sm:text-3xl font-extrabold text-silver-dark mb-4 uppercase tracking-wider">
            Your Empathetic Care Companion
          </p>
          <p className="text-xl sm:text-2xl font-bold text-silver-midtone leading-relaxed max-w-3xl mx-auto">
            Simplifying medical tracking, clinic queue waiting, and doctor briefings with accessible designs for senior citizens and caregivers.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowLogin(true)}
              className="py-6 px-12 bg-silver-dark hover:bg-silver-midtone text-silver-card rounded-2xl text-2xl sm:text-3xl font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-2xl cursor-pointer min-h-[80px]"
            >
              Login
            </button>
          </div>
        </div>

        {/* About Section */}
        <div id="about" className="w-full max-w-5xl text-left space-y-6 py-8">
          <h2 className="text-3xl font-black text-silver-dark uppercase border-b-4 border-silver-accent pb-2">
            About
          </h2>
          <div className="space-y-4 text-xl font-bold text-silver-dark leading-relaxed">
            <p>
              SilverCare is a healthcare platform designed to simplify interactions between patients, caregivers, and healthcare providers.
            </p>
            <p>
              The platform focuses on secure access, efficient communication, and streamlined healthcare management while providing a user-friendly experience.
            </p>
            <p>
              It aims to make healthcare services more accessible, organized, and reliable for everyone.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-8 px-4 py-8 font-sans text-xl w-full">
      
      {/* Back to details link */}
      <div className="w-full max-w-5xl flex justify-start">
        <button
          onClick={() => setShowLogin(false)}
          className="text-silver-midtone hover:text-silver-dark font-black text-lg uppercase cursor-pointer flex items-center space-x-2"
        >
          <span>←</span> <span>Back to Details & Features</span>
        </button>
      </div>

      {/* Main Auth Panel */}
      <div className="w-full max-w-5xl bg-silver-accent border-4 border-silver-midtone rounded-3xl p-8 shadow-md">
        
        {error && (
          <div className="mb-6 p-4 bg-silver-sos text-white text-lg font-black rounded-xl border-4 border-white text-center animate-bounce">
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div className="mb-6 p-4 bg-silver-dark text-silver-card text-lg font-black rounded-xl text-center animate-pulse">
            Processing secure request... Please wait...
          </div>
        )}

        {!isCustomMode ? (
          <div>
            <h2 className="text-3xl font-black text-silver-dark text-center mb-8 uppercase tracking-wider">
              Quick Access Portals
            </h2>
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Action 1: Patient Login */}
              <button
                onClick={() => handleQuickDemo('patient')}
                disabled={loading}
                className="w-full py-6 px-8 bg-silver-dark hover:bg-silver-midtone disabled:opacity-50 text-silver-card rounded-2xl flex items-center justify-between transition-colors border-4 border-transparent shadow-md focus:outline-none focus:ring-4 focus:ring-silver-midtone cursor-pointer min-h-[96px]"
                aria-label="Login as Patient"
              >
                <div className="flex items-center space-x-6">
                  <div className="p-3 bg-silver-card rounded-xl text-silver-dark shrink-0">
                    <User className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div className="text-left">
                    <span className="text-2xl sm:text-3xl font-black block">Login as Patient</span>
                    <span className="text-sm font-semibold text-silver-bg uppercase block">Demo Account: Ramesh Kumar</span>
                  </div>
                </div>
                <span className="text-2xl font-black shrink-0">➔</span>
              </button>

              {/* Action 2: Caregiver Login */}
              <button
                onClick={() => handleQuickDemo('caregiver')}
                disabled={loading}
                className="w-full py-6 px-8 bg-silver-midtone hover:bg-silver-dark disabled:opacity-50 text-silver-card rounded-2xl flex items-center justify-between transition-colors border-4 border-transparent shadow-md focus:outline-none focus:ring-4 focus:ring-silver-dark cursor-pointer min-h-[96px]"
                aria-label="Login as Caregiver"
              >
                <div className="flex items-center space-x-6">
                  <div className="p-3 bg-silver-card rounded-xl text-silver-sos shrink-0">
                    <ShieldAlert className="w-8 h-8 stroke-[3]" />
                  </div>
                  <div className="text-left">
                    <span className="text-2xl sm:text-3xl font-black block">Login as Caregiver</span>
                    <span className="text-sm font-semibold text-silver-bg uppercase block">Demo Account: John Caregiver</span>
                  </div>
                </div>
                <span className="text-2xl font-black shrink-0">➔</span>
              </button>

              <div className="text-center pt-4">
                <button
                  onClick={() => setIsCustomMode(true)}
                  className="text-silver-dark font-black hover:underline text-lg uppercase cursor-pointer"
                >
                  Or use a custom email / registration
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Form Mode Selector */}
            <div className="flex border-4 border-silver-midtone rounded-2xl overflow-hidden mb-8 bg-white">
              <button
                onClick={() => setAuthTab('login')}
                className={`flex-1 py-4 text-center font-black text-xl cursor-pointer ${
                  authTab === 'login' ? 'bg-silver-dark text-white' : 'bg-white text-silver-dark'
                }`}
              >
                SIGN IN
              </button>
              <button
                onClick={() => setAuthTab('signup')}
                className={`flex-1 py-4 text-center font-black text-xl cursor-pointer ${
                  authTab === 'signup' ? 'bg-silver-dark text-white' : 'bg-white text-silver-dark'
                }`}
              >
                REGISTER
              </button>
            </div>

            <form onSubmit={handleCustomAuthSubmit} className="space-y-6 bg-silver-card p-6 sm:p-8 rounded-2xl border-4 border-silver-midtone shadow-inner">
              
              {authTab === 'signup' && (
                <div>
                  <label className="block text-sm font-black text-silver-dark uppercase mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-black text-silver-dark uppercase mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-silver-dark uppercase mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                  />
                </div>
              </div>

              {authTab === 'signup' && (
                <div className="space-y-4">
                  <label className="block text-sm font-black text-silver-dark uppercase">Select Account Role</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole('patient')}
                      className={`py-4 border-4 rounded-xl font-black text-lg cursor-pointer flex items-center justify-center space-x-2 ${
                        role === 'patient' ? 'bg-silver-dark text-white border-silver-dark' : 'bg-white text-silver-dark border-gray-300'
                      }`}
                    >
                      <User className="w-5 h-5" />
                      <span>PATIENT</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('caregiver')}
                      className={`py-4 border-4 rounded-xl font-black text-lg cursor-pointer flex items-center justify-center space-x-2 ${
                        role === 'caregiver' ? 'bg-silver-dark text-white border-silver-dark' : 'bg-white text-silver-dark border-gray-300'
                      }`}
                    >
                      <ShieldAlert className="w-5 h-5" />
                      <span>CAREGIVER</span>
                    </button>
                  </div>

                  {role === 'patient' && (
                    <div className="pt-2">
                      <label className="block text-sm font-black text-silver-dark uppercase mb-2">
                        Link Caregiver ID (Optional)
                      </label>
                      <div className="relative">
                        <Key className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                        <input
                          type="text"
                          placeholder="Caregiver's User UUID"
                          value={linkUserId}
                          onChange={(e) => setLinkUserId(e.target.value)}
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-base min-h-[64px]"
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-bold mt-1 block">
                        Allows caregiver to access patient dashboards remotely.
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-silver-dark hover:bg-silver-midtone text-white rounded-xl font-black text-xl shadow-md min-h-[64px]"
              >
                {authTab === 'login' ? 'SIGN IN NOW ➔' : 'REGISTER ACCOUNT ➔'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="text-silver-midtone hover:text-silver-dark font-black text-base uppercase cursor-pointer"
                >
                  ← Back to Quick Access Portals
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
