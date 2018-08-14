const logger = require('../startup/logging');
const NotificationController=require('./PushNotificationController');
const Fence  = require('../models/fence');

exports.setFence= function (req, res){


    var newfence = new Fence({  

    });
    
    newfence.save(function (err, user) {
    });
}