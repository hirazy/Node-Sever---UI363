const mongoose = require('mongoose');
var Schema = mongoose.Schema;
// let ObjectId = Schema.ObjectId;
const shortId = require('shortid');

let RoomType = {
    // PERSONAL: 0,
    // GROUP: 1,
    // BROADCAST: 2
   AMONGUS: 0,
   ANIMAL_CROSSING: 1,
   BRAWL_STARS: 2,
   CALL_OF_DUTY: 3,
   FORTNITE: 4,
   FREE_FIRE: 5,
   JUST_CHATTING: 6,
   MINECRAFT: 7,
   MOBILE_LEGENDS: 8,
   PUBG_MOBILE: 9,
   ROBLOX: 10
};


let room = new Schema({
    // private or public 
    private: {default: false, type:Boolean},
    //unique code
    code: {type: String, trim: true, unique: true}
    //users of the room
    // users: [{type: ObjectId, ref: 'User'}], 
    // //last message that sent in room
    // //the type of the chat , can be personal , group or broadcast
    // type: {type: Number},
    // //the admin of the room , or creator
    // admin: {type: ObjectId, ref: 'User'}
    //check if room is deleted or not
});

room.pre('save', async function (next) {
    //generate a unique short code
    this.code = await shortId.generate();
    this.updated_at = new Date().getTime();
    this.created_at = new Date().getTime();
    next();
})

room.pre('update', function (next) {
    this.updated_at = new Date().getTime();
    next();
})

let Room = mongoose.model('Room', room);
// room.plugin(mongooseKeywords, { paths: ['name'] })
// room.plugin(findOneOrCreate);

module.exports = {Room};