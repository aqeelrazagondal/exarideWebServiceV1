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
const Shift = require('../models/shift');
const express = require('express');
const http = require('http');
const fs = require('fs');
const logger = require('../startup/logging');
const regCtrl = require('../controller/registrationController');
const LocController = require('../controller/locationController');
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

  logger.info('Ib driver info update route', id);
  const admin = await Admin.findOne({ email: req.body.email });
  if (!admin) return res.status(400).jsonp({ status: 'failure', message: 'Admin not found by given Email.', object: [] }); 
  logger.info('Admin found', admin.name);

  const driverQuery = req.params.id;
  const driver = await Driver.findOne({ _id: driverQuery });
  if(!driver) return res.status(400).jsonp({ status: 'failure', message: 'driver not found by given ID.', object: [] });
  logger.info('In update driver info route', driver._userId);

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
  let listofDrivers = [];
  let driverResponseObject;

  const driver = await Driver.find({});
  for(var i = 0; i< driver.length; i++){
    console.log(driver[i]._userId);
    const user = await User.findOne({ _id: driver[i]._userId });
    // if(!user) return res.status(400).jsonp({ status: 'failure', messgae: 'Driver not found by given ID.', object: [] });
    if(user){
      driverResponseObject = {
        _id: driver[i]._id,
        name: user.name,
        email: user.email,
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

module.exports = router; 