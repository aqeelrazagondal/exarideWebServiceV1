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

    // let location = await Location.findOne({ title: req.body.title });
    // if (location) return res.status(400).send('Location already registered.');

    location = new Location(_.pick(req.body, ['title', 'loc','radius','adminFence']));
    await location.save();

    res.status(200).jsonp({
        status: 'success',
        message: 'Location saved successfully!',
        object: location
    });
});

router.get('/fence', async (req, res) => {

    const fences = await Location.find({adminFence: true});
    if (!fences) return res.status(404).send('Fences Not found.');


    res.status(200).jsonp({
        status: 'success',
        message: 'List of Fences!',
        object: fences
    });
});
module.exports = router; 
