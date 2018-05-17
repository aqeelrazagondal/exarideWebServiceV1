const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const joi = require('joi');
//package for making HTTP Request
var request=require("request");
const mongoose = require('mongoose');
const { User } = require('../models/user');
const { Admin } = require('../models/admin');
const { Driver } = require('../models/driver');
const express = require('express');
var http = require('http');
var fs = require('fs');
const logger = require('../startup/logging');
const regCtrl = require('../controller/registrationController');
const LocController = require('../controller/locationController');
const router = express.Router();

router.patch('/:id', adminAuth, async (req, res) => {

  const admin = await Admin.findOne({ email: req.body.email });
  if (!admin) return res.status(400).jsonp({ status: 'failure', message: 'Admin not found by given Email.', object: [] }); 
  console.log('Admin found! ', admin);

  const driverQuery = req.params.id;
  const driver = await Driver.findOne({ _id: driverQuery });
  if(!driver) return res.status(400).jsonp({ status: 'failure', message: 'driver not found by given ID.', object: [] });
  console.log('In Driver table UserID', driver._userId);

  let userQuery = driver._userId; 
  const user = await User.findOne({ _id: userQuery });
  user.email = req.body.newEmail;
  user.name = req.body.name;
  user.phone = req.body.phone; 
  await user.save();
 
  if (!user) return res.status(404).send('User not found by the givem ID.');

  res.status(400).jsonp({ status: 'success', message: 'Driver Info Updated.', object: user });
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
  
router.get('/:id', async (req, res) => {
  const query = req.params.id;
  const driver = await Driver.findOne({ _id: query });
  if (!driver) return res.status(404).send('Driver with the given ID was not found.');

  let userQuery = driver._userId; 
  const user = await User.findOne({ _id: userQuery });
  
  res.jsonp({ status: 'Success', message: 'Uerr Found!.', object: user });
});
  
router.get('/', async (req, res) => {
  const driver = await Driver.find({});
  for(var i = 0; i< driver.length; i++){
    console.log(driver[i]._userId);
  }
  res.jsonp({
    driver: driver
  });
});


module.exports = router; 