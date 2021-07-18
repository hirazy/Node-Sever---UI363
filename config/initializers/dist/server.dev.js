"use strict";

// config/initializers/server.js
var express = require('express');

var path = require('path'); // Local dependecies


var config = require('nconf');

var cors = require('cors'); // create the express app
// configure middlewares


var bodyParser = require('body-parser');

var morgan = require('morgan');

var logger = require('winston');

var app;

var start = function start() {
  'use strict';

  return new Promise(function (fulfill, reject) {
    // Configure express 
    app = express(); // Error handler???

    app.use(function (req, res, next) {
      res.header('Access-Control-Allow-Origin', "*");
      res.header('Access-Control-Allow-Credentials', "true");
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next(); // logger.error(err);
      // res
      //     .status(err.status || 500)
      //     .json({
      //         message: err.message,
      //         error: (app.get('env') === 'development' ? err.stack : {})
      //     });
      // next(err);
    });
    app.use(cors({
      credentials: true,
      origin: true
    }));
    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({
      extended: true
    }));
    app.use(bodyParser.json({
      type: '*/*'
    }));
    logger.info('[SERVER] Initializing routes');

    require('../../app/controller/data/index')(app); // use  index at folder data


    app.use(express["static"](path.join(__dirname, 'public')));
    app.listen(config.get('NODE_PORT'));
    logger.info('[SERVER] Listening on port ' + config.get('NODE_PORT')); // create socket io

    var server = require('http').createServer();

    global.io = require('socket.io')(server, {
      'transports': ['websocket', 'polling']
    });
    server.listen(config.get('SOCKET_PORT'), function (err) {
      if (err) {
        logger.error(err);
      }

      logger.info('[SERVER] socket io listen socketio on ', config.get('SOCKET_PORT'));
      global.io.on('connection', require('../../app/controller/socket/index.js'));
    });
    fulfill();
  });
};

module.exports = start;