// app/models/user.js
// INITILIAZE your model here
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const trending =  new Schema({
    name: String,
    thumb: String,
    url:String,
    type:String,
    des:String,
    

});
module.exports = mongoose.model('Trending',trending);
