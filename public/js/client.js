window.API_BASE = '';
window.socket = io();

// Request cache for faster repeated requests
const requestCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

window.joinHospitalRoom = function (hospitalId) {
  if (!hospitalId) return;
  window.socket.emit('joinHospitalRoom', hospitalId);
};

function getToken(){
  try{ return localStorage.getItem('jwt') || ''; }catch(e){ return ''; }
}

function setToken(t){
  try{ localStorage.setItem('jwt', t || ''); }catch(e){}
}

async function api(path, options = {}) {
  // Check cache for GET requests
  const cacheKey = `${options.method || 'GET'}:${path}`;
  if (!options.method || options.method === 'GET') {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  }

  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(API_BASE + path, {
    headers,
    credentials: 'same-origin',
    ...options,
  });
  
  if (!res.ok) {
    let errorMsg = 'Request failed';
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || errorData.error || errorMsg;
    } catch(e) {
      errorMsg = await res.text() || errorMsg;
    }
    throw new Error(errorMsg);
  }
  
  const data = await res.json();
  
  // Cache GET requests
  if (!options.method || options.method === 'GET') {
    requestCache.set(cacheKey, { data, timestamp: Date.now() });
  }
  
  return data;
}

async function login(role, username, password){
  const data = await api('/api/auth/login', { method:'POST', body: JSON.stringify({ role, username, password }) });
  setToken(data.token);
  return data; // { token, forcePasswordChange }
}

async function changePassword(role, username, newPassword){
  return api('/api/auth/change-password', { method:'POST', body: JSON.stringify({ role, username, newPassword }) });
}

window.api = api;
window.login = login;
window.changePassword = changePassword;
window.setToken = setToken;
window.getToken = getToken;


