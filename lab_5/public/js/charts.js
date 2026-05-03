let powerBarChart;
let efficiencyLineChart;

function initCharts() {
  const powerCtx = document.getElementById('powerBarChart');
  const efficiencyCtx = document.getElementById('efficiencyLineChart');

  powerBarChart = new Chart(powerCtx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'DC потужність, кВт',
          data: []
        },
        {
          label: 'AC потужність, кВт',
          data: []
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  efficiencyLineChart = new Chart(efficiencyCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'ККД, %',
          data: [],
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          min: 85,
          max: 100
        }
      }
    }
  });
}

function updateCharts(inverters) {
  const labels = inverters.map((item) => item.id);

  powerBarChart.data.labels = labels;
  powerBarChart.data.datasets[0].data = inverters.map((item) => item.dcPower);
  powerBarChart.data.datasets[1].data = inverters.map((item) => item.acPower);
  powerBarChart.update();

  efficiencyLineChart.data.labels = labels;
  efficiencyLineChart.data.datasets[0].data = inverters.map((item) => item.efficiency);
  efficiencyLineChart.update();
}