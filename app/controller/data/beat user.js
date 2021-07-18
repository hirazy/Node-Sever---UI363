// app/routes/users.js
'use strict';

const BeatUser = require('../../models/beat user');
const RESPONSE = require('../../../constance/RESPONSE');
const ERRORCODE = require('../../../constance/ERRORCODE');
const BeatUserView = require('../../view/beat user view');
const _ = require('lodash');

module.exports = function(router) {
    // This will handle the url calls for /users/:user_id
    router.route('/:name')
        .get(function(req, res) {
            // Return user
            const beatuser = BeatUser.findOne({name:req.params.name});
            beatuser
                .then((beatu)=>{
                    if(!beatu){
                        res.json({code:RESPONSE.CODE_ERR, ERRCODE: ERRORCODE.NOTFOUND});
                        return;
                    }
                    let ret = new BeatUserView(beatu);
                    res.json({code:RESPONSE.CODE_OK_WITH_MESS,data:ret.Full()});
                })
                .catch((err)=>{
                    res.json({code:RESPONSE.CODE_ERR_WITH_MESS,ERRCODE: ERRORCODE.EXCEPTION,err});
                });
        }) 
        // .put(function(req, res) {
        //     // Update user
        // })
        // .patch(function(req, res) {
        //     // Patch
        // })
        .delete(function(req, res) {
            // Delete record
            const beatuser = BeatUser.findOne({name:req.params.name});
            beatuser
                .then((beatu)=>
                {
                    if(!beatu){
                        res.json({code:RESPONSE.CODE_ERR, ERRCODE: ERRORCODE.NOTFOUND});
                        return;
                    }
                    return beatu.remove();
                })
                .then(()=>{
                    res.json({code:RESPONSE.CODE_OK});
                })
                .catch((err)=>{
                    res.json({code:RESPONSE.CODE_ERR_WITH_MESS,ERRCODE: ERRORCODE.EXCEPTION,err});
                });
        });

    router.route('/')
        .get(function(req, res) {
            // Logic for GET /beat-user routes
            BeatUser.find({})
                .then((bUsers)=>{
                    if(!bUsers || bUsers.length === 0)
                    {
                        res.json({code:RESPONSE.CODE_ERR, ERRCODE: ERRORCODE.NOTFOUND});
                        return;
                    }
                    let wrapped = _(bUsers);
                    const ret = wrapped.map((bUser)=>{
                        let bw = new BeatUserView(bUser);
                        return bw.Compact();
                    });
                    res.json({code:RESPONSE.CODE_OK_WITH_MESS,data:ret});
                })
                .catch((err)=>{
                    res.json({code:RESPONSE.CODE_ERR_WITH_MESS,ERRCODE: ERRORCODE.EXCEPTION,err});
                });

        }).post(function(req, res) {
            // Create new user
            let user = new BeatUser({
                name: req.body.name,
                joinTime: Date.now()/1000 | 0
            });

            let err = user.validateSync();
            if(err){
                res.json({code:RESPONSE.CODE_ERR_WITH_MESS, ERRCODE: ERRORCODE.VALIDATE,err});
                return;
            }
            user.save()
                .then((u)=>{
                    res.status(201).json({code:RESPONSE.CODE_OK_WITH_MESS,data:u});
                })
                .catch((err)=>{
                    res.json({code:RESPONSE.CODE_ERR_WITH_MESS, ERRCODE: ERRORCODE.EXCEPTION,err});
                });
        });
};
