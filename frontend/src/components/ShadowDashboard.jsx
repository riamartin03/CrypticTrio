import React, { useState } from 'react';
import { ShieldAlert, TrendingUp, Calendar, AlertOctagon, Heart, CheckCircle2, XCircle, ClipboardList, Plus } from 'lucide-react';

export default function ShadowDashboard() {
  // State for SOS historical logs
  const [sosLogs, setSosLogs] = useState([
    { id: 'sos-1', type: 'Emergency SOS Press', info: 'Ramesh triggered SOS button. Caregiver called back to resolve.', date: 'July 10, 2026', time: '02:14 PM', urgent: true },
    { id: 'sos-2', type: 'Unverified Dose Warning', info: 'Atorvastatin 20mg went unverified for 30 minutes. Automated SMS sent.', date: 'July 08, 2026', time: '09:30 PM', urgent: false },
  ]);

  const acknowledgeAlert = (id) => {
    setSosLogs(sosLogs.filter((log) => log.id !== id));
  };

  // State for Appointments list
  const [appointments, setAppointments] = useState([
    { id: 'cal-1', title: 'Cardiologist Check-up', doctor: 'Dr. Emily Vance', date: 'July 18, 2026', time: '10:30 AM', location: 'St. Jude General, Rm 402' },
    { id: 'cal-2', title: 'Bi-weekly Blood Labs', doctor: 'Labcorp Clinic', date: 'July 24, 2026', time: '08:00 AM', location: 'Downtown Medical Center' },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");

  const addVisitLog = () => {
    if (!newTitle || !newDate) return;
    const newVisit = {
      id: `cal-${Date.now()}`,
      title: newTitle,
      doctor: 'Assigned Care Clinic',
      date: newDate,
      time: '11:00 AM',
      location: 'Main Medical Center'
    };
    setAppointments([...appointments, newVisit]);
    setNewTitle("");
    setNewDate("");
  };

  return (
    <div className="space-y-12 pb-16 font-sans text-xl leading-relaxed text-silver-dark">
      
      {/* Caregiver Portal Welcome Header */}
      <div className="bg-silver-dark text-silver-card border-4 border-silver-midtone rounded-3xl p-8 shadow-md">
        <div className="flex items-center space-x-3 text-silver-bg">
          <ShieldAlert className="w-8 h-8 stroke-[2.5]" />
          <span className="text-xl font-bold uppercase tracking-wider">Secondary Shadow Portal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black mt-2">Shadow Caregiver Dashboard</h1>
        <p className="text-xl text-silver-bg mt-2 font-semibold">
          Active Monitor Stream for Patient: <span className="font-extrabold underline text-white">Ramesh Kumar</span>.
        </p>
      </div>

      {/* 1. Live Adherence Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-silver-card border-4 border-silver-midtone rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-black text-gray-500 uppercase tracking-wider">Weekly Adherence</span>
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-4xl font-black text-silver-dark">94.2%</span>
            <TrendingUp className="w-6 h-6 text-emerald-600 shrink-0" />
          </div>
          <span className="text-xs font-bold text-gray-400">Real-time sync active</span>
        </div>

        <div className="bg-silver-card border-4 border-emerald-600 rounded-2xl p-6 shadow-sm flex flex-col justify-between bg-emerald-50">
          <span className="text-sm font-black text-emerald-800 uppercase tracking-wider">Taken / Completed</span>
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-4xl font-black text-emerald-700">45 Doses</span>
          </div>
          <span className="text-xs font-bold text-emerald-600">Verification check-off logged</span>
        </div>

        <div className="bg-silver-card border-4 border-silver-sos rounded-2xl p-6 shadow-sm flex flex-col justify-between bg-red-50">
          <span className="text-sm font-black text-silver-sos uppercase tracking-wider">Missed Alerts</span>
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-4xl font-black text-silver-sos">{sosLogs.length} Warnings</span>
          </div>
          <span className="text-xs font-bold text-red-500">Active alerts requiring attention</span>
        </div>
      </div>

      {/* 2. Remote View Windows (Split Interface layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Remote Window A: Patient Medical Records */}
        <div className="bg-silver-card border-4 border-silver-midtone rounded-3xl p-8 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b-4 border-silver-accent pb-2">
            <div className="flex items-center space-x-3 text-silver-dark">
              <ClipboardList className="w-8 h-8 stroke-[2.5]" />
              <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide">Patient Records Stream</h2>
            </div>
            <span className="text-sm font-black bg-silver-bg text-silver-dark px-3 py-1 rounded-lg">READ ONLY</span>
          </div>

          <div className="space-y-4">
            <div className="border-2 border-gray-300 rounded-xl p-4 bg-silver-bg">
              <span className="text-xs text-gray-500 font-bold block">PATIENT BIOGRAPHY</span>
              <p className="text-lg font-black text-silver-dark">Ramesh Kumar — Male, Age 72</p>
            </div>

            <div className="border-4 border-silver-sos rounded-xl p-4 bg-red-50">
              <span className="text-xs text-silver-sos font-black block">CONFIRMED PARADISCIPLINARY ALLERGIES</span>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {['Penicillin', 'Sulfa Antibiotics', 'Aspirin'].map((al) => (
                  <span key={al} className="text-base font-black bg-silver-sos text-silver-card px-2.5 py-1 rounded">
                    🚫 {al}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-2 border-gray-300 rounded-xl p-4">
              <span className="text-xs text-gray-500 font-bold block">CHRONIC MEDICAL HISTORY</span>
              <p className="text-lg font-bold text-silver-dark mt-1">
                Hypertension, Type 2 Diabetes, Coronary Artery Disease.
              </p>
            </div>
          </div>
        </div>

        {/* Remote Window B: Upcoming Appointments Calendar */}
        <div className="bg-silver-card border-4 border-silver-midtone rounded-3xl p-8 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b-4 border-silver-accent pb-2">
            <div className="flex items-center space-x-3 text-silver-dark">
              <Calendar className="w-8 h-8 stroke-[2.5]" />
              <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide">Upcoming Visits Stream</h2>
            </div>
          </div>

          {/* Appointments list */}
          <div className="space-y-4">
            {appointments.map((evt) => (
              <div key={evt.id} className="border-2 border-gray-300 rounded-xl p-4 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-silver-dark">{evt.title}</h3>
                  <p className="text-base text-silver-midtone font-bold">{evt.doctor}</p>
                  <span className="text-xs text-gray-400 font-bold block mt-2">📍 {evt.location}</span>
                </div>
                <span className="text-sm font-black bg-silver-dark text-silver-card px-2 py-1 rounded-lg shrink-0">
                  {evt.date}
                </span>
              </div>
            ))}

            {/* Caregiver schedule loader form */}
            <div className="border border-gray-300 rounded-xl p-3 bg-silver-bg space-y-3">
              <span className="text-xs font-black text-silver-dark uppercase tracking-wider block">Log Future Patient Check-Up</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Appointment Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="p-3 border-2 border-gray-300 rounded-xl bg-white text-base font-semibold min-h-[56px]"
                />
                <input
                  type="text"
                  placeholder="Date (July 30, 2026)"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="p-3 border-2 border-gray-300 rounded-xl bg-white text-base font-semibold min-h-[56px]"
                />
              </div>
              <button
                onClick={addVisitLog}
                className="w-full py-3 px-4 bg-silver-dark hover:bg-silver-midtone text-white rounded-xl font-black text-sm flex items-center justify-center space-x-1 cursor-pointer min-h-[64px]"
              >
                <Plus className="w-5 h-5" />
                <span>ADD TO SCHEDULE</span>
              </button>
            </div>

          </div>
        </div>

        {/* Remote Window C: Full Prescriptions Grid */}
        <div className="bg-silver-card border-4 border-silver-midtone rounded-3xl p-8 shadow-md space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b-4 border-silver-accent pb-2">
            <div className="flex items-center space-x-3 text-silver-dark">
              <ClipboardList className="w-8 h-8 stroke-[2.5]" />
              <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide">Active Medication Prescriptions</h2>
            </div>
            <span className="text-sm font-black bg-silver-bg text-silver-dark px-3 py-1 rounded-lg">3 ACTIVE SCHEDULERS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Lisinopril 10mg', dose: '1 pill daily', slot: 'Morning', spec: 'Pink / Round' },
              { name: 'Metformin 500mg', dose: '1 capsule with meal', slot: 'Afternoon', spec: 'White / Capsule' },
              { name: 'Atorvastatin 20mg', dose: '1 pill before bed', slot: 'Night', spec: 'White / Round' },
            ].map((presc, idx) => (
              <div key={idx} className="border-2 border-gray-300 rounded-2xl p-4 bg-silver-bg flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-silver-dark">{presc.name}</h3>
                  <p className="text-base font-bold text-gray-500 mt-1">{presc.dose}</p>
                </div>
                <div className="flex justify-between items-center text-sm font-black mt-4 pt-2 border-t border-gray-300 text-silver-dark">
                  <span>🕒 {presc.slot}</span>
                  <span>💊 {presc.spec}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Remote Window D: Historical Log of SOS Alerts */}
        <div className="bg-silver-card border-4 border-silver-sos rounded-3xl p-8 shadow-md space-y-6 lg:col-span-2 bg-red-50 bg-opacity-30">
          <div className="flex items-center space-x-3 border-b-4 border-silver-sos pb-2">
            <AlertOctagon className="w-8 h-8 text-silver-sos stroke-[2.5]" />
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-silver-dark text-left">Historical SOS Alert Logs</h2>
          </div>

          <div className="space-y-4">
            {sosLogs.length === 0 ? (
              <p className="text-center font-bold text-emerald-700 py-6">✅ All alerts acknowledged and cleared.</p>
            ) : (
              sosLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 border-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    log.urgent ? 'border-silver-sos bg-white' : 'border-amber-500 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-3 flex-wrap gap-1.5 mb-2">
                      <span
                        className={`text-sm font-black px-2.5 py-1.5 rounded text-white ${
                          log.urgent ? 'bg-silver-sos' : 'bg-amber-500 text-silver-dark'
                        }`}
                      >
                        ⚠️ {log.type}
                      </span>
                      <span className="text-sm font-semibold text-gray-400">
                        {log.date} — {log.time}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-silver-dark leading-relaxed">
                      {log.info}
                    </p>
                  </div>
                  
                  {/* Acknowledge Target Button */}
                  <button
                    onClick={() => acknowledgeAlert(log.id)}
                    className="py-3 px-4 bg-silver-dark hover:bg-silver-midtone text-white font-black text-sm rounded-lg cursor-pointer shrink-0 min-h-[64px] p-4 flex items-center justify-center"
                    aria-label={`Acknowledge log ${log.id}`}
                  >
                    ACKNOWLEDGE
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
