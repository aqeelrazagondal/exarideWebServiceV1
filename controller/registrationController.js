const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcrypt');
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


module.exports.userExists = function(phoneNo,callback){
    logger.info('UserExists Method Called');
    var query = { phone : phoneNo };
    User.findOne(query).exec(function(err, user){
        if (err){
            logger.error('Some Error while finding user' + err );
            res.status(400).send({status:"failure",
                                  message:err,
                                  object:[]
            });
        }
        else{
            if (user){
                logger.info('User Found with Phone Num. :'+phoneNo);                
                console.log("user found with phone no "+phoneNo);
                callback (user);
            }
            else{
                logger.info('User Not Found with Phone Num. :'+phoneNo);
                console.log("user not found with phone no "+phoneNo);
                callback( user);
            }
       }
     });
    logger.info(' Exit UserExists Method');
}

module.exports.completeProfile = function(user, profilePhotoUrl, res) {
	try{
    console.log("In Controller completeProfile Method");    
    logger.info('RegistrationController.completeProfile called for user  :'  + user.phone  );

		var phoneNo = user.phone;
        var name = user.name;
        var regNo = user.regNo;    
    // update profile    
    
     //find user by phone no.
    userExists(phoneNo,function(user){
        if (user){            
            //update user model
			if (fullName)
				user.name = name;
				user.profile_photo_url= profilePhotoUrl;
				user.active=false;
				user.verified_user=true;  
				user.deactivate_user=false;
                
				user.save(function (err, user){
					if(err){
						logger.error('Some Error while updating user' + err );
							 
					}
					else{
						 logger.info('User updated With Phone Num ' + phoneNo );
									  
						res.jsonp({status:"success",
						message:"Profile Updated!",
						 object:user}); 
					}
              });             
        }
        else{
            logger.info('User Not Found to Update With Phone Num ' + phoneNo );
            res.jsonp({status:"failure",
                            message:"No User Found to Update!",
                            object:[]}); 
        }    
    });
    
    logger.info(' Exit RegistrationController.completeProfile Method');
	}catch (err){
		logger.info('An Exception Has occured in completeProfile method' + err);
	}
}
