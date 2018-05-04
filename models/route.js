var mongoose = require('mongoose');
var Location = require('./location');

var RouteSchema = new mongoose.Schema({

    routeTitle: {
        type: String,
        unique: true
    },
    startLoc: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2d'      // create the geospatial index
    },
    endLoc: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2d'      // create the geospatial index
    }


}, { timestamps: true });

// Export the Mongoose model
module.exports = mongoose.model('Route', RouteSchema);