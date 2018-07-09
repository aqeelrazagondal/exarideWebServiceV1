const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
//package for making HTTP Request
var request=require("request");
const mongoose = require('mongoose');
const express = require('express');
const { Admin } = require('../models/admin');
const { Shared } = require('../models/shared');
var http = require('http');
var fs = require('fs');
const logger = require('../startup/logging');
const regCtrl = require('../controller/registrationController');
const LocController = require('../controller/locationController');
const chatController = require('../controller/chatController');
const router = express.Router();

router.post('/register', async (req, res) => {                         
    
    let user_type = 'admin';
    let admin = await Admin.findOne({ email: req.body.email });
    if (admin) return res.status(400).send('Admin already registered.');

    admin = new Admin(_.pick(req.body, ['name', 'email', 'password', 'phone']));
    let shared = new Shared({speedLimit:50.0});
    await shared.save();
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(admin.password, salt);
    await admin.save();

    const token = admin.generateAuthToken();
    res.header('x-auth-token', token);
    res.jsonp({
      status: 'success',
      message: 'successfully admin created ',
      object: admin    
    });
});

router.post('/login', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let adminResObj;
  
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
  
    let admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).send('Invalid email.');
  
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) return res.status(400).send('Invalid password.');
  
    admin.active = true;
  
    adminResObj = {
      "_id" : admin._id,
      "email" : admin.email,
      "userType" : admin.user_type
    };
    
    if(admin && validPassword){
      const token = admin.generateAuthToken();
      res.setHeader('x-auth-token', token);
      res.jsonp({
        status : "success",
        message : "successfully Logged In",
        object : adminResObj
      });
    }  
    
});

router.post('/sendSmsToAllDrivers', adminAuth, function (req, res) {

  if (req.body === undefined || req.body === null) {
    res.end("Empty Body");
  }
  console.log("in routes /sendSmsToAllDrivers");
  var reqData = req.body;
  chatController.sendMessageToDriver(reqData, res);
});


function validate(req) {
    const schema = {
      email: Joi.string().min(5).max(255).required().email(),
      password: Joi.string().min(5).max(255).required()
    };
    return Joi.validate(req, schema);
}


module.exports = router; 