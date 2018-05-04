const auth = require('../middleware/auth');
const config = require('config');
const _ = require('lodash');
const Joi = require('joi');
const User = require('../models/user');
const Driver = require('../models/driver');
const Route  = require('../models/route');
const Location = require('../models/location');
const Shift = require('../models/shift');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    let title = req.body.title; 
    let routeId = req.body._routeId;
    let startLocName;
    let endLocName;
    let driverId = req.body._driverId;
    let driverName;
    let vehicle = req.body.vehicle;
    let shiftStartTime = req.body.shiftStartTime;
    let shiftEndTime = req.body.shiftEndTime;
    let shiftStatus = req.body.shiftStatus;
  
    const route = await Route.findById(req.body._routeId);
    if (!route) return res.status(400).send('Invalid route.');
    
    startLocName = route.startLoc;
    console.log('startLocName  ', startLocName);
    
    driverId = await User.findById(driverId);
    if (!driverId) return res.status(400).send('Invalid DriverId.');
  
    const shift = new Shift({ 
        title: title,
        _routeId: routeId,
        startLocName: startLocName,
        endLocationName: endLocationName,
        _driverId: driverId,
        vehicle: vehicle,
        shiftStartTime: shiftStartTime,
        shiftEndTime: shiftEndTime,
        shiftStatus: shiftStatus
    });
    
    // await shift.save();
    
    res.jsonp({
        status : "Success",
        message : "Successfully saved."
        // object : shift
    });
      
});

module.exports = router; 