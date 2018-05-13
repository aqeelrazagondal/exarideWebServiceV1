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
const Location = require('../models/location');
const Rider  = require('../models/rider');
const mongoose = require('mongoose');
const express = require('express');
const logger = require('../startup/logging');
const regController = require('../controller/registrationController');

var locationExists = function(id,callback){

    logger.info('markerExists Method Called');
    var query = { _id : id };
    Location.findOne(query).exec(function(err, location){
        if (err){
            logger.error('Some Error while finding Location' + err );
            res.status(400).send({status:"failure", message:err, object:[] });
        }
        else{
            if (location){                
                logger.info('Marker Found with id :'+id);
                callback (location);
            }
            else{                
                 logger.info('Marker Not Found with id :'+id);
                callback( location);                
            }
       }
    });
    
    logger.info(' Exit MarkerExists Method');
}

var userExists = function(phoneNo,callback){
    logger.info('UserExists Method Called');
    var query = { phone: phoneNo };
    User.findOne(query).exec(function(err, phone){
        if (err){
            logger.error('Some Error while finding user' + err );
            res.status(400).send({status:"failure", message:err, object:[] });
        }
        else{
            if (phone){
                console.log('Fpund a user ', phone);
                logger.info('User Found with Phone Num. :'+phone);                
                console.log("user found with phone no "+phone);
                callback (phone);
            }
            else{
                logger.info('User Not Found with Phone Num. :'+phone);
                console.log("user not found with phone no "+phone);
                callback( phone);
            }
       }
     });
    logger.info(' Exit UserExists Method');
}

exports.updateUserLocation = function (reqData, res) {
    try {
        var phone = reqData.phoneNo;
        var longitude = reqData.longitude;
        var latitude = reqData.latitude;
        var userLoc = new Object({ latitude: latitude, longitude: longitude });

        regController.userExists(phone, function (user) {
            if (user) {
                user.loc = [longitude, latitude];
                user.last_shared_loc_time = new Date();
                user.save(function (err, user) {
                    if (err) {
                        logger.error('Some Error while updating user' + err);
                    }
                    else {
                        logger.info('User Location With Phone Num ' + phone);
                        console.log('Save user ###############', user)
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

exports.updateRiderLocation = function (reqData, res) {
    try {
        var phone = reqData.phoneNo;
        var longitude = reqData.longitude;
        var latitude = reqData.latitude;
        var userLoc = new Object({ latitude: latitude, longitude: longitude });

        regController.userExists(phone, function (user) {
            if (user) {
                user.loc = [longitude, latitude];
                user.last_shared_loc_time = new Date();
                user.save(function (err, user) {
                    if (err) {
                        logger.error('Some Error while updating user' + err);
                    }
                    else {
                        logger.info('User Location With Phone Num ' + phone);
                        console.log('Save user ###############', user)
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