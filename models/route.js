const mongoose = require('mongoose');
const Location = require('./location');

const RouteSchema = new mongoose.Schema({

    routeTitle: {
        type: String,
        unique: true
    },
    _beginLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location'},
    _endLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location'}


}, { timestamps: true });

// Export the Mongoose model
module.exports = mongoose.model('Route', RouteSchema);