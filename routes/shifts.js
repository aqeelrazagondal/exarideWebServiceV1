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

router.get('/:Id', auth, async (req, res) => {
    let shiftRiders;
    let riderTempObj;
    let userTempObj;
    let listOfRiders = [];
    let riderResObj;
    let temp= [];
    let shiftResObj;
    let listOfShiftRes = [];
    let myDate;
    let myDate1;

    const shifts = await Shift.find({ _driverId: req.params.Id });
    if ( !shifts ) return res.status(404).jsonp({ status : "failure", message : "Shift cannot fint by the given ID.", object : []});

    for (var i = 0; i < shifts.length; i++) {
        
        shiftRiders = await ShiftRiders.find({ _shiftId: shifts[i]._id });
        if ( !shiftRiders ) return res.status(404).jsonp({ status : "failure", message : "The Rider with the given ID was not found.", object : []});
        
        for(var j = 0; j < shiftRiders.length; j++){
            riderTempObj = await Rider.findOne({ _id: shiftRiders[j]._riderId });
            
            if( riderTempObj ){
                userTempObj = await User.findOne({ _id: riderTempObj._userId });

                myDate = new Date(shiftRiders[j].pickUpTime);
                pickUpT = myDate.getTime();

                myDate1 = new Date(shiftRiders[j].dropOfTime);
                dropOfT = myDate.getTime();
                
                riderResObj = {
                    profile_photo_url: userTempObj.profile_photo_url,
                    name: riderTempObj.name,
                    pickUploc: shiftRiders[j].pickUploc,
                    dropOfLoc: shiftRiders[j].dropOfLoc,
                    pickUpTime: pickUpT,
                    dropOfTime: dropOfT
                }
                listOfRiders.push( riderResObj );
            }
        }

        shiftResObj = {
            title: shifts[i].title,
            startLocName: shifts[i].startLocName,
            endLocName: shifts[i].endLocName,
            vehicle: shifts[i].vehicle,
            shiftStartTime: shifts[i].shiftStartTime,
            shiftEndTime: shifts[i].shiftEndTime,
            listofRiders: listOfRiders
        }
        listOfShiftRes.push( shiftResObj );
        listOfRiders = [];
    }
    
    res.jsonp({
        status : "success",
        message : "List of Shifts.",
        object : listOfShiftRes
    });
});


module.exports = router; 