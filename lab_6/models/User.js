const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }

  const data = fs.readFileSync(USERS_FILE, 'utf8');
  return data ? JSON.parse(data) : [];
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

async function findByEmail(email) {
  const users = readUsers();
  const normalizedEmail = normalizeEmail(email);
  return users.find((user) => normalizeEmail(user.email) === normalizedEmail) || null;
}

async function findById(id) {
  const users = readUsers();
  return users.find((user) => user.id === id) || null;
}

async function create(userData) {
  const users = readUsers();

  const newUser = {
    id: Date.now().toString(),
    ...userData,
    email: normalizeEmail(userData.email),
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  return newUser;
}

module.exports = {
  findByEmail,
  findById,
  create
};
