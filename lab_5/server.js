const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

function random(min, max, decimals = 1) {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateInverters() {
  return Array.from({ length: 5 }, (_, index) => {
    const dcPower = random(80, 160, 1);
    const efficiency = random(92, 98.5, 1);
    const acPower = Number((dcPower * efficiency / 100).toFixed(1));

    return {
      id: `INV-${index + 1}`,
      dcPower,
      acPower,
      efficiency,
      dcVoltage: random(580, 760, 0),
      acVoltage: random(215, 235, 0),
      frequency: random(49.7, 50.3, 2),
      temperature: random(35, 65, 1),
      status: efficiency >= 94 && acPower > 90 ? 'normal' : 'warning',
      timestamp: Date.now()
    };
  });
}

app.get('/api/inverters', (req, res) => {
  res.json({
    timestamp: Date.now(),
    inverters: generateInverters()
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    lastUpdate: Date.now()
  });
});

app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
});