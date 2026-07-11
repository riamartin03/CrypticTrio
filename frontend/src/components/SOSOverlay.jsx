import React from 'react';
import { AlertOctagon, X, Phone, Heart } from 'lucide-react';

export default function SOSOverlay({ isOpen, onClose, profileData }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="w-full max-w-3xl bg-white text-[#2F4156] rounded-[36px] shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Sticky Header with Slate/Navy background for professional look */}
        <div className="sticky top-0 z-50 bg-[#2F4156] text-white p-6 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-3 text-white">
            <AlertOctagon className="w-8 h-8 text-red-400 animate-pulse" />
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">Medical Emergency Snapshot</h2>
          </div>
          <button
            onClick={onClose}
            className="py-3 px-5 bg-white hover:bg-gray-100 text-[#2F4156] rounded-xl font-black text-lg transition-all cursor-pointer flex items-center space-x-1"
          >
            <X className="w-6 h-6 text-red-500" />
            <span>CLOSE</span>
          </button>
        </div>

        {/* Content Snapshot Body */}
        <div className="p-8 space-y-8 flex-grow bg-[#F5EFEB]">
          
          {/* Subtle Health Information Box */}
          <div className="bg-white text-[#2F4156] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-gray-100 pb-6">
              <div>
                <span className="text-xs text-gray-500 font-bold block uppercase tracking-wider">Allergy Warning</span>
                <span className="text-2xl font-black text-red-600 uppercase">HIGH RISK</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-bold block uppercase tracking-wider">Blood Group Type</span>
                <span className="text-2xl font-black text-[#2F4156]">{profileData.bloodGroup}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-bold block uppercase tracking-wider">Biological Gender</span>
                <span className="text-2xl font-black text-[#2F4156]">{profileData.gender}</span>
              </div>
            </div>

            {/* Allergies list */}
            <div className="space-y-2">
              <h4 className="text-lg font-black uppercase text-red-600 flex items-center space-x-2">
                <span>🚫</span>
                <span>Active Allergies Ledger:</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {profileData.allergies.map(al => (
                  <span key={al} className="bg-red-50 text-red-700 font-black text-base px-4 py-1.5 rounded-xl uppercase">
                    {al}
                  </span>
                ))}
              </div>
            </div>

            {/* Core Chronic Conditions */}
            <div className="space-y-2">
              <h4 className="text-lg font-black uppercase text-[#2F4156] flex items-center space-x-2">
                <span>🩺</span>
                <span>Conditions Summary:</span>
              </h4>
              <ul className="list-disc pl-6 space-y-2 text-lg font-bold text-[#2F4156] uppercase">
                {profileData.conditions.map(cond => (
                  <li key={cond} className="marker:text-red-500">
                    {cond}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Aesthetic dial triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            
            {/* Emergency Services */}
            <button
              onClick={() => alert("Simulating phone call: Dialing 911 Emergency Services...")}
              className="py-5 px-6 bg-red-50 hover:bg-red-100 text-red-700 rounded-2xl font-black text-xl flex items-center justify-center space-x-3 shadow-md active:scale-95 transition-all cursor-pointer min-h-[72px]"
            >
              <Phone className="w-6 h-6 text-red-600" />
              <span>DIAL EMERGENCY 911</span>
            </button>

            {/* Primary Caregiver */}
            <button
              onClick={() => alert("Simulating phone call: Dialing Primary Caregiver John...")}
              className="py-5 px-6 bg-[#567C8D] hover:bg-[#2F4156] text-white rounded-2xl font-black text-xl flex items-center justify-center space-x-3 shadow-md active:scale-95 transition-all cursor-pointer min-h-[72px]"
            >
              <Heart className="w-6 h-6 text-white fill-white" />
              <span>DIAL CAREGIVER JOHN</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
