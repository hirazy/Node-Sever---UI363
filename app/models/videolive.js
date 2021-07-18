// app/models/user.js
// INITILIAZE your model here
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const videoLive =  new Schema({
    url: String,
    thumb: String
});

module.exports = mongoose.model('VideoLive',videoLive);
