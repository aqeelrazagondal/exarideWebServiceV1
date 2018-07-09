
const mongoose = require('mongoose');

// Define our schema
const SharedSchema   = new mongoose.Schema({
    speedLimit: { type: Number, default: 0}
}, {timestamps: true});

// Export the Mongoose model
module.exports = mongoose.model('Shared', SharedSchema);