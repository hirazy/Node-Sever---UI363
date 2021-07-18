// /app.js
'use strict';

var server = require('./config/initializers/server');
var nconf = require('nconf');
var logger = require('winston');

// Load Environment variables from .env file
require('dotenv').load();

// Load global variables
require('./config/initializers/variable.js');


// Set up configs
nconf.use('memory');
// First load command line arguments
nconf.argv();
// Load environment variables
nconf.env();

// Load config file for the environment
require('./config/environments/' + nconf.get('NODE_ENV'));

// logger.debug(7);
// logger.info(6);
// logger.notice(5);
// logger.warning(4);

logger.info('[APP] Starting server initialization');

// Initialize Modules
require('./config/initializers/logger')(logger).then(() => {

    return require('./config/initializers/database')();
}).then(() => {
    return server();
}).then(() => {
    {
        logger.info('[APP] initialized SUCCESSFULLY');
        logger.info('[APP] Start in mode: ' + nconf.get('NODE_ENV'));

    }
})
    .catch((err) => {
        logger.error('[APP] initialization failed', err);
    });