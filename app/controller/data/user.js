"use strict";

var express = require("express");
var router = express.Router();
const User = require("../../models/user.js");
var logger = require("winston");
var ObjectId = require('mongodb').ObjectId
// var Room = require('../../models/RoomGame.js')

global.cookie = undefined;

// router.get('/',function(req,res){
//     res.json({message:'here 1', userid: req.query.userId,name:req.query.name});
// });

// router.put('/:userId',function(req,res){
// });
router.post("/add", (req, res) => {
    const {
        uid,
        username,
        name,
        photo_url,
        list_room,
        follower,
        following,
        block
    } = req.body;
    const data = new User({
        uid,
        username,
        name,
        photo_url,      
        list_room,
        follower,
        following,
        block
    });
    data
        .save()
        .then(a => res.json({ code: 3, data: a }))
        .catch(e => {
            res.json({ code: 1, mes: e });
        });
});

router.get("/", (req, res) => {
    if (req.query.keywords) {
        req.query.keywords = new RegExp(req.query.keywords, "i");
    }
    User.find(Object.assign({}, req.query))
        .populate("album")
        .then(data => {
            res.json({ code: 3, data: data });
        });
});

router.get("/by-user", (req, res) => {
    // find by username and password
    const id = req.query.id;
    User.findById(id).then(data => {
        if (user) {
            return res.json({ code: 3, data: data });
        } else {
            return res.json({ code: 2 });
        }
    });
});

router.get("/join-room/", (req, res)=>{
    
})

router.get("/by-id", (req, res) => {
    const id = req.query.id;
    User.findById(id).then(video => {
        if (video) {
            return res.json({ code: 3, data: video });
        } else {
            return res.json({ code: 2 });
        }
    });
});



router.patch("/update", (req, res) => {
    const id = req.query.id;
    //   const url = req.body.url;
    //   const thumb = req.body.thumb;

    User.findById(id).then(user => {
        if (user) {
            user.name = name;
            user.age = agge;
            user.save();
            return res.json({ code: 3, data: user });
        } else {
            return res.json({ code: 2 });
        }
    });
});

router.post('/login', (req, res)=>{
    var post = req.body;
    var x = JSON.parse(JSON.stringify(post))
    console.log(x)
    User.findOne({_id: ObjectId(x._id)}).exec((err, user)=>{
        if(err){
            res.status(500).send({message: err})
            res.redirect('/add')
        }

        if(user){
            res.status(400).send()
        }
    })
})


router.post('/next_room', (req, res)=>{
    var post = req.body
    var x = JSON.parse(JSON.stringify(post))
    
    

})

module.exports = function (appRoute) {
    appRoute.use(router);
};
// app used router when require import