// app/models/user.js
// INITILIAZE your model here
const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const beatUser = new Schema(
  {
    name: {
      type: String,
      unique: [true, "name exist"],
      minlength: [3, "length of name must greater than 3"],
      maxlength: [10, "length of name mus less than 10"]
    },
    joinTime: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("BeatUser", beatUser);
