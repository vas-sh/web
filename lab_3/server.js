const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data', 'data.json');

function readData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/data', (req, res) => {
  res.json(readData());
});

app.post('/api/data', (req, res) => {
  const { name, power, cosPhi } = req.body;

  const reactivePower = power * Math.tan(Math.acos(cosPhi));
  const compensated = reactivePower * 0.7; // умовно
  const savings = reactivePower - compensated;

  const newItem = {
    id: Date.now().toString(),
    name,
    power,
    cosPhi,
    reactivePower: reactivePower.toFixed(2),
    compensated: compensated.toFixed(2),
    savings: savings.toFixed(2),
    date: new Date().toISOString()
  };

  const data = readData();
  data.push(newItem);
  writeData(data);

  res.json({ success: true });
});

app.delete('/api/data/:id', (req, res) => {
  const data = readData().filter(i => i.id !== req.params.id);
  writeData(data);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});