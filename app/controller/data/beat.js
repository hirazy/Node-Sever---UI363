'use strict';

var express = require('express');
var router = express.Router();
const Beat  = require('../../models/beat.js');
var logger = require('winston');

global.cookie = undefined;


// router.get('/',function(req,res){
//     res.json({message:'here 1', userid: req.query.userId,name:req.query.name});
// });

// router.put('/:userId',function(req,res){
// });

router.post('/add', function(req, res){

    const time = req.body.time;
    const bpm = req.body.bpm;


    const beat = new Beat({
        time,
        bpm
    });
    beat.save();

    return res.json({code: 3, data: beat});
});

router.get('/',function(req,res){
    Beat.find({}).then(beats => {
        if (beats) {
            return res.json({code: 3, data: beats})
        }
    })
    
});

router.get('/by-id',function(req,res){
    const id = req.query.id;
    Beat.findById(id).then(beat => {
        if (beat) {
            return res.json({code: 3, data: beat})
        } else {
            return res.json({code: 2});
        }
    })
});

router.patch('/update', function(req, res) {
    const id = req.query.id;
    const time = req.body.time;
    const bpm = req.body.bpm;

    Beat.findById(id).then(beat => {
        if (beat) {
            beat.time = time;
            beat.bpm = bpm;
            beat.save();
            return res.json({code: 3, data: beat});
        } else {
            return res.json({code: 2});
        }
    })
})



module.exports = function(appRoute) {
    appRoute.use(router);
};
