'use strict';

var express = require('express');
var router = express.Router();
const VideoLive = require('../../models/videolive.js');
var logger = require('winston');

global.cookie = undefined;


// router.get('/',function(req,res){
//     res.json({message:'here 1', userid: req.query.userId,name:req.query.name});
// });

// router.put('/:userId',function(req,res){
// });
router.post('/add', (req, res) =>{
    const url=req.body.url;
    const thumb=req.body.thumb;
    const video=new VideoLive({url,thumb})
    video.save();
    return res.json({code:3,data:video})
})


router.get('/',  (req, res) =>{
    VideoLive.find({}).then(vieos => {
        if (vieos) {
            return res.json({ code: 3, data: vieos })
        }
    })
});

router.get('/by-id',  (req, res)=> {
    const id = req.query.id;
    VideoLive.findById(id).then(video => {
        if (video) {
            return res.json({ code: 3, data: video }) // send video found by id requested
        } else {
            return res.json({ code: 2 });
        }
    })
});

router.patch('/update',  (req, res)=> {
    const id = req.query.id;
    const url = req.body.url;
    const thumb = req.body.thumb;

    VideoLive.findById(id).then(video => {
        if (video) {
            video.url = url;
            video.thumb = thumb;
            video.save();
            return res.json({ code: 3, data: video }); 
        } else {
            return res.json({ code: 2 });
        }
    })
})



module.exports = function (appRoute) {
    appRoute.use(router);
};
