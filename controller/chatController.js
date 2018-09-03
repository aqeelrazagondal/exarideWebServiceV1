//package for making HTTP Request
var request = require("request");
const { User } = require('../models/user');
const { Driver } = require('../models/driver');
const Rider  = require('../models/rider');
const Admin = require('../models/admin');
const mongoose = require('mongoose');
const express = require('express');
const logger = require('../startup/logging');
const NotificationController=require('./PushNotificationController');

var http = require('http');
var urlencode = require('urlencode');

exports.sendMessageToDriver = async function(reqData,res){
    
    try{        
        logger.info('ChatController.sendMessageToDriver called  :');
        const message = reqData.message;

        const driver = await Driver.find({});
        if(!driver) return res.jsonp({ status: 'failure', message: 'Driver not found.', object: []});
        // console.log('DRIVERS LIST ******** ', driver);
        if(driver){
            for(let i = 0; i < driver.length; i++){
            
                console.log('USER ID !!!!', driver[i]._userId );
                const user = await User.findOne({ _id: driver[i]._userId });
                if( !user ) res.jsonp({ status: 'failure', message: 'user not found', object: [] });
                console.log('USERS PHONE NUMBER FOUND', user.phone);
                
                if(user.phone){
                    
                    let adminMessage;
                    adminMessage = "QAU Smart Ride Admin message : " + message;
                    console.log('ADMIN MESSAGE!! ', adminMessage);   
        
                    user.message = message;
                    user.save();
        
                    console.log('Saved message', user.message);
                    
                    // var headers = {
        
                    //     'Authorization':       'Basic ZmFsY29uLmV5ZTowMzM1NDc3OTU0NA==',
                    //     'Content-Type':     'application/json',
                    //     'Accept':       'application/json'
                    // }
        
                    // Configure the request
                    // var options = {
                    //     // url: 'http://107.20.199.106/sms/1/text/single',
                    //     url: 'http://sms.brandedsms.net//api/sms-api.php?username=omer&password=omer&phone='
                    //             +user.phone+'&sender=Step&message='+adminMessage,
                    //     method: 'GET',
                    //     // headers: headers,
                 
                    //     // json: {
                    //     //     'from': 'SmartRide',
                    //     //     'to': user.phone,
                    //     //     'text': adminMessage
                    //     // }
                    // }
        
                    // // Start the request
                    // request(options, function (error, response, body) {
                    //     if (!error ) {
                    //         // Print out the response body
                    //         console.log(body)
                    //         logger.info('Sucessful Response of SMS API : ' + body );
                    //     }
                    //     else{
                    //         logger.info('Response/Error of SMS API : ' + error );
                    //     }
                    // });

                var msg = urlencode(adminMessage);
                var toNumber = user.phone;
                var username = 'khansaifullah1993@gmail.com';
                var hash = '46091d672420ae34c55d0619af751550d06da52860717b031be7ca12d8c68856'; // The hash key could be found under Help->All Documentation->Your hash key. Alternatively you can use your Textlocal password in plain text.
                var sender = 'QAURide';
                var data = 'username=' + username + '&hash=' + hash + '&sender=' + sender + '&numbers=' + toNumber + '&message=' + msg;
                var options = {
                host: 'api.txtlocal.com', path: '/send?' + data
                };
                callback = function (response) {
                var str = '';//another chunk of data has been recieved, so append it to `str`
                response.on('data', function (chunk) {
                    str += chunk;
                });//the whole response has been recieved, so we just print it out here
                response.on('end', function () {
                    console.log(str);
                });
                }//console.log('hello js'))
                http.request(options, callback).end();//url encode instalation need to use $ npm install urlencode
                
                
                    
                    logger.info('User Found with mobile number ' + user.phone );
            }
        }
    }
       
    res.jsonp({ status:"success", message:"Message sent!", object:[] });	  
    logger.info(' Exit chatController.sendMessageToDriver Method');
    }catch (err){
		logger.info('An Exception Has occured in sendMessageToDriver method' + err);
	}
}

exports.sendAlertToRider = async function(reqData,res){
    
    try{
        let alert = reqData.alert;         
        logger.info('ChatController.sendAlertToRider called - phone :  ' + reqData.phoneNo + 'alert : '+  reqData.alert );
        const user = await User.findOne({ phone: reqData.phoneNo });
        if(!user) return res.jsonp({ status: 'failure', message: 'Rider not found', object: [] });

        user.alert = alert;
        await user.save();
        logger.info('user alert ' + user.alert);
        res.jsonp({ status:"success", message:"Alert Set!", object:[] });	  
        logger.info(' Exit chatController.sendAlertToRider Method');
    
    }catch (err){
		logger.info('An Exception Has occured in sendAlertToRider method' + err);
	}
}

exports.sendAlertToDriver = async function(reqData,res){
    
    try{
        const message = reqData.message;
        let id = reqData._driverId;         
        logger.info('ChatController.sendAlertToDriver called  :');
        
        const driver = await Driver.findOne({ _id: id });
        if(!driver) return res.jsonp({ status: 'failure', message: 'Driver not found', object: [] });
        console.log('Found a driver', driver);
  
        // var message ="Message From QAU SERVER";	
        
        logger.info('Sending Notification of to driver  to onesignal id ' +driver.onesignalid);
        if (driver.onesignalid){
            NotificationController.sendNotifcationToPlayerId(driver.onesignalid,message);
        }

        // const user = await User.findOne({ _id: driver._userId });
        // if(!user) return res.jsonp({ status: 'failure', message: 'User not found by given ID.', object: [] });
        // console.log('Found a User', user);

        // if(user.phone){
                    
        //     let adminMessage;
        //     adminMessage = "Admin message for BMS Application : " + message;
        //     console.log('ADMIN MESSAGE!! ', adminMessage);   

        //     user.message = message;
        //     await user.save();

        //     console.log('Saved message', user.message);
            
            // var headers = {

            //     'Authorization':       'Basic ZmFsY29uLmV5ZTowMzM1NDc3OTU0NA==',
            //     'Content-Type':     'application/json',
            //     'Accept':       'application/json'
            // }

            // Configure the request
            // var options = {
            //     url: 'http://107.20.199.106/sms/1/text/single',
            //     method: 'POST',
            //     headers: headers,
         
            //     json: {
            //         'from': 'BMS',
            //         'to': user.phone,
            //         'text': adminMessage
            //     }
            // }

            // Start the request
            // request(options, function (error, response, body) {
            //     if (!error ) {
            //         // Print out the response body
            //         console.log(body)
            //         logger.info('Sucessful Response of SMS API : ' + body );
            //     }
            //     else{
            //         logger.info('Response/Error of SMS API : ' + error );
            //     }
            // });
            
           // logger.info('User Found with mobile number ' + user.phone );

        res.jsonp({ status:"success", message:"Alert Sent to Driver!", object:[] });	  
        logger.info(' Exit chatController.sendAlertToRider Method');
    
    //}
    }catch (err){
		logger.info('An Exception Has occured in sendAlertToRider method' + err);
	}
}