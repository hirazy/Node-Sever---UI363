// app/models/user.js
// INITILIAZE your model here
const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var mongooseKeywords = require('mongoose-keywords-vi')

const song = new Schema({
  name: String,
  thumb: String,
  url: String,
  view: Number,
  singer: {
    type: Schema.Types.ObjectId,
    ref: 'Singer'
  },
  musician: {
    type: Schema.Types.ObjectId,
    ref: 'musician'
  },
  album: {
    type: Schema.Types.ObjectId,
    ref: 'Album'
  },
  type: String,
  des: String
});

song.plugin(mongooseKeywords, { paths: ['name'] })

module.exports = mongoose.model("Song", song);
