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
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.post('/pickuplocation', function (req, res) {

    if (req.body === undefined || req.body === null) {
      res.end("Empty Body");
    }
    console.log("in routes /location");
    var reqData = req.body;
    // console.log(reqData);
    LocController.riderPickUPLocation(reqData, res);
});

module.exports = router; 