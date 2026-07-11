import React, { useState } from 'react';
import { Mic, Check, Image, Sun, Moon, Clock, User, ClipboardList, ShieldAlert, FileText, Calendar, Play, Square, Plus } from 'lucide-react';

export default function PatientDashboard({ hideImages = false }) {
  // State for Today's Checklist
  const [checklist, setChecklist] = useState([
    { id: 1, label: 'Take Blood Pressure Medicine (Lisinopril)', done: true },
    { id: 2, label: 'Record Morning Voice Symptom Journal', done: false },
    { id: 3, label: 'Afternoon Diabetes Check (Metformin)', done: false },
  ]);

  const toggleCheck = (id) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  // State for Symptom Voice Journal
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState("");
  const [pastLogs, setPastLogs] = useState([
    { date: 'July 10, 2026', text: 'Coughing last night, but blood pressure was normal.' },
    { date: 'July 09, 2026', text: 'Standard energy level. Slept 8 hours.' }
  ]);

  const triggerRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    setRecordedText("Listening... speak your symptoms now.");
    setTimeout(() => {
      setIsRecording(false);
      const newText = "I felt mild chest congestion and dizzyness around 9:00 AM. It passed after taking blood pressure medication.";
      setRecordedText(newText);
      // Append to past logs
      const today = new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
      setPastLogs((prev) => [{ date: today, text: newText }, ...prev]);
    }, 3000);
  };

  // State for Clinic Queue
  const [servingTicket, setServingTicket] = useState(12);
  const userTicket = 15;
  const advanceQueueSim = () => {
    if (servingTicket < userTicket) {
      setServingTicket((prev) => prev + 1);
    } else {
      setServingTicket(1); // Reset loop for demo
    }
  };

  // State for Consultation recorder
  const [isRecConsultation, setIsRecConsultation] = useState(false);
  const [consultationText, setConsultationText] = useState("");

  const startConsultationRec = () => {
    setIsRecConsultation(true);
    setConsultationText("Recording consultation... speak clearly.");
  };

  const stopConsultationRec = () => {
    setIsRecConsultation(false);
    setConsultationText("Extracted Doctor Instructions: Take Metformin 500mg strictly with lunch. Check blood pressure every morning.");
  };

  // State for future appointments scheduler form
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [appointments, setAppointments] = useState([
    { id: 1, title: 'Cardiologist Check-up', doctor: 'Dr. Emily Vance', date: 'July 18, 2026', time: '10:30 AM', location: 'St. Jude General, Rm 402' },
    { id: 2, title: 'Bi-weekly Blood Labs', doctor: 'Labcorp Clinic', date: 'July 24, 2026', time: '08:00 AM', location: 'Downtown Medical Center' },
  ]);

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

  // State for After-Visit Medicine Scheduler (Pill Matrix)
  const [meds, setMeds] = useState([
    { id: 'med-1', name: 'Lisinopril 10mg', time: 'Morning', icon: 'sun', instructions: 'Take 1 pill after breakfast', image: 'oval-pink', taken: true },
    { id: 'med-2', name: 'Metformin 500mg', time: 'Afternoon', icon: 'sun', instructions: 'Take 1 capsule with lunch', image: 'capsule-white', taken: false },
    { id: 'med-3', name: 'Atorvastatin 20mg', time: 'Night', icon: 'moon', instructions: 'Take 1 pill before bedtime', image: 'round-white', taken: false },
  ]);

  const toggleMedTaken = (id) => {
    setMeds(
      meds.map((med) => (med.id === id ? { ...med, taken: !med.taken } : med))
    );
  };

  return (
    <div className="space-y-12 pb-16 font-sans text-xl leading-relaxed text-silver-dark">
      
      {/* Welcome Banner Header */}
      <div className="bg-silver-dark text-silver-card border-4 border-silver-midtone rounded-3xl p-8 shadow-md">
        <p className="text-xl font-bold uppercase tracking-wider text-silver-bg">Active Patient Companion</p>
        <h1 className="text-3xl sm:text-5xl font-black mt-2">
          Good morning, Ramesh. Today is Saturday, July 11, 2026.
        </h1>
        <p className="text-xl text-silver-bg mt-2 font-semibold">
          Your caregiver (John) is linked and receiving updates.
        </p>
      </div>

      {/* Today's Checklist: Vertically Aligned To-Do list with giant 64px checkboxes */}
      <div className="bg-silver-card border-4 border-silver-midtone rounded-3xl p-8 shadow-md">
        <div className="flex items-center space-x-3 mb-6">
          <ClipboardList className="w-8 h-8 text-silver-dark" aria-hidden="true" />
          <h2 className="text-3xl font-extrabold uppercase tracking-wide">Today's Daily Checklist</h2>
        </div>
        
        <div className="space-y-4">
          {checklist.map((item) => (
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
                  TASK #{item.id}
                </span>
                <span className={`text-xl sm:text-2xl font-bold ${item.done ? 'line-through text-silver-midtone' : 'text-silver-dark'}`}>
                  {item.label}
                </span>
              </div>
              
              {/* Giant 64px x 64px Touch Target Checkbox */}
              <button
                onClick={() => toggleCheck(item.id)}
                className={`w-[64px] h-[64px] rounded-2xl border-4 shrink-0 flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-4 focus:ring-silver-midtone p-2 ${
                  item.done ? 'bg-silver-dark border-silver-dark' : 'bg-white border-gray-300'
                }`}
                aria-label={`Checkbox for ${item.label}. Status: ${item.done ? 'Checked' : 'Unchecked'}`}
              >
                {item.done && <Check className="w-10 h-10 text-silver-card stroke-[4]" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Linear Grid Cards (Feature Center) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card 1: Profile & Symptom Journal */}
        <div className="bg-silver-card border-4 border-silver-midtone rounded-3xl p-8 shadow-md space-y-6">
          <div className="flex items-center space-x-3 border-b-4 border-silver-accent pb-2">
            <Mic className="w-8 h-8 text-silver-dark" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide">Symptom Voice Journal</h2>
          </div>
          
          <p className="text-lg font-bold text-silver-dark leading-relaxed">
            Record physical symptoms by voice. The companion converts it to text for caregivers and doctor summaries.
          </p>
          
          {/* Massive Microphone Graphic Trigger */}
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

          {/* Timeline Entry Fields */}
          <div className="space-y-4">
            {recordedText && (
              <div className="border-2 border-silver-midtone rounded-xl p-4 bg-silver-bg">
                <p className="text-sm font-black text-silver-dark uppercase tracking-wider mb-2">Live Transcript Result:</p>
                <p className="text-lg font-bold text-silver-dark italic">
                  "{recordedText}"
                </p>
              </div>
            )}
            
            {/* Preview Block for Past Logs */}
            <div className="space-y-3">
              <p className="text-sm font-black text-silver-dark uppercase tracking-wider">Previous Entries History:</p>
              <div className="max-h-[160px] overflow-y-auto space-y-2 border border-gray-300 rounded-xl p-3 bg-silver-bg">
                {pastLogs.map((log, idx) => (
                  <div key={idx} className="border-b border-gray-200 pb-2 last:border-b-0">
                    <span className="text-xs font-black text-silver-midtone block">{log.date}</span>
                    <span className="text-base font-bold text-silver-dark">"{log.text}"</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Patient Records structured book */}
        <div className="bg-silver-card border-4 border-silver-midtone rounded-3xl p-8 shadow-md space-y-6">
          <div className="flex items-center space-x-3 border-b-4 border-silver-accent pb-2">
            <User className="w-8 h-8 text-silver-dark" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide">Patient Medical Record Book</h2>
          </div>

          <div className="space-y-6">
            {/* Demographics Card Section */}
            <div className="border-2 border-gray-300 rounded-2xl p-4 bg-silver-bg">
              <p className="text-sm font-black text-silver-dark uppercase tracking-wider mb-2">Patient Demographics</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 font-bold block">FULL NAME</span>
                  <span className="text-xl font-black text-silver-dark">Ramesh Kumar</span>
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
                {['Penicillin', 'Sulfa Antibiotics', 'Aspirin'].map((allergy) => (
                  <span key={allergy} className="text-base font-black bg-silver-sos text-silver-card px-3 py-1 rounded-lg">
                    🚫 {allergy}
                  </span>
                ))}
              </div>
            </div>

            {/* Medical History Tags */}
            <div className="border-2 border-gray-300 rounded-2xl p-4">
              <p className="text-sm font-black text-silver-dark uppercase tracking-wider mb-2">Chronic Conditions</p>
              <div className="flex flex-wrap gap-2">
                {['Hypertension', 'Type 2 Diabetes', 'Coronary Artery Disease'].map((tag) => (
                  <span key={tag} className="text-base font-bold bg-silver-bg border border-silver-midtone text-silver-dark px-3 py-1 rounded-lg">
                    🩺 {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: During-Visit Tracker */}
        <div className="bg-silver-card border-4 border-silver-midtone rounded-3xl p-8 shadow-md space-y-6 lg:col-span-2">
          <div className="flex items-center space-x-3 border-b-4 border-silver-accent pb-2">
            <ClipboardList className="w-8 h-8 text-silver-dark" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide">During-Visit Clinical Tracker</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Queue progress widget */}
            <div className="border-2 border-gray-300 rounded-2xl p-4 bg-silver-bg space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-black text-silver-dark uppercase tracking-wider">Live Waitlist Queue Status</p>
                <button
                  onClick={advanceQueueSim}
                  className="bg-silver-dark hover:bg-silver-midtone text-white text-xs font-black py-1 px-3 rounded-lg border-2 border-transparent transition-colors cursor-pointer"
                  aria-label="Simulate advancing serving ticket"
                >
                  SIMULATE ADVANCE
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white border border-silver-midtone p-2 rounded-xl">
                  <span className="text-xs text-gray-500 font-bold block">SERVING</span>
                  <span className="text-2xl font-black text-silver-dark">#{servingTicket}</span>
                </div>
                <div className="bg-silver-dark text-silver-card p-2 rounded-xl">
                  <span className="text-xs text-silver-bg font-bold block">YOUR SPOT</span>
                  <span className="text-2xl font-black">#{userTicket}</span>
                </div>
                <div className="bg-white border border-silver-sos p-2 rounded-xl">
                  <span className="text-xs text-silver-sos font-bold block">DELAY TIME</span>
                  <span className="text-xl font-black text-silver-sos">
                    {Math.max(0, (userTicket - servingTicket) * 5)}m
                  </span>
                </div>
              </div>
              
              {/* Queue Timeline Line */}
              <div className="w-full bg-gray-300 h-4 rounded-full overflow-hidden flex border border-gray-400">
                <div 
                  className="bg-silver-midtone h-full transition-all duration-500" 
                  style={{ width: `${(servingTicket / userTicket) * 100}%` }}
                ></div>
                <div className="bg-silver-dark h-full" style={{ width: '5%' }}></div>
                <div className="bg-transparent h-full" style={{ width: '25%' }}></div>
              </div>
            </div>

            {/* Consultation Audio Control Box */}
            <div className="border-2 border-gray-300 rounded-2xl p-4 bg-silver-bg space-y-3">
              <p className="text-sm font-black text-silver-dark uppercase tracking-wider">Consultation Voice Recorder</p>
              <p className="text-base text-gray-600 font-bold">Record conversation with doctor to compile instructions.</p>
              <div className="flex space-x-3">
                <button
                  onClick={startConsultationRec}
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
                  className="flex-1 py-3 px-4 bg-silver-dark hover:bg-silver-midtone text-silver-card rounded-xl font-bold flex items-center justify-center space-x-2 cursor-pointer min-h-[64px] p-4"
                  aria-label="Stop recording consultation audio"
                >
                  <Square className="w-5 h-5 fill-silver-card" />
                  <span>STOP</span>
                </button>
              </div>
            </div>

            {/* Prescription parser structured block */}
            {(consultationText || isRecConsultation) && (
              <div className="border-2 border-gray-300 rounded-2xl p-4 bg-silver-bg md:col-span-2 space-y-3">
                <p className="text-sm font-black text-silver-dark uppercase tracking-wider">Prescription OCR Summary Result</p>
                <div className="bg-white border-2 border-silver-midtone p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center flex-wrap gap-2 border-b border-gray-200 pb-2">
                    <span className="text-xl font-black text-silver-dark">💊 Metformin 500mg</span>
                    <span className="text-sm font-black bg-silver-sos text-silver-card px-2.5 py-1 rounded">CRITICAL</span>
                  </div>
                  <p className="text-lg font-bold text-silver-dark">
                    <strong>{isRecConsultation ? "Compiling live transcription..." : consultationText}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Push future appointments to calendar form */}
            <div className="border-2 border-gray-300 rounded-2xl p-4 bg-silver-bg md:col-span-2 space-y-4">
              <p className="text-sm font-black text-silver-dark uppercase tracking-wider">Log Next Clinic Appointment</p>
              
              {/* Render local appointments list */}
              <div className="space-y-2 mb-4">
                {appointments.map((appt) => (
                  <div key={appt.id} className="bg-white p-3 rounded-lg border border-gray-300 flex justify-between items-center">
                    <div>
                      <span className="font-black text-silver-dark block text-lg">{appt.title}</span>
                      <span className="text-sm text-gray-500 font-bold">{appt.date} at {appt.time} ({appt.doctor})</span>
                    </div>
                    <span className="text-xs bg-silver-accent text-silver-dark py-1 px-2.5 rounded font-black">LOGGED</span>
                  </div>
                ))}
              </div>

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

        {/* Card 4: After-Visit Medicine Scheduler (Pill Matrix) */}
        <div className="bg-silver-card border-4 border-silver-midtone rounded-3xl p-8 shadow-md space-y-6 lg:col-span-2">
          <div className="flex items-center space-x-3 border-b-4 border-silver-accent pb-2">
            <Calendar className="w-8 h-8 text-silver-dark" aria-hidden="true" />
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide">After-Visit Medication Matrix</h2>
          </div>
          <p className="text-lg font-bold text-silver-dark leading-relaxed">
            Your daily prescription routine. Take critical medications on schedule.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {meds.map((med, idx) => (
              <div key={idx} className={`border-4 rounded-3xl p-6 space-y-4 flex flex-col justify-between transition-all ${
                med.taken ? 'border-silver-midtone bg-silver-bg opacity-75' : 'border-gray-300 bg-silver-bg'
              }`}>
                
                {/* Sun/Moon slot indicator */}
                <div className="flex items-center justify-between border-b-2 border-gray-300 pb-3">
                  <span className="text-xl font-black text-silver-dark uppercase tracking-wider">{med.time}</span>
                  <div className="p-2 bg-white rounded-xl border border-gray-400">
                    {med.icon === 'sun' ? (
                      <Sun className="w-8 h-8 text-yellow-600 stroke-[2.5]" aria-hidden="true" />
                    ) : (
                      <Moon className="w-8 h-8 text-indigo-800 stroke-[2.5]" aria-hidden="true" />
                    )}
                  </div>
                </div>

                {/* Pill Picture Thumbnail placeholder (Hides if hideImages is active) */}
                {!hideImages && (
                  <div className="w-full h-24 bg-gray-200 border-2 border-gray-400 rounded-2xl flex flex-col items-center justify-center shrink-0">
                    <Image className="w-8 h-8 text-gray-500 mb-1" />
                    <span className="text-xs font-black text-gray-500 uppercase">{med.image}</span>
                  </div>
                )}

                <div>
                  <h3 className="text-2xl font-black text-silver-dark">{med.name}</h3>
                  <p className="text-lg text-gray-600 font-bold mt-1 leading-relaxed">
                    {med.instructions}
                  </p>
                </div>

                {/* Giant Intake Check-off target */}
                <button
                  onClick={() => toggleMedTaken(med.id)}
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
        </div>

      </div>
    </div>
  );
}
