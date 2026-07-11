import React, { useState, useEffect } from 'react';
import { Mic, Check, Image, Sun, Moon, Clock, User, ClipboardList, ShieldAlert, FileText, Calendar, Play, Square, Plus } from 'lucide-react';
import { api } from '../services/api';

export default function PatientDashboard({ hideImages = false, patientId, onTriggerSOS }) {
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // null, 'profile', 'during-visit', 'after-visit', 'calendar', 'sos'
  const [error, setError] = useState(null);
  
  // Dashboard Aggregated States
  const [patientName, setPatientName] = useState("Patient");
  const [profile, setProfile] = useState({
    allergies: [],
    medical_history: [],
    emergency_contacts: [],
    home_address: null
  });
  const [meds, setMeds] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [pastLogs, setPastLogs] = useState([]);
  const [queueInfo, setQueueInfo] = useState(null);

  // Local/UI states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState("");
  const [isRecConsultation, setIsRecConsultation] = useState(false);
  const [consultationInput, setConsultationInput] = useState("");
  const [consultationText, setConsultationText] = useState("");
  const [prescriptionExtracting, setPrescriptionExtracting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  
  // Appointments calendar state (saved in localStorage for local persistence since backend has no endpoint for future calendar dates)
  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem(`silvercare_appts_${patientId}`);
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Cardiologist Check-up', doctor: 'Dr. Emily Vance', date: 'July 18, 2026', time: '10:30 AM', location: 'St. Jude General, Rm 402' },
      { id: 2, title: 'Bi-weekly Blood Labs', doctor: 'Labcorp Clinic', date: 'July 24, 2026', time: '08:00 AM', location: 'Downtown Medical Center' },
    ];
  });

  useEffect(() => {
    localStorage.setItem(`silvercare_appts_${patientId}`, JSON.stringify(appointments));
  }, [appointments, patientId]);

  // Load patient data from aggregated caregiver dashboard endpoint
  const loadDashboardData = async () => {
    try {
      setError(null);
      const data = await api.caregiver.getDashboard(patientId);
      
      setPatientName(data.patient_name || "Patient");
      setProfile(data.profile || {
        allergies: [],
        medical_history: [],
        emergency_contacts: [],
        home_address: null
      });
      setMeds(data.medications || []);
      setPastLogs(data.recent_journals || []);
      setQueueInfo(data.queue_status && data.queue_status.in_queue !== false ? data.queue_status : null);
      
      // Calculate today's date in YYYY-MM-DD
      const todayStr = new Date().toISOString().split('T')[0];
      
      // Map compliance logs to Taken states in meds
      const updatedMeds = (data.medications || []).map(med => {
        const isTakenToday = (data.compliance_history || []).some(log => 
          log.medicine_id === med.id && 
          log.date === todayStr && 
          log.status === 'completed'
        );
        return { ...med, taken: isTakenToday };
      });
      setMeds(updatedMeds);

      // Build Checklist Items
      const checklistItems = [];
      let itemIndex = 1;
      
      // Med checklist items
      updatedMeds.forEach(med => {
        med.scheduled_times.forEach(slot => {
          checklistItems.push({
            id: `med-${med.id}-${slot}`,
            label: `Take ${med.name} (${slot})`,
            done: med.taken,
            type: 'med',
            medicineId: med.id,
            timeSlot: slot
          });
        });
      });

      // Voice Journal check item
      const recordedJournalToday = (data.recent_journals || []).some(journal => 
        journal.created_at.startsWith(todayStr)
      );
      checklistItems.push({
        id: 'voice-journal',
        label: 'Record Daily Physical Symptom Journal',
        done: recordedJournalToday,
        type: 'journal'
      });

      setChecklist(checklistItems);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch live patient records from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [patientId]);

  // Log intake for a medication
  const handleToggleMedCheck = async (medId, timeSlot, currentTaken) => {
    try {
      const nextStatus = currentTaken ? 'pending' : 'completed';
      await api.scheduler.logIntake({
        patient_id: patientId,
        medicine_id: medId,
        scheduled_time_slot: timeSlot,
        status: nextStatus
      });
      await loadDashboardData();
    } catch (err) {
      alert("Error logging medication intake: " + err.message);
    }
  };

  // Symptom Voice Journal Recorder
  const triggerRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    setRecordedText("Listening... speak your symptoms now.");
    
    // Mock audio transcript compiled by Gemini summary compiler on backend
    setTimeout(async () => {
      setIsRecording(false);
      const transcriptText = "I felt mild chest congestion and dizzyness around 9:00 AM. It passed after taking blood pressure medication.";
      setRecordedText(transcriptText);
      
      // Call backend to compile Doctor Brief and save to journal
      try {
        await api.visit.generateSummary(patientId, transcriptText);
        await loadDashboardData();
      } catch (err) {
        alert("Failed to submit symptom journal: " + err.message);
      }
    }, 3000);
  };

  // Live Queue Operations
  const handleJoinQueue = async () => {
    try {
      await api.queue.add(patientId);
      await loadDashboardData();
    } catch (err) {
      alert("Failed to join queue: " + err.message);
    }
  };

  const advanceQueueSim = async () => {
    try {
      await api.queue.advance();
      await loadDashboardData();
    } catch (err) {
      alert("Failed to advance queue: " + err.message);
    }
  };

  // Consultation Prescription Processing
  const startConsultationRec = () => {
    setIsRecConsultation(true);
    setConsultationInput("");
    setConsultationText("Recording consultation... speak clearly.");
  };

  const stopConsultationRec = async () => {
    setIsRecConsultation(false);
    setPrescriptionExtracting(true);
    
    // Simulated spoken words
    const spokenInstructions = "Take Metformin 500mg strictly with lunch. Check blood pressure every morning.";
    
    try {
      const res = await api.visit.processPrescription({
        patient_id: patientId,
        ocr_text: spokenInstructions
      });
      setConsultationText(`Extracted Instruction: ${res.extracted_data.name} - ${res.extracted_data.custom_instructions}`);
      await loadDashboardData();
    } catch (err) {
      setConsultationText("Failed to extract structured instructions automatically.");
    } finally {
      setPrescriptionExtracting(false);
    }
  };

  const handleCustomOcrExtract = async () => {
    if (!consultationInput) return;
    setPrescriptionExtracting(true);
    setError(null);
    try {
      const res = await api.visit.processPrescription({
        patient_id: patientId,
        ocr_text: consultationInput
      });
      setConsultationInput("");
      setConsultationText(`Successfully Added Medication: ${res.extracted_data.name}. Instructions: ${res.extracted_data.custom_instructions}`);
      await loadDashboardData();
    } catch (err) {
      alert("Prescription analysis failed: " + err.message);
    } finally {
      setPrescriptionExtracting(false);
    }
  };

  // Calendar Appointments
  const addAppointment = () => {
    if (!newTitle || !newDate) return;
    const newEvt = {
      id: Date.now(),
      title: newTitle,
      doctor: 'Registered Doctor Care',
      date: newDate,
      time: '10:00 AM',
      location: 'SilverCare Connected Clinic'
    };
    setAppointments([...appointments, newEvt]);
    setNewTitle("");
    setNewDate("");
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-white border-4 border-silver-midtone rounded-3xl animate-pulse">
        <h2 className="text-3xl font-black text-silver-dark uppercase">Synchronizing with Medical Core Server...</h2>
        <p className="text-lg text-gray-500 font-bold mt-2">Fetching patient records, schedules and compliance history.</p>
      </div>
    );
  }

  const renderModal = (title, content, onClose) => {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-silver-card border-8 border-silver-midtone rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
          <div className="flex justify-between items-center border-b-4 border-silver-accent pb-4">
            <h2 className="text-3xl font-black uppercase text-silver-dark">{title}</h2>
            <button 
              onClick={onClose}
              className="p-3 bg-silver-dark hover:bg-silver-midtone text-silver-card rounded-xl min-h-[64px] min-w-[64px] flex items-center justify-center cursor-pointer font-black text-xl transition-all"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
          <div className="text-silver-dark text-xl leading-relaxed">
            {content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 pb-16 font-sans text-xl leading-relaxed text-silver-dark">
      
      {/* Welcome Banner Header */}
      <div className="bg-silver-dark text-silver-card border-4 border-silver-midtone rounded-3xl p-8 shadow-md">
        <p className="text-xl font-bold uppercase tracking-wider text-silver-bg">Active Patient Companion</p>
        <h1 className="text-3xl sm:text-5xl font-black mt-2">
          Good morning, {patientName}.
        </h1>
        <p className="text-xl text-silver-bg mt-2 font-semibold">
          Your caregiver dashboard is synchronized. User UUID: <span className="font-mono text-sm bg-silver-midtone text-white px-2 py-0.5 rounded">{patientId}</span>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-silver-sos text-white text-lg font-black rounded-2xl text-center border-4 border-white">
          ⚠️ {error}
        </div>
      )}

      {/* 5-Card Accessibility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Profile */}
        <button
          onClick={() => setActiveModal('profile')}
          className="bg-white hover:bg-silver-accent border-4 border-silver-midtone rounded-3xl p-8 text-left shadow-md flex flex-col justify-between transition-all active:scale-95 hover:scale-[1.02] cursor-pointer min-h-[180px] space-y-4"
        >
          <div className="flex items-center space-x-3 text-silver-dark">
            <User className="w-10 h-10 shrink-0 stroke-[2.5]" />
            <span className="text-2xl font-black uppercase tracking-wider">Profile</span>
          </div>
          <p className="text-base text-gray-500 font-bold">
            View demographics, allergies, medical history, and past voice symptoms journal logs.
          </p>
        </button>

        {/* Card 2: During Visit */}
        <button
          onClick={() => setActiveModal('during-visit')}
          className="bg-white hover:bg-silver-accent border-4 border-silver-midtone rounded-3xl p-8 text-left shadow-md flex flex-col justify-between transition-all active:scale-95 hover:scale-[1.02] cursor-pointer min-h-[180px] space-y-4"
        >
          <div className="flex items-center space-x-3 text-silver-dark">
            <ClipboardList className="w-10 h-10 shrink-0 stroke-[2.5]" />
            <span className="text-2xl font-black uppercase tracking-wider">During Visit</span>
          </div>
          <p className="text-base text-gray-500 font-bold">
            Check clinic waitlist spot, record conversations with doctor, and parse prescriptions.
          </p>
        </button>

        {/* Card 3: After Visit */}
        <button
          onClick={() => setActiveModal('after-visit')}
          className="bg-white hover:bg-silver-accent border-4 border-silver-midtone rounded-3xl p-8 text-left shadow-md flex flex-col justify-between transition-all active:scale-95 hover:scale-[1.02] cursor-pointer min-h-[180px] space-y-4"
        >
          <div className="flex items-center space-x-3 text-silver-dark">
            <Clock className="w-10 h-10 shrink-0 stroke-[2.5]" />
            <span className="text-2xl font-black uppercase tracking-wider">After Visit</span>
          </div>
          <p className="text-base text-gray-500 font-bold">
            Complete daily checklists and check active medication guidelines or intake schedules.
          </p>
        </button>

        {/* Card 4: Calendar */}
        <button
          onClick={() => setActiveModal('calendar')}
          className="bg-white hover:bg-silver-accent border-4 border-silver-midtone rounded-3xl p-8 text-left shadow-md flex flex-col justify-between transition-all active:scale-95 hover:scale-[1.02] cursor-pointer min-h-[180px] space-y-4"
        >
          <div className="flex items-center space-x-3 text-silver-dark">
            <Calendar className="w-10 h-10 shrink-0 stroke-[2.5]" />
            <span className="text-2xl font-black uppercase tracking-wider">Calendar</span>
          </div>
          <p className="text-base text-gray-500 font-bold">
            Log, schedule, and view upcoming clinic appointments and follow-up medical visits.
          </p>
        </button>

        {/* Card 5: SOS */}
        <button
          onClick={() => setActiveModal('sos')}
          className="bg-red-50 hover:bg-red-100 border-4 border-silver-sos rounded-3xl p-8 text-left shadow-md flex flex-col justify-between transition-all active:scale-95 hover:scale-[1.02] cursor-pointer min-h-[180px] space-y-4 md:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center space-x-3 text-silver-sos">
            <ShieldAlert className="w-10 h-10 shrink-0 stroke-[2.5] animate-pulse" />
            <span className="text-2xl font-black uppercase tracking-wider">SOS</span>
          </div>
          <p className="text-base text-red-700 font-black">
            🚨 Trigger immediate emergency alerts to registered caregivers.
          </p>
        </button>
      </div>

      {/* POPUP MODALS DETAILS */}

      {/* 1. Profile Modal */}
      {activeModal === 'profile' && renderModal(
        "Patient Profile & Medical History",
        <div className="space-y-8">
          {/* Patient Medical Record Book */}
          <div className="bg-silver-card border-4 border-silver-midtone rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 border-b-4 border-silver-accent pb-2">
              <User className="w-8 h-8 text-silver-dark" aria-hidden="true" />
              <h3 className="text-2xl font-extrabold uppercase tracking-wide">Patient Medical Record Book</h3>
            </div>

            <div className="space-y-6">
              {/* Demographics Card Section */}
              <div className="border-2 border-gray-300 rounded-2xl p-4 bg-silver-bg">
                <p className="text-sm font-black text-silver-dark uppercase tracking-wider mb-2">Patient Demographics</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 font-bold block">FULL NAME</span>
                    <span className="text-xl font-black text-silver-dark">{patientName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-bold block">BIO AGE / DOB</span>
                    <span className="text-xl font-black text-silver-dark">72 Years (1954)</span>
                  </div>
                </div>
              </div>

              {/* Structured Allergy Warning Section */}
              <div className="border-4 border-silver-sos rounded-2xl p-4 bg-red-50">
                <div className="flex items-center space-x-2 text-silver-sos mb-2">
                  <ShieldAlert className="w-6 h-6 stroke-[3]" />
                  <span className="text-base font-black uppercase tracking-wider">High Risk Allergies</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.allergies.length === 0 ? (
                    <span className="text-base font-bold text-gray-500">None registered</span>
                  ) : (
                    profile.allergies.map((allergy) => (
                      <span key={allergy} className="text-base font-black bg-silver-sos text-silver-card px-3 py-1 rounded-lg">
                        🚫 {allergy}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Medical History Tags */}
              <div className="border-2 border-gray-300 rounded-2xl p-4">
                <p className="text-sm font-black text-silver-dark uppercase tracking-wider mb-2">Chronic Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {profile.medical_history.length === 0 ? (
                    <span className="text-base font-bold text-gray-500">None registered</span>
                  ) : (
                    profile.medical_history.map((tag) => (
                      <span key={tag} className="text-base font-bold bg-silver-bg border border-silver-midtone text-silver-dark px-3 py-1 rounded-lg">
                        🩺 {tag}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Symptom Voice Journal */}
          <div className="bg-silver-card border-4 border-silver-midtone rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 border-b-4 border-silver-accent pb-2">
              <Mic className="w-8 h-8 text-silver-dark" aria-hidden="true" />
              <h3 className="text-2xl font-extrabold uppercase tracking-wide">Symptom Voice Journal</h3>
            </div>
            
            <p className="text-lg font-bold text-silver-dark leading-relaxed">
              Record physical symptoms by voice. The companion converts it to text and automatically compiles structured medical briefs for your caregiver.
            </p>
            
            <div className="flex justify-center my-6">
              <button
                onClick={triggerRecording}
                className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-lg transition-transform focus:outline-none focus:ring-4 focus:ring-silver-midtone cursor-pointer p-4 ${
                  isRecording 
                    ? 'bg-silver-sos border-silver-sos text-white animate-pulse' 
                    : 'bg-silver-bg border-silver-midtone hover:border-silver-dark text-silver-dark'
                }`}
                aria-label="Simulate Symptoms voice recording trigger"
              >
                <Mic className="w-16 h-16" />
                <span className="text-xs font-black mt-1 uppercase">
                  {isRecording ? 'Listening' : 'Talk'}
                </span>
              </button>
            </div>

            <div className="space-y-4">
              {recordedText && (
                <div className="border-2 border-silver-midtone rounded-xl p-4 bg-silver-bg">
                  <p className="text-sm font-black text-silver-dark uppercase tracking-wider mb-2">Live Transcript Result:</p>
                  <p className="text-lg font-bold text-silver-dark italic">
                    "{recordedText}"
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <p className="text-sm font-black text-silver-dark uppercase tracking-wider">Previous Entries History:</p>
                <div className="max-h-[220px] overflow-y-auto space-y-2 border border-gray-300 rounded-xl p-3 bg-silver-bg">
                  {pastLogs.length === 0 ? (
                    <p className="text-sm font-bold text-gray-500">No voice journal records compiled yet.</p>
                  ) : (
                    pastLogs.map((log, idx) => (
                      <div key={idx} className="border-b border-gray-200 pb-2 last:border-b-0">
                        <span className="text-xs font-black text-silver-midtone block">
                          {new Date(log.created_at).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}
                        </span>
                        <span className="text-base font-bold text-silver-dark block">"{log.transcript}"</span>
                        <div className="mt-1 text-xs text-silver-dark bg-white border border-gray-300 p-2 rounded prose max-w-none">
                          <strong>AI compiled Doctor Brief summary:</strong>
                          <pre className="font-sans text-xs whitespace-pre-wrap mt-1 leading-snug">{log.summary}</pre>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        () => setActiveModal(null)
      )}

      {/* 2. During Visit Modal */}
      {activeModal === 'during-visit' && renderModal(
        "During-Visit Clinical Tracker",
        <div className="space-y-8">
          <div className="bg-silver-card border-4 border-silver-midtone rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 border-b-4 border-silver-accent pb-2">
              <ClipboardList className="w-8 h-8 text-silver-dark" aria-hidden="true" />
              <h3 className="text-2xl font-extrabold uppercase tracking-wide">During-Visit Clinical Tracker</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Live Waitlist Queue */}
              <div className="border-2 border-gray-300 rounded-2xl p-4 bg-silver-bg space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-black text-silver-dark uppercase tracking-wider">Live Waitlist Queue Status</p>
                  {queueInfo && (
                    <button
                      onClick={advanceQueueSim}
                      className="bg-silver-dark hover:bg-silver-midtone text-white text-xs font-black py-1 px-3 rounded-lg border-2 border-transparent transition-colors cursor-pointer"
                      aria-label="Simulate advancing serving ticket"
                    >
                      SIMULATE ADVANCE
                    </button>
                  )}
                </div>
                
                {!queueInfo ? (
                  <div className="text-center py-4 bg-white border rounded-xl p-4">
                    <p className="text-base font-bold text-gray-500 mb-3">You are not currently in the clinic visit queue.</p>
                    <button
                      onClick={handleJoinQueue}
                      className="py-3 px-6 bg-silver-dark hover:bg-silver-midtone text-white font-black text-base rounded-xl transition-all cursor-pointer min-h-[56px]"
                    >
                      🚀 JOIN CLINIC WAITLIST
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white border border-silver-midtone p-2 rounded-xl">
                        <span className="text-xs text-gray-500 font-bold block">SERVING</span>
                        <span className="text-2xl font-black text-silver-dark">#{queueInfo.current_number}</span>
                      </div>
                      <div className="bg-silver-dark text-silver-card p-2 rounded-xl">
                        <span className="text-xs text-silver-bg font-bold block">YOUR SPOT</span>
                        <span className="text-2xl font-black">#{queueInfo.user_number}</span>
                      </div>
                      <div className="bg-white border border-silver-sos p-2 rounded-xl">
                        <span className="text-xs text-silver-sos font-bold block">DELAY TIME</span>
                        <span className="text-xl font-black text-silver-sos">
                          {queueInfo.est_minutes_left}m
                        </span>
                      </div>
                    </div>
                    
                    {/* Queue Progress Bar */}
                    <div className="w-full bg-gray-300 h-4 rounded-full overflow-hidden flex border border-gray-400">
                      <div 
                        className="bg-silver-midtone h-full transition-all duration-500" 
                        style={{ 
                          width: `${Math.min(100, (queueInfo.current_number / queueInfo.user_number) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    {queueInfo.current_number >= queueInfo.user_number && (
                      <div className="p-2.5 bg-green-100 text-green-800 border-2 border-green-300 rounded-xl text-center text-base font-black animate-pulse">
                        🔔 IT IS YOUR TURN! PLEASE ENTER CLINICAL ROOM.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Consultation Voice Recorder */}
              <div className="border-2 border-gray-300 rounded-2xl p-4 bg-silver-bg space-y-3">
                <p className="text-sm font-black text-silver-dark uppercase tracking-wider">Consultation Voice Recorder</p>
                <p className="text-base text-gray-600 font-bold">Record conversation with doctor to compile instruction parameters.</p>
                <div className="flex space-x-3">
                  <button
                    onClick={startConsultationRec}
                    disabled={prescriptionExtracting}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 ${
                      isRecConsultation 
                        ? 'bg-emerald-800 text-white animate-pulse' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                    aria-label="Start recording consultation audio"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    <span>{isRecConsultation ? 'RECORDING' : 'RECORD'}</span>
                  </button>
                  <button
                    onClick={stopConsultationRec}
                    disabled={!isRecConsultation || prescriptionExtracting}
                    className="flex-1 py-3 px-4 bg-silver-dark hover:bg-silver-midtone text-silver-card rounded-xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4 disabled:opacity-50"
                    aria-label="Stop recording consultation audio"
                  >
                    <Square className="w-5 h-5 fill-silver-card" />
                    <span>STOP</span>
                  </button>
                </div>
              </div>

              {/* Prescription parser structured block */}
              {(consultationText || isRecConsultation || prescriptionExtracting) && (
                <div className="border-2 border-gray-300 rounded-2xl p-4 bg-silver-bg md:col-span-2 space-y-3">
                  <p className="text-sm font-black text-silver-dark uppercase tracking-wider">Prescription Extraction Result</p>
                  <div className="bg-white border-2 border-silver-midtone p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center flex-wrap gap-2 border-b border-gray-200 pb-2">
                      <span className="text-xl font-black text-silver-dark">💊 Medical Assistant Output</span>
                      {prescriptionExtracting && (
                        <span className="text-sm font-black bg-silver-dark text-white px-2.5 py-1 rounded animate-pulse">ANALYZING Prescriptions...</span>
                      )}
                    </div>
                    <p className="text-lg font-bold text-silver-dark">
                      <strong>{consultationText}</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Custom OCR script parse direct text input box */}
              <div className="border-2 border-gray-300 rounded-2xl p-4 bg-silver-bg md:col-span-2 space-y-4">
                <p className="text-sm font-black text-silver-dark uppercase tracking-wider">Quick Add Medication via Prescription OCR Text</p>
                <p className="text-base text-gray-500 font-bold">Paste Doctor's prescription text below to parse into Medication Matrix automatically via AI.</p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. Amlodipine 5mg. Take 1 round white pill morning with food. Critical blood pressure."
                    value={consultationInput}
                    onChange={(e) => setConsultationInput(e.target.value)}
                    className="flex-grow p-4 border-2 border-gray-300 rounded-xl bg-white font-semibold text-base min-h-[64px]"
                    aria-label="Prescription Text Input"
                  />
                  <button
                    onClick={handleCustomOcrExtract}
                    disabled={prescriptionExtracting}
                    className="py-4 px-6 bg-silver-dark hover:bg-silver-midtone text-white font-black rounded-xl cursor-pointer min-h-[64px] min-w-[120px] flex items-center justify-center"
                  >
                    {prescriptionExtracting ? "EXTRACTING..." : "EXTRACT"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        () => setActiveModal(null)
      )}

      {/* 3. After Visit Modal */}
      {activeModal === 'after-visit' && renderModal(
        "After-Visit Guidelines & Schedules",
        <div className="space-y-8">
          {/* Today's Checklist */}
          <div className="bg-silver-card border-4 border-silver-midtone rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <ClipboardList className="w-8 h-8 text-silver-dark" aria-hidden="true" />
              <h3 className="text-2xl font-extrabold uppercase tracking-wide">Today's Daily Checklist</h3>
            </div>
            
            {checklist.length === 0 ? (
              <p className="text-lg text-gray-500 font-bold">No active medications scheduled.</p>
            ) : (
              <div className="space-y-4">
                {checklist.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-5 border-4 rounded-2xl ${
                      item.done 
                        ? 'bg-silver-bg border-silver-midtone opacity-75' 
                        : 'bg-silver-card border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-black bg-silver-dark text-silver-card px-2.5 py-1 rounded">
                        TASK #{idx + 1}
                      </span>
                      <span className={`text-xl sm:text-2xl font-bold ${item.done ? 'line-through text-silver-midtone' : 'text-silver-dark'}`}>
                        {item.label}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (item.type === 'med') {
                          handleToggleMedCheck(item.medicineId, item.timeSlot, item.done);
                        } else {
                          triggerRecording();
                        }
                      }}
                      className={`w-[64px] h-[64px] rounded-2xl border-4 shrink-0 flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-4 focus:ring-silver-midtone p-2 ${
                        item.done ? 'bg-silver-dark border-silver-dark' : 'bg-white border-gray-300'
                      }`}
                      aria-label={`Checkbox for ${item.label}`}
                    >
                      {item.done && <Check className="w-10 h-10 text-silver-card stroke-[4]" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* After-Visit Medicine Scheduler (Pill Matrix) */}
          <div className="bg-silver-card border-4 border-silver-midtone rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 border-b-4 border-silver-accent pb-2">
              <Calendar className="w-8 h-8 text-silver-dark" aria-hidden="true" />
              <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide">After-Visit Medication Matrix</h3>
            </div>
            <p className="text-lg font-bold text-silver-dark leading-relaxed">
              Your daily prescription routine. Take critical medications on schedule.
            </p>

            {meds.length === 0 ? (
              <p className="text-lg text-gray-500 font-bold">No active medications logged in database.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {meds.map((med, idx) => (
                  <div key={idx} className={`border-4 rounded-3xl p-6 space-y-4 flex flex-col justify-between transition-all ${
                    med.taken ? 'border-silver-midtone bg-silver-bg opacity-75' : 'border-gray-300 bg-silver-bg'
                  }`}>
                    
                    <div className="flex items-center justify-between border-b-2 border-gray-300 pb-3">
                      <span className="text-xl font-black text-silver-dark uppercase tracking-wider">
                        {med.scheduled_times.join(', ')}
                      </span>
                      <div className="p-2 bg-white rounded-xl border border-gray-400">
                        {med.scheduled_times.some(time => ['Morning', 'Afternoon'].includes(time)) ? (
                          <Sun className="w-8 h-8 text-yellow-600 stroke-[2.5]" aria-hidden="true" />
                        ) : (
                          <Moon className="w-8 h-8 text-indigo-800 stroke-[2.5]" aria-hidden="true" />
                        )}
                      </div>
                    </div>

                    {!hideImages && (
                      <div className="w-full h-24 bg-gray-200 border-2 border-gray-400 rounded-2xl flex flex-col items-center justify-center shrink-0">
                        <Image className="w-8 h-8 text-gray-500 mb-1" />
                        <span className="text-xs font-black text-gray-500 uppercase">
                          {med.visual_identifiers ? `${med.visual_identifiers.shape} - ${med.visual_identifiers.color}` : 'Pill Image'}
                        </span>
                      </div>
                    )}

                    <div>
                      <h3 className="text-2xl font-black text-silver-dark">{med.name}</h3>
                      {med.is_critical && (
                        <span className="text-xs font-black bg-silver-sos text-silver-card px-2 py-0.5 rounded uppercase tracking-wider block w-max mt-1 mb-2">
                          ⚠️ CRITICAL
                        </span>
                      )}
                      <p className="text-lg text-gray-600 font-bold mt-1 leading-relaxed">
                        {med.custom_instructions}
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleMedCheck(med.id, med.scheduled_times[0] || 'Morning', med.taken)}
                      className={`w-full py-4 px-6 border-4 rounded-2xl font-black text-lg transition-all cursor-pointer min-h-[72px] p-4 flex items-center justify-center space-x-2 ${
                        med.taken 
                          ? 'bg-silver-dark border-silver-dark text-white hover:bg-silver-midtone hover:border-silver-midtone' 
                          : 'bg-white border-gray-400 text-silver-dark hover:bg-silver-accent'
                      }`}
                      aria-label={`Mark intake status for ${med.name}`}
                    >
                      <Check className={`w-6 h-6 stroke-[3] ${med.taken ? 'text-white' : 'text-gray-400'}`} />
                      <span>{med.taken ? 'TAKEN!' : 'MARK TAKEN'}</span>
                    </button>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>,
        () => setActiveModal(null)
      )}

      {/* 4. Calendar Modal */}
      {activeModal === 'calendar' && renderModal(
        "Clinic Appointment Calendar Log Book",
        <div className="space-y-8">
          <div className="bg-silver-card border-4 border-silver-midtone rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-3 border-b-4 border-silver-accent pb-2">
              <Calendar className="w-8 h-8 text-silver-dark" aria-hidden="true" />
              <h3 className="text-2xl font-extrabold uppercase tracking-wide">Clinic Appointment Book</h3>
            </div>

            <div className="space-y-6">
              {/* Logged appointments list */}
              <div className="space-y-2 mb-4">
                {appointments.length === 0 ? (
                  <p className="text-lg text-gray-500 font-bold">No appointments scheduled.</p>
                ) : (
                  appointments.map((appt) => (
                    <div key={appt.id} className="bg-white p-4 rounded-xl border-2 border-gray-300 flex justify-between items-center shadow-sm">
                      <div>
                        <span className="font-black text-silver-dark block text-xl">{appt.title}</span>
                        <span className="text-base text-gray-500 font-bold">{appt.date} at {appt.time} ({appt.doctor})</span>
                        <span className="text-sm text-silver-midtone block mt-1">📍 {appt.location}</span>
                      </div>
                      <span className="text-xs bg-silver-accent text-silver-dark py-1 px-2.5 rounded font-black shrink-0">LOGGED</span>
                    </div>
                  ))
                )}
              </div>

              {/* Form to log next clinic appointment */}
              <div className="border-2 border-gray-300 rounded-2xl p-4 bg-silver-bg space-y-4">
                <p className="text-sm font-black text-silver-dark uppercase tracking-wider">Log Next Clinic Appointment</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Appointment Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl bg-white font-semibold text-base min-h-[64px]"
                    aria-label="Appointment Title Input"
                  />
                  <input
                    type="text"
                    placeholder="Date (e.g. July 29, 2026)"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl bg-white font-semibold text-base min-h-[64px]"
                    aria-label="Appointment Date Input"
                  />
                  <button
                    onClick={addAppointment}
                    className="w-full py-4 px-4 bg-silver-dark hover:bg-silver-midtone text-silver-card font-black rounded-xl cursor-pointer flex items-center justify-center space-x-2 min-h-[64px] p-4"
                    aria-label="Add appointment to calendar log"
                  >
                    <Plus className="w-6 h-6 stroke-[3]" />
                    <span>ADD VISIT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        () => setActiveModal(null)
      )}

      {/* 5. SOS Modal */}
      {activeModal === 'sos' && renderModal(
        "Emergency SOS Controller",
        <div className="space-y-6 text-center">
          <div className="p-6 bg-red-100 border-4 border-silver-sos rounded-2xl flex flex-col items-center justify-center space-y-4">
            <ShieldAlert className="w-20 h-20 text-silver-sos animate-bounce" />
            <h3 className="text-2xl font-black text-silver-dark uppercase">Trigger Emergency Assistance</h3>
            <p className="text-lg text-gray-600 font-bold">
              Clicking the button below will immediately dispatch an emergency SMS and Email alert to your registered caregivers.
            </p>
          </div>
          <button
            onClick={() => {
              if (onTriggerSOS) onTriggerSOS();
              setActiveModal(null);
            }}
            className="w-full py-6 px-6 bg-silver-sos hover:bg-red-800 text-silver-card rounded-2xl font-black text-2xl flex items-center justify-center space-x-3 transition-transform active:scale-95 cursor-pointer border-4 border-white shadow-lg min-h-[84px] p-4"
            aria-label="Confirm SOS dispatch alert"
          >
            🚨 CONFIRM RAPID SOS PANIC
          </button>
        </div>,
        () => setActiveModal(null)
      )}

    </div>
  );
}
