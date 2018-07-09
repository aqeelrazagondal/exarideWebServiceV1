const mongoose = require('mongoose');

// Define our schema
var SharedSchema  = mongoose.model('Shared', new mongoose.Schema({
    speedLimit: { type: Number, default: 0}
    
} , {timestamps: true}));

// Export the Mongoose model
exports.Shared = SharedSchema; 