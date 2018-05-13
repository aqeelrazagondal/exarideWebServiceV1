const mongoose = require('mongoose');
const User = require('./user');

// Define our schema
var DriverSchema  = mongoose.model('Driver', new mongoose.Schema({
    _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: false },
    name: String,
    email: String
    // phone: { type: String, default: null }
    
} , {timestamps: true}));

// Export the Mongoose model
exports.Driver = DriverSchema; 