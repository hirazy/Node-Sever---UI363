// app/models/user.js
// INITILIAZE your model here
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseKeywords = require('mongoose-keywords-vi')
const singer =  new Schema({
    name: String,
    avata: String,
    country:String,
    flow:Number,
    type:String,
    des:String
});

singer.plugin(mongooseKeywords, { paths: ['name'] })
module.exports = mongoose.model('Singer',singer);
