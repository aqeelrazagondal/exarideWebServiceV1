const express = require('express');
const morgan = require('morgan');
const winston = require('./logging');
const homePage = require('../routes/home');
const users = require('../routes/users');
const auth = require('../routes/auth');
const error = require('../middleware/error');
const location = require('../routes/locations');
const routes = require('../routes/routes');
const shift = require('../routes/shifts');
const shiftRiders = require('../routes/shiftRiders');
const riders = require('../routes/riders');
const admin = require('../routes/admins');
const drivers = require('../routes/driver');
const cors = require('cors');

module.exports = function(app) {
    
    app.use(express.json());
    app.use(morgan('combined', { stream: winston.stream }));
    app.use(cors());
    
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
      
        // add this line to include winston logging
        winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
      
        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });

    app.use(function(req, res, next) {

		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "*");
		res.header("Access-Control-Expose-Headers", "*");
		next();
    
    });

    app.use('/', homePage);
    app.use('/api/users', users);
    app.use('/api/auth', auth);
    app.use('/api/location', location);
    app.use('/api/routes', routes);
    app.use('/api/shifts', shift);
    app.use('/api/riders', shiftRiders);
    app.use('/api/riders', riders);
    app.use('/api/admin', admin);
    app.use('/api/driver', drivers);
    app.use(error);    

}