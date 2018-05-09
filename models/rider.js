const mongoose = require('mongoose');
const User = require('./user');

// Define our schema
var RiderSchema   = new mongoose.Schema({

    _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: false },
    name: String,
    phone: { type: String, default: null }
   
} , {timestamps: true});
// Export the Mongoose model
module.exports = mongoose.model('Rider', RiderSchema);