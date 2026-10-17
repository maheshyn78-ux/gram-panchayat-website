const fs = require('fs').promises;
const path = require('path');

const farmersFile = path.join(__dirname, '..', 'data', 'farmers.json');

async function ensureFarmersFile() {
  try {
    await fs.mkdir(path.dirname(farmersFile), { recursive: true });
    await fs.access(farmersFile);
  } catch (err) {
    await fs.writeFile(farmersFile, '[]', 'utf8');
  }
}

async function readFarmers() {
  await ensureFarmersFile();
  const raw = await fs.readFile(farmersFile, 'utf8');
  return JSON.parse(raw || '[]');
}

async function writeFarmers(farmers) {
  await fs.writeFile(farmersFile, JSON.stringify(farmers, null, 2), 'utf8');
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function nextFarmerId(farmers) {
  if (!farmers || farmers.length === 0) return 1;
  return Math.max(...farmers.map(f => Number(f.id) || 0)) + 1;
}

async function getAllFarmers() {
  const farmers = await readFarmers();
  return farmers.sort((a, b) => Number(a.id) - Number(b.id));
}

async function getFarmerById(id) {
  const farmers = await readFarmers();
  return farmers.find(f => String(f.id) === String(id));
}

async function findFarmerByPhone(phone, excludeId = null) {
  const normalizedPhone = normalizePhone(phone);
  const farmers = await readFarmers();
  return farmers.find(f => normalizePhone(f.phone) === normalizedPhone && String(f.id) !== String(excludeId));
}

async function addFarmer({ name, phone, village }) {
  const farmers = await readFarmers();
  const newFarmer = {
    id: nextFarmerId(farmers),
    name: String(name || '').trim(),
    phone: normalizePhone(phone),
    village: String(village || '').trim(),
    dateAdded: new Date().toISOString()
  };
  farmers.push(newFarmer);
  await writeFarmers(farmers);
  return newFarmer;
}

async function updateFarmer(id, { name, phone, village }) {
  const farmers = await readFarmers();
  const index = farmers.findIndex(f => String(f.id) === String(id));
  if (index === -1) return null;
  farmers[index] = {
    ...farmers[index],
    name: String(name || farmers[index].name).trim(),
    phone: normalizePhone(phone || farmers[index].phone),
    village: String(village || farmers[index].village).trim()
  };
  await writeFarmers(farmers);
  return farmers[index];
}

async function deleteFarmer(id) {
  const farmers = await readFarmers();
  const filtered = farmers.filter(f => String(f.id) !== String(id));
  if (filtered.length === farmers.length) return false;
  await writeFarmers(filtered);
  return true;
}

module.exports = {
  getAllFarmers,
  getFarmerById,
  findFarmerByPhone,
  addFarmer,
  updateFarmer,
  deleteFarmer
};
