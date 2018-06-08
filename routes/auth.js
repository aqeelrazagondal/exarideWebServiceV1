const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User} = require('../models/user');
const { Driver } = require('../models/driver');
const mongoose = require('mongoose');
const express = require('express');
const logger = require('../startup/logging');
const router = express.Router();
const asyncMiddleware = require('../middleware/async');

router.post('/', async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userResponseObject;

  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email });
  if (!user) return res.status(400).jsonp({ status: 'failure', message: 'Invalid email.' , object: []});
  console.log('found a user', user);

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).jsonp({ status: 'failure', message: 'Invalid Password.' , object: []});

  let driver = await Driver.findOne({ _userId: user._id });
  if(!driver) return res.status(400).jsonp({ status: 'failure', message: 'Driver not found.' , object: []});
  console.log('Driver ', driver)
  driver.active = true;

  userResponseObject = {
    "_id" : driver._id,
    "email" : user.email,
    "userType" : user.user_type,
    "name" : user.name
  };
  
  const token = user.generateAuthToken();
  res.setHeader('x-auth-token', token);
  res.jsonp({
    status : "success",
    message : "successfully Logged In",
    object : userResponseObject
  }); 

});

function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  };
  return Joi.validate(req, schema);
}

module.exports = router; 
