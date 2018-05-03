var mongoose = require('mongoose');
var Location = require('./location');

var RouteSchema = new mongoose.Schema({

    routeTitle: String,
    _beginLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: null },
    _endLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: null }

}, { timestamps: true });

// Export the Mongoose model
module.exports = mongoose.model('Route', RouteSchema);