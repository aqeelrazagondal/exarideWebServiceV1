const winston = require('winston');
const mongoose = require('mongoose');

module.exports = function() {
    mongoose.connect('mongodb://admin:12345@ds139067.mlab.com:39067/vidly')
    .then(() => winston.info('Connected to the databse...'));
}