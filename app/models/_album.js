// app/models/user.js
// INITILIAZE your model here
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseKeywords = require('mongoose-keywords-vi')
const album =  new Schema({
    name: String,
    thumb: String,
    type:String,
    des:String,
});
album.plugin(mongooseKeywords, { paths: ['name'] })
module.exports = mongoose.model('Album',album);
