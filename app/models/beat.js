// app/models/user.js
// INITILIAZE your model here
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const beat =  new Schema({
    time: Number,
    bpm: Number
});

module.exports = mongoose.model('Beat',beat);
