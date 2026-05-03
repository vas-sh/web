const API_URL = '/api';

async function fetchInverters() {
  const response = await fetch(`${API_URL}/inverters`);

  if (!response.ok) {
    throw new Error('Помилка отримання даних інверторів');
  }

  return response.json();
}

async function fetchApiStatus() {
  const response = await fetch(`${API_URL}/status`);

  if (!response.ok) {
    throw new Error('API недоступне');
  }

  return response.json();
}