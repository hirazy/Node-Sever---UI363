var nconf = require('nconf');

nconf.set('database', {
    user: 'test',
    password: 'test',
    server: 'mongodb://localhost:27017/testdb'
});
