const Joi = require('joi');
const _ = require('lodash');
const Route = require('../models/route');
const Location = require('../models/location');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/async');

router.post('/', async (req, res) => {
    let beginLocationId = req.body._beginLocationId;
    let endLocationId = req.body._endLocationId;
    let routeTitle = req.body.routeTitle;


    let route = await Route.findOne({ routeTitle });
    if (route) return res.status(400).send('Route already Added!.');

    route = new Route({
        routeTitle: routeTitle,
        _beginLocationId: beginLocationId,
        _endLocationId: endLocationId
    });

    await route.save();
    res.send(route);
});

router.get('/', async (req, res) => {
    let location = await Location.findById({_id: '5aec0a2ae709f017c012c59b'});
    console.log('location ', location);

    const route = await Route.find();
    if (!route) return res.status(404).send('Routes Not found.');

    // console.log("ROUTE", route)
    res.jsonp({
        status: 'Successful',
        message: 'List of Routes',
        object: route
    });
});

module.exports = router; 