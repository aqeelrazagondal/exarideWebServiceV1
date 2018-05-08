const auth = require('../middleware/auth');
const _ = require('lodash');
const Joi = require('joi');
const { User } = require('../models/user');
const Driver = require('../models/driver');
const Rider = require('../models/rider');
const Location = require('../models/location');
const Shift = require('../models/shift');
const shiftRider = require('../models/shiftRider');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {

    let shift = await Shift.findOne({ _id: req.body._shiftId });
    if (!shift) return res.status(400).send('Shift not Found.');

    let _riderId = req.body._riderId;
    let pickUpTime = req.body.pickUpTime;
    let dropOfTime = req.body.dropOfTime;
    let shiftStartTime = req.body.shiftStartTime;
    let shiftEndTime = req.body.shiftEndTime;

    let rider = await Rider.findOne({ _id: _riderId });
    if(!rider)  return res.status(400).send('Rider id not found.');

    let pickUpLocName = await Location.findOne({ title: req.body.pickUpLocName });
    if (!pickUpLocName) return res.status(400).send('pickUpLocName not found.');

    let dropOfLocName = await Location.findOne({ title: req.body.dropOfLocName });
    if (!dropOfLocName) return res.status(400).send('dropOfLocName not found.');
    
    let riderResObj = new shiftRider ({
        _shiftId: shift._id,
        _riderId: rider._id,
        pickUpLocName: pickUpLocName.title,
        pickUploc: pickUpLocName.loc,
        dropOfLocName: dropOfLocName.title,
        dropOfLoc: dropOfLocName.loc,
        shiftStartTime: shiftStartTime,
        shiftEndTime: shiftEndTime,
    });

    await riderResObj.save();
    
    res.jsonp({
        status : "success",
        message : "successfully saved.",
        object : riderResObj
    });
      
});

module.exports = router; 