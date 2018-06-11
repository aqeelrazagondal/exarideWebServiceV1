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
const ShiftRider = require('../models/shiftRider');
const mongoose = require('mongoose');
const geolib = require('geolib');
const express = require('express');
const logger = require('../startup/logging');
const regController = require('../controller/registrationController');

var userExists = function(email, callback){
    logger.info('UserExists Method Called');
    var query = { email };
    User.findOne(query).exec(function(err, email){
        if (err){
            logger.error('Some Error while finding user' + err );
            res.status(400).send({status:"failure", message:err, object:[] });
        }
        else{
            if (email){
                logger.info('User Found with Email. :'+email);                
                console.log("user found with Email. :"+email);
                callback (email);
            }
            else{
                logger.info('User Not Found with Email. :'+email);
                console.log("user not found with EMail. :"+email);
                callback( email);
            }
       }
     });
    logger.info(' Exit UserExists Method');
}
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

exports.updateDriverLocation = function(reqData, res){

    try {
        var email = reqData.email;
        var longitude = reqData.longitude;
        var latitude = reqData.latitude;
        userExists(email, function (user) {
            if (user) {
                
                user.loc = [longitude, latitude];
                user.last_shared_loc_time = new Date();
                user.save(function (err, user) {
                    if (err) {
                        logger.error('Some Error while updating user' + err);
                    }
                    else {
                        logger.info('User Location With email ' + user.email);
                        console.log('USER LOCATION *************** ', user.loc);
                        console.log('user.last_shared_loc_time', user.last_shared_loc_time);
                        console.log('########### FOUND A USER ##########', user);
                        
                        res.jsonp({
                            status: "success",
                            message: "Location Updated!",
                            object: user
                        });
                    }
                });
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
        logger.info('An Exception Has occured in updateDriverLocation method' + err);
    }
    logger.info(' Exit UPDATE DRIVER LOCATION Method');
}

exports.updateRiderLocation = async function (reqData, res) {
    logger.info('updateRiderLocation method called', reqData);
    try {

        let riderRsponseObject;
        let userObj, stopResObj;
        let listOfStops = [];
        let userResObj;
        let listOfDrivers = [];
        let phone = reqData.phoneNo;
        let longitude = reqData.longitude;
        let latitude = reqData.latitude;
        let userLoc = new Object({ latitude: latitude, longitude: longitude }); 

        // finding list of drivers
        let driver = await Driver.find({});
        if(!driver) return res.jsonp({ status: "failure", message: "Failed To update Location!", object: [] });
        // console.log('LIST OF DRIVERS ', driver );
        if(driver){
            for(let i = 0; i < driver.length; i++){
                userObj = await User.find({ _id: driver[i]._userId });
                if(userObj){
                    for(let j = 0; j < userObj.length; j++){
                        userResObj = {
                            _id: driver[i]._id,
                            profile_photo_url: userObj[j].profile_photo_url,
                            loc: userObj[j].loc,
                            name: userObj[j].name
                        }
                        listOfDrivers.push(userResObj);
                    }
                }
            }
        }

        // finding list of stops
        // list of stops
        let shiftRider = await ShiftRider.find({});
        if(!shiftRider) return res.jsonp({ status: "failure", message: "Failed To findind stops!", object: [] });
        if(shiftRider){
            for(let i = 0; i < shiftRider.length; i++){
                console.log('shiftRider[i]._stopId', shiftRider[i]._stopId);
                let pickUp = await Location.findOne({ _id: shiftRider[i]._stopId }); 
                console.log('FIND A PICK UP LOCATION..!!!', pickUp);
                if(pickUp){
    
                    let stopRes = {
                        pickUpID: pickUp._id,
                        pickUpLocName: pickUp.title,
                        pickUploc: pickUp.loc
                    }
                    listOfStops.push(stopRes);
                }    
            }
        }   

        riderRsponseObject = {
            listOfDrivers: listOfDrivers,
            listOfStops: listOfStops
        };
        console.log('Number reqData Entered by Mobile!', reqData.phoneNo);

        const user = await User.findOne({phone: reqData.phoneNo});
        if(!user) return res.jsonp({ status: 'failure', message: 'Rider not found ', object: [] });

        console.log('User found with Phone number !', user.phone);
        if(user){
            user.loc = [longitude, latitude];
            user.last_shared_loc_time = new Date();
            await user.save();

            res.jsonp({
                status: "success",
                message: "Location Updated!",
                object: riderRsponseObject
            });
        }
       
    } catch (err) {
        logger.info('An Exception Has occured in updateRiderLocation method' + err);
    }
}

exports.riderPickUPLocation = async function(reqData, res){
    try {
        let userObj;
        let userResObj;
        let listOfDrivers = [];

        logger.info("IN Riderpickuploaction");
        let phone = reqData.phoneNo;
        let longitude = reqData.longitude;
        let latitude = reqData.latitude;
        let radius = reqData.radius;
 

        let user = await User.findOne({ phone });
        if(!user) return res.jsonp({ status: "failure", message: "Failed To Finding rider!", object: [] });
        console.log('Found a user', user);

        let location = new Location({
            loc: [longitude, latitude],
            radius: radius
        });
        await location.save();
        console.log('Location saved', location);

        let query =  user._id;
        console.log('query', query);

        let rider = await Rider.findOne({ _userId: user._id });
        if(!rider) return res.jsonp({ status: 'failure', message: 'Rider not found by userID', object: [] });

        rider._pickUpLocationId = location._id;
        
        await rider.save();
        console.log('Rider saved!', rider);

        res.jsonp({
            status: "success",
            message: "riderPickUPLocation Updated!",
            object: []
        });
        
    } catch (err) {
        logger.info('An Exception Has occured in RiderPickUpLocation method' + err);
    }
}

