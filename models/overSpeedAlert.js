var mongoose = require('mongoose');
var User = require('./User');
var Driver = require('./Driver');


// Define our schema
var OverSpeedAlertSchema   = new mongoose.Schema({
    
    _driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver'},
   msg:String,
   speed: Number    
}, {timestamps: true});
// Export the Mongoose model
module.exports = mongoose.model('OverSpeedAlert', OverSpeedAlertSchema);