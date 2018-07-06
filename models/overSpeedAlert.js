var mongoose = require('mongoose');
var User = require('./user');
var Driver = require('./driver');


// Define our schema
var OverSpeedAlertSchema   = new mongoose.Schema({
    
    _driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver'},
   msg:String,
   speed: Number    
}, {timestamps: true});
// Export the Mongoose model
module.exports = mongoose.model('OverSpeedAlert', OverSpeedAlertSchema);