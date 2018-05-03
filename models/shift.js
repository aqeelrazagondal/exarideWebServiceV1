var mongoose = require('mongoose');
var User = require('./user');
var Location = require('./location');
var Driver = require('./driver');
var Vehicle = require('./vehicle');

// Define our schema
var ShiftSchema   = new mongoose.Schema({

    // _riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider' },
    _routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Routes' },
    _beginLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location'},
    _endLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location'},
    _driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver'  },
    _vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle'}, 
    shiftStartTime: Date,
    shiftEndTime: Date,
    shiftStatus: String
    
}, {timestamps: true});
//VehicleSchema.index({_userId})
// Export the Mongoose model
module.exports = mongoose.model('Shift', ShiftSchema);