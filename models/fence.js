const mongoose = require('mongoose');

// Define our schema
const fenceSchema   = new mongoose.Schema({

    fenceName : String,
    radius: Number 
   
}, {timestamps: true});

// Export the Mongoose model

const Fence = mongoose.model('Fence', fenceSchema);
module.exports.Fence = Fence; 
