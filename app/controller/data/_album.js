'use strict';

var express = require('express');
var router = express.Router();
const Album = require('../../models/_album.js');
var logger = require('winston');

global.cookie = undefined;


// router.get('/',function(req,res){
//     res.json({message:'here 1', userid: req.query.userId,name:req.query.name});
// });

// router.put('/:userId',function(req,res){
// });
router.post('/add', (req, res) => {

    const { name, thumb, type, des } = req.body;
    const data = new Album({ name, thumb, type, des })
    data.save();
    return res.json({ code: 3, data })
})


const destroy = (req, res, next) => {
    let albumid = req.body.albumid
    Album.findOneAndRemove(albumid)
        .then(() => {
            res.json({
                message: 'Deleted successfully!'
            })
        })
}
router.delete('/delete-id', (req, res) => {
    const id = req.query.id;

    Album.findOneAndRemove(id)
        .then((data) => {
            if (data) {
                return res.json({ code: 3, data: data })
            } else {
                return res.json({ code: 2 });
            }
        })

});


router.get('/', (req, res) => {
    if (req.query.keywords) {
        req.query.keywords = new RegExp(req.query.keywords, "i");
    }
    Album.find(Object.assign({}, req.query)).then(data => {
        if (data) {
            return res.json({ code: 3, data })
        }
    })
});

router.get('/by-id', (req, res) => {
    const id = req.query.id;
    Album.findById(id).then(video => {
        if (video) {
            return res.json({ code: 3, data: video })
        } else {
            return res.json({ code: 2 });
        }
    })
});

router.patch('/update', (req, res) => {
    const id = req.query.id;
    const { name, thumb, type, des } = req.body;

    Album.findById(id).then(video => {
        if (video) {
            video = req.body;
            const data = new Album({ name, thumb, type, des })
            video = data
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
