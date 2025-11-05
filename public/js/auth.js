// public/js/auth.js
let CSRF = null;
async function getCSRF() {
  if (CSRF) return CSRF;
  const r = await fetch('/api/csrf-token', { credentials: 'include' });
  const { csrfToken } = await r.json();
  CSRF = csrfToken;
  return CSRF;
}

export async function me() {
  const r = await fetch('/api/auth/me', { credentials: 'include' });
  const j = await r.json().catch(()=>({}));
  return j.user || null;
}

export async function login(email, password) {
  const csrf = await getCSRF();
  const r = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  const j = await r.json().catch(()=>({}));
  if (!r.ok) throw new Error(j?.error || 'Login falló');
  return j.user;
}

export async function logout() {
  const csrf = await getCSRF();
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
    credentials: 'include'
  });
}

async function refreshAuthButtons() {
  const user = await me();
  const btnLogin  = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogin)  btnLogin.classList.toggle('d-none', !!user);
  if (btnLogout) btnLogout.classList.toggle('d-none', !user);
}

// Espera a que el DOM esté listo (y bootstrap global cargado)
function ready(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

ready(() => {
  const btnLogin  = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const form      = document.getElementById('form-login');
  const modalEl   = document.getElementById('modalLogin');

  let modal = null;

  // Mostrar modal al hacer clic
  btnLogin?.addEventListener('click', () => {
    if (!modal && window.bootstrap && modalEl) {
      modal = new window.bootstrap.Modal(modalEl);
    }
    modal?.show();
  });

  // Enviar login
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('login-email');
    const passInput  = document.getElementById('login-pass');
    const email = emailInput ? emailInput.value : '';
    const password = passInput ? passInput.value : '';
    try {
      await login(email, password);
      await refreshAuthButtons();
      if (!modal && window.bootstrap && modalEl) {
        modal = new window.bootstrap.Modal(modalEl);
      }
      modal?.hide();
    } catch (err) {
      alert((err && err.message) ? err.message : 'No se pudo iniciar sesión.');
    }
  });

  // Logout
  btnLogout?.addEventListener('click', async () => {
    await logout();
    await refreshAuthButtons();
  });

  // Estado inicial botones
  refreshAuthButtons();
});
