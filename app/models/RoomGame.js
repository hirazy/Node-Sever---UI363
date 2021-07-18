const mongoose = require('mongoose');
var Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;
const shortId = require('shortid');

let RoomType = {
    // PERSONAL: 0,
    // GROUP: 1,
    // BROADCAST: 2
    AMONGUS: 0,
    JUST_CHATTING: 1,
    ROBLOX: 2,
    MINECRAFT: 3,
    FORTNITE: 4,
    BRAWL_STARS: 5,
    CALL_OF_DUTY: 6,
    MOBILE_LEGENDS: 7,
    FREE_FIRE: 8,
    ANIMAL_CROSSING: 9,
    PUBG_MOBILE: 10
};


let RoomGame = new Schema({
    //unique code
    code: {type: String, trim: true, unique: true},
    //users of the room
    users: [{type: ObjectId, ref: 'User'}], 
    //last message that sent in room
    //the type of the chat , can be personal , group or broadcast
    type: {type: Number},
    //the admin of the room , or creator
    admin: {type: ObjectId, ref: 'User'}
    //check if room is deleted or not
});

RoomGame.pre('save', async function (next) {
    //generate a unique short code
    this.code = await shortId.generate();
    this.updated_at = new Date().getTime();
    this.created_at = new Date().getTime();
    next();
})

RoomGame.pre('update', function (next) {
    this.updated_at = new Date().getTime();
    next();
})

let RoomGame = mongoose.model('RoomGame', RoomGame);

module.exports = {RoomGame, ChatType};