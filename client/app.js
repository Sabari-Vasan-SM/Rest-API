// Client-side application logic extracted from index.html
// Keeps functions global so existing inline attributes in the HTML still work.

const API_BASE = location.origin + '/api/users';

async function getUsers() {
  try {
    const res = await fetch(API_BASE);
    const data = await res.json();
    document.getElementById('output').textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    document.getElementById('output').textContent = 'Network error: ' + err.message;
  }
}

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

function isAuthenticated() {
  return !!localStorage.getItem('token');
}

function setAuthState() {
  const auth = isAuthenticated();
  // Toggle protected controls
  ['create-name','create-email','create-btn','update-id','update-name','update-email','update-btn','delete-id','delete-btn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = !auth;
  });

  // Show auth status and toggle login/signup visibility
  const status = document.getElementById('auth-status');
  const logoutBtn = document.getElementById('logout-btn');
  const userEmail = localStorage.getItem('userEmail');
  if (auth) {
    status.textContent = userEmail ? `Logged in as ${userEmail}` : 'Logged in';
    logoutBtn.style.display = 'inline-block';
  } else {
    status.textContent = 'Not logged in';
    logoutBtn.style.display = 'none';
  }
}

async function createUser() {
  const name = document.getElementById('create-name').value || 'New User';
  const email = document.getElementById('create-email').value || 'new@example.com';
  const headers = Object.assign({ 'Content-Type': 'application/json' }, getAuthHeader());
  try {
    if (!isAuthenticated()) return alert('Please login first to perform this operation.');
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name, email })
    });
    if (res.status === 401) {
      alert('Unauthorized - please login again');
      logout();
      return;
    }
    const data = await res.json();
    document.getElementById('output').textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    document.getElementById('output').textContent = 'Network error: ' + err.message;
  }
}

async function updateUser() {
  const id = document.getElementById('update-id').value;
  const name = document.getElementById('update-name').value;
  const email = document.getElementById('update-email').value;
  if (!id) return alert('Please provide user id to update');
  try {
    if (!isAuthenticated()) return alert('Please login first to perform this operation.');
    const headers = Object.assign({ 'Content-Type': 'application/json' }, getAuthHeader());
    const res = await fetch(API_BASE + '/' + id, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ name, email })
    });
    if (res.status === 401) { alert('Unauthorized - please login again'); logout(); return; }
    const data = await res.json();
    document.getElementById('output').textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    document.getElementById('output').textContent = 'Network error: ' + err.message;
  }
}

async function deleteUser() {
  const id = document.getElementById('delete-id').value;
  if (!id) return alert('Please provide user id to delete');
  try {
    if (!isAuthenticated()) return alert('Please login first to perform this operation.');
    const headers = getAuthHeader();
    const res = await fetch(API_BASE + '/' + id, { method: 'DELETE', headers });
    if (res.status === 401) { alert('Unauthorized - please login again'); logout(); return; }
    const data = await res.json();
    document.getElementById('output').textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    document.getElementById('output').textContent = 'Network error: ' + err.message;
  }
}

async function signup() {
  const name = document.getElementById('signup-name').value || 'New User';
  const email = document.getElementById('signup-email').value || 'new@example.com';
  const password = document.getElementById('signup-password').value || 'password';
  const res = await fetch(location.origin + '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  document.getElementById('output').textContent = JSON.stringify(data, null, 2);
}

async function login() {
  const email = document.getElementById('login-email').value || 'vasan@example.com';
  const password = document.getElementById('login-password').value || 'password';
  const res = await fetch(location.origin + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (res.ok && data.token) {
    localStorage.setItem('token', data.token);
    if (data.user && data.user.email) localStorage.setItem('userEmail', data.user.email);
    document.getElementById('auth-status').textContent = 'Logged in as ' + (data.user && data.user.email);
    setAuthState();
    // optionally refresh users after login
    getUsers();
  }
  document.getElementById('output').textContent = JSON.stringify(data, null, 2);
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userEmail');
  document.getElementById('auth-status').textContent = 'Logged out';
  setAuthState();
}

// small helper: pretty print objects to output and optionally log
function prettyPrint(obj, log = false) {
  const s = JSON.stringify(obj, null, 2);
  document.getElementById('output').textContent = s;
  if (log) console.log(obj);
}

// small helper: create some sample users locally (not sent to server) for UI testing
function generateSampleUsers(count = 5) {
  const arr = [];
  for (let i = 1; i <= count; i++) {
    arr.push({ id: i, name: `User ${i}`, email: `user${i}@example.com` });
  }
  prettyPrint(arr);
}

// initialize UI state on load
setAuthState();

// expose some helpers for debugging in console
window.generateSampleUsers = generateSampleUsers;
window.prettyPrint = prettyPrint;
