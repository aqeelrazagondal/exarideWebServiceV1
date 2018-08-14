const mongoose = require('mongoose');
const User = require('./user');
const Driver = require('./driver');
const Rider = require('./rider');

// Define our schema
const driverRatingSchema   = new mongoose.Schema({

    _driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver'},
    _ratedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    _ratedByRiderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider'},
    behavior: { type: Number, default: 0 },
    driving: { type: Number, default: 0 },
    delay: { type: Number, default: 0 }
   
}, {timestamps: true});

// Export the Mongoose model

const DriverRating = mongoose.model('DriverRating', driverRatingSchema);
module.exports.DriverRating = DriverRating; 

//  module.exports = mongoose.model('DriverRating', driverRatingSchema);