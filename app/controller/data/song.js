"use strict";

var express = require("express");
var router = express.Router();
const Song = require("../../models/song.js");
var logger = require("winston");

global.cookie = undefined;

// router.get('/',function(req,res){
//     res.json({message:'here 1', userid: req.query.userId,name:req.query.name});
// });

// router.put('/:userId',function(req,res){
// });
router.post("/add", (req, res) => {
  const {
    name,
    thumb,
    url,
    view,
    singer,
    musician,
    album,
    type,
    des
  } = req.body;
  const data = new Song({
    name,
    thumb,
    url,
    view,
    singer,
    musician,
    album,
    type,
    des
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
  Song.find(Object.assign({}, req.query))
    .populate("singer")
    .populate("musician")
    .populate("album")
    .then(songs => {
      res.json({ code: 3, data: songs });
    });
});
router.get("/by-album", (req, res) => {
  const id = req.query.id;
  Song.findById(id).then(song => {
    if (video) {
      return res.json({ code: 3, data: video });
    } else {
      return res.json({ code: 2 });
    }
  });
});
router.get("/by-id", (req, res) => {
  const id = req.query.id;
  VideoLive.findById(id).then(video => {
    if (video) {
      return res.json({ code: 3, data: video });
    } else {
      return res.json({ code: 2 });
    }
  });
});

router.patch("/update", (req, res) => {
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
  });
});

module.exports = function (appRoute) {
  appRoute.use(router);
};
// app used router when require import