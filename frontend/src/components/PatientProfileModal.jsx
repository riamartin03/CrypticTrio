import React, { useState } from 'react';
import { User, X, Mic, Volume2, ShieldAlert, FileText, Play, Pause } from 'lucide-react';

export default function PatientProfileModal({ isOpen, onClose, profileData }) {
  const [severity, setSeverity] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [micActive, setMicActive] = useState(false);

  if (!isOpen) return null;

  const preferredName = profileData.preferredName || profileData.preferred_name || '';
  const phone = profileData.phone || '';
  const dateOfBirth = profileData.dateOfBirth || profileData.date_of_birth || '';
  const bloodGroup = profileData.bloodGroup || profileData.blood_group || '';
  const conditions = profileData.conditions || profileData.primary_conditions || [];
  const mentalDisabilities = profileData.mentalDisabilities || profileData.mental_disabilities || [];
  const physicalDisabilities = profileData.physicalDisabilities || profileData.physical_disabilities || [];
  const lifetimeMedications = profileData.lifetimeMedications || profileData.lifetime_medications || '';
  const physicianName = profileData.physicianName || profileData.physician_name || '';
  const clinicPhone = profileData.clinicPhone || profileData.clinic_phone || '';
  const homeAddress = profileData.homeAddress || profileData.home_address || null;
  const name = profileData.name || '';
  const gender = profileData.gender || '';

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="w-full max-w-4xl bg-white border-8 border-silver-dark rounded-[36px] shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col text-silver-dark">
        
        {/* Sticky Header with Locked CLOSE button */}
        <div className="sticky top-0 z-50 bg-silver-dark text-white p-6 flex justify-between items-center border-b-4 border-silver-midtone shadow-md">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8" />
            <h2 className="text-2xl sm:text-3xl font-black uppercase">1. Patient Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="py-3 px-5 bg-silver-sos hover:bg-red-800 text-white rounded-xl font-black text-lg border-2 border-white transition-all cursor-pointer flex items-center space-x-1"
          >
            <X className="w-6 h-6" />
            <span>CLOSE</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-8 space-y-8 flex-grow">
          
          {/* Prominent Access Block */}
          <div className="bg-[#2F4156] text-white p-6 rounded-2xl border-4 border-[#567C8D] shadow-md text-center">
            <span className="text-3xl font-black block tracking-wider">📂 PATIENT RECORDS SUMMARY</span>
            <span className="text-sm font-semibold uppercase text-silver-bg block mt-1">Official Medical Profile Documentation</span>
          </div>

          {/* Demographics & Locked Configuration Fields (Read-Only) */}
          <div className="border-4 border-silver-midtone rounded-2xl p-6 bg-silver-bg space-y-6">
            <h3 className="text-xl font-black uppercase text-silver-dark border-b-2 border-gray-300 pb-2">Locked Demographics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="text-xs text-gray-500 font-bold block uppercase">Full Name</label>
                <span className="text-2xl font-black">{name || 'N/A'}</span>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold block uppercase">Preferred Name</label>
                <span className="text-2xl font-black block">{preferredName || 'None'}</span>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold block uppercase">Date of Birth</label>
                <span className="text-2xl font-black block">{dateOfBirth || 'Not Specified'}</span>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold block uppercase">Biological Gender</label>
                <span className="text-2xl font-black block">{gender || 'N/A'}</span>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold block uppercase">Verified Blood Group</label>
                <span className="text-2xl font-black block">{bloodGroup || 'N/A'}</span>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold block uppercase">Contact Phone</label>
                <span className="text-2xl font-black block">{phone || 'Not Specified'}</span>
              </div>
            </div>
          </div>

          {/* Clinical Profile Details */}
          <div className="border-4 border-silver-midtone rounded-2xl p-6 bg-white space-y-6">
            <h3 className="text-xl font-black uppercase text-silver-dark border-b-2 border-gray-300 pb-2">Clinical Profile Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-gray-500 font-bold block uppercase">Chronic Conditions</label>
                <span className="text-xl font-black block text-silver-dark">
                  {conditions.length > 0 ? conditions.join(', ') : 'No chronic conditions registered'}
                </span>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold block uppercase">Lifetime Medications</label>
                <span className="text-xl font-black block text-silver-dark">{lifetimeMedications || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Cognitive & Mobility Assistance */}
          <div className="border-4 border-silver-midtone rounded-2xl p-6 bg-silver-bg space-y-6">
            <h3 className="text-xl font-black uppercase text-silver-dark border-b-2 border-gray-300 pb-2">Cognitive & Mobility Assistance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-gray-500 font-bold block uppercase mb-1">Mental & Cognitive Disabilities</label>
                <div className="flex flex-wrap gap-2">
                  {mentalDisabilities.length > 0 ? (
                    mentalDisabilities.map((d, i) => (
                      <span key={i} className="text-sm font-black bg-silver-midtone text-white px-3 py-1.5 rounded-lg uppercase">
                        🧠 {d}
                      </span>
                    ))
                  ) : (
                    <span className="text-base font-bold text-gray-500">None registered</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold block uppercase mb-1">Physical & Mobility Disabilities</label>
                <div className="flex flex-wrap gap-2">
                  {physicalDisabilities.length > 0 ? (
                    physicalDisabilities.map((d, i) => (
                      <span key={i} className="text-sm font-black bg-silver-midtone text-white px-3 py-1.5 rounded-lg uppercase">
                        🚶 {d}
                      </span>
                    ))
                  ) : (
                    <span className="text-base font-bold text-gray-500">None registered</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Physician Care */}
          <div className="border-4 border-silver-midtone rounded-2xl p-6 bg-white space-y-6">
            <h3 className="text-xl font-black uppercase text-silver-dark border-b-2 border-gray-300 pb-2">Primary Physician Care</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-gray-500 font-bold block uppercase">Primary Care Physician</label>
                <span className="text-2xl font-black block text-silver-dark">{physicianName || 'No assigned physician'}</span>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold block uppercase">Clinic Contact Phone</label>
                <span className="text-2xl font-black block text-silver-dark">{clinicPhone || 'Not Specified'}</span>
              </div>
            </div>
          </div>

          {/* Verified Home Location */}
          {homeAddress && (
            <div className="border-4 border-silver-midtone rounded-2xl p-6 bg-silver-bg space-y-4">
              <h3 className="text-xl font-black uppercase text-silver-dark border-b-2 border-gray-300 pb-2">Verified Home Location</h3>
              <div>
                <label className="text-xs text-gray-500 font-bold block uppercase">Home Address</label>
                <span className="text-xl font-black block text-silver-dark">{homeAddress.address_text || 'No address details'}</span>
              </div>
              {homeAddress.latitude && homeAddress.longitude && (
                <div className="text-xs text-gray-400 font-bold uppercase mt-1">
                  Coordinates: Lat {homeAddress.latitude}, Lng {homeAddress.longitude}
                </div>
              )}
            </div>
          )}

          {/* Surgical History timeline ledger (Read-only view locked) */}
          <div className="border-4 border-silver-midtone rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-black uppercase text-silver-dark border-b-2 border-gray-300 pb-2">Surgical History Ledger</h3>
            <div className="space-y-4">
              {profileData.surgicalHistory.map((s) => (
                <div key={s.id} className="flex items-start space-x-4 border-l-4 border-silver-midtone pl-4 py-2 relative">
                  <div className="absolute -left-[14px] top-4 w-6 h-6 bg-silver-dark rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="bg-silver-bg p-4 rounded-xl border-2 border-gray-200 flex-grow">
                    <span className="text-sm font-black text-silver-midtone uppercase block">{s.year}</span>
                    <span className="text-xl font-black text-silver-dark">{s.surgery}</span>
                    <span className="text-xs text-gray-500 font-bold block mt-1">📍 {s.hospital}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Symptoms Log Module */}
          <div className="border-4 border-silver-midtone rounded-2xl p-6 space-y-6">
            <h3 className="text-xl font-black uppercase text-silver-dark border-b-2 border-gray-300 pb-2">Symptoms Log Module</h3>
            
            {/* Enlarged Single-Tap Microphone target */}
            <div className="flex justify-center py-4">
              <button
                onClick={() => setMicActive(!micActive)}
                className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-lg transition-transform focus:outline-none focus:ring-4 focus:ring-silver-midtone cursor-pointer p-4 ${
                  micActive 
                    ? 'bg-silver-sos border-white text-white animate-pulse' 
                    : 'bg-silver-bg border-silver-midtone text-silver-dark hover:bg-silver-accent'
                }`}
                aria-label="Microphone record trigger"
              >
                <Mic className="w-16 h-16" />
                <span className="text-xs font-black mt-1 uppercase">{micActive ? 'Listening...' : 'Tap to Record'}</span>
              </button>
            </div>

            {/* Manual Slider Timeline scale widget */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-black text-silver-dark uppercase">
                <span>Severity Scale (Mild)</span>
                <span className="text-lg text-silver-sos">{severity} / 10</span>
                <span>(Severe)</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(parseInt(e.target.value))}
                className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-silver-dark"
                aria-label="Symptom severity slider"
              />
            </div>

            {/* Text-to-audio speech playback control bar */}
            <div className="bg-silver-bg p-4 rounded-xl border border-gray-300 flex items-center justify-between">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-silver-dark text-white rounded-lg min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer"
                aria-label={isPlaying ? "Pause audio playback" : "Play audio playback"}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <div className="flex-grow mx-4">
                <div className="h-3 bg-gray-300 rounded-full overflow-hidden">
                  <div 
                    className="bg-silver-midtone h-full transition-all duration-300"
                    style={{ width: isPlaying ? '60%' : '10%' }}
                  ></div>
                </div>
              </div>
              <span className="text-xs font-black text-gray-500 uppercase">0:12 / 0:20</span>
            </div>

            {/* Doctor Briefing symptoms overview */}
            <div className="bg-white border-4 border-silver-midtone rounded-xl p-4 space-y-2 shadow-inner">
              <h4 className="text-lg font-black text-silver-dark uppercase tracking-wider border-b border-gray-200 pb-2">
                📝 For the Doctor: Patient Symptom Briefing
              </h4>
              <p className="text-base font-semibold leading-relaxed text-gray-600 italic">
                "Patient Ramesh Kumar reported dizziness and mild chest congestion occurring primarily during the morning check-in slot. Severity rating index registers at {severity}/10. No acute symptoms were logged within the past 12 hours. Verification compliance history displays normal thresholds."
              </p>
            </div>

          </div>

          {/* Allergies Checklist Section */}
          <div className="border-4 border-silver-sos rounded-2xl p-6 bg-red-50 space-y-4">
            <div className="flex items-center space-x-2 text-silver-sos mb-2 border-b-2 border-red-200 pb-2">
              <ShieldAlert className="w-8 h-8 stroke-[3]" />
              <h3 className="text-xl font-black uppercase tracking-wider">Allergies Checklist Section</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {profileData.allergies.map(al => (
                <span key={al} className="text-lg font-black bg-silver-sos text-white border-2 border-white px-4 py-2 rounded-xl shadow-sm uppercase">
                  🚫 {al}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
