const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const joi = require('joi');
//package for making HTTP Request
const request=require("request");
const mongoose = require('mongoose');
const { User } = require('../models/user');
const { Admin } = require('../models/admin');
const { Driver } = require('../models/driver');
const { OverSpeedAlert } = require('../models/overSpeedAlert');
const Shift = require('../models/shift');
const express = require('express');
const http = require('http');
const fs = require('fs');
const logger = require('../startup/logging');
const regCtrl = require('../controller/registrationController');
const LocController = require('../controller/locationController');
const NotificationController=require('../controller/PushNotificationController');
const router = express.Router();

// search by BUS name, and route/shift name 
router.get('/search/:key', async (req, res) => {
  logger.info('IN Search Route!..');
  
  const name = req.params.key;
  const title = req.params.key;
  logger.info('Search name is!..', name);
  logger.info('Search Title is!..', title);
  const user = await User.findOne({name: new RegExp('.*'+name+'.*', "i")});
  console.log('Found a user ', user);

  const shift = await Shift.findOne({ title: new RegExp('.*'+title+'.*', "i") });  
  console.log('found a shift', shift);

  if(user){
    res.jsonp({
      status: 'success',
      messgae: 'Found a Driver',
      object: user
    });
  }
  else if(shift){
    res.jsonp({
      status: 'success',
      messgae: 'Found a Shift',
      object: shift
    });
  }else {
    res.jsonp({ status: 'Failure', messgae: 'Not FOund.!', object: [] });
  }

 
});

router.patch('/:id', adminAuth, async (req, res) => {

  const driverQuery = req.params.id;
  const driver = await Driver.findOne({ _id: driverQuery });
  if(!driver) return res.status(400).jsonp({ status: 'failure', message: 'driver not found by given ID.', object: [] });
  logger.info('In update driver info route');

  let userQuery = driver._userId; 
  console.log('userQuery', userQuery);

  const user = await User.findOne({ _id: userQuery });
  user.email = req.body.email;
  user.name = req.body.name;
  user.phone = req.body.phone; 
  await user.save();
 
  if (!user) return res.status(404).send('User not found by the givem ID.');

  res.status(200).jsonp({ status: 'success', message: 'Driver Info Updated.', object: user });
});
  
router.delete('/:id', adminAuth, async (req, res) => {
  const query = req.params.id;
  const driver = await Driver.findByIdAndRemove({ _id: query });
  if(!driver)  return res.status(400).jsonp({ status: 'failure', message: 'Driver not found by given ID.', object: [] });

  const userQuery = driver._userId;
  const user = await User.findByIdAndRemove({ _id: userQuery });
  if(!user) return res.status(400).jsonp({ status: 'failure', message: 'User not found by User ID.', object: [] });
  
  res.jsonp({ status: 'Success', message: 'User Deleted!.', object: user });
});
  
router.get('/:id', adminAuth, async (req, res) => {
  const query = req.params.id;
  const driver = await Driver.findOne({ _id: query });
  if (!driver) return res.status(404).send('Driver with the given ID was not found.');

  let userQuery = driver._userId; 
  const user = await User.findOne({ _id: userQuery });
  
  res.jsonp({ status: 'Success', message: 'User Found!.', object: user });
});
  
router.get('/', adminAuth, async (req, res) => {
  let listofDrivers = [];
  let driverResponseObject;

  const driver = await Driver.find({});
  if(!driver) return res.status(400).jsonp({ status: 'failure', messgae: 'Driver not found.', object: [] });
  
  for(var i = 0; i< driver.length; i++){
     
    console.log(driver[i]._userId);
    const user = await User.findOne({ _id: driver[i]._userId });
    // if(!user) return res.status(400).jsonp({ status: 'failure', messgae: 'Driver not found by given ID.', object: [] });
    if(user){
      driverResponseObject = {
        _id: driver[i]._id,
        panic: driver[i].panic,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile_photo_url: user.profile_photo_url,
        loc: user.loc,
        last_shared_loc_time: user.last_shared_loc_time
      }
      listofDrivers.push(driverResponseObject);
    }
  }

  res.jsonp({
    status: 'success',
    messgae: 'List of Drivers',
    object: listofDrivers
  });
  
});

