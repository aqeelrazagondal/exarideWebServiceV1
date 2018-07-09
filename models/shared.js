
const mongoose = require('mongoose');

// Define our schema
const sharedSchema   = new mongoose.Schema({
    speedLimit: { type: Number, default: 0}
}, {timestamps: true});

// Export the Mongoose model
const Shared = mongoose.model('Shared', sharedSchema);
module.exports = Shared; 
