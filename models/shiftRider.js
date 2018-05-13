const mongoose = require('mongoose');
const Shift = require('./shift');
const Rider = require('./rider');
const User = require('./user');

// Define our schema
const shiftRidersSchema   = new mongoose.Schema({

    _shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
    _riderId: {type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
    riderName: String,
    pickUpTime: Date,
    dropOfTime: Date,
    pickUpLocName: {
        type: String
    },
    pickUploc: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2d'      // create the geospatial index
    },
    dropOfLoc: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2d'      // create the geospatial index
    },
    dropOfLocName: {
        type: String
    }

}, {timestamps: true});

// Export the Mongoose model
module.exports = mongoose.model('shiftRider', shiftRidersSchema);