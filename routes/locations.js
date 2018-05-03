const Joi = require('joi');
const _ = require('lodash');
const { User } = require('../models/user');
const Location = require('../models/location');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/async');

router.post('/', async (req, res) => {
    let locaResponseObject;
    
    // const { error } = validate(req.body); 
    // if (error) return res.status(400).send(error.details[0].message);

    let location = await Location.findOne({ title: req.body.title });
    if (location) return res.status(400).send('User already registered.');

    location = new Location(_.pick(req.body, ['title', 'loc']));
    await location.save();

    res.send(location);
});

module.exports = router; 
