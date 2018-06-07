const auth = require('../middleware/auth');
const config = require('config');
const _ = require('lodash');
const Joi = require('joi');
const { User } = require('../models/user');
const {Driver} = require('../models/driver');
const Location = require('../models/location');
const Shift = require('../models/shift');
const Rider = require('../models/rider');
const ShiftRider = require('../models/shiftRider');
const mongoose = require('mongoose');
const express = require('express');
const logger = require('../startup/logging');
const moment = require('moment');
const router = express.Router();

router.get('/getAllShifts', async (req, res) => {
    let listOfStops = [];
    let listOfShifts =  [];
    let listOfShiftsArray = [];
    let shiftRiderRes;
    let shiftRes;

    // finding shift for against given driver ID 
    const shifts = await Shift.find({}).sort('-date');
    if ( !shifts ) return res.status(404).jsonp({ status : "failure", message : "Shift cannot fint by the given ID.", object : []});
    
    for(var i = 0; i < shifts.length; i++){

        let shiftRider = await ShiftRider.find({_shiftId: shifts[i]._id});
        if(!shiftRider) return res.jsonp({ status: "failure", message: "Failed To finding stops!", object: [] });
        
        for(var j = 0; j < shiftRider.length; j++){
            
            if(shiftRider){
                shiftRiderRes = {
                    _id: shiftRider[j]._id,
                    pickUploc: shiftRider[j].pickUploc
                }
                listOfStops.push(shiftRiderRes);
            }
        }
        let startLoc = await Location.findOne({ _id: shifts[i]._startLocId });
        if(!startLoc) return res.status(404).jsonp({ status : "failure", message : "Location not found by the given ID.", object : []});
    
        let endLoc = await Location.findOne({ _id: shifts[i]._endLocID });
        if(!endLoc) return res.status(404).jsonp({ status : "failure", message : "Location not found by the given ID.", object : []});
        
        console.log('shifts[i]._id', shifts[i]._id);

        shiftRes = {
            id: shifts[i]._id,
            title: shifts[i].title,
            startLoc: startLoc.loc,
            endLoc: endLoc.loc,
            listOfStops: listOfStops
        }
        
        listOfShifts.push(shiftRes);
        listOfStops = [];  
    }

    res.jsonp({
        status : "success",
        message : "List of Shifts.",
        object : listOfShifts
    });
});

router.get('/allShifts', async (req, res) => {
    let listOfStops = [];
    let listOfShifts =  [];
    let listOfShiftsArray = [];
    let shiftRiderRes;
    let shiftRes;
    
    logger.info('In allSHifts method...!');

    // finding shift for against given driver ID 
    const shifts = await Shift.find({}).sort('-date');
    if ( !shifts ) return res.status(404).jsonp({ status : "failure", message : "Shift cannot fint by the given ID.", object : []});
    
    for(var i = 0; i < shifts.length; i++){

        let shiftRider = await ShiftRider.find({_shiftId: shifts[i]._id});
        if(!shiftRider) return res.jsonp({ status: "failure", message: "Failed To finding stops!", object: [] });
        
        for(var j = 0; j < shiftRider.length; j++){
            
            if(shiftRider){
                shiftRiderRes = {
                    _id: shiftRider[j]._id,
                    pickUploc: shiftRider[j].pickUploc
                }
                listOfStops.push(shiftRiderRes);
            }
        }
        let startLoc = await Location.findOne({ _id: shifts[i]._startLocId });
        if(!startLoc) return res.status(404).jsonp({ status : "failure", message : "Location not found by the given ID.", object : []});
    
        let endLoc = await Location.findOne({ _id: shifts[i]._endLocID });
        if(!endLoc) return res.status(404).jsonp({ status : "failure", message : "Location not found by the given ID.", object : []});
    
        shiftRes = {
            title: shifts[i].title,
            startLoc: startLoc.loc,
            endLoc: endLoc.loc,
            shiftStartTime: shifts[i].shiftStartTime,
            shiftEndTime: shifts[i].shiftEndTime,
            listOfStops: listOfStops
        }
        
        listOfShifts.push(shiftRes);
        listOfStops = [];  
    }

    res.jsonp({
        status : "success",
        message : "List of Shifts.",
        object : listOfShifts
    });
});




