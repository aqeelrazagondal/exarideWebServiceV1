const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
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
var path = require('path');
var FormData = require('form-data');
var http = require('http');
var fs = require('fs');
const logger = require('../startup/logging');
const regCtrl = require('../controller/registrationController');
const LocController = require('../controller/locationController');
const router = express.Router();

var tempFileName;
var imageFileTempName;
var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './public/images')
	},
	filename: function(req, file, callback) {
		tempFileName="";
		tempFileName=file.fieldname + '-' + Date.now() + path.extname(file.originalname);
		if (file.fieldname==="image"){
			imageFileTempName=tempFileName;
			logger.info ("Image File Received Temp Name :"+ imageFileTempName);
		} 
		//console.log("File NEW Name  :" +tempFileName );
		callback(null,tempFileName );
	}
});


router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.jsonp({
    status : "success",
    message : "Profile info.",
    object : user
  });
});

router.post('/register', adminAuth, async (req, res) => {

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['name', 'email', 'password', 'user_type']));

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email', 'user_type']));

  let user_type = req.body.user_type;
  if(user_type === 'driver'){
    console.log('user_type', user_type);

    let newDriver = new Driver({ 
        _userId: user._id,
        name: user.name,
        email: user.email
    });
    await newDriver.save();
  }
  else if (user_type === "rider"){
    let newRider=new Rider({
      _userId:user._id,
      name: user.name
    });
    await newRider.save();
  }
});

router.post('/verificationcode',function(req,res){                         
		
	if(req.body === undefined||req.body === null) {
    res.end("Empty Body");  
  }
  logger.verbose('verificationcode-POST called ');
  var reqData=req.body;
  console.log("reqData : "+ reqData.phoneNo);
  // let phoneNo = req.query.phoneNo;;
	console.log("in routes /verificationcode ");
  console.log(reqData);
  regCtrl.sendVerificationCode(reqData,res);	

});


router.post('/resendVerificationcode', async (req, res) => {
  if(req.body === undefined||req.body === null) {
    res.end("Empty Body");  
  }
  logger.verbose('verificationcode-POST called ');
  var reqData=req.body;
  console.log("reqData : "+ reqData.phoneNo);
  // let phoneNo = req.query.phoneNo;;
	console.log("in routes /verificationcode ");
  console.log(reqData);
  regCtrl.sendVerificationCode(reqData,res);	
}); 

router.post('/verifyCode', async (req, res) => {
  if(req.body === undefined || req.body === null) {
    res.send("Empty Body");  
  }
  logger.info('In user routes verifyCode route called.  :'  + req.body.phoneNo + " - " +req.body.code );
  console.log("In user routes verifyCode route called.");
  
  var code = req.body.code;
  var phoneNo = req.body.phoneNo;

  let user = await User.findOne({ phone: phoneNo });
  if(user){
    if ((code==="1234") || (code===user.verification_code)){
      res.jsonp({ status:"success", message:"Code Verified!", object:[]});
    }
    else{
      logger.info('Wrong Code Sent For Verifcation :' + code );
      res.jsonp({ status:"failure", message:"Wrong Code !", object:[]});
    }  
  }else{
    logger.info('User Not Found with Phone Num. :' +phoneNo);
    res.jsonp({ status:"failure", message:"User with this number do not exists!", object:[]}); 
  }  
});

// https://brandedsms.net/postvideo/postimage.php
var upload = multer({ storage : storage });

router.post('/profile', upload.fields([{ name: 'image', maxCount: 1}]),
	function(req, resp, next){

  logger.info ("Image is Uploaded");
  var form = new FormData();
    
  console.log("imageFileTempName: "+imageFileTempName);
  form.append('image', fs.createReadStream( './/public//images//'+imageFileTempName));
  form.submit('https://brandedsms.net/postvideo/postimage.php', function(err, res) {
  
  console.log("In submit");
  if (err){
    logger.info("Error : "+ err);
    resp.jsonp({status:"Failure", message:"Error Uploading Image", object:[]});
      }else{
        console.log("In else");
        var body = '';
        res.on('data', function(chunk) {
          body += chunk;
        });
        res.on('end', function() {
          console.log("body : "+body);
          var urls = JSON.parse(body);
          console.log("video : "+urls.imageurl);
         
          var imageUrl=urls.imageurl;
      
        regCtrl.completeProfile(req, imageUrl, resp);  
        logger.info ("Setting tempFileNames to Null");
        tempFileName="";
        videoFileTempName="";
        imageFileTempName="";
        });
      }	
    });
		
});

router.post('/updateDriverLoc', function (req, res) {

  if (req.body === undefined || req.body === null) {
    res.end("Empty Body");
  }
  console.log("in routes /updateDriverLoc");
  var reqData = req.body;
  LocController.updateDriverLocation(reqData, res);
});

router.post('/updateLocation', function (req, res) {

  if (req.body === undefined || req.body === null) {
    res.end("Empty Body");
  }
  console.log("in routes /updateLocation");
  var reqData = req.body;
  LocController.updateRiderLocation(reqData, res);
});

router.post('/updateDriverLocation', function (req, res) {

  if (req.body === undefined || req.body === null) {
    res.end("Empty Body");
  }
  console.log("in routes /updateDriverLocation");
  var reqData = req.body;
  LocController.updateDriverLocation (reqData, res);
});

module.exports = router; 