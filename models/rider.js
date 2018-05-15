const mongoose = require('mongoose');
const User = require('./user');
const Location = require('./location');

// Define our schema
var RiderSchema   = new mongoose.Schema({

    _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    _pickUpLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location'},
    pickupLocName: String,
    last_shared_loc_time: Date,
    active: { type: Boolean, default: false },
    name: String,
    phone: { type: String, default: null }
   
} , {timestamps: true});
// Export the Mongoose model
module.exports = mongoose.model('Rider', RiderSchema);