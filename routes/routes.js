const Joi = require('joi');
const _ = require('lodash');
const Route = require('../models/route');
const Location = require('../models/location');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/async');

router.post('/', async (req, res) => {
    let startLoc;
    let endLoc;
    let title = req.body.title;
    let routeTitle= req.body.routeTitle;

    let location = await Location.find({})
    console.log("Location", location);
    startLoc = location.loc; // lat and lng []


    let route = await Route.findOne({ routeTitle });
    if (route) return res.status(400).send('Route already Added!.');

    // route = new Route({
    //     title: title,
    //     startLoc: startLoc
    // });
    // await route.save();
    // res.send(route);
});

router.get('/', async (req, res) => {
    const route = await Route.find();
    if (!route) return res.status(404).send('Routes Not found.');

    res.jsonp({
        status: 'Successful',
        message: 'List of Routes',
        object: route
    });
});

module.exports = router; 