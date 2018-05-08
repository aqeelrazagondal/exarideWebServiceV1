const auth = require('../middleware/auth');
const config = require('config');
const _ = require('lodash');
const Joi = require('joi');
const { User } = require('../models/user');
const Driver = require('../models/driver');
const Location = require('../models/location');
const Shift = require('../models/shift');
const ShiftRiders = require('../models/shiftRider');
const Rider = require('../models/rider');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    let title = req.body.title; 
    let vehicle = req.body.vehicle;
    let shiftStartTime = req.body.shiftStartTime;
    let shiftEndTime = req.body.shiftEndTime;
    let shiftStatus = req.body.shiftStatus;

    let shift = await Shift.findOne({ title });
    if (shift) return res.status(400).send('Shift already registered.');
    console.log(shift);
  
    let user = await User.findOne({ _id: req.body._driverId });
    if (!user) return res.status(400).send('User Not found.');
    console.log(user._id);

    let startLoc = await Location.findOne({ title: req.body.startLocName });
    if (!startLoc) return res.status(400).send('Start Location not found.');
    console.log('Start Location', startLoc.title);

    let endLoc = await Location.findOne({ title: req.body.endLocName });
    if (!endLoc) return res.status(400).send('End Location not found.');
    console.log('End Location', endLoc.title);
    
    let shiftResObj = new Shift({
        title: title,
        _driverId: user._id,
        driverName: user.name,
        startLocName: startLoc.title,
        endLocName: endLoc.title,
        vehicle: vehicle,
        shiftStartTime: shiftStartTime,
        shiftEndTime: shiftEndTime,
        shiftStatus: shiftStatus
    });

    await shiftResObj.save();
    
    res.jsonp({
        status : "success",
        message : "successfully saved.",
        object : shiftResObj
    });
      
});

router.get('/:Id', async (req, res) => {
    let shiftRiders;
    let riderTempObj;
    let userTempObj;
    let listOfRiders = [];
    let riderResObj;
    let temp= [];

    const shifts = await Shift.find({ _driverId: req.params.Id });
    if (!shifts) return res.status(404).jsonp({ status : "failure", message : "shift cannot fint by the given ID.", object : []});
    // console.log('List of shifts : ', shifts);

    for (var i = 0; i < shifts.length; i++) {
        shiftRiders = await ShiftRiders.find({ _shiftId: shifts[i]._id });
        if (!shiftRiders) return res.status(404).jsonp({ status : "failure", message : "the Rider with the given ID was not found.", object : []});
        // console.log('Rider in shift of given Id ', shiftRiders);

        for(var i = 0; i < shiftRiders.length; i++){
            riderTempObj = await Rider.findOne({ _id: shiftRiders[i]._riderId });
            if(riderTempObj){
                // console.log('Rider table Data ', riderTempObj._userId);
                userTempObj = await User.findOne({ _id: riderTempObj._userId });
                console.log('Rider info from User table  ######## ', userTempObj);

                riderResObj = {
                    profile_photo_url: riderTempObj.profile_photo_url,
                    name: riderTempObj.name
                }
                listOfRiders.push(riderResObj);
                console.log('listOfRiders ********* ' , listOfRiders);
            }
            

            // console.log('riderResObj ', riderResObj);
            // listOfRiders = riderResObj;
        }
        
    }
    // console.log('List of Riders', shiftRiders);

    const shiftResObj = {

    }
    res.jsonp({
        status : "success",
        message : "List of shifts.",
        object : shiftResObj
    });
});


module.exports = router; 