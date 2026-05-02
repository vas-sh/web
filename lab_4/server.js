const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

let generators = [
  {
    id: 1,
    name: 'ДГУ-250 Резервна',
    ratedPower: 250,
    currentPower: 0,
    voltage: 400,
    frequency: 50,
    fuelLevel: 85,
    engineSpeed: 0,
    oilPressure: 0,
    status: 'standby'
  },
  {
    id: 2,
    name: 'ДГУ-500 Промислова',
    ratedPower: 500,
    currentPower: 320,
    voltage: 400,
    frequency: 50,
    fuelLevel: 62,
    engineSpeed: 1500,
    oilPressure: 4.2,
    status: 'running'
  }
];

function findGenerator(id) {
  return generators.find((generator) => generator.id === Number(id));
}

function validateGenerator(data) {
  const requiredFields = [
    'name',
    'ratedPower',
    'currentPower',
    'voltage',
    'frequency',
    'fuelLevel',
    'engineSpeed',
    'oilPressure',
    'status'
  ];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      return `Поле "${field}" є обов'язковим`;
    }
  }

  if (typeof data.name !== 'string') {
    return 'Поле "name" має бути рядком';
  }

  if (!['standby', 'running', 'fault'].includes(data.status)) {
    return 'Поле "status" повинно мати значення: standby, running або fault';
  }

  const numericFields = [
    'ratedPower',
    'currentPower',
    'voltage',
    'frequency',
    'fuelLevel',
    'engineSpeed',
    'oilPressure'
  ];

  for (const field of numericFields) {
    if (typeof data[field] !== 'number' || Number.isNaN(data[field])) {
      return `Поле "${field}" має бути числом`;
    }
  }

  if (data.fuelLevel < 0 || data.fuelLevel > 100) {
    return 'Рівень палива має бути в межах від 0 до 100%';
  }

  return null;
}

// GET /api/generators - отримати всі ДГУ
app.get('/api/generators', (req, res) => {
  const { status, minFuel } = req.query;

  let result = [...generators];

  if (status) {
    result = result.filter((generator) => generator.status === status);
  }

  if (minFuel) {
    result = result.filter((generator) => generator.fuelLevel >= Number(minFuel));
  }

  res.json(result);
});

// GET /api/generators/:id - отримати конкретну ДГУ
app.get('/api/generators/:id', (req, res) => {
  const generator = findGenerator(req.params.id);

  if (!generator) {
    return res.status(404).json({
      error: 'Дизель-генераторну установку не знайдено'
    });
  }

  res.json(generator);
});

// POST /api/generators - створити нову ДГУ
app.post('/api/generators', (req, res) => {
  const validationError = validateGenerator(req.body);

  if (validationError) {
    return res.status(400).json({
      error: validationError
    });
  }

  const newGenerator = {
    id: generators.length > 0 ? Math.max(...generators.map((g) => g.id)) + 1 : 1,
    ...req.body
  };

  generators.push(newGenerator);

  res.status(201).json({
    message: 'Дизель-генераторну установку створено',
    generator: newGenerator
  });
});

// POST /api/generators/:id/start - запустити генератор
app.post('/api/generators/:id/start', (req, res) => {
  const generator = findGenerator(req.params.id);

  if (!generator) {
    return res.status(404).json({
      error: 'Дизель-генераторну установку не знайдено'
    });
  }

  if (generator.status === 'fault') {
    return res.status(400).json({
      error: 'Неможливо запустити генератор у стані fault'
    });
  }

  if (generator.fuelLevel <= 5) {
    return res.status(400).json({
      error: 'Недостатній рівень палива для запуску'
    });
  }

  generator.status = 'running';
  generator.engineSpeed = 1500;
  generator.oilPressure = 4.0;
  generator.currentPower = generator.currentPower === 0 ? generator.ratedPower * 0.6 : generator.currentPower;

  res.json({
    message: 'Генератор запущено',
    generator
  });
});

app.post('/api/generators/:id/stop', (req, res) => {
  const generator = findGenerator(req.params.id);

  if (!generator) {
    return res.status(404).json({
      error: 'Дизель-генераторну установку не знайдено'
    });
  }

  generator.status = 'standby';
  generator.currentPower = 0;
  generator.engineSpeed = 0;
  generator.oilPressure = 0;

  res.json({
    message: 'Генератор зупинено',
    generator
  });
});

app.get('/api/generators/:id/fuel', (req, res) => {
  const generator = findGenerator(req.params.id);

  if (!generator) {
    return res.status(404).json({
      error: 'Дизель-генераторну установку не знайдено'
    });
  }

  const fuelStatus =
    generator.fuelLevel > 50
      ? 'normal'
      : generator.fuelLevel > 15
        ? 'low'
        : 'critical';

  res.json({
    generatorId: generator.id,
    name: generator.name,
    fuelLevel: generator.fuelLevel,
    fuelStatus,
    recommendation:
      fuelStatus === 'critical'
        ? 'Потрібно терміново поповнити запас палива'
        : fuelStatus === 'low'
          ? 'Рекомендується поповнити запас палива'
          : 'Рівень палива достатній'
  });
});

app.put('/api/generators/:id', (req, res) => {
  const index = generators.findIndex((generator) => generator.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({
      error: 'Дизель-генераторну установку не знайдено'
    });
  }

  const validationError = validateGenerator(req.body);

  if (validationError) {
    return res.status(400).json({
      error: validationError
    });
  }

  generators[index] = {
    id: Number(req.params.id),
    ...req.body
  };

  res.json({
    message: 'Дані дизель-генераторної установки оновлено',
    generator: generators[index]
  });
});

app.patch('/api/generators/:id', (req, res) => {
  const generator = findGenerator(req.params.id);

  if (!generator) {
    return res.status(404).json({
      error: 'Дизель-генераторну установку не знайдено'
    });
  }

  if (req.body.status && !['standby', 'running', 'fault'].includes(req.body.status)) {
    return res.status(400).json({
      error: 'Поле "status" повинно мати значення: standby, running або fault'
    });
  }

  if (req.body.fuelLevel !== undefined && (req.body.fuelLevel < 0 || req.body.fuelLevel > 100)) {
    return res.status(400).json({
      error: 'Рівень палива має бути в межах від 0 до 100%'
    });
  }

  Object.assign(generator, req.body);

  res.json({
    message: 'Параметри дизель-генераторної установки частково оновлено',
    generator
  });
});

app.delete('/api/generators/:id', (req, res) => {
  const index = generators.findIndex((generator) => generator.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({
      error: 'Дизель-генераторну установку не знайдено'
    });
  }

  const deletedGenerator = generators.splice(index, 1)[0];

  res.json({
    message: 'Дизель-генераторну установку видалено',
    generator: deletedGenerator
  });
});

app.use(express.json())
app.use(express.static('public'))

app.listen(PORT, () => {
  console.log(`REST API сервер запущено: http://localhost:${PORT}`);
  console.log('Доступні endpoints:');
  console.log('GET    /api/generators');
  console.log('GET    /api/generators/:id');
  console.log('POST   /api/generators');
  console.log('POST   /api/generators/:id/start');
  console.log('POST   /api/generators/:id/stop');
  console.log('GET    /api/generators/:id/fuel');
  console.log('PUT    /api/generators/:id');
  console.log('PATCH  /api/generators/:id');
  console.log('DELETE /api/generators/:id');
});