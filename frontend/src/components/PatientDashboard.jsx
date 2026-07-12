import React, { useState, useEffect } from 'react';
import { User, ClipboardList, FileText, Calendar as CalendarIcon, ShieldAlert, Sun, Moon, Check, Image } from 'lucide-react';
import PatientProfileModal from './PatientProfileModal';
import DuringVisitModal from './DuringVisitModal';
import CalendarModal from './CalendarModal';
import SOSOverlay from './SOSOverlay';
import { api } from '../services/api';

export default function PatientDashboard({ hideImages = false, patientId }) {
  // Active modal state: null, 'profile', 'visit', 'calendar', 'sos'
  const [activeModal, setActiveModal] = useState(null);

  // Dynamic date helpers
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateFormatted = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  // Profile data
  const [profileData, setProfileData] = useState({
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

  // Fetch patient profile from backend with graceful fallback
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.user.getProfile();
        if (data && data.profile) {
          setProfileData({
            name: data.name || "Ramesh Kumar",
            gender: data.profile.gender || "Male",
            bloodGroup: data.profile.blood_group || "O+",
            allergies: data.profile.allergies || ["Penicillin", "Sulfa Antibiotics", "Aspirin"],
            conditions: data.profile.primary_conditions || ["Early-stage Dementia", "Type 2 Diabetes", "Hypertension"],
            surgicalHistory: data.profile.medical_history && data.profile.medical_history.length > 0 
              ? data.profile.medical_history.map((s, idx) => {
                  if (typeof s === 'string') {
                    return { id: idx, surgery: s, year: "Not Specified", hospital: "Clinic Records" };
                  }
                  return s;
                })
              : [
                  { id: 1, surgery: "Appendectomy", year: "1988", hospital: "City General" },
                  { id: 2, surgery: "Knee Replacement", year: "2019", hospital: "Orthopedic Center" }
                ],
            preferred_name: data.profile.preferred_name || data.name || '',
            phone: data.profile.phone || '',
            date_of_birth: data.profile.date_of_birth || '',
            mental_disabilities: data.profile.mental_disabilities || [],
            physical_disabilities: data.profile.physical_disabilities || [],
            lifetime_medications: data.profile.lifetime_medications || '',
            physician_name: data.profile.physician_name || '',
            clinic_phone: data.profile.clinic_phone || '',
            home_address: data.profile.home_address || null
          });
        }
      } catch (err) {
        console.warn("Failed to load patient profile from API. Using local mock defaults.", err);
      }
    }
    loadProfile();
  }, []);

  // Medications state (interactive inline checklist loaded from API)
  const [meds, setMeds] = useState([]);

  useEffect(() => {
    async function loadMeds() {
      try {
        const data = await api.scheduler.getMedicines(patientId);
        if (data && data.length > 0) {
          setMeds(data.map(m => ({
            id: m.id || m._id || m.medicine_id,
            name: m.name,
            time: m.time_of_day || m.scheduled_times?.[0] || 'Morning',
            instructions: m.instructions || m.custom_instructions || 'Take as directed',
            shape: m.shape || m.visual_identifiers?.shape || 'Oval',
            color: m.color || m.visual_identifiers?.color || 'White',
            image: m.image_url || m.imageUrl || null,
            taken: m.taken || false
          })));
        } else {
          setMeds([
            { id: 'med-1', name: 'Lisinopril 10mg', time: 'Morning', instructions: 'Take 1 pill after breakfast', shape: 'Oval', color: 'Pink', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300', taken: true },
            { id: 'med-2', name: 'Metformin 500mg', time: 'Morning', instructions: 'Take 1 capsule with breakfast', shape: 'Capsule', color: 'White', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300', taken: false },
            { id: 'med-3', name: 'Atorvastatin 20mg', time: 'Night', instructions: 'Take 1 pill before bedtime', shape: 'Round', color: 'White', image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300', taken: false },
          ]);
        }
      } catch (err) {
        console.warn("Failed to load medicines from API:", err);
        setMeds([
          { id: 'med-1', name: 'Lisinopril 10mg', time: 'Morning', instructions: 'Take 1 pill after breakfast', shape: 'Oval', color: 'Pink', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300', taken: true },
          { id: 'med-2', name: 'Metformin 500mg', time: 'Morning', instructions: 'Take 1 capsule with breakfast', shape: 'Capsule', color: 'White', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300', taken: false },
          { id: 'med-3', name: 'Atorvastatin 20mg', time: 'Night', instructions: 'Take 1 pill before bedtime', shape: 'Round', color: 'White', image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300', taken: false },
        ]);
      }
    }
    if (patientId) {
      loadMeds();
    }
  }, [patientId]);

  const toggleMedTaken = async (id) => {
    const targetMed = meds.find(med => med.id === id);
    if (!targetMed) return;
    const newTaken = !targetMed.taken;

    setMeds(meds.map(med => med.id === id ? { ...med, taken: newTaken } : med));

    try {
      await api.scheduler.logIntake({
        patient_id: patientId,
        medicine_id: id,
        scheduled_time_slot: targetMed.time || 'Morning',
        status: newTaken ? 'completed' : 'missed'
      });
    } catch (err) {
      console.error("Failed to log intake to API, reverting status:", err);
      setMeds(meds.map(med => med.id === id ? { ...med, taken: !newTaken } : med));
    }
  };

  // Appointments
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const data = await api.visit.getAppointments(patientId);
        if (data && data.length > 0) {
          setAppointments(data);
        } else {
          // If empty, set the default mock ones
          setAppointments([
            { id: 1, title: 'Cardiologist Check-up', doctor: 'Dr. Rajesh', date: '2026-07-18', time: '10:30 AM', location: 'St. Jude General, Rm 402' },
            { id: 2, title: 'Bi-weekly Blood Labs', doctor: 'Labcorp Clinic', date: '2026-07-24', time: '08:00 AM', location: 'Downtown Medical Center' },
          ]);
        }
      } catch (err) {
        console.warn("Failed to load appointments from API. Using local mock defaults.", err);
        setAppointments([
          { id: 1, title: 'Cardiologist Check-up', doctor: 'Dr. Rajesh', date: '2026-07-18', time: '10:30 AM', location: 'St. Jude General, Rm 402' },
          { id: 2, title: 'Bi-weekly Blood Labs', doctor: 'Labcorp Clinic', date: '2026-07-24', time: '08:00 AM', location: 'Downtown Medical Center' },
        ]);
      }
    }
    loadAppointments();
  }, [patientId]);

  return (
    <div className="space-y-12 pb-16 font-sans text-xl leading-relaxed text-[#2F4156] select-none">
      
      {/* 1. Dynamic Orientation Banner (Pushed lower on screen with pt-16, centered) */}
      <div className="space-y-8 text-center max-w-4xl mx-auto pt-16 sm:pt-24 pb-6">
        <h1 className="text-3xl sm:text-5xl font-black leading-tight text-[#2F4156] flex flex-col items-center">
          <span className="block mb-2">Hi, {profileData.name}!</span>
          <span className="block text-2xl sm:text-3xl font-bold text-gray-700">
            Today is {dayName}, {dateFormatted}. Here is what your day looks like:
          </span>
        </h1>

        {/* Summary Indicators - Emojis removed, content centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          
          {/* Next Appointment alert */}
          <div className="bg-white text-[#2F4156] p-6 rounded-2xl flex items-center justify-center shadow-md min-h-[96px]">
            <div className="text-center">
              <span className="text-xl sm:text-2xl font-black block">Appointment today at 2:00 PM with Dr. Rajesh</span>
            </div>
          </div>

          {/* Medication checklist alert */}
          <div className="bg-white text-[#2F4156] p-6 rounded-2xl flex items-center justify-center shadow-md min-h-[96px]">
            <div className="text-center">
              <span className="text-xl sm:text-2xl font-black block">
                Morning medications: {meds.filter(m => m.time === 'Morning' && !m.taken).length} pending
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Main Feature Grid (12 Columns, Centers Trigger Cards symmetrically) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Card 1: Profile */}
        <button
          onClick={() => setActiveModal('profile')}
          className="md:col-span-6 bg-white hover:bg-gray-55 text-[#2F4156] rounded-[28px] p-8 shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center text-center min-h-[260px] focus:ring-4 focus:ring-silver-midtone cursor-pointer"
        >
          <div className="p-3 bg-[#2F4156] text-white rounded-2xl shadow-sm mb-4">
            <User className="w-12 h-12" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase text-[#2F4156]">1. My Profile</h3>
            <p className="text-base text-gray-700 font-bold uppercase mt-1 font-semibold">Demographics, Allergies & History</p>
          </div>
        </button>

        {/* Card 2: During Visit */}
        <button
          onClick={() => setActiveModal('visit')}
          className="md:col-span-6 bg-white hover:bg-gray-55 text-[#2F4156] rounded-[28px] p-8 shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center text-center min-h-[260px] focus:ring-4 focus:ring-silver-midtone cursor-pointer"
        >
          <div className="p-3 bg-[#2F4156] text-white rounded-2xl shadow-sm mb-4">
            <ClipboardList className="w-12 h-12" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase text-[#2F4156]">2. During Visit</h3>
            <p className="text-base text-gray-700 font-bold uppercase mt-1 font-semibold">Prescriptions & Consultations</p>
          </div>
        </button>

        {/* Card 3: AFTER VISIT (Full width Medication Matrix block using white surface, with ivory child tiles) */}
        <div 
          className="md:col-span-12 bg-white text-[#2F4156] rounded-[28px] p-8 shadow-lg space-y-6 flex flex-col justify-between min-h-[300px]"
        >
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-[#2F4156] text-white rounded-2xl shadow-sm">
                <FileText className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-black uppercase text-[#2F4156]">3. After Visit Medication Matrix</h3>
                <p className="text-sm text-gray-700 font-bold uppercase">Log and check off taken prescriptions directly below</p>
              </div>
            </div>
            <span className="text-xs font-black bg-[#2F4156] text-white px-3 py-1.5 rounded-lg">DAILY INTAKE MATRIX</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {meds.map((med) => (
              <div 
                key={med.id} 
                className={`rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-md transition-all bg-[#C8D9E6] ${
                  med.taken ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-center justify-between border-b border-gray-300 pb-2">
                  <span className="text-lg font-black text-[#2F4156] uppercase tracking-wider">{med.time}</span>
                  <div className="p-1.5 bg-white rounded-lg">
                    {med.time === 'Night' ? (
                      <Moon className="w-6 h-6 text-indigo-800" />
                    ) : (
                      <Sun className="w-6 h-6 text-yellow-600" />
                    )}
                  </div>
                </div>

                {!hideImages && (
                  <div className="w-full h-24 bg-white rounded-xl overflow-hidden flex flex-col items-center justify-center shrink-0 border border-gray-200">
                    {med.image ? (
                      <img 
                        src={med.image} 
                        alt={med.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-2">
                        <Image className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-[10px] font-black text-gray-500 uppercase">{med.shape} - {med.color}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-left">
                  <h4 className="text-xl font-black text-[#2F4156]">{med.name}</h4>
                  <p className="text-sm text-gray-600 font-bold mt-1 leading-relaxed">
                    {med.instructions}
                  </p>
                </div>

                <button
                  onClick={() => toggleMedTaken(med.id)}
                  className={`w-full py-3 px-4 rounded-xl font-black text-base transition-all cursor-pointer min-h-[56px] flex items-center justify-center space-x-2 ${
                    med.taken 
                      ? 'bg-silver-dark text-white hover:bg-[#2F4156]' 
                      : 'bg-white text-[#2F4156] hover:bg-gray-200'
                  }`}
                >
                  <Check className={`w-5 h-5 stroke-[3] ${med.taken ? 'text-white' : 'text-gray-400'}`} />
                  <span>{med.taken ? 'TAKEN!' : 'MARK TAKEN'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Calendar */}
        <button
          onClick={() => setActiveModal('calendar')}
          className="md:col-span-6 bg-white hover:bg-gray-55 text-[#2F4156] rounded-[28px] p-8 shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center text-center min-h-[260px] focus:ring-4 focus:ring-silver-midtone cursor-pointer"
        >
          <div className="p-3 bg-[#2F4156] text-white rounded-2xl shadow-sm mb-4">
            <CalendarIcon className="w-12 h-12" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase text-[#2F4156]">4. Calendar</h3>
            <p className="text-base text-gray-700 font-bold uppercase mt-1 font-semibold">Clinic Visits & Monthly Schedules</p>
          </div>
        </button>

        {/* Card 5: SOS */}
        <button
          onClick={async () => {
            setActiveModal('sos');
            try {
              await api.user.triggerSOS(patientId);
              console.log("SOS alert sent to backend.");
            } catch (err) {
              console.error("Failed to post SOS to backend:", err);
            }
          }}
          className="md:col-span-6 bg-white hover:bg-gray-55 text-[#2F4156] rounded-[28px] p-8 shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center text-center min-h-[260px] focus:ring-4 focus:ring-red-400 cursor-pointer"
        >
          <div className="p-3 bg-[#2F4156] text-white rounded-2xl shadow-sm mb-4 animate-pulse">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase text-[#2F4156]">5. Emergency SOS</h3>
            <p className="text-base text-gray-700 font-bold uppercase mt-1 font-semibold">Immediate Snapshot Records & Dialers</p>
          </div>
        </button>

      </div>

      {/* MODALS / OVERLAYS */}
      <PatientProfileModal
        isOpen={activeModal === 'profile'}
        onClose={() => setActiveModal(null)}
        profileData={profileData}
      />

      <DuringVisitModal
        isOpen={activeModal === 'visit'}
        onClose={() => setActiveModal(null)}
        meds={meds}
        setMeds={setMeds}
        appointments={appointments}
        setAppointments={setAppointments}
        patientId={patientId}
      />

      <CalendarModal
        isOpen={activeModal === 'calendar'}
        onClose={() => setActiveModal(null)}
        appointments={appointments}
      />

      <SOSOverlay
        isOpen={activeModal === 'sos'}
        onClose={() => setActiveModal(null)}
        profileData={profileData}
      />

    </div>
  );
}
