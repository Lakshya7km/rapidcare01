window.API_BASE = '';
window.socket = io();

// Request cache for faster repeated requests
const requestCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

window.joinHospitalRoom = function (hospitalId) {
  if (!hospitalId) return;
  window.socket.emit('joinHospitalRoom', hospitalId);
};

function getToken() {
  try { return localStorage.getItem('jwt') || ''; } catch (e) { return ''; }
}

function setToken(t) {
  try { localStorage.setItem('jwt', t || ''); } catch (e) { }
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
    } catch (e) {
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

async function login(role, username, password) {
  const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ role, username, password }) });
  setToken(data.token);
  return data; // { token, forcePasswordChange }
}

async function changePassword(role, username, newPassword) {
  return api('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ role, username, newPassword }) });
}


// --- Utility Functions ---

window.logout = function () {
  localStorage.clear();
  window.location.href = '/';
};

window.notify = function (message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    color: white;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
    font-weight: 500;
    animation: slideInRight 0.3s ease-out;
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  // Add icon based on type
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

  document.body.appendChild(toast);

  // Add animation styles if not present
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.innerHTML = `
      @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

window.formatDate = function (dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

// Export to window
window.api = api;
window.login = login;
window.changePassword = changePassword;
window.setToken = setToken;
window.getToken = getToken;


