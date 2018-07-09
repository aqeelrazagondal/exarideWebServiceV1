const express = require('express');
const router = express.Router();

const { OverSpeedAlert } = require('../models/overSpeedAlert');

router.get('/', (req, res) => {
    res.send('BMS - Smart Ride WebSerivices Working');
});


router.get('/overSpeedingAlert', async (req, res) => {
    // const query = req.params.id;
    const overSpeedAlerts = await OverSpeedAlert.find({  });
    if (!overSpeedAlerts) return res.status(404).send('OverSpeedAlerts List is Empty.');
    
    res.jsonp({ status: 'Success', message: 'Over Speed Alerts List. ', object: overSpeedAlerts });
  });
  

module.exports = router; 