const mongoose = require('mongoose');
const Shift = require('../models/shift');
const Routes = require('../models/routes');

// Define our schema
const shiftRidersSchema   = new mongoose.Schema({

    _shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
    riders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rider'
    }],
    pickup: Date,
    dropOf: Date,
    pickUpLoc: { type: mongoose.Schema.Types.ObjectId, ref: 'Location'},
    dropOfLoc: { type: mongoose.Schema.Types.ObjectId, ref: 'Location'}
    
}, {timestamps: true});

// Export the Mongoose model
module.exports = mongoose.model('shiftRiders', shiftRidersSchema);