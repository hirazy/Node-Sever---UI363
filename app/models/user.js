// app/models/user.js
// INITILIAZE your model here
const mongoose = require("mongoose");
var findOneOrCreate = require('mongoose-find-one-or-create');
var Schema = mongoose.Schema;


var mongooseKeywords = require('mongoose-keywords-vi')

const user = new Schema({
    uid: String,
    username: String,
    name: String,
    url_photo: String,
    list_room: [{
        type: Schema.Types.ObjectId,
        ref: 'Room'
    }],
    follower: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    block: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }]
});

user.plugin(mongooseKeywords, { paths: ['name'] })
user.plugin(findOneOrCreate);
module.exports = mongoose.model("User", user);
