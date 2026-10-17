const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Simple data helpers
async function ensureUsersFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(USERS_FILE);
  } catch (err) {
    await fs.writeFile(USERS_FILE, '[]', 'utf8');
  }
}

async function readUsers() {
  await ensureUsersFile();
  const raw = await fs.readFile(USERS_FILE, 'utf8');
  return JSON.parse(raw || '[]');
}

async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// API: List users
app.get('/api/users', async (req, res, next) => {
  try {
    const users = await readUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// API: Get user by id
app.get('/api/users/:id', async (req, res, next) => {
  try {
    const users = await readUsers();
    const user = users.find(u => String(u.id) === String(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// API: Create user
app.post('/api/users', async (req, res, next) => {
  try {
    const users = await readUsers();
    const id = Date.now();
    const user = { id, ...req.body };
    users.push(user);
    await writeUsers(users);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

// API: Update user
app.put('/api/users/:id', async (req, res, next) => {
  try {
    const users = await readUsers();
    const idx = users.findIndex(u => String(u.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'User not found' });
    users[idx] = { ...users[idx], ...req.body };
    await writeUsers(users);
    res.json(users[idx]);
  } catch (err) {
    next(err);
  }
});

// API: Delete user
app.delete('/api/users/:id', async (req, res, next) => {
  try {
    const users = await readUsers();
    const filtered = users.filter(u => String(u.id) !== String(req.params.id));
    if (filtered.length === users.length) return res.status(404).json({ error: 'User not found' });
    await writeUsers(filtered);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Fallback for SPA/static files (optional)
app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  next();
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
