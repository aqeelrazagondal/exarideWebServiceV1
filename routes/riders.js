const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const _ = require('lodash');
var multer  = require('multer')
var upload = multer({ dest: './public/images/profileImages' });
//package for making HTTP Request
var request=require("request");
const {User, validate} = require('../models/user');
const { Driver } = require('../models/driver');
const Rider  = require('../models/rider');
const logger = require('../startup/logging');
const LocController = require('../controller/locationController');
const chatController = require('../controller/chatController');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const NotificationController=require('../controller/PushNotificationController');

router.get('/', adminAuth, async (req, res) => {
  let listOfRiders = [];
  let ridersResponseObject;

  const riders = await Rider.find({});
  if(!riders) return res.status(400).jsonp({ status: 'failure', messgae: 'riders not found.', object: [] });
  
  for(var i = 0; i< riders.length; i++){
     
    console.log(riders[i]._userId);
    const user = await User.findOne({ _id: riders[i]._userId });
    // if(!user) return res.status(400).jsonp({ status: 'failure', messgae: 'riders not found by given ID.', object: [] });
    if(user){
      ridersResponseObject = {
        _id: riders[i]._id,
       // panic: riders[i].panic,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile_photo_url: user.profile_photo_url,
        loc: user.loc,
        last_shared_loc_time: user.last_shared_loc_time
      }
      listOfRiders.push(ridersResponseObject);
    }
  }

  res.jsonp({
    status: 'success',
    messgae: 'List of Riders',
    object: listOfRiders
  });
  
});
router.post('/pickuplocation', function (req, res) {

    if (req.body === undefined || req.body === null) {
      res.end("Empty Body");
    }
    console.log("in routes /location");
    var reqData = req.body;
    LocController.riderPickUPLocation(reqData, res);

  });

router.post('/alert', function(req, res) {

  if (req.body === undefined || req.body === null) {
    res.send("Empty Body");
  }

  if(req.body.phoneNo === null){
    res.send('Empty PhoneNo');
  }
  console.log("in routes /alert");
  var reqData = req.body;
  chatController.sendAlertToRider(reqData, res);

});

router.post('/alertToDriver', function(req, res) {

  if (req.body === undefined || req.body === null) {
    res.send("Empty Body");
  }
  
  console.log("in routes /alert");
  var reqData = req.body;
  chatController.sendAlertToDriver(reqData, res);

});

router.post('/onesignal', async (req, res) => {                           
		
	if(req.body === undefined||req.body === null) {
    res.end("Empty Body");  
  }
  logger.verbose('onesignal-POST called ');
  
  let phone = req.body.phone;
  let oneSignalId = req.body.oneSignalId;

  const user = await User.findOne({ phone: phone });

  const rider = await Rider.findOne({ _userId: user._id  });
  
  rider.onesignalid = oneSignalId;
  await rider.save();
 
  if (!rider) return res.status(404).send('rider not found by the given ID.');

  res.status(200).jsonp({ status: 'success', message: 'One Signal Id Updated!', object: rider });

});


module.exports = router; 