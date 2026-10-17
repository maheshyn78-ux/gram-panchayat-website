const Farmer = require('../models/farmerModel');

function validatePhoneValue(phone) {
  const normalized = String(phone || '').trim();
  return /^\d{10}$/.test(normalized);
}

async function listFarmers(req, res, next) {
  try {
    const farmers = await Farmer.getAllFarmers();
    res.json(farmers);
  } catch (error) {
    next(error);
  }
}

async function getFarmer(req, res, next) {
  try {
    const farmer = await Farmer.getFarmerById(req.params.id);
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    res.json(farmer);
  } catch (error) {
    next(error);
  }
}

async function createFarmer(req, res, next) {
  try {
    const { name, phone, village } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Farmer Name is required.' });
    }
    if (!validatePhoneValue(phone)) {
      return res.status(400).json({ error: 'Phone Number must be exactly 10 digits.' });
    }
    const duplicate = await Farmer.findFarmerByPhone(phone);
    if (duplicate) {
      return res.status(400).json({ error: 'A farmer with this phone number already exists.' });
    }

    const newFarmer = await Farmer.addFarmer({
      name,
      phone,
      village
    });
    res.status(201).json(newFarmer);
  } catch (error) {
    next(error);
  }
}

async function updateFarmer(req, res, next) {
  try {
    const { name, phone, village } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Farmer Name is required.' });
    }
    if (!validatePhoneValue(phone)) {
      return res.status(400).json({ error: 'Phone Number must be exactly 10 digits.' });
    }
    const duplicate = await Farmer.findFarmerByPhone(phone, req.params.id);
    if (duplicate) {
      return res.status(400).json({ error: 'A farmer with this phone number already exists.' });
    }
    const updated = await Farmer.updateFarmer(req.params.id, { name, phone, village });
    if (!updated) {
      return res.status(404).json({ error: 'Farmer not found.' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deleteFarmer(req, res, next) {
  try {
    const deleted = await Farmer.deleteFarmer(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Farmer not found.' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listFarmers,
  getFarmer,
  createFarmer,
  updateFarmer,
  deleteFarmer
};
