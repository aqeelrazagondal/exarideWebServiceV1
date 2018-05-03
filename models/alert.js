const mongoose = require('mongoose');
const User = require('./user');
const AlertType = require('./alertType');

// Define our schema
const AlertSchema   = new mongoose.Schema({
    
    //_userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,default:null }, 
   _type:{ type: mongoose.Schema.Types.ObjectId, ref: 'alertType'  },
   sentBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }, 
   sentTo:{ type: mongoose.Schema.Types.ObjectId, ref: 'user'  }, 

    
}, {timestamps: true});
//VehicleSchema.index({_userId})
// Export the Mongoose model
module.exports = mongoose.model('Alert', AlertSchema);