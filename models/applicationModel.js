const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CITIZENS_FILE = path.join(DATA_DIR, 'citizens.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');

async function ensureFile(filePath, defaultContent) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(filePath);
  } catch (err) {
    await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2), 'utf8');
  }
}

async function readJson(filePath, defaultContent) {
  await ensureFile(filePath, defaultContent);
  const raw = await fs.readFile(filePath, 'utf8');
  return raw ? JSON.parse(raw) : defaultContent;
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ---------- Citizens (user login) ----------
async function getCitizens() {
  return readJson(CITIZENS_FILE, []);
}

async function findCitizenByUsername(username) {
  const citizens = await getCitizens();
  return citizens.find(c => c.username.toLowerCase() === String(username).toLowerCase());
}

async function registerCitizen(username, password, phone) {
  const citizens = await getCitizens();
  const existing = citizens.find(c => c.username.toLowerCase() === String(username).toLowerCase());
  if (existing) return { error: 'Username already exists. Please login instead.' };

  const citizen = {
    id: Date.now(),
    username: String(username).trim(),
    password: String(password),
    phone: String(phone || '').trim(),
    createdAt: new Date().toISOString()
  };
  citizens.push(citizen);
  await writeJson(CITIZENS_FILE, citizens);
  return { citizen };
}

async function verifyCitizenLogin(username, password) {
  const citizen = await findCitizenByUsername(username);
  if (!citizen) return null;
  if (citizen.password !== String(password)) return null;
  return citizen;
}

// ---------- Applications ----------
async function getApplications() {
  return readJson(APPLICATIONS_FILE, []);
}

async function getApplicationsForUser(username) {
  const applications = await getApplications();
  return applications.filter(a => a.username.toLowerCase() === String(username).toLowerCase());
}

async function submitApplication(username, serviceName, details) {
  const applications = await getApplications();
  const entry = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    username: String(username).trim(),
    serviceName: String(serviceName || 'General Application').trim(),
    details: String(details || '').trim(),
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    remarks: 'Application submitted and awaiting admin review.',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  applications.unshift(entry);
  await writeJson(APPLICATIONS_FILE, applications);
  return entry;
}

async function updateApplicationStatus(id, status, remarks) {
  const applications = await getApplications();
  const index = applications.findIndex(a => String(a.id) === String(id));
  if (index === -1) return null;

  applications[index].status = status;
  applications[index].remarks = remarks || applications[index].remarks;
  applications[index].updatedAt = new Date().toISOString();

  await writeJson(APPLICATIONS_FILE, applications);
  return applications[index];
}

module.exports = {
  getCitizens,
  findCitizenByUsername,
  registerCitizen,
  verifyCitizenLogin,
  getApplications,
  getApplicationsForUser,
  submitApplication,
  updateApplicationStatus
};
