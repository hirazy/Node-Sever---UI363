// config/initializers/logger.js
let nconf = require('nconf');

module.exports = function (logger) {
    'use strict';
    return new Promise((fulfill) => {
        let logLevel = 'silly';
        let env = nconf.get('NODE_ENV');
        if(env==='product')
        {
            logLevel = 'warn';
        }
        else if(env === 'test')
        {
            logLevel = 'debug';
        }
        else
        {
            logLevel = 'silly';
        }


        logger.configure({
            transports: [
                new(logger.transports.Console)({
                    name: 'console',
                    level: logLevel,
                    colorize: true
                }),
                new(logger.transports.File)({
                    name: 'silly-file',
                    filename: 'silly.log',
                    level: 'silly'
                }),
                new(logger.transports.File)({
                    name: 'debug-file',
                    filename: 'debug.log',
                    level: 'debug'
                }),
                new(logger.transports.File)({
                    name: 'error-file',
                    filename: 'error.log',
                    level: 'warn'
                })
            ]
        });
        fulfill();
    });
};