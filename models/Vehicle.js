const mongoose = require('mongoose');

// Define our schema
const VehicleSchema   = new mongoose.Schema({
    
    regNumber: String,
    type: String,
    seatingCapacity:Number
    
}, {timestamps: true});

// Export the Mongoose model
module.exports = mongoose.model('Vehicle', VehicleSchema);