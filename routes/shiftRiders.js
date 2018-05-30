const auth = require('../middleware/auth');
const _ = require('lodash');
const Joi = require('joi');
const { User } = require('../models/user');
const Driver = require('../models/driver');
const Rider = require('../models/rider');
const Location = require('../models/location');
const Shift = require('../models/shift');
const shiftRider = require('../models/shiftRider');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {

    

    let shift = await Shift.findOne({ _id: req.body._shiftId });
    if (!shift) return res.status(400).jsonp({ status: 'failure', message: 'Shift not Found.', object: [] });

    let shiftStartTime = req.body.shiftStartTime;
    let shiftEndTime = req.body.shiftEndTime;

    let stop = await Location.findOne({ _id: req.body._stopId });
    if (!stop) return res.status(400).jsonp({ status: 'failure', message: 'Stop Location not Found By given ID.', object: [] });

    // let shiftRider = await shiftRider.findOne({ pickUploc: stop.loc });
    // if (shiftRider) return res.status(400).jsonp({ status: 'failure', message: 'Stop Location added.', object: [] });
    
    let riderResObj = new shiftRider ({
        
        _shiftId: shift._id,
        _stopId: stop._id
    
    });

    await riderResObj.save();
    
    res.jsonp({
        status : "success",
        message : "successfully stop added!.",
        object : riderResObj
    });
      
});
 
module.exports = router; 