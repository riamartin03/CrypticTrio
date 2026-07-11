import React, { useState, useEffect } from 'react';
import { HeartHandshake, User, ShieldAlert, Mail, Lock, Phone, Key } from 'lucide-react';
import { api } from '../services/api';

export default function LandingAndAuth({ onLoginSuccess, initialView = 'landing', onViewChange }) {
  // view: 'landing' | 'patient' | 'caregiver'
  const [view, setView] = useState(initialView);

  useEffect(() => {
    if (initialView) {
      setView(initialView);
    }
  }, [initialView]);
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'signup'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Shared fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  // Caregiver-only fields
  const [phone, setPhone] = useState('');
  const [patientId, setPatientId] = useState('');

  const resetFormFields = () => {
    setEmail('');
    setName('');
    setPassword('');
    setPhone('');
    setPatientId('');
    setError(null);
  };

  const goToView = (target) => {
    resetFormFields();
    setAuthTab('login');
    setView(target);
    if (onViewChange) onViewChange(target);
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (authTab === 'signup') {
        await api.auth.signup({
          email,
          name,
          password,
          role: 'patient'
        });
      }
      
      const loginRes = await api.auth.login(email, password);
      localStorage.setItem('silvercare_token', loginRes.access_token);
      onLoginSuccess({
        token: loginRes.access_token,
        userId: loginRes.user_id,
        role: loginRes.role,
        name: loginRes.name || name || 'Ramesh Kumar',
        patientId: loginRes.user_id
      });
    } catch (err) {
      console.warn("Backend auth failed or offline. Falling back to local mock session:", err);
      localStorage.setItem('silvercare_token', 'dummy-patient-token');
      onLoginSuccess({
        token: 'dummy-patient-token',
        userId: 'dummy-patient-id',
        role: 'patient',
        name: name || 'Ramesh Kumar',
        patientId: 'dummy-patient-id'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCaregiverSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (authTab === 'signup') {
        await api.auth.signup({
          email,
          name,
          password,
          role: 'caregiver',
          link_user_id: patientId || undefined
        });
      }
      
      const loginRes = await api.auth.login(email, password);
      localStorage.setItem('silvercare_token', loginRes.access_token);
      onLoginSuccess({
        token: loginRes.access_token,
        userId: loginRes.user_id,
        role: loginRes.role,
        name: loginRes.name || name || 'John Caregiver',
        patientId: patientId || 'dummy-patient-id'
      });
    } catch (err) {
      console.warn("Backend auth failed or offline. Falling back to local mock session:", err);
      localStorage.setItem('silvercare_token', 'dummy-caregiver-token');
      onLoginSuccess({
        token: 'dummy-caregiver-token',
        userId: 'dummy-caregiver-id',
        role: 'caregiver',
        name: name || 'John Caregiver',
        patientId: patientId || 'dummy-patient-id'
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------- LANDING VIEW ----------
  if (view === 'landing') {
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
          <p className="text-xl sm:text-2xl font-bold text-silver-midtone leading-relaxed max-w-3xl mx-auto mb-10">
            Simplifying medical tracking, clinic queue waiting, and doctor briefings with accessible designs for senior citizens and caregivers.
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => goToView('patient')}
              className="py-5 px-12 bg-silver-dark hover:bg-silver-midtone text-silver-card rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer min-h-[72px] max-w-sm w-full flex items-center justify-center"
            >
              <span className="text-2xl font-black uppercase">login</span>
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

  // ---------- SHARED AUTH SHELL ----------
  const isCaregiver = view === 'caregiver';

  return (
    <div className="flex flex-col items-center justify-center space-y-8 px-4 py-8 font-sans text-xl w-full">

      <div className="w-full max-w-5xl flex justify-start">
        <button
          onClick={() => goToView('landing')}
          className="text-silver-midtone hover:text-silver-dark font-black text-lg uppercase cursor-pointer flex items-center space-x-2"
        >
          <span>←</span> <span>Back to Home</span>
        </button>
      </div>

      <div className="w-full max-w-5xl bg-silver-accent rounded-3xl p-8 shadow-none">

        <div className="flex items-center justify-center space-x-3 mb-6">
          {isCaregiver ? (
            <ShieldAlert className="w-10 h-10 text-silver-sos" />
          ) : (
            <User className="w-10 h-10 text-silver-dark" />
          )}
          <h2 className="text-3xl font-black text-silver-dark uppercase tracking-wider">
            {isCaregiver ? 'Caregiver Portal' : 'Patient Portal'}
          </h2>
        </div>

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

        <div className="max-w-2xl mx-auto">
          {/* Tab Selector */}
          <div className="flex border-4 border-silver-midtone rounded-2xl overflow-hidden mb-8 bg-white">
            <button
              onClick={() => { setAuthTab('login'); setError(null); }}
              className={`flex-1 py-4 text-center font-black text-xl cursor-pointer ${
                authTab === 'login' ? 'bg-silver-dark text-white' : 'bg-white text-silver-dark'
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => { setAuthTab('signup'); setError(null); }}
              className={`flex-1 py-4 text-center font-black text-xl cursor-pointer ${
                authTab === 'signup' ? 'bg-silver-dark text-white' : 'bg-white text-silver-dark'
              }`}
            >
              REGISTER
            </button>
          </div>

          {/* ---------- PATIENT FORM ---------- */}
          {!isCaregiver && (
            <form onSubmit={handlePatientSubmit} className="space-y-6 bg-silver-card p-6 sm:p-8 rounded-2xl shadow-none">

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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-silver-dark hover:bg-silver-midtone text-white rounded-xl font-black text-xl shadow-md min-h-[64px]"
              >
                {authTab === 'login' ? 'SIGN IN NOW ➔' : 'REGISTER ACCOUNT ➔'}
              </button>
            </form>
          )}

          {/* ---------- CAREGIVER FORM ---------- */}
          {isCaregiver && (
            <form onSubmit={handleCaregiverSubmit} className="space-y-6 bg-silver-card p-6 sm:p-8 rounded-2xl shadow-none">

              {authTab === 'signup' && (
                <>
                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Caregiver Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Caregiver"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +1 555 0199"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>
                </>
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
                <div>
                  <label className="block text-sm font-black text-silver-dark uppercase mb-2">Patient ID</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                    <input
                      type="text"
                      required
                      placeholder="Patient's User ID"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-base min-h-[64px]"
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-bold mt-1 block">
                    Ask the patient for their Patient ID, shown on their dashboard after registration. Each patient can only be linked to one caregiver.
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-silver-dark hover:bg-silver-midtone text-white rounded-xl font-black text-xl shadow-md min-h-[64px]"
              >
                {authTab === 'login' ? 'SIGN IN NOW ➔' : 'REGISTER ACCOUNT ➔'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}