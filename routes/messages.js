const mongoose = require('mongoose');
const express = require('express');
const { Admin } = require('../models/admin');
const logger = require('../startup/logging');
const regCtrl = require('../controller/registrationController');
const LocController = require('../controller/locationController');
const router = express.Router();

// router.post('/sendSmsToAllDrivers', async (req, res) => {  
  
// });

module.exports = router; 