var mongoose = require('mongoose');
var Driver = require('./driver');


// Define our schema

var overSpeedAlertSchema  = mongoose.model('OverSpeedAlert', new mongoose.Schema({
    _driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver'},
   msg:String,
   driverName:String,
   speed: Number    
} , {timestamps: true}));

// Export the Mongoose model
exports.OverSpeedAlert = overSpeedAlertSchema; 