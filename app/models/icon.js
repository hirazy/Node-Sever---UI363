const {mongoose} = require('mongoose');
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

const TYPE = {
    FREE : 0,
    NORMAL : 1,
    PREMIUM : 2
}

let icon = new Schema({
    type: {type: Number, required: true, default: 1},
    url_img: {type: String, required: true, default: MessageType.TEXT}
})

let Message = mongoose.model('Icon', icon);

// make this available to our users in our Node applications
module.exports = {Icon};
