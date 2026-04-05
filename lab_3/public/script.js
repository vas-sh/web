const form = document.getElementById('form');
const list = document.getElementById('list');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form));

  await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  form.reset();
  load();
});

async function load() {
  const res = await fetch('/api/data');
  const data = await res.json();

  list.innerHTML = data.map(i => `
    <div class="item">
      <h3>${i.name}</h3>

      <p><span class="label">Потужність:</span> ${i.power} кВт</p>
      <p><span class="label">cos φ:</span> ${i.cosPhi}</p>

      <p><span class="label">Реактивна потужність:</span> ${i.reactivePower}</p>
      <p><span class="label">Після компенсації:</span> ${i.compensated}</p>
      <p><span class="label">Економія:</span> ${i.savings}</p>

      <button class="btn-delete" onclick="del('${i.id}')">Видалити</button>
    </div>
  `).join('');
}

async function del(id) {
  await fetch('/api/data/' + id, { method: 'DELETE' });
  load();
}

load();