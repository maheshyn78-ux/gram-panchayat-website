const express = require('express');
const applicationController = require('../controllers/applicationController');

const router = express.Router();

// Citizen auth
router.post('/citizen/register', applicationController.register);
router.post('/citizen/login', applicationController.login);

// Citizen applications
router.post('/citizen/apply', applicationController.apply);
router.get('/citizen/applications/:username', applicationController.myApplications);

// Admin
router.get('/admin/applications', applicationController.allApplications);
router.put('/admin/applications/:id', applicationController.updateStatus);

module.exports = router;
