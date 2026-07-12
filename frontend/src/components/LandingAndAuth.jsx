import React, { useState, useEffect } from 'react';
import { HeartHandshake, User, ShieldAlert, Mail, Lock, Phone, Key, Calendar, FileText, MapPin, Heart, Users, Activity } from 'lucide-react';
import { api } from '../services/api';
import axiosApi from '../api';

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

  // Patient registration new fields
  const [preferredName, setPreferredName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  
  const [bloodGroup, setBloodGroup] = useState('');
  const [primaryConditions, setPrimaryConditions] = useState('');
  const [mentalDisabilities, setMentalDisabilities] = useState('');
  const [physicalDisabilities, setPhysicalDisabilities] = useState('');
  const [lifetimeMedications, setLifetimeMedications] = useState('');
  const [allergiesInput, setAllergiesInput] = useState('');
  const [physicianName, setPhysicianName] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');
  
  const [caretakerName, setCaretakerName] = useState('');
  const [caretakerPhone, setCaretakerPhone] = useState('');
  const [caretakerEmail, setCaretakerEmail] = useState('');
  const [caretakerRelationship, setCaretakerRelationship] = useState('');
  const [secondaryContactName, setSecondaryContactName] = useState('');
  const [secondaryContactPhone, setSecondaryContactPhone] = useState('');
  
  const [streetAddress, setStreetAddress] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState('');

  const resetFormFields = () => {
    setEmail('');
    setName('');
    setPassword('');
    setPhone('');
    setPatientId('');
    setError(null);
    setPreferredName('');
    setPatientPhone('');
    setConfirmPassword('');
    setDateOfBirth('');
    setGender('');
    setBloodGroup('');
    setPrimaryConditions('');
    setMentalDisabilities('');
    setPhysicalDisabilities('');
    setLifetimeMedications('');
    setAllergiesInput('');
    setPhysicianName('');
    setClinicPhone('');
    setCaretakerName('');
    setCaretakerPhone('');
    setCaretakerEmail('');
    setCaretakerRelationship('');
    setSecondaryContactName('');
    setSecondaryContactPhone('');
    setStreetAddress('');
    setUnitNumber('');
    setCity('');
    setStateProvince('');
    setZipCode('');
    setCountry('');
    setGpsCoordinates('');
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
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        
        await axiosApi.post('/auth/signup', {
          email,
          name,
          password,
          role: 'patient',
          preferred_name: preferredName || undefined,
          phone: patientPhone || undefined,
          date_of_birth: dateOfBirth || undefined,
          gender: gender || undefined,
          blood_group: bloodGroup || undefined,
          primary_conditions: primaryConditions ? primaryConditions.split(',').map(s => s.trim()) : [],
          mental_disabilities: mentalDisabilities ? mentalDisabilities.split(',').map(s => s.trim()) : [],
          physical_disabilities: physicalDisabilities ? physicalDisabilities.split(',').map(s => s.trim()) : [],
          lifetime_medications: lifetimeMedications || undefined,
          physician_name: physicianName || undefined,
          clinic_phone: clinicPhone || undefined,
          emergency_contacts: [
            ...(caretakerName ? [{ name: caretakerName, phone: caretakerPhone, relationship: caretakerRelationship || 'Primary Caregiver', email: caretakerEmail || undefined }] : []),
            ...(secondaryContactName ? [{ name: secondaryContactName, phone: secondaryContactPhone, relationship: 'Secondary Contact' }] : [])
          ],
          allergies: allergiesInput ? allergiesInput.split(',').map(s => s.trim()) : [],
          home_address: streetAddress ? {
            address_text: streetAddress,
            latitude: gpsCoordinates ? parseFloat(gpsCoordinates.split(',')[0]) || 37.3382 : 37.3382,
            longitude: gpsCoordinates ? parseFloat(gpsCoordinates.split(',')[1]) || -121.8863 : -121.8863,
            street: streetAddress,
            unit: unitNumber || undefined,
            city: city || undefined,
            state: stateProvince || undefined,
            zip_code: zipCode || undefined,
            country: country || undefined
          } : undefined
        });
      }
      
      const res = await axiosApi.post('/auth/login', {
        username: email,
        email: email,
        password,
        role: 'patient'
      });
      
      localStorage.setItem('user_id', res.data.user_id);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('silvercare_token', res.data.access_token);
      
      onLoginSuccess({
        token: res.data.access_token,
        userId: res.data.user_id,
        role: res.data.role,
        name: res.data.name || name || 'Ramesh Kumar',
        patientId: res.data.user_id
      });
      
      window.history.replaceState({}, '', '/dashboard');
      
    } catch (err) {
      if (err.message === "Passwords do not match.") {
        setError("Passwords do not match.");
        return;
      }
      const errMsg = err.response?.data?.detail || err.message || "Incorrect email or password";
      setError(errMsg);
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
        await axiosApi.post('/auth/signup', {
          email,
          name,
          password,
          role: 'caregiver',
          link_user_id: patientId || undefined,
          patient_id: patientId || undefined
        });
      }
      
      const res = await axiosApi.post('/auth/login', {
        username: email,
        email: email,
        password,
        role: 'caregiver'
      });
      
      localStorage.setItem('user_id', res.data.user_id);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('silvercare_token', res.data.access_token);
      
      onLoginSuccess({
        token: res.data.access_token,
        userId: res.data.user_id,
        role: res.data.role,
        name: res.data.name || name || 'John Caregiver',
        patientId: res.data.patient_id || patientId || 'dummy-patient-id'
      });
      
      window.history.replaceState({}, '', '/dashboard');
      
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || "Incorrect email or password";
      setError(errMsg);
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
            Because everyone deserves care, dignity, and someone by their side.
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
          <div className="space-y-6 text-xl font-bold text-silver-dark leading-relaxed">
            <p>
              Care begins with people. That's why we've created a space where patients, caregivers, and healthcare professionals can come together, support one another, and navigate healthcare with greater ease. Whether you're seeking medical assistance, caring for a loved one, or providing professional care, our platform is designed to make every connection simple, meaningful, and accessible.
            </p>
            <p>
              True care continues beyond the hospital doors. By encouraging lasting connections between patients, caregivers, and healthcare professionals, we hope to make every step of recovery feel supported, informed, and never alone. Together, we strive to build a community where compassion, trust, and timely support help people lead healthier, more confident lives.
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

              {authTab === 'signup' && (
                <>
                  {/* Basic Information */}
                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Preferred Name / Nickname</label>
                    <div className="relative">
                      <User className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="text"
                        placeholder="e.g. Ramesh"
                        value={preferredName}
                        onChange={(e) => setPreferredName(e.target.value)}
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
                        placeholder="e.g. +1 555 0199"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Gender</label>
                    <div className="relative">
                      <User className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px] appearance-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Blood Group</label>
                    <div className="relative">
                      <Activity className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px] appearance-none"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Primary Medical Conditions</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <textarea
                        placeholder="e.g. Hypertension, Diabetes (separate with commas)"
                        value={primaryConditions}
                        onChange={(e) => setPrimaryConditions(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Mental & Cognitive Disabilities</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <textarea
                        placeholder="e.g. Dementia, None (separate with commas)"
                        value={mentalDisabilities}
                        onChange={(e) => setMentalDisabilities(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Physical & Sensory Disabilities</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <textarea
                        placeholder="e.g. Knee Stiffness, None (separate with commas)"
                        value={physicalDisabilities}
                        onChange={(e) => setPhysicalDisabilities(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Lifetime Medications</label>
                    <div className="relative">
                      <Activity className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <textarea
                        placeholder="e.g. Lisinopril 10mg, Metformin 500mg"
                        value={lifetimeMedications}
                        onChange={(e) => setLifetimeMedications(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Known Allergies & Drug Reactions</label>
                    <div className="relative">
                      <ShieldAlert className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <textarea
                        placeholder="e.g. Penicillin, Aspirin (separate with commas)"
                        value={allergiesInput}
                        onChange={(e) => setAllergiesInput(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Primary Care Physician Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="text"
                        placeholder="e.g. Dr. Emily Vance"
                        value={physicianName}
                        onChange={(e) => setPhysicianName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Clinic Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="tel"
                        placeholder="e.g. +1 555 0244"
                        value={clinicPhone}
                        onChange={(e) => setClinicPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  {/* Caregiver & Emergency Contact */}
                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Primary Caretaker Name</label>
                    <div className="relative">
                      <Heart className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="text"
                        placeholder="e.g. John Caregiver"
                        value={caretakerName}
                        onChange={(e) => setCaretakerName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Caretaker Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="tel"
                        placeholder="e.g. +1 555 0199"
                        value={caretakerPhone}
                        onChange={(e) => setCaretakerPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Caretaker Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="email"
                        placeholder="caretaker@example.com"
                        value={caretakerEmail}
                        onChange={(e) => setCaretakerEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Relationship to Patient</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="text"
                        placeholder="e.g. Daughter, Spouse"
                        value={caretakerRelationship}
                        onChange={(e) => setCaretakerRelationship(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Secondary Emergency Contact Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="text"
                        placeholder="e.g. Robert Smith"
                        value={secondaryContactName}
                        onChange={(e) => setSecondaryContactName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Secondary Emergency Contact Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="tel"
                        placeholder="e.g. +1 555 0388"
                        value={secondaryContactPhone}
                        onChange={(e) => setSecondaryContactPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Full Street Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="text"
                        placeholder="e.g. 123 Sunny Meadows Lane"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Apartment / Suite / Unit Number</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="text"
                        placeholder="e.g. Suite 402"
                        value={unitNumber}
                        onChange={(e) => setUnitNumber(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="text"
                        placeholder="e.g. San Jose"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">State / Province</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="text"
                        placeholder="e.g. CA"
                        value={stateProvince}
                        onChange={(e) => setStateProvince(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Postal / ZIP Code</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="text"
                        placeholder="e.g. 95192"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-silver-dark uppercase mb-2">Country</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="text"
                        placeholder="e.g. USA"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-black text-silver-dark uppercase">GPS Coordinates / Map Location</label>
                      <button
                        type="button"
                        onClick={() => {
                          const query = `${streetAddress || ''} ${city || ''} ${stateProvince || ''} ${zipCode || ''}`.trim();
                          const url = query 
                            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
                            : 'https://www.google.com/maps';
                          window.open(url, '_blank');
                        }}
                        className="text-xs font-black text-[#2F4156] underline uppercase hover:text-black cursor-pointer"
                      >
                        Find Coordinates on Google Maps
                      </button>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
                      <input
                        type="text"
                        placeholder="e.g. 37.3382, -121.8863"
                        value={gpsCoordinates}
                        onChange={(e) => setGpsCoordinates(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl bg-white font-semibold text-lg min-h-[64px]"
                      />
                    </div>
                  </div>
                </>
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