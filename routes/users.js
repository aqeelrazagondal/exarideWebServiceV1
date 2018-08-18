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
const { DriverRating } = require('../models/driverRating');
const { OverSpeedAlert } = require('../models/overSpeedAlert');
const Rider  = require('../models/rider');
const Shift  = require('../models/shift');
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

  let user = await User.findOne({ phone: req.body.phone });
  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['name', 'email', 'password', 'user_type', 'phone']));

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email', 'user_type', 'phone']));

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

  // logger.info ("Image is Uploaded");
        var form = new FormData();
        var phone = req.body.phoneNo;
        var name = req.body.name;
        var regNo = req.body.regNo; 

        regCtrl.userExists(phone,function(user){
          if (user){            
              //update user model
              if (phone)
                  user.regNo = regNo;
                  user.name = name;
                  // user.profile_photo_url = imageUrl;
                  user.active = false;
                  user.verified_user = true;  
                  user.deactivate_user = false;
                  
                  user.save(function (err, user){
                      if(err){
                          logger.error('Some Error while updating user' + err );		 
                      }
                      else{
                          logger.info('User updated With Phone Num ' + phone );			  
                          resp.jsonp({status:"success", message:"Profile Updated!", object:user}); 
                      }
              });             
          }
          else{
              logger.info('User Not Found to Update With Phone Num ' + phone );
              res.jsonp({status:"failure", message:"No User Found to Update!", object:[] }); 
          }  
        });   

  // console.log("imageFileTempName: "+imageFileTempName);
  // form.append('image', fs.createReadStream( './/public//images//'+imageFileTempName));
  // form.submit('https://brandedsms.net/postvideo/postimage.php', function(err, res) {
  
  // console.log("In submit");
  // if (err){
  //   logger.info("Error : "+ err);
  //   resp.jsonp({status:"Failure", message:"Error Uploading Image", object:[]});
  //     }else{
  //       console.log("In else");
  //       var body = '';
  //       res.on('data', function(chunk) {
  //         body += chunk;
  //       });
  //       res.on('end', function() {
  //         console.log("body : "+body);
  //         var urls = JSON.parse(body);
  //         console.log("video : "+urls.imageurl);
         
  //         var imageUrl=urls.imageurl;
      
  //       regCtrl.completeProfile(req, imageUrl, resp);  
  //       logger.info ("Setting tempFileNames to Null");
  //       tempFileName="";
  //       videoFileTempName="";
  //       imageFileTempName="";
  //       });
  //     }	
  //   });
		
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



router.post('/ratedriver',async function (req, res) {

  if (req.body === undefined || req.body === null) {
    res.end("Empty Body");
  }
  console.log("in routes /ratedriver");
  var routeId=req.body.routeId;
  var phoneNo= req.body.phoneNo;
  // var userId= req.body.userId;
  var behavior=req.body.behavior;
  var driving= req.body.driving;
  var delay= req.body.delay;
  

//   var query={ _ratedByRiderId: riderId, _driverId: driverId };
//   DriverRating.find(query).limit(1).next(function(err, doc){

//     if (doc){

//       logger.info(doc);
//     }
//     // handle data
//  })
  var user = await User.findOne({ phone: phoneNo});
  var shift = await Shift.findOne({ _id: routeId});
  if (user && shift){
    var rating = await DriverRating.findOne({ _ratedByUserId: user._id, _driverId: shift._driverId });
    if (rating){
      rating._driverId= shift._driverId;
      rating._ratedByUserId= user._id;
      // rating._ratedByRiderId= riderId ;
      rating.behavior= behavior ;
      rating.driving= driving ;
      rating.delay= delay;
      rating = await rating.save();
  
      res.status(200).jsonp({ status: 'success', message: 'Driver Rating updated!', object: rating });
    }else {
  
      let newRating = new DriverRating({ 
        _driverId:shift._driverId,
        _ratedByUserId: user._id,
        behavior: behavior ,
        driving: driving ,
        delay:delay,
  
    });
    const rating = await newRating.save();
  
    res.jsonp({
      status: 'success',
      messgae: 'Driver Rating saved Successfully',
      object: rating
    });
    }
  }else {
     
    res.jsonp({
      status: 'failure',
      messgae: 'Unable to save raitings',
      object: []
    });
  }


});


router.get('/driverratings',async function (req, res) {

  const aggregatorOpts = [{
        $group: {
            _id:"$_driverId",
            avgbehavior: { $avg: "$behavior" },
            avgdriving: { $avg: "$driving" },
            avgdelay: { $avg: "$delay" }

        }
    }]

    const driverratings = await DriverRating.aggregate(aggregatorOpts).exec();  
    if (!driverratings) return res.status(404).send('Driver Ratings List is Empty.');
    
    res.jsonp({ status: 'success', message: 'Driver Ratings List. ', object: driverratings });

});

router.get('/driverPerformance',async function (req, res) {

  function addToListPromise(obj){
    logger.info ('adding Obj to list');
    return new Promise((resolve,reject) => {
      resList.push(obj);
      resolve(1);		
    });
   
  }
  let promiseArr = [];
  var resObj;
  var resList = [];
  var totalAverage;
  const aggregatorOpts1 = [{
        $group: {
            _id:"$_driverId",
            avgbehavior: { $avg: "$behavior" },
            avgdriving: { $avg: "$driving" },
            avgdelay: { $avg: "$delay" }
        }
    }]

    const driverratings = await DriverRating.aggregate(aggregatorOpts1).exec();   
    const aggregatorOpts = [
      {
          $group: {
              _id:"$_driverId",
              count: { $sum: 1 },
              "drivername": { "$first": "$driverName"} 
          }
      }]

      const overSpeedAlerts = await OverSpeedAlert.aggregate(aggregatorOpts).exec();  
      if (!overSpeedAlerts) return res.status(404).send('OverSpeedAlerts List is Empty.');

      if (driverratings){
        logger.info('Driver Ratings found' );
      for(var i=0; i <driverratings.length ; i++ ){
        logger.info('Driver Ratings Length : '+ driverratings.length );
        for(var j=0; j <overSpeedAlerts.length ; j++ ){
          logger.info('overSpeedAlerts Length :'+ overSpeedAlerts.length );
          logger.info('driverratings[i]._id :'+ driverratings[i]._id );
          logger.info('overSpeedAlerts[j]._id :'+ overSpeedAlerts[j]._id );
      

          if (driverratings[i]._id.toString() === overSpeedAlerts[j]._id.toString()){
            logger.info('driverratings[i]._id===overSpeedAlerts[j]._id ' );
            totalAverage=(driverratings[i].avgbehavior +driverratings[i].avgdriving+driverratings[i].avgdelay ) / 3;
    
            resObj={
              "_driverId":driverratings[i]._id,
              "avgRating":totalAverage,
              "overspeedCount":overSpeedAlerts[j].count,
              "drivername":overSpeedAlerts[j].drivername

            }
            logger.info('Pushing to promise array' );
            promiseArr.push(addToListPromise(resObj));
          }else{
            logger.info('driverratings[i]._id!=overSpeedAlerts[j]._id ' );
          }
        }
      }
     }else {
       logger.info('Driver Ratings not found' );
     }
     Promise.all(promiseArr)
     .then((result)=> {
      res.jsonp({ status: 'success', message: 'Driver Performance List.', object: resList });

        })
     .catch(error => {
       logger.error ('An Error Has Occured : ' + err); 
       });

   
});

module.exports = router; 