const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const _ = require('lodash');
var multer  = require('multer')
var upload = multer({ dest: './public/images/profileImages' });
//package for making HTTP Request
var request=require("request");
//package to generate a random number
var randomize = require('randomatic');
const {User, validate} = require('../models/user');
const { Driver } = require('../models/driver');
const Rider  = require('../models/rider');
const mongoose = require('mongoose');
const express = require('express');
const logger = require('../startup/logging');
const regController = require('../controller/registrationController');

exports.updateUserLocation = function (reqData, res) {
    try {
        var email = reqData.email;
        var longitude = reqData.longitude;
        var latitude = reqData.latitude;
        var userLoc = new Object({ latitude: latitude, longitude: longitude });

        regController.userExists(email, function (user) {
            if (user) {
                user.loc = [longitude, latitude];
                user.last_shared_loc_time = new Date();
                user.save(function (err, user) {
                    if (err) {
                        logger.error('Some Error while updating user' + err);
                    }
                    else {
                        logger.info('User Location With Phone Num ' + email);
                        res.jsonp({
                            status: "success",
                            message: "Location Updated!",
                            object: user
                        });
                    }
                });

                logger.info('location : ' + user.loc);
            }
            else {
                res.jsonp({
                    status: "failure",
                    message: "Failed To update Location!",
                    object: []
                });
            }
        });
    } catch (err) {
        logger.info('An Exception Has occured in updateUserLocation method' + err);
    }
}