const BASE_URL = 'http://localhost:8000/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('silvercare_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || response.statusText || 'API request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email, password) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    signup: (userData) => request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  },
  user: {
    getProfile: () => request('/user/profile'),
    updateProfile: (profileData) => request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
    triggerSOS: (patientId) => request(`/user/sos?patient_id=${patientId}`, {
      method: 'POST',
    }),
  },
  scheduler: {
    getMedicines: (patientId) => request(`/scheduler/medicines?patient_id=${patientId}`),
    createMedicine: (medData) => request('/scheduler/medicines', {
      method: 'POST',
      body: JSON.stringify(medData),
    }),
    logIntake: (logData) => request('/scheduler/log-intake', {
      method: 'POST',
      body: JSON.stringify(logData),
    }),
  },
  queue: {
    status: (patientId) => request(`/queue/status?patient_id=${patientId}`),
    add: (patientId) => request(`/queue/add?patient_id=${patientId}`, {
      method: 'POST',
    }),
    advance: () => request('/queue/advance', {
      method: 'POST',
    }),
    reset: () => request('/queue/reset', {
      method: 'POST',
    }),
  },
  ai: {
    foodInteraction: (patientId, query) => request('/ai/food-interaction', {
      method: 'POST',
      body: JSON.stringify({ patient_id: patientId, query }),
    }),
    chat: (query, patientId) => request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ query, patient_id: patientId }),
    }),
  },
  navigation: {
    getHomeRoute: (patientId) => request(`/navigation/home-route?patient_id=${patientId}`),
  },
  visit: {
    generateSummary: (patientId, transcript) => request('/visit/generate-summary', {
      method: 'POST',
      body: JSON.stringify({ patient_id: patientId, transcript }),
    }),
    getAppointments: (patientId) => request(`/visits/appointments/${patientId}`),
    createAppointment: (apptData) => request('/visits/appointments', {
      method: 'POST',
      body: JSON.stringify(apptData),
    }),
  },
  caregiver: {
    getDashboard: (patientId) => request(`/caregiver/dashboard?patient_id=${patientId}`),
  },
};
