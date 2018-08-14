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

router.delete('/:id', async (req, res) => {
    const query = req.params.id;
    const location = await Location.findByIdAndRemove({ _id: query });
    if(!location)  return res.status(400).jsonp({ status: 'failure', message: 'location not found by given ID.', object: [] });

    res.jsonp({ status: 'Success', message: 'Location Deleted!.', object: [] });
  });

  router.patch('/:id', async (req, res) => {

    const query = req.params.id;
    const location = await Location.findOne({ _id: query });
    if(!location) return res.status(400).jsonp({ status: 'failure', message: 'location not found by given ID.', object: [] });
    logger.info('In update location info route');
    location
    location.title = req.body.title;
    location.radius = req.body.radius;
    await location.save();
  
    res.status(200).jsonp({ status: 'success', message: 'Location Info Updated.', object: location });
  });
module.exports = router; 
