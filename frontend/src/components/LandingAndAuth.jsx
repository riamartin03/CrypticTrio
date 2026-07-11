import React from 'react';
import { HeartHandshake, User, ShieldAlert, UserPlus } from 'lucide-react';

export default function LandingAndAuth({ setRole }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 px-4 py-8 font-sans text-xl">
      
      {/* Hero Section Container */}
      <div className="w-full max-w-5xl bg-silver-card border-4 border-silver-midtone rounded-3xl p-8 sm:p-10 shadow-md text-center">
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
      </div>

      {/* About & Features Information Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* About Section */}
        <div className="bg-silver-card border-4 border-silver-midtone rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-black text-silver-dark uppercase border-b-4 border-silver-accent pb-2 mb-4 flex items-center space-x-2">
            <span>ℹ️</span>
            <span>About SilverCare</span>
          </h2>
          <p className="text-lg sm:text-xl font-bold text-silver-dark leading-relaxed">
            SilverCare is designed specifically for seniors facing cognitive or motor difficulties. Our interface uses high-contrast fonts, anti-glare screen configurations, and oversize click zones to ensure that monitoring your health stays simple, quick, and stress-free.
          </p>
        </div>

        {/* Features List Section */}
        <div className="bg-silver-card border-4 border-silver-midtone rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-black text-silver-dark uppercase border-b-4 border-silver-accent pb-2 mb-4 flex items-center space-x-2">
            <span>✨</span>
            <span>Key Assistant Features</span>
          </h2>
          <ul className="space-y-3 text-lg sm:text-xl font-bold text-silver-dark">
            <li className="flex items-start space-x-2">
              <span className="text-silver-midtone font-extrabold select-none">✓</span>
              <span>Daily checklist for pills and check-ins</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-silver-midtone font-extrabold select-none">✓</span>
              <span>Speech-to-Text symptoms journal</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-silver-midtone font-extrabold select-none">✓</span>
              <span>Live clinic queue progress tracking</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-silver-midtone font-extrabold select-none">✓</span>
              <span>Accessibility overlay with reading rules</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Authentication Gateway Panel (Giant Buttons with Empty Click Handlers) */}
      <div className="w-full max-w-5xl bg-silver-accent border-4 border-silver-midtone rounded-3xl p-8 shadow-md">
        <h2 className="text-3xl font-black text-silver-dark text-center mb-8 uppercase tracking-wider">
          Secure Login & Gateways
        </h2>
        
        {/* Vertical List of oversize authentication targets */}
        <div className="space-y-6 max-w-2xl mx-auto">
          
          {/* Action 1: Patient Login */}
          <button
            onClick={() => setRole('patient')}
            className="w-full py-6 px-8 bg-silver-dark hover:bg-silver-midtone text-silver-card rounded-2xl flex items-center justify-between transition-colors border-4 border-transparent shadow-md focus:outline-none focus:ring-4 focus:ring-silver-midtone cursor-pointer min-h-[96px]"
            aria-label="Login as Patient"
          >
            <div className="flex items-center space-x-6">
              <div className="p-3 bg-silver-card rounded-xl text-silver-dark shrink-0">
                <User className="w-8 h-8 stroke-[3]" />
              </div>
              <span className="text-2xl sm:text-3xl font-black text-left">Login as Patient</span>
            </div>
            <span className="text-2xl font-black shrink-0">➔</span>
          </button>

          {/* Action 2: Caregiver Login */}
          <button
            onClick={() => setRole('caregiver')}
            className="w-full py-6 px-8 bg-silver-midtone hover:bg-silver-dark text-silver-card rounded-2xl flex items-center justify-between transition-colors border-4 border-transparent shadow-md focus:outline-none focus:ring-4 focus:ring-silver-dark cursor-pointer min-h-[96px]"
            aria-label="Login as Caregiver (Shadow Dashboard)"
          >
            <div className="flex items-center space-x-6">
              <div className="p-3 bg-silver-card rounded-xl text-silver-sos shrink-0">
                <ShieldAlert className="w-8 h-8 stroke-[3]" />
              </div>
              <span className="text-2xl sm:text-3xl font-black text-left">Login as Caregiver</span>
            </div>
            <span className="text-2xl font-black shrink-0">➔</span>
          </button>

          {/* Action 3: New Register Sign Up */}
          <button
            onClick={() => setRole('patient')}
            className="w-full py-6 px-8 bg-silver-card hover:bg-silver-bg text-silver-dark border-4 border-silver-midtone rounded-2xl flex items-center justify-between transition-colors shadow-md focus:outline-none focus:ring-4 focus:ring-silver-midtone cursor-pointer min-h-[96px]"
            aria-label="Sign Up for a new SilverCare account"
          >
            <div className="flex items-center space-x-6">
              <div className="p-3 bg-silver-accent rounded-xl text-silver-dark shrink-0">
                <UserPlus className="w-8 h-8 stroke-[3]" />
              </div>
              <span className="text-2xl sm:text-3xl font-black text-left">Sign Up / Register</span>
            </div>
            <span className="text-2xl font-black shrink-0">➔</span>
          </button>

        </div>
      </div>

    </div>
  );
}
