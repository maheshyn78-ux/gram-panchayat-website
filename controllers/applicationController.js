const store = require('../models/applicationModel');

// ---------- Citizen auth ----------
async function register(req, res, next) {
  try {
    const { username, password, phone } = req.body;

    if (!username || !String(username).trim()) {
      return res.status(400).json({ success: false, message: 'Username is required.' });
    }
    if (!password || String(password).length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters.' });
    }

    const result = await store.registerCitizen(username, password, phone);
    if (result.error) {
      return res.status(409).json({ success: false, message: result.error });
    }
    return res.json({ success: true, message: 'Registration successful. You can now login.', username: result.citizen.username });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !String(username).trim()) {
      return res.status(400).json({ success: false, message: 'Username is required.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const citizen = await store.verifyCitizenLogin(username, password);
    if (!citizen) {
      return res.status(401).json({ success: false, message: 'Invalid username or password. New here? Please register first.' });
    }

    return res.json({ success: true, message: 'Login successful.', username: citizen.username });
  } catch (error) {
    next(error);
  }
}

// ---------- Citizen application actions ----------
async function apply(req, res, next) {
  try {
    const { username, serviceName, details } = req.body;

    if (!username || !String(username).trim()) {
      return res.status(400).json({ success: false, message: 'Please login before applying.' });
    }
    if (!serviceName || !String(serviceName).trim()) {
      return res.status(400).json({ success: false, message: 'Please select a service to apply for.' });
    }

    const entry = await store.submitApplication(username, serviceName, details);
    return res.json({ success: true, message: 'Application submitted successfully. Admin will review it shortly.', entry });
  } catch (error) {
    next(error);
  }
}

async function myApplications(req, res, next) {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required.' });
    }
    const applications = await store.getApplicationsForUser(username);
    return res.json({ success: true, applications });
  } catch (error) {
    next(error);
  }
}

// ---------- Admin actions ----------
async function allApplications(req, res, next) {
  try {
    const applications = await store.getApplications();
    const totals = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      approved: applications.filter(a => a.status === 'approved').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    };
    return res.json({ success: true, totals, applications });
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved, rejected, or pending.' });
    }

    const updated = await store.updateApplicationStatus(id, status, remarks);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    return res.json({ success: true, message: `Application marked as ${status}.`, entry: updated });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, apply, myApplications, allApplications, updateStatus };
