var mongoose = require('mongoose');
var User = require('./User');
//var Location = require('./Location');


// Define our schema
var AlertTypeSchema   = new mongoose.Schema({
    
   _type:Number,
   title:String,
   descripton:String
    
}, {timestamps: true});
// Export the Mongoose model
module.exports = mongoose.model('AlertType', AlertTypeSchema);