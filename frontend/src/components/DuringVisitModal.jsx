import React, { useState } from 'react';
import { ClipboardList, X, Play, Square, Image, Plus, PlusCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export default function DuringVisitModal({ isOpen, onClose, meds, setMeds, appointments, setAppointments, patientId }) {
  const [rxImage, setRxImage] = useState(null);
  const [rxForm, setRxForm] = useState({ name: "", dosage: "", frequency: "Morning", duration: "", remarks: "" });
  const [visitAppt, setVisitAppt] = useState({ date: "", time: "", doctor: "", notes: "" });

  // Custom states
  const [isRecording, setIsRecording] = useState(false);
  const [consultationText, setConsultationText] = useState("AI Consultation log summary pending. Press 'Record' to capture conversation.");
  const [servingNumber, setServingNumber] = useState(10);
  const [estWait, setEstWait] = useState(12);
  
  const handleRxUploadSim = () => {
    setRxImage("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300");
  };

  const handleStartRec = () => {
    setIsRecording(true);
    setConsultationText("Recording doctor consultation audio stream...");
  };

  const handleStopRec = () => {
    setIsRecording(false);
    setConsultationText("Extracted Doctor Consultation Log: Patient has experienced morning dizziness related to blood pressure adjustments. Action: Patient advised to take Lisinopril 10mg strictly after breakfast. Metformin dosage remains scheduled at dinner to avoid nausea. Follow-up lab check-up in 1 week.");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto font-sans text-silver-dark">
      <div className="w-full max-w-4xl bg-white border-8 border-silver-dark rounded-[36px] shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Sticky Header with Locked CLOSE button */}
        <div className="sticky top-0 z-50 bg-silver-dark text-white p-6 flex justify-between items-center border-b-4 border-silver-midtone shadow-md">
          <div className="flex items-center space-x-3">
            <ClipboardList className="w-8 h-8" />
            <h2 className="text-2xl sm:text-3xl font-black uppercase">2. During-Visit Tracker</h2>
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
          
          {/* A. Live Queue Tracker Panel */}
          <div className="border-4 border-silver-midtone rounded-2xl p-6 bg-silver-bg space-y-4">
            <div className="flex justify-between items-center border-b border-gray-300 pb-2">
              <h3 className="text-xl font-black uppercase tracking-wider text-silver-dark">
                Live Queue Tracker Panel
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (servingNumber < 12) {
                    setServingNumber(prev => prev + 1);
                    setEstWait(prev => Math.max(0, prev - 6));
                  } else {
                    setServingNumber(10);
                    setEstWait(12);
                  }
                }}
                className="py-1.5 px-4 bg-silver-dark hover:bg-silver-midtone text-white rounded-lg font-black text-xs transition-all cursor-pointer shadow-sm uppercase"
              >
                {servingNumber >= 12 ? "Reset Queue" : "Advance Queue"}
              </button>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4 py-2">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-black bg-silver-dark text-white px-2 py-1 rounded">POSITION</span>
                <div className="flex items-center space-x-2 text-xl font-black">
                  <span className={servingNumber === 10 ? "text-silver-sos font-black scale-110" : "text-gray-400"}>#10</span>
                  <span className="text-silver-dark">➔</span>
                  <span className={servingNumber === 11 ? "text-silver-sos font-black scale-110" : "text-gray-400"}>#11</span>
                  <span className="text-silver-dark">➔</span>
                  <span className={servingNumber >= 12 ? "text-emerald-600 font-black text-2xl" : "text-silver-sos font-black text-2xl"}>
                    #12 {servingNumber >= 12 ? "(YOUR TURN)" : "(YOU)"}
                  </span>
                  <span className="text-silver-dark">➔</span>
                  <span className="text-gray-400">#13</span>
                </div>
              </div>
            </div>
            {/* Predicted Appointment Clock */}
            <div className="bg-white border-2 border-silver-sos p-4 rounded-xl text-center">
              <span className="text-2xl sm:text-3xl font-black text-silver-sos block animate-pulse">
                {servingNumber >= 12 
                  ? "🔔 IT'S YOUR TURN! Please enter Room 402 now." 
                  : `⏱️ Estimated time until your turn: ${estWait} minutes`}
              </span>
            </div>
          </div>

          {/* B. Physician Profile Card */}
          <div className="border-4 border-silver-midtone rounded-2xl p-6 bg-silver-bg space-y-3">
            <h3 className="text-xl font-black uppercase text-silver-dark border-b border-gray-300 pb-2">Assigned Physician Details</h3>
            <div className="bg-white border-2 border-gray-300 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-gray-500 font-bold block uppercase">DOCTOR NAME</span>
                <span className="text-lg font-black text-silver-dark">Dr. Rajesh</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-bold block uppercase">SPECIALIZATION</span>
                <span className="text-lg font-black text-silver-dark">Cardiovascular Health</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-bold block uppercase">CLINIC ROOM</span>
                <span className="text-lg font-black text-silver-sos">Room 402, Block A</span>
              </div>
            </div>
          </div>

          {/* C. Doctor Consultation Audio Recorder Suite */}
          <div className="border-4 border-silver-midtone rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-black uppercase text-silver-dark border-b border-gray-300 pb-2">Doctor Consultation Audio Recorder Suite</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Recorder Controls */}
              <div className="bg-silver-bg p-4 rounded-xl border border-gray-300 flex flex-col justify-between space-y-4 min-h-[140px]">
                <span className="text-sm font-black uppercase text-gray-500">Audio Recording input stream</span>
                <div className="flex space-x-3">
                  <button
                    onClick={handleStartRec}
                    disabled={isRecording}
                    className="flex-grow py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-xl text-base cursor-pointer min-h-[56px]"
                  >
                    Start Record
                  </button>
                  <button
                    onClick={handleStopRec}
                    disabled={!isRecording}
                    className="flex-grow py-3 bg-silver-dark hover:bg-silver-midtone disabled:opacity-50 text-white font-black rounded-xl text-base cursor-pointer min-h-[56px]"
                  >
                    Stop
                  </button>
                </div>
                <button
                  onClick={() => alert("Simulating download: File 'consultation_audio_ रमेश_कुमार.wav' downloaded.")}
                  className="w-full py-3 bg-white hover:bg-gray-100 text-silver-dark border-2 border-silver-dark font-black rounded-xl text-base cursor-pointer min-h-[56px] flex items-center justify-center space-x-1"
                >
                  <span>📥 Download Consultation Audio File</span>
                </button>
              </div>

              {/* Consultation AI Summary Pane */}
              <div className="bg-white border-2 border-silver-midtone p-4 rounded-xl flex flex-col justify-between">
                <span className="text-sm font-black uppercase text-silver-midtone border-b pb-1 mb-2 block">AI Consultation Summary</span>
                <p className="text-base text-gray-600 font-bold leading-relaxed flex-grow italic">
                  "{consultationText}"
                </p>
              </div>
            </div>
          </div>

          {/* D. Physician Dashboard Cross-link */}
          <div className="border-4 border-silver-midtone rounded-2xl p-6 bg-silver-bg space-y-3">
            <h3 className="text-xl font-black uppercase text-silver-dark border-b border-gray-300 pb-2">Physician Dashboard Cross-link</h3>
            <div className="bg-white border-2 border-silver-midtone p-4 rounded-xl space-y-2">
              <span className="text-xs text-silver-sos font-black block uppercase tracking-wider">🔒 Live Symptoms briefing cross-reference link (Profile module)</span>
              <p className="text-base text-gray-600 font-bold leading-relaxed italic">
                "Patient Ramesh Kumar reported dizziness and mild chest congestion occurring primarily during the morning check-in slot. Severity rating index registers at 5/10. No acute symptoms were logged within the past 12 hours. Verification compliance history displays normal thresholds."
              </p>
            </div>
          </div>

          {/* Existing: Prescription Photo & Fields */}
          <div className="border-4 border-silver-midtone rounded-2xl p-6 space-y-6">
            <h3 className="text-xl font-black uppercase text-silver-dark border-b border-gray-300 pb-2">Prescription OCR Capture Segment</h3>
            
            <div className="flex flex-col items-center justify-center border-4 border-dashed border-gray-300 rounded-2xl p-8 bg-silver-bg">
              {rxImage ? (
                <div className="space-y-4 text-center">
                  <img src={rxImage} alt="Prescription Thumbnail" className="h-40 rounded-xl border-4 border-white shadow-md mx-auto" />
                  <button onClick={() => setRxImage(null)} className="text-sm font-black text-silver-sos uppercase hover:underline">Remove</button>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <Image className="w-16 h-16 text-gray-400 mx-auto" />
                  <span className="text-base text-gray-500 font-bold block">Upload Prescription Image</span>
                  <button onClick={handleRxUploadSim} className="py-3 px-6 bg-silver-dark hover:bg-silver-midtone text-white font-black text-base rounded-xl min-h-[56px]">
                    SELECT PICTURE
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Medication Name"
                  value={rxForm.name}
                  onChange={(e) => setRxForm({ ...rxForm, name: e.target.value })}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl bg-white font-semibold text-base min-h-[64px]"
                />
                <input
                  type="text"
                  placeholder="Dosage Volume"
                  value={rxForm.dosage}
                  onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl bg-white font-semibold text-base min-h-[64px]"
                />
                <input
                  type="text"
                  placeholder="Frequency ('When')"
                  value={rxForm.frequency}
                  onChange={(e) => setRxForm({ ...rxForm, frequency: e.target.value })}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl bg-white font-semibold text-base min-h-[64px]"
                />
                <input
                  type="text"
                  placeholder="Duration Limits ('Till When')"
                  value={rxForm.duration}
                  onChange={(e) => setRxForm({ ...rxForm, duration: e.target.value })}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl bg-white font-semibold text-base min-h-[64px]"
                />
              </div>
              <textarea
                placeholder="Doctor Remarks / Instructions"
                rows="3"
                value={rxForm.remarks}
                onChange={(e) => setRxForm({ ...rxForm, remarks: e.target.value })}
                className="w-full p-4 border-2 border-gray-300 rounded-xl bg-white font-semibold text-base"
              />
              
              <button
                onClick={async () => {
                  if (!rxForm.name) return;
                  const newMed = {
                    patient_id: patientId,
                    name: rxForm.name,
                    visual_identifiers: {
                      shape: 'Round',
                      color: 'White'
                    },
                    scheduled_times: [rxForm.frequency],
                    custom_instructions: rxForm.remarks || `Take ${rxForm.dosage} for ${rxForm.duration}`,
                    is_critical: false
                  };
                  try {
                    const res = await api.scheduler.createMedicine(newMed);
                    setMeds([
                      ...meds,
                      {
                        id: res.medicine_id || `med-${Date.now()}`,
                        name: rxForm.name,
                        time: rxForm.frequency,
                        instructions: rxForm.remarks || `Take ${rxForm.dosage} for ${rxForm.duration}`,
                        shape: 'Round',
                        color: 'White',
                        taken: false
                      }
                    ]);
                    setRxForm({ name: "", dosage: "", frequency: "Morning", duration: "", remarks: "" });
                    setRxImage(null);
                    alert("Medication registered into matrix!");
                  } catch (err) {
                    console.error("Failed to add medication:", err);
                    alert("Failed to save medication: " + err.message);
                  }
                }}
                className="w-full py-4 bg-silver-dark hover:bg-silver-midtone text-white font-black text-lg rounded-xl min-h-[64px]"
              >
                ADD TO MEDICATION MATRIX
              </button>
            </div>
          </div>

          {/* Existing: Next Appointment tracker */}
          <div className="border-4 border-silver-midtone rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-black uppercase text-silver-dark border-b border-gray-300 pb-2">Next Appointment Entry Tracker</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="date"
                value={visitAppt.date}
                onChange={(e) => setVisitAppt({ ...visitAppt, date: e.target.value })}
                className="w-full p-4 border-2 border-gray-300 rounded-xl bg-white font-semibold text-base min-h-[64px]"
              />
              <input
                type="time"
                value={visitAppt.time}
                onChange={(e) => setVisitAppt({ ...visitAppt, time: e.target.value })}
                className="w-full p-4 border-2 border-gray-300 rounded-xl bg-white font-semibold text-base min-h-[64px]"
              />
              <input
                type="text"
                placeholder="Doctor Name"
                value={visitAppt.doctor}
                onChange={(e) => setVisitAppt({ ...visitAppt, doctor: e.target.value })}
                className="w-full p-4 border-2 border-gray-300 rounded-xl bg-white font-semibold text-base min-h-[64px]"
              />
              <input
                type="text"
                placeholder="Clinic Notes"
                value={visitAppt.notes}
                onChange={(e) => setVisitAppt({ ...visitAppt, notes: e.target.value })}
                className="w-full p-4 border-2 border-gray-300 rounded-xl bg-white font-semibold text-base min-h-[64px]"
              />
            </div>
            <button
              onClick={async () => {
                if (!visitAppt.date || !visitAppt.doctor) return;
                const newAppt = {
                  patient_id: patientId,
                  title: 'Clinic Visit',
                  doctor: visitAppt.doctor,
                  date: visitAppt.date,
                  time: visitAppt.time || '10:00 AM',
                  location: visitAppt.notes || 'Clinic'
                };
                try {
                  const res = await api.visit.createAppointment(newAppt);
                  setAppointments([
                    ...appointments,
                    {
                      id: res.id || Date.now(),
                      title: 'Clinic Visit',
                      doctor: visitAppt.doctor,
                      date: visitAppt.date,
                      time: visitAppt.time || '10:00 AM',
                      location: visitAppt.notes || 'Clinic'
                    }
                  ]);
                  setVisitAppt({ date: "", time: "", doctor: "", notes: "" });
                  alert("Appointment logged!");
                } catch (err) {
                  console.error("Failed to log appointment:", err);
                  alert("Failed to save appointment: " + err.message);
                }
              }}
              className="w-full py-4 bg-silver-dark hover:bg-silver-midtone text-white font-black text-lg rounded-xl min-h-[64px]"
            >
              LOG APPOINTMENT
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
