const form = document.getElementById('generatorForm');
const list = document.getElementById('generatorsList');
const message = document.getElementById('message');
const refreshBtn = document.getElementById('refreshBtn');
const statusFilter = document.getElementById('statusFilter');

function showMessage(text) {
  message.textContent = text;

  setTimeout(() => {
    message.textContent = '';
  }, 3500);
}

function statusClass(status) {
  return `status status-${status}`;
}

async function loadGenerators() {
  const status = statusFilter.value;
  const url = status ? `/api/generators?status=${status}` : '/api/generators';

  const response = await fetch(url);
  const generators = await response.json();

  if (generators.length === 0) {
    list.innerHTML = '<div class="empty">Немає доступних дизель-генераторних установок</div>';
    return;
  }

  list.innerHTML = generators.map((generator) => `
    <article class="generator-card">
      <div class="card-top">
        <div>
          <h3>${generator.name}</h3>
          <p>ID: ${generator.id}</p>
        </div>
        <span class="${statusClass(generator.status)}">${generator.status}</span>
      </div>

      <div class="metrics">
        <div class="metric">
          <span>Потужність</span>
          <strong>${generator.currentPower}/${generator.ratedPower} кВт</strong>
        </div>

        <div class="metric">
          <span>Напруга</span>
          <strong>${generator.voltage} В</strong>
        </div>

        <div class="metric">
          <span>Частота</span>
          <strong>${generator.frequency} Гц</strong>
        </div>

        <div class="metric">
          <span>Обороти</span>
          <strong>${generator.engineSpeed} об/хв</strong>
        </div>

        <div class="metric">
          <span>Тиск мастила</span>
          <strong>${generator.oilPressure} бар</strong>
        </div>

        <div class="metric">
          <span>Паливо</span>
          <strong>${generator.fuelLevel}%</strong>
        </div>
      </div>

      <div class="progress">
        <div class="progress-bar" style="width: ${generator.fuelLevel}%"></div>
      </div>

      <div class="actions">
        <button class="btn success" onclick="startGenerator(${generator.id})">Запустити</button>
        <button class="btn warning" onclick="stopGenerator(${generator.id})">Зупинити</button>
        <button class="btn secondary" onclick="showFuel(${generator.id})">Паливо</button>
        <button class="btn danger" onclick="deleteGenerator(${generator.id})">Видалити</button>
      </div>
    </article>
  `).join('');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = Object.fromEntries(new FormData(form));

  const payload = {
    name: formData.name,
    ratedPower: Number(formData.ratedPower),
    currentPower: Number(formData.currentPower),
    voltage: Number(formData.voltage),
    frequency: Number(formData.frequency),
    fuelLevel: Number(formData.fuelLevel),
    engineSpeed: Number(formData.engineSpeed),
    oilPressure: Number(formData.oilPressure),
    status: formData.status
  };

  const response = await fetch('/api/generators', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok) {
    showMessage(result.error || 'Помилка створення ДГУ');
    return;
  }

  showMessage('Дизель-генераторну установку створено');
  form.reset();
  loadGenerators();
});

async function startGenerator(id) {
  const response = await fetch(`/api/generators/${id}/start`, {
    method: 'POST'
  });

  const result = await response.json();

  if (!response.ok) {
    showMessage(result.error || 'Помилка запуску генератора');
    return;
  }

  showMessage(result.message);
  loadGenerators();
}

async function stopGenerator(id) {
  const response = await fetch(`/api/generators/${id}/stop`, {
    method: 'POST'
  });

  const result = await response.json();

  if (!response.ok) {
    showMessage(result.error || 'Помилка зупинки генератора');
    return;
  }

  showMessage(result.message);
  loadGenerators();
}

async function showFuel(id) {
  const response = await fetch(`/api/generators/${id}/fuel`);
  const result = await response.json();

  if (!response.ok) {
    showMessage(result.error || 'Помилка отримання даних про паливо');
    return;
  }

  showMessage(`${result.name}: паливо ${result.fuelLevel}%, стан: ${result.fuelStatus}. ${result.recommendation}`);
}

async function deleteGenerator(id) {
  const confirmed = confirm('Видалити цю дизель-генераторну установку?');

  if (!confirmed) {
    return;
  }

  const response = await fetch(`/api/generators/${id}`, {
    method: 'DELETE'
  });

  const result = await response.json();

  if (!response.ok) {
    showMessage(result.error || 'Помилка видалення');
    return;
  }

  showMessage(result.message);
  loadGenerators();
}

refreshBtn.addEventListener('click', loadGenerators);
statusFilter.addEventListener('change', loadGenerators);

loadGenerators();