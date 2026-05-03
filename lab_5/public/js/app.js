let autoInterval = null;
let isAutoEnabled = false;

const refreshBtn = document.getElementById('refreshBtn');
const autoBtn = document.getElementById('autoBtn');
const connectionStatus = document.getElementById('connectionStatus');

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('uk-UA');
}

function calculateTotals(inverters) {
  const totalDcPower = inverters.reduce((sum, item) => sum + item.dcPower, 0);
  const totalAcPower = inverters.reduce((sum, item) => sum + item.acPower, 0);
  const avgEfficiency =
    inverters.reduce((sum, item) => sum + item.efficiency, 0) / inverters.length;

  return {
    totalDcPower: totalDcPower.toFixed(1),
    totalAcPower: totalAcPower.toFixed(1),
    avgEfficiency: avgEfficiency.toFixed(1)
  };
}

function getAcQuality(inverters) {
  const hasBadFrequency = inverters.some(
    (item) => item.frequency < 49.8 || item.frequency > 50.2
  );

  const hasBadVoltage = inverters.some(
    (item) => item.acVoltage < 218 || item.acVoltage > 232
  );

  if (hasBadFrequency || hasBadVoltage) {
    return {
      text: 'Warning',
      className: 'status-warning'
    };
  }

  return {
    text: 'Normal',
    className: 'status-normal'
  };
}

function updateMetricCards(inverters, timestamp) {
  const totals = calculateTotals(inverters);
  const acQuality = getAcQuality(inverters);

  document.getElementById('totalDcPower').textContent = totals.totalDcPower;
  document.getElementById('totalAcPower').textContent = totals.totalAcPower;
  document.getElementById('avgEfficiency').textContent = totals.avgEfficiency;

  const acQualityElement = document.getElementById('acQuality');
  acQualityElement.textContent = acQuality.text;
  acQualityElement.className = acQuality.className;

  document.getElementById('lastUpdate').textContent = formatTime(timestamp);
}

function updateTable(inverters) {
  const table = document.getElementById('invertersTable');

  table.innerHTML = inverters
    .map((item) => {
      const statusClass =
        item.status === 'normal' ? 'status-normal' : 'status-warning';

      return `
        <tr>
          <td>${item.id}</td>
          <td>${item.dcPower}</td>
          <td>${item.acPower}</td>
          <td>${item.efficiency}</td>
          <td>${item.dcVoltage}</td>
          <td>${item.acVoltage}</td>
          <td>${item.frequency}</td>
          <td>${item.temperature}</td>
          <td class="${statusClass}">${item.status}</td>
        </tr>
      `;
    })
    .join('');
}

async function loadData() {
  try {
    connectionStatus.textContent = 'Online';
    connectionStatus.className = 'badge bg-success';

    const data = await fetchInverters();

    updateMetricCards(data.inverters, data.timestamp);
    updateCharts(data.inverters);
    updateTable(data.inverters);
  } catch (error) {
    connectionStatus.textContent = 'Error';
    connectionStatus.className = 'badge bg-danger';
    console.error(error);
  }
}

function toggleAutoUpdate() {
  if (!isAutoEnabled) {
    autoInterval = setInterval(loadData, 3000);
    isAutoEnabled = true;

    autoBtn.textContent = 'Зупинити автооновлення';
    autoBtn.className = 'btn btn-danger';
  } else {
    clearInterval(autoInterval);
    isAutoEnabled = false;

    autoBtn.textContent = 'Увімкнути автооновлення';
    autoBtn.className = 'btn btn-success';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initCharts();
  loadData();

  refreshBtn.addEventListener('click', loadData);
  autoBtn.addEventListener('click', toggleAutoUpdate);
});