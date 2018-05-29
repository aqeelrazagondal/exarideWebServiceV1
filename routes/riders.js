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

module.exports = router; 