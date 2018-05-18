const auth = require('../middleware/auth');
const config = require('config');
const _ = require('lodash');
const Joi = require('joi');
const { User } = require('../models/user');
const {Driver} = require('../models/driver');
const Location = require('../models/location');
const Shift = require('../models/shift');
const ShiftRiders = require('../models/shiftRider');
const Rider = require('../models/rider');
const mongoose = require('mongoose');
const express = require('express');
const logger = require('../startup/logging');
const router = express.Router();

router.get('/getAllShifts', async (req, res) => {
    logger.info('IN GET ALL SHIFTS ROUTE!');
    let shiftResObj;
    let lisOfShifts = [];

    const shifts = await Shift.find({});
    if(!shifts) return res.status(400).jsonp({ status:'failure', message: 'Shifts not found', object: [] });
    console.log('Shifts Found', shifts);

    for(var i = 0; i < shifts.length; i++){
        logger.info(shifts[i].startLocName);
        const locationStart = await Location.findOne({ title: shifts[i].startLocName });
        if(!locationStart) return res.status(400).jsonp({ status:'failure', message: 'Start location not found', object: [] });
        logger.info('Start location', locationStart.loc);

        const locationEnd = await Location.findOne({ title: shifts[i].endLocName })
        if(!locationEnd) return res.status(400).jsonp({ status:'failure', message: 'End location not found', object: [] });
        logger.info('End Location ', locationEnd.loc);

        shiftResObj = {
            title: shifts[i].title,
            startLocName: shifts[i].startLocName,
            startLocLatLng: locationStart.loc,
            endLocName: shifts[i].endLocName,
            endLocLatLng: locationEnd.loc,
            shiftStatus: shifts[i].shiftStatus
        }
        lisOfShifts.push(shiftResObj);
    }
    
    res.jsonp({
        status : "success",
        message : "List of Shifts.",
        object : lisOfShifts
    });
});


router.post('/', async (req, res) => {
    logger.info('In POST shift route ');
    let title = req.body.title; 
    let vehicle = req.body.vehicle;
    let shiftStartTime = req.body.shiftStartTime;
    let shiftEndTime = req.body.shiftEndTime;
    let shiftStatus = req.body.shiftStatus;

    let shift = await Shift.findOne({ title });
    if (shift)  return res.status(400).jsonp({ status:'failure', message: 'Shift already registered.', object: [] });
    console.log(shift);
  
    let driver = await Driver.findOne({ _id: req.body._driverId });
    if (!driver) return res.status(400).jsonp({ status:'failure', message: 'Driver not found by given ID.', object: [] });
    console.log(driver._id);

    let startLoc = await Location.findOne({ title: req.body.startLocName });
    if (!startLoc) return res.status(400).jsonp({ status:'failure', message: 'Start location not found', object: [] });
    console.log('Start Location', startLoc.title);

    let endLoc = await Location.findOne({ title: req.body.endLocName });
    if (!endLoc)  return res.status(400).jsonp({ status:'failure', message: 'End location not found', object: [] });
    console.log('End Location', endLoc.title);
    
    let shiftResObj = new Shift({
        title: title,
        _driverId: driver._id,
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
    logger.info('IN SHFTS ROUTES, shifts are find by Driver ID. ', req.params.id)
    let shiftRiders;
    let riderTempObj;
    let userTempObj;
    let listOfRiders = [];
    let riderResObj;
    let temp= [];
    let shiftResObj;
    let listOfShiftRes = [];
    let userObj;
    let myDate, myDate1, myDate2, myDate3;

    let driver = await Driver.findOne({ _id: req.params.Id });
    if(!driver) return res.status(404).jsonp({ status : "failure", message : "Something wrong! Driver cannot found.", object : []});

    // finding shift for against given driver ID 
    const shifts = await Shift.find({ _driverId: req.params.Id }).sort('-date');
    if ( !shifts ) return res.status(404).jsonp({ status : "failure", message : "Shift cannot fint by the given ID.", object : []});
    console.log('List of shifts', shifts);

    for (var i = 0; i < shifts.length; i++) {
        
        // finding list of riders in shiftriders table
        shiftRiders = await ShiftRiders.find({ _shiftId: shifts[i]._id });
        if ( !shiftRiders ) return res.status(404).jsonp({ status : "failure", message : "The Rider with the given ID was not found.", object : []});
        
        for(var j = 0; j < shiftRiders.length; j++){
            // finding rider with given rider ID 
            riderTempObj = await Rider.findOne({ _id: shiftRiders[j]._riderId });
            console.log('Rider response object ', riderResObj);

            if( riderTempObj ){
                userTempObj = await User.findOne({ _id: riderTempObj._userId });

                if(userTempObj){
                    myDate = new Date(shiftRiders[j].pickUpTime);
                    let pickUpT = myDate.getTime();
    
                    myDate1 = new Date(shiftRiders[j].dropOfTime);
                    let dropOfT = myDate1.getTime();
                    
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

        }
        myDate2 = new Date(shifts[i].shiftEndTime);
        let shiftStartT = myDate2.getTime();

        myDate3 = new Date(shifts[i].shiftStartTime);
        let shiftEndT = myDate2.getTime();

        const startLocation = await Location.findOne({ title: shifts[i].startLocName });
        const endLocation = await Location.findOne({ title: shifts[i].endLocName });

        shiftResObj = {
            title: shifts[i].title,
            startLoc: startLocation.loc,
            endLoc: endLocation.loc,
            vehicle: shifts[i].vehicle,
            shiftStartTime: shiftStartT,
            shiftEndTime: shiftEndT,
            listofRiders: listOfRiders
        }
        listOfShiftRes.push( shiftResObj );
        listOfRiders = [];
    }
    logger.info('Final shifts response by driver ID.');
    
    res.jsonp({
        status : "success",
        message : "List of Shifts.",
        object : listOfShiftRes
    });
});

module.exports = router; 