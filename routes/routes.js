const Joi = require('joi');
const _ = require('lodash');
const Location = require('../models/location');
const Route = require('../models/route');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middleware/async');

router.post('/', async (req, res) => {
    let routeResponseObject;
    let routeTitle = req.body.routeTitle;
    let _beginLocationId = req.body._beginLocationId;
    let _endLocationId = req.body._endLocationId;

    let route = await Route.findOne({ routeTitle });
    if (route) return res.status(400).send('Route already Added!.');

    // let location = await Location.findOne({ _id: _beginLocationId });

    route = new Route(_.pick(req.body, ['routeTitle', '_beginLocationId', '_endLocationId']));
    await route.save();

    res.send(route);
});

module.exports = router; 