router.post('/', async (req, res) => {
    logger.info('In ADD shift route ');
    let title = req.body.title; 
    let vehicle = req.body.vehicle;
    let shiftStartTime = req.body.shiftStartTime;
    let shiftEndTime = req.body.shiftEndTime;
    let shiftStatus = req.body.shiftStatus;

    var dateStart = shiftStartTime;
    console.log('dateStart :' +dateStart);

    var dateEnd = shiftEndTime;
    console.log('dateEnd :' +dateEnd);

    // var dateStart = "2018-10-15"+shiftStartTime+"000Z";
    // console.log('date ' +dateStart);

    // var dateEnd = "2018-5-30T"+shiftEndTime+"000Z";
    // console.log('date ' +dateEnd);
    
    // var b = "05 October 2011 "+shiftStartTime+" UTC";
    // var event = new Date(b);
    
    // console.log(event.toString());
    // console.log(event.toISOString());
    

    let shift = await Shift.findOne({ title });
    if (shift)  return res.status(400).jsonp({ status:'failure', message: 'Shift already registered.', object: [] });
    console.log('shift' + shift);
  
    let driver = await Driver.findOne({ _id: req.body._driverId });
    if (!driver) return res.status(400).jsonp({ status:'failure', message: 'Driver not found by given ID.', object: [] });
    console.log('driver ID' + driver._id);

    let startLoc = await Location.findOne({ _id: req.body._startLocId });
    if (!startLoc) return res.status(400).jsonp({ status:'failure', message: 'Start location not found', object: [] });
    console.log('Start Location ' +startLoc);

    let endLoc = await Location.findOne({ _id: req.body._endLocID });
    if (!endLoc)  return res.status(400).jsonp({ status:'failure', message: 'End location not found', object: [] });
    console.log('End Location ' +endLoc);
    

    let shiftResObj = new Shift({
        title: title,
        _driverId: driver._id,
        _startLocId: startLoc._id,
        startLocName: startLoc.title,
        _endLocID: endLoc._id,
        endLocName:  endLoc.title,
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
        shiftRiders = await ShiftRider.find({ _shiftId: shifts[i]._id });
        if ( !shiftRiders ) return res.status(404).jsonp({ status : "failure", message : "The Rider with the given ID was not found.", object : []});
        
        for(var j = 0; j < shiftRiders.length; j++){
            // finding rider with given rider ID 
            
            console.log('pickUpLocName:  ', shiftRiders[j].pickUpLocName);
            console.log('Rider ID:  ', shiftRiders[j]._riderId);
            console.log('_id:  ', shiftRiders[j]._id);
            console.log('createdAt:  ', shiftRiders[j].createdAt);

            riderTempObj = await Rider.findOne({ _id: shiftRiders[j]._riderId });
            console.log('Rider Temp object ', riderTempObj);

            if( riderTempObj ){
                userTempObj = await User.findOne({ _id: riderTempObj._userId });

                if(userTempObj){
                    myDate = shiftRiders[j].pickUpTime
                    let pickUpT = myDate.getTime();
                    console.log('PICK UP TIME', pickUpT);
    
                    myDate1 = new Date(shiftRiders[j].dropOfTime);
                    let dropOfT = myDate1.getTime();
                    console.log('PICK UP TIME', dropOfT);

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
        let shiftEndT = myDate3.getTime();

        const startLocation = await Location.findOne({ _id: shifts[i]._startLocId });
        if(!startLocation) return res.status(404).jsonp({ status : "failure", message : "Start location not found with the given ID.", object : []});
        
        const endLocation = await Location.findOne({ _id: shifts[i]._endLocID });
        if(!endLocation) return res.status(404).jsonp({ status : "failure", message : "End Location not found with the given ID.", object : []});
        shiftResObj = {
            id: shifts[i]._id,
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

router.post('/status', async (req, res) => {

    let shiftID = req.body.shiftID;
    let shiftStatus = req.body.shiftStatus;

    let shift = await Shift.findOne({ _id: shiftID });
    console.log('Found a Shift!', shift);

    shift.shiftStatus = shiftStatus;
    await shift.save();

    res.jsonp({
        status: 'success',
        message: 'shift status updated!',
        object: []
    });

});

module.exports = router; 