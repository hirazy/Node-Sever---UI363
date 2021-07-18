// app/models/user.js
// INITILIAZE your model here
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const musician =  new Schema({
    name: String,
    avata: String,
    country:String,
    flow:Number,
    type:String,
    des:String
});

module.exports = mongoose.model('musician',musician);
