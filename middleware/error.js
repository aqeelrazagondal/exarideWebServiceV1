const winston = require('winston');

module.exports = function(err, req, res, next){
    winston.error(err.message, err);

    // error
    // warn
    // info
    // verbose
    // debug
    // silly

    // Log the exception
    res.status(500).jsonp({
      status:"Failure",
      message:"Something Failed",
      object:[]
    });
}