router.post('/panic', async (req, res) => {                           
		
	if(req.body === undefined||req.body === null) {
    res.end("Empty Body");  
  }
  logger.verbose('panic-POST called ');
  //Test Purpose


  let driverId = req.body.id;
  let panicFlag = req.body.panic;

  const driver = await Driver.findOne({ _id: driverId });
  driver.panic = panicFlag;
  
  // var message ="Message From QAU SERVER";	
   
  // logger.info('Sending Notification of closed Group to player id ' +driver.onesignalid);
  // if (driver.onesignalid){
  //   NotificationController.sendNotifcationToPlayerId(driver.onesignalid,message);

  // }
  
  await driver.save();
 
  if (!driver) return res.status(404).send('Driver not found by the given ID.');

  res.status(200).jsonp({ status: 'success', message: 'Driver Info Updated.', object: driver });

});

router.post('/onesignal', async (req, res) => {                           
		
	if(req.body === undefined||req.body === null) {
    res.end("Empty Body");  
  }
  logger.verbose('onesignal-POST called ');
  
  let driverId = req.body.id;
  let oneSignalId = req.body.oneSignalId;

  const driver = await Driver.findOne({ _id: driverId });
  driver.onesignalid = oneSignalId;
  await driver.save();
 
  if (!driver) return res.status(404).send('Driver not found by the given ID.');

  res.status(200).jsonp({ status: 'success', message: 'One Signal Id Updated!', object: driver });

});

router.post('/overSpeedingAlert', async (req, res) => {                           
		
	if(req.body === undefined||req.body === null) {
    res.end("Empty Body");  
  }
  logger.verbose('overSpeedingAlert-POST called ');
  
  let driverId = req.body.id;
  let speed = req.body.speed;


  const driver = await Driver.findOne({_id:driverId});
  
   newOverSpeedAlert = new OverSpeedAlert({ 
   _driverId: driverId,
  //  msg:'',
   speed: speed    
  });
  await newOverSpeedAlert.save();

  //Sending Sms To Admin
  const admin = await Admin.find({});
  if (admin){

    let adminMessage="Attention Please! Driver  ";
  if (driver){
    adminMessage = adminMessage+ driver.name +"is driving  buss at Speed :" + speed + "KM/H" ;
  }
  console.log('ADMIN MESSAGE!! ', adminMessage);   
  
  var headers = {

      'Authorization':       'Basic ZmFsY29uLmV5ZTowMzM1NDc3OTU0NA==',
      'Content-Type':     'application/json',
      'Accept':       'application/json'
  }

  // Configure the request
  var options = {
      url: 'http://107.20.199.106/sms/1/text/single',
      method: 'POST',
      headers: headers,

      json: {
          'from': 'BMS',
          'to': admin.phone,
          'text': adminMessage
      }
  }

  // Start the request
  request(options, function (error, response, body) {
      if (!error ) {
          // Print out the response body
          console.log(body)
          logger.info('Sucessful Response of SMS API : ' + body );
      }
      else{
          logger.info('Response/Error of SMS API : ' + error );
      }
  });
  }
  

  if (!newOverSpeedAlert) return res.status(404).send('There was some error in sending Alert To Admin');

  res.status(200).jsonp({ status: 'success', message: 'Overspeeding Alert Sent To Admin.', object: newOverSpeedAlert });

});

router.get('/speedLimit', async (req, res) => {

  
  const admin = await Admin.find({});
  if (admin){
    let obj = {
      speedLimit:admin[0].speedLimit
    }
  }
 
  if (!admin) return res.status(404).send('Can not Find Speed Limit');
  res.jsonp({ status: 'Success', message: 'Speed Limit.', object: obj });
});
  

module.exports = router; 