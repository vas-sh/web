let autoInterval = null;
let isAutoUpdateEnabled = false;

const parameters = {
  electricPower: {
    min: 0,
    max: 1000,
    normalMin: 300,
    normalMax: 900,
    decimals: 0
  },
  thermalPower: {
    min: 0,
    max: 1200,
    normalMin: 400,
    normalMax: 1000,
    decimals: 0
  },
  efficiency: {
    min: 75,
    max: 90,
    normalMin: 80,
    normalMax: 88,
    decimals: 1
  },
  exhaustTemperature: {
    min: 100,
    max: 180,
    normalMin: 120,
    normalMax: 160,
    decimals: 0
  }
};

function getRandomValue(min, max, decimals = 0) {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

function checkStatus(value, parameter) {
  if (value >= parameter.normalMin && value <= parameter.normalMax) {
    return 'normal';
  }

  if (value >= parameter.min && value <= parameter.max) {
    return 'warning';
  }

  return 'critical';
}

function updateParameter(elementId, statusId, value, parameter) {
  const valueElement = document.getElementById(elementId);
  const statusElement = document.getElementById(statusId);

  valueElement.textContent = value;

  const status = checkStatus(value, parameter);
  statusElement.className = `status status-${status}`;
}

function formatTimestamp() {
  return new Date().toLocaleTimeString('uk-UA');
}

function generateSensorData() {
  return {
    electricPower: getRandomValue(
      parameters.electricPower.min,
      parameters.electricPower.max,
      parameters.electricPower.decimals
    ),
    thermalPower: getRandomValue(
      parameters.thermalPower.min,
      parameters.thermalPower.max,
      parameters.thermalPower.decimals
    ),
    efficiency: getRandomValue(
      parameters.efficiency.min,
      parameters.efficiency.max,
      parameters.efficiency.decimals
    ),
    exhaustTemperature: getRandomValue(
      parameters.exhaustTemperature.min,
      parameters.exhaustTemperature.max,
      parameters.exhaustTemperature.decimals
    ),
    operationMode: Math.random() > 0.5 ? 'Електричний пріоритет' : 'Тепловий пріоритет',
    energySaving: getRandomValue(5, 25, 1),
    maintenanceTime: getRandomValue(20, 500, 0)
  };
}

function updateDisplay(data) {
  updateParameter(
    'electricPower',
    'electricPowerStatus',
    data.electricPower,
    parameters.electricPower
  );

  updateParameter(
    'thermalPower',
    'thermalPowerStatus',
    data.thermalPower,
    parameters.thermalPower
  );

  updateParameter(
    'efficiency',
    'efficiencyStatus',
    data.efficiency,
    parameters.efficiency
  );

  updateParameter(
    'exhaustTemperature',
    'exhaustTemperatureStatus',
    data.exhaustTemperature,
    parameters.exhaustTemperature
  );

  document.getElementById('operationMode').textContent = data.operationMode;
  document.getElementById('energySaving').textContent = data.energySaving;
  document.getElementById('maintenanceTime').textContent = data.maintenanceTime;
  document.getElementById('lastUpdate').textContent = formatTimestamp();
}

function manualUpdate() {
  const data = generateSensorData();
  updateDisplay(data);
}

function toggleAutoUpdate() {
  const autoButton = document.getElementById('autoUpdateBtn');
  const autoStatus = document.getElementById('autoStatus');

  if (!isAutoUpdateEnabled) {
    autoInterval = setInterval(manualUpdate, 3000);
    isAutoUpdateEnabled = true;

    autoButton.textContent = 'Зупинити автооновлення';
    autoButton.className = 'btn btn-danger';
    autoStatus.textContent = 'Автооновлення увімкнено (3 сек)';
  } else {
    clearInterval(autoInterval);
    isAutoUpdateEnabled = false;

    autoButton.textContent = 'Увімкнути автооновлення';
    autoButton.className = 'btn btn-success';
    autoStatus.textContent = 'Автооновлення вимкнено';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  manualUpdate();

  document.getElementById('updateBtn').addEventListener('click', manualUpdate);
  document.getElementById('autoUpdateBtn').addEventListener('click', toggleAutoUpdate);
});