const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User, validate} = require('../models/user');
const { Driver } = require('../models/driver');
const Rider  = require('../models/rider');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.jsonp({
    status : "success",
    message : "Profile info.",
    object : user
  });
});

router.post('/register', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['name', 'email', 'password', 'user_type']));

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email', 'user_type']));

  let user_type = req.body.user_type;
  if(user_type === 'driver'){
    console.log('user_type', user_type);

    let newDriver = new Driver({ 
        _userId: user._id,
        name: user.name
    });
    await newDriver.save();
  }
  else if (user_type === "rider"){
    let newRider=new Rider({
      _userId:user._id,
      name: user.name
    });
    await newRider.save();
  }
});

module.exports = router; 
