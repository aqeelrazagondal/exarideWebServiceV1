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
const regCtrl = require('../controller/registrationController');
const LocController = require('../controller/locationController');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.jsonp({
    status : "success",
    message : "Profile info.",
    object : user
  });
});

router.post('/register', async (req, res) => {

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['name', 'email', 'password', 'user_type', 'phone', 'os']));

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email', 'user_type', 'phone', 'OS']));

  let user_type = req.body.user_type;
  if(user_type === 'driver'){
    console.log('user_type', user_type);

    let newDriver = new Driver({ 
        _userId: user._id,
        name: user.name
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

router.post('/verificationcode', async (req, res) => {
  if(req.body === undefined || req.body === null) {
    res.send("Empty Body");  
  }
  
  const phoneNo = req.body.phoneNo;
  const resend = req.body.resend;
  let code;
  let verificationMsg;
  let requestUrl;
  let nUser;

  logger.info('In Route /VerificationCode called  :' + phoneNo );
  code = randomize('0', 4);
  verificationMsg = "Verification code for Rider Application : " + code;

  const user = await User.findOne({ phone: phoneNo });
  if ( user ) return res.status(400).jsonp({ status:"failure", message:"Rider Already register", object:[] });
  
  if (resend==="true"||resend==1){
    res.jsonp({status:"failure", message:"Please Create User First", object:[]});    
  }
  else{
    let newUser = new User({  
      phone: phoneNo,
      verified_user:false,                            
      verification_code:code
    });
    await newUser.save();
    //Http Request to send message
    requestUrl="http://sendpk.com/api/sms.php?username=923370768876&password=5823&mobile="+newUser.phone+"&sender=umer%22&message="+verificationMsg;
    request.get(requestUrl,
      function(error,response,body){
        if(error){
          console.log(error);
        }else{
          console.log(response);
        }
    });
    logger.info('User Created With Phone Num ' + phoneNo + 'Code ' + code );
    res.jsonp({ status:"success", message:"Verification code Sent!", object:[]});
  }
});

router.post('/resendVerificationcode', async (req, res) => {
  if(req.body === undefined || req.body === null) {
    res.send("Empty Body");  
  }
  
  const phoneNo = req.body.phoneNo;
  const resend = req.body.resend;
  let code;
  let verificationMsg;
  let requestUrl;

  logger.info('In Route /VerificationCode called  :' + phoneNo );
  code = randomize('0', 4);
  verificationMsg = "Verification code for Rider Application : " + code;

  const user = await User.findOne({ phone: phoneNo });
  if ( user ){
    console.log (" User Exists  sending verification code again");
    // send verification code logic
    //generate a code and set to user.verification_code
    user.verification_code=code;
    await user.save();   
  
    //"http://sendpk.com/api/sms.php?username=923124999213&password=4857&mobile=
    requestUrl="http://sendpk.com/api/sms.php?username=923370768876&password=5823&mobile="+user.phone+"&sender=umer%22&message="+verificationMsg;
    request.get(requestUrl,
    function(error,response,body){
      if(error){
        console.log(error);
      }else{
        console.log(response);
      }
    });
    res.jsonp({status:"success", message:"Verification code Sent Again!", object:[]});
  }  
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

router.post('/updateLocation', function (req, res) {

  if (req.body === undefined || req.body === null) {
    res.end("Empty Body");
  }
  console.log("in routes /location");
  var reqData = req.body;
  // console.log(reqData);
  LocController.updateUserLocation(reqData, res);
});

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  }
});
var upload = multer({storage: storage});

router.post('/profile',upload.single('image'), function(req,res){
		
  if(req.body === undefined||req.body === null) {
     res.end("Empty Body"); 
  }



});

module.exports = router; 