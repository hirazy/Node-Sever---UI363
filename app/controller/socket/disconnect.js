'use strict';

var logger = require('winston');


module.exports = function(socket){
    return function(data){
       logger.warn(socket.id + ' disconnected');
    };
};
