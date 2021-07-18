var nconf = require('nconf');

nconf.set('database', {
    user: 'beat',
    password: '123456',
    server: 'mongodb://aib.vn:2411/beat'
});
