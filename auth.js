/* ===================================
   auth.js — Login & Logout
   =================================== */

// Demo user credentials
const USERS = [
  { username: 'admin', password: 'admin123', name: 'Admin', role: 'HR Manager' }
];

// Called when login button is clicked
function handleLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl  = document.getElementById('login-error');

  if (!username || !password) {
    showError(errorEl, 'Please enter both username and password.');
    return;
  }

  const user = USERS.find(u => u.username === username && u.password === password);

  if (!user) {
    showError(errorEl, 'Incorrect username or password.');
    return;
  }

  // Save login session
  localStorage.setItem('kpi_user', JSON.stringify(user));

  // Redirect to dashboard
  window.location.href = 'dashboard.html';
}

// Called on logout button
function logout() {
  localStorage.removeItem('kpi_user');
  window.location.href = 'login.html';
}

// Protect pages — if not logged in, go back to login
function requireAuth() {
  const user = localStorage.getItem('kpi_user');
  if (!user) {
    window.location.href = 'login.html';
  }
}

// Allow pressing Enter key on login form
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && document.getElementById('login-error')) {
    handleLogin();
  }
});

// Show error message helper
function showError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

// Run auth check on all pages except login
if (!window.location.pathname.includes('login')) {
  requireAuth();
}
