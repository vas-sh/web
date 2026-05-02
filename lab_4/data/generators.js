const generators = [
  {
    id: 1,
    name: 'ДГУ-100 Резервна',
    ratedPower: 100,
    currentPower: 0,
    voltage: 400,
    frequency: 50,
    fuelLevel: 80,
    engineSpeed: 0,
    oilPressure: 0,
    status: 'standby'
  },
  {
    id: 2,
    name: 'ДГУ-250 Основна',
    ratedPower: 250,
    currentPower: 180,
    voltage: 400,
    frequency: 50,
    fuelLevel: 55,
    engineSpeed: 1500,
    oilPressure: 4.2,
    status: 'running'
  },
  {
    id: 3,
    name: 'ДГУ-150 Аварійна',
    ratedPower: 150,
    currentPower: 0,
    voltage: 0,
    frequency: 0,
    fuelLevel: 20,
    engineSpeed: 0,
    oilPressure: 0,
    status: 'fault'
  }
];

module.exports = generators;
