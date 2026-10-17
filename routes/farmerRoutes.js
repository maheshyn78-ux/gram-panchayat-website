const express = require('express');
const farmerController = require('../controllers/farmerController');

const router = express.Router();

router.get('/farmers', farmerController.listFarmers);
router.get('/farmers/:id', farmerController.getFarmer);
router.post('/farmers', farmerController.createFarmer);
router.put('/farmers/:id', farmerController.updateFarmer);
router.delete('/farmers/:id', farmerController.deleteFarmer);

module.exports = router;
