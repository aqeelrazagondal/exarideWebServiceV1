const mongoose = require('mongoose');
const User = require('./user');
const Location = require('./location');
const Driver = require('./driver');
// const Vehicle = require('./vehicle');
const Route = require('./route');

// Define our schema
const ShiftSchema   = new mongoose.Schema({

    // _riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
    title: String,
    _routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
    startLocName: String,
    endLocName: String,
    _driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    driverName: String,
    vehicle: String,
    shiftStartTime: Date,
    shiftEndTime: Date,
    shiftStatus: String
    
}, {timestamps: true});
//VehicleSchema.index({_userId})
// Export the Mongoose model
module.exports = mongoose.model('Shift', ShiftSchema);