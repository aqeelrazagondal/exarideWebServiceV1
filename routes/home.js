const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('BMS - Smart Ride WebSerivices Working');
});

module.exports = router; 