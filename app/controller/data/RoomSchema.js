"use strict";
var express = require("express");
var router = express.Router();
const {Room, ChatType} = require("../../models/RoomSchema")
var logger = require("winston");

global.cookie = undefined;

// router.get('/',function(req,res){
//     res.json({message:'here 1', userid: req.query.userId,name:req.query.name});
// });

// router.put('/:userId',function(req,res){
// });
router.post("/add", (req, res) => {
    const {
        
    } = req.body;
    const data = new Room({
        code,
        users,
        last_msg_id,
        type,
        admin,
        deleted,
        updated_at,
        created_at
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
    Room.find(Object.assign({}, req.query))
        .populate("room")
        .then(data => {
            res.json({ code: 3, data: data });
        });
});

router.get("/by-room", (req, res) => {
    // find by username and password
    const id = req.query.id;
    Room.findById(id).then(data => {
        if (data) {
            return res.json({ code: 3, data: data });
        } else {
            return res.json({ code: 2 });
        }
    });
});

router.get("/by-id", (req, res) => {
    const id = req.query.id;
    Room.findById(id).then(video => {
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

    Room.findById(id).then(user => {
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

router.post("/next", (req, res)=>{
    const id = req.query.id;

    
})

module.exports = function (appRoute) {
    appRoute.use(router);
};
// app used router when require import