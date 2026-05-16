let csrfToken = '';

async function loadCsrfToken() {
  const response = await fetch('/auth/csrf-token');
  const data = await response.json();
  csrfToken = data.csrfToken;
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'CSRF-Token': csrfToken,
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}

function showMessage(text) {
  const message = document.getElementById('message');

  if (message) {
    message.textContent = text;
  }
}

function showResult(data) {
  document.getElementById('result').textContent = JSON.stringify(data, null, 2);
}

async function initRegisterPage() {
  const form = document.getElementById('registerForm');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(form));

    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      showMessage(data.message + '. Тепер можна увійти.');
      form.reset();
    } catch (error) {
      showMessage(error.error || 'Помилка реєстрації');
    }
  });
}

async function initLoginPage() {
  const form = document.getElementById('loginForm');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(form));

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      csrfToken = data.csrfToken;
      window.location.href = '/dashboard.html';
    } catch (error) {
      showMessage(error.error || 'Помилка входу');
    }
  });
}

async function initDashboardPage() {
  const userInfo = document.getElementById('userInfo');

  if (!userInfo) return;

  try {
    const status = await fetch('/auth/status').then((res) => res.json());

    if (!status.authenticated) {
      window.location.href = '/login.html';
      return;
    }

    csrfToken = status.csrfToken;
    userInfo.textContent = `${status.user.name} (${status.user.email}), роль: ${status.user.role}`;
  } catch {
    window.location.href = '/login.html';
  }

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await apiRequest('/auth/logout', {
      method: 'POST'
    });

    window.location.href = '/login.html';
  });

  document.getElementById('pueBtn').addEventListener('click', async () => {
    try {
      const data = await apiRequest('/api/datacenter/pue');
      showResult(data);
    } catch (error) {
      showResult(error);
    }
  });

  document.getElementById('loadBalanceBtn').addEventListener('click', async () => {
    try {
      const data = await apiRequest('/api/servers/load-balance', {
        method: 'POST',
        body: JSON.stringify({
          targetLoad: 70
        })
      });

      showResult(data);
    } catch (error) {
      showResult(error);
    }
  });

  document.getElementById('coolingBtn').addEventListener('click', async () => {
    try {
      const data = await apiRequest('/api/cooling/optimize', {
        method: 'POST',
        body: JSON.stringify({
          coolingMode: 'eco'
        })
      });

      showResult(data);
    } catch (error) {
      showResult(error);
    }
  });

  document.getElementById('reportsBtn').addEventListener('click', async () => {
    try {
      const data = await apiRequest('/api/efficiency/reports');
      showResult(data);
    } catch (error) {
      showResult(error);
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadCsrfToken();

  initRegisterPage();
  initLoginPage();
  initDashboardPage();
});