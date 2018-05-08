const mongoose = require('mongoose');
const User = require('./user');
const Location = require('./location');
const Driver = require('./driver');
// const Vehicle = require('./vehicle');
const Route = require('./route');

// Define our schema
const ShiftSchema   = new mongoose.Schema({

    _driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver'},
    title: {
        type: String,
        lowercase: true,
        trim: true,
        required: true
    },
    startLocName: {
        type: String,
        lowercase: true,
        trim: true
    },
    endLocName: String,
    driverName: {
        type: String,
        lowercase: true,
        trim: true
    },
    vehicle: String,
    shiftStartTime: Date,
    shiftEndTime: Date,
    shiftStatus: String
    
}, {timestamps: true});
//VehicleSchema.index({_userId})
// Export the Mongoose model
module.exports = mongoose.model('Shift', ShiftSchema);