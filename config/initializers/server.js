// config/initializers/server.js


var express = require('express');
var path = require('path');
var router = express.Router();
//const UserSchema = require("../../app/models/userSchema");
const Album = require("../../app/models/_album");

// ******URL SERVER******
var url = "mongodb://localhost:27017/";

// User
var MongoClient = require('mongodb').MongoClient;
const User = require("../../app/models/user.js");
var passport = require('passport')
const facebookStrategy = require('passport-facebook').Strategy
var ObjectId = require('mongodb').ObjectId
const session = require('express-session')
// Local dependecies
var config = require('nconf');
const { OAuth2Client } = require('google-auth-library')
const CLIENT_ID = '1056878842072-05km20lpl5k8a9bpq38dn7uu490jjl0r.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID)
var cors = require('cors')
const cookieParser = require('cookie-parser');
var user_id_google = ""
var user_id_facebook = ""
// create the express app
// configure middlewares
var bodyParser = require('body-parser');
var morgan = require('morgan');
var logger = require('winston');
const { use } = require('passport');
const { v4: uuidV4 } = require('uuid')
//var Peer = require('peer').PeerServer;
const stream = require('readable-stream');
const { min } = require('lodash');

// const { ExpressPeerServer } = require('peer')
// const peerServer = ExpressPeerServer(server, {
// 	debug: true,
// })
var app;

// array save user online 
let users_online = []
/* user: {_id: String, uid: String, username: String, name: String, size_following: Int, size_follower: Int, 
*  url_photo: String, status: Int refer: Status., code_room: String}
*/

// array save socket of user according to _id save user._id
var socket_id = {}

var list_socket_id = {}

// array save room exist
var list_room = []

/* room: {code: init 3001, String generate by code number of final room in list_room + random(1-20)
  type: 0-10, users: [{user: users, mute: boolean}], admin: host create room or user join after - users, private: boolean}
*/

// FOLLOWING_ONLINE 

// + _id
// + uid
// + username
// + name
// + url_photo
// + status
// + code_room

// RECOMMEND

// + _id
// + uid
// + username
// + name
// + url_photo
// + status
// + code_room
// + follow
// + block

// FOLLOWING - FOLLOWER

// + _id
// + uid
// + username
// + name
// + url_photo
// + follow
// + block



var RoomType_Name = ["AMONGUS", "ANIMAL_CROSSING", "BRAWL_STARS", "CALL_OF_DUTY",
    "FORTNITE", "FREE_FIRE", "JUST_CHATTING", "MINECRAFT", "MOBILE_LEGENDS", "PUBG_MOBILE", "ROBLOX"]

const Status = {
    // PERSONAL: 0,
    // GROUP: 1,
    // BROADCAST: 2
    OFFLINE: -2,
    ONLINE: -1,
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
}

// ERROR
var ERROR_PRIVATE = 1
var ERROR_FULL = 2
var ERROR_KICK = 3
var ERROR_INTERNET = 4
var ERROR_NOT_EXIST = 5

var FOLLOWING = 0
var FOLLOWER = 1
var BLOCK = 2

// MESSAGE
var MESSAGE_NULL = 0
var MESSAGE_JOINED = 1
var MESSAGE_PUBLIC = 2
var MESSAGE_PRIVATE = 3
var MESSAGE_CHAT = 4


var start = function () {
    'use strict';

    return new Promise((fulfill, reject) => {
        // Configure express 
        app = express();
        app.set("view engine", "ejs")
        // Error handler???
        app.use(function (req, res, next) {
            res.header('Access-Control-Allow-Origin', "*");
            res.header('Access-Control-Allow-Credentials', "true");
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next()
            // logger.error(err);
            // res
            //     .status(err.status || 500)
            //     .json({
            //         message: err.message,
            //         error: (app.get('env') === 'development' ? err.stack : {})
            //     });
            // next(err);
        });

        app.use(cors({ credentials: true, origin: true }))

        app.use(morgan('dev'));
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json({ type: '*/*' }));
        // app.render("create-web", {id: 2}, {

        // })


        logger.info('[SERVER] Initializing routes');
        require('../../app/controller/data/index')(app); // use  index at folder data
        //)
        app.use(express.static(path.join(__dirname, 'public')));

        app.listen(config.get('NODE_PORT'));
        logger.info('[SERVER] Listening on port ' + config.get('NODE_PORT'));

        // initialize app with passport

        // push image android background url
        // app.post()


        // create socket io
        var server = require('http').createServer();
        global.io = require('socket.io')(server, { 'transports': ['websocket', 'polling'] });

        server.listen(config.get('SOCKET_PORT'), function (err) {

            if (err) {
                logger.error(err);
            }
            logger.info('[SERVER] socket io listen socketio on ', config.get('SOCKET_PORT'));


            //global.io.on('connection', require('../../app/controller/socket/index.js'));
            global.io.on('connection', function (socket) {

                console.log('Connected')
                var user = new User() // user to save user sign in
                var list_user_recommend = [] // list recommend 
                var list_online_friend = []
                var ind_room = -1 // index of room in list_room
                var status = -1 // -1: online and other code_rooms 
                var list_search = [] // list_search

                // ****************** SIGN IN ******************

                socket.on("signingoogle", function (data) {

                    var x = JSON.parse(data)
                    console.log("**************** X ****************")

                    MongoClient.connect(url, function (err, db) {
                        if (err) throw err;
                        var dbo = db.db("testdb");
                        console.log("UserName: " + x.username)
                        dbo.collection("users").find({ username: x.username }).toArray(function (err, result) {
                            if (result.length > 0) {
                                // Found User
                                //console.log("result")
                                var x1 = JSON.parse(JSON.stringify(result[0]))

                                // **** SAVE USER ****
                                user = {
                                    _id: x1._id, uid: x1.uid, username: x1.username, name: x1.name, size_following: x1.following.length,
                                    size_follower: x1.follower.length, url_photo: x1.url_photo, status: Status.ONLINE, code_room: ""
                                } // *** ASSIGN USER LOGIN *** 

                                socket_id[user._id] = socket // save object socket

                                list_socket_id[user._id] = socket.id // list_socket_id assign socket id

                                socket.emit("key_user_main", { user: user })

                                // db.close();
                                var friend_online = x1.follower
                                let st_friend = new Set()
                                for (var i = 0; i < friend_online.length; i++) {
                                    st_friend.add(JSON.stringify(friend_online[i]._id))
                                }

                                var st_following = new Set()

                                for (var i = 0; i < x1.following.length; i++) {
                                    st_following.add(JSON.stringify(x1.following[i]._id))
                                }

                                var check_online = false

                                var list_friend_online = []

                                for (var i = 0; i < users_online.length; i++) {
                                    if (st_friend.has(JSON.stringify(users_online[i]._id)) && socket_id[users_online[i]._id] != null) {
                                        console.log("users_online[i]._id: " + list_socket_id[users_online[i]._id])

                                        var tmp_user = {
                                            _id: user._id, uid: user.uid, username: user.username, name: user.name,
                                            url_photo: user.url_photo, status: user.status, code_room: user.code_room
                                        }

                                        console.log("******* FRIEND ONLINE *************")
                                        console.log("ID ONLINE: " + list_socket_id[users_online[i]._id])
                                        socket_id[users_online[i]._id].emit("friend_online", { user: tmp_user }) // Must optimize

                                        //io.to(list_socket_id[users_online[i]._id]).emit("key_online_friend", { user: tmp_user }) // SEND TO FOLLOWER FOLLOWING_ONLINE
                                    }
                                    if (st_following.has(JSON.stringify(users_online[i]._id))) {

                                        var o1 = users_online[i]
                                        list_friend_online.push({
                                            _id: o1._id, uid: o1.uid, username: o1.username, name: o1.name,
                                            url_photo: o1.url_photo, status: o1.status, code_room: o1.code_room
                                        }) //  list_friend_online // FOLLOWING_ONLINE
                                    }
                                    if (JSON.stringify(user._id) == JSON.stringify(users_online[i]._id)) {
                                        check_online = true
                                    }
                                }

                                // user_status
                                // user_status[user._id] = { status: Status.ONLINE, code_room: "" }

                                list_online_friend = list_friend_online // ******** LIST FRIEND ONLINE *******

                                st_following.add(JSON.stringify(user._id))

                                var list_recommend = []
                                var cnt = 0;

                                console.log("Length: " + users_online.length)
                                while (cnt < Math.min(20, users_online.length)) {
                                    var rand = Math.floor(Math.random() * users_online.length)
                                    console.log("Rand: " + rand)
                                    if (!st_following.has(JSON.stringify(users_online[rand]._id))) {
                                        var o1 = users_online[rand]

                                        list_recommend.push({
                                            _id: o1._id, uid: o1.uid, username: o1.username, name: o1.name,
                                            url_photo: o1.url_photo,
                                            follow: false, block: false, status: o1.status, code_room: o1.code_room
                                        }) // RECOMMEND

                                        st_following.add(JSON.stringify(users_online[rand]._id))
                                    }
                                    cnt += 1
                                }

                                // ********** List Recommend ***********    
                                list_user_recommend = list_recommend

                                socket.emit("key_recommend", { list: list_recommend })

                                // *** Push user to list online which be checked exist in user_online before
                                if (!check_online) {
                                    users_online.push(user)
                                }

                                // ************ FRIEND ONLINE **************

                                // Send User on room according to type
                                var room_users = [] // number of users each room 
                                for (var i = 0; i < 11; i++) {
                                    room_users.push(0)
                                }

                                for (var i = 0; i < list_room.length; i++) {
                                    for (var j = 0; j < 10; j++) {
                                        if (list_room[i].users[j].user._id != "") {
                                            room_users[list_room[i].type]++;
                                        }
                                    }
                                }

                                var send_room = []
                                for (var i = 0; i < 11; i++) {
                                    send_room.push({ type: i, number: room_users[i] })
                                }

                                socket.emit("key_room_main", { list: send_room })

                                list_friend_online = list_friend_online
                                socket.emit("key_friend_online", { list: list_friend_online })

                                // check exist in room
                                for (var i = 0; i < list_room.length; i++) {
                                    for (var j = 0; j < 10; j++) {
                                        if (compare(list_room[i].users[j].user._id, user._id)) {
                                            socket.emit("key_in_room", { room: list_room[i] })
                                            socket.join(list_room[i].code)
                                            user.code_room = list_room[i].code // Update code_room
                                            user.status = list_room[i].status
                                            break
                                        }
                                    }
                                }
                            }
                            else {
                                // The first => initialize user and save
                                var new_user = {
                                    uid: x.uid, username: x.username, name: x.name,
                                    url_photo: x.url_photo, list_room: [], follower: [], following: [], block: []
                                }
                                // *** ASSIGN USER LOGIN *** 
                                dbo.collection("users").insertOne(new_user, function (err, res) {
                                    if (err) throw err;
                                    else {
                                        console.log("1 document inserted");
                                        console.log(res.ops[0])
                                        var x1 = JSON.parse(JSON.stringify(res.ops[0]))
                                        user = {
                                            _id: x1._id, uid: x1.uid, username: x1.username, name: x1.name,
                                            size_following: 0, size_follower: 0, url_photo: x1.url_photo, status: Status.ONLINE, code_room: ""
                                        }

                                        list_socket_id[user._id] = socket.id
                                        // *** Push user to list online *** 
                                        users_online.push(user)

                                        socket.emit("key_user_main", { user: user })

                                        var cnt = 0
                                        var list_recommend = []
                                        let st = new Set()
                                        st.add(JSON.stringify(user._id))

                                        console.log("Length: " + users_online.length)

                                        while (cnt < min(20, users_online.length)) {
                                            var rand = Math.floor(Math.random() * users_online.length)
                                            console.log("Rand: " + users_online.length)
                                            if (!st.has(JSON.stringify(users_online[rand]._id))) {
                                                var o1 = users_online[rand]
                                                list_recommend.push({
                                                    _id: o1._id, uid: o1.uid, username: o1.username, name: o1.name,
                                                    url_photo: o1.url_photo,
                                                    follow: false, block: false, status: o1.status, code_room: o1.code_room
                                                }) // RECOMMEND
                                                st.add(JSON.stringify(users_online[rand]._id))
                                                cnt += 1
                                            }
                                        }

                                        var room_users = [] // number of users each room 
                                        for (var i = 0; i < 11; i++) {
                                            room_users.push(0)
                                        }

                                        for (var i = 0; i < list_room.length; i++) {
                                            for (var j = 0; j < 10; j++) {
                                                if (list_room[i].users[j].user._id != "") {
                                                    room_users[list_room[i].type]++;
                                                }
                                            }
                                        }

                                        var send_room = []
                                        for (var i = 0; i < 11; i++) {
                                            send_room.push({ type: i, number: room_users[i] })
                                        }

                                        socket.emit("key_room_main", { list: send_room })

                                        list_user_recommend = list_recommend
                                        socket.emit("key_recommend", { list: list_recommend })
                                        console.log("list_recommend: " + list_recommend.toString())
                                        socket_id[user._id] = socket
                                        socket.id = user._id
                                        // db.close();
                                    }
                                });
                            }

                        })
                        global.io.emit("listupdate", { list: users_online })
                        //db.close()
                    });
                })

                // ************************ LOGOUT ************************

                socket.on("logout", function (data) {
                    console.log("logout")
                    var x = JSON.parse(data)

                    MongoClient.connect(url, function (err, db) { // get data from database mongodb collections
                        if (err) throw err;
                        var dbo = db.db("testdb");

                        dbo.collection("users").find({ _id: ObjectId(x._id) }).toArray(function (err, result) {

                            if (result.length > 0) {
                                //  console.log(user)
                                for (var i = 0; i < users_online.length; i++) {
                                    // compare username to delete user online 
                                    if (JSON.stringify(users_online[i]._id.toString()) === JSON.stringify(user._id.toString())) {
                                        socket_id[users_online[i].uid] = null
                                        users_online.splice(i, 1)
                                        //socket_id.splice(users_online[i].uid, 1)
                                        console.log("Deleted Successfully " + i)
                                        break
                                    }
                                }

                                var x1 = JSON.parse(JSON.stringify(result[0]))
                                //console.log(x1)
                                var friend_online = x1.follower
                                let st_friend = new Set()
                                for (var i = 0; i < friend_online.length; i++) {
                                    st_friend.add(JSON.stringify(friend_online[i]._id))
                                }

                                // emit to client of user follower
                                console.log("Emit Friend Offline")
                                for (var i = 0; i < users_online.length; i++) {
                                    if (st_friend.has(JSON.stringify(users_online[i]._id))) {
                                        // socket_id[users_online[i]._id].emit("friend_offline", { user: tmp_user }) // wrong

                                        var tmp_user = {
                                            _id: user._id, uid: user.uid, username: user.username, name: user.name,
                                            url_photo: user.url_photo, status: user.status, code_room: user.code_room
                                        }

                                        global.io.to(list_socket_id[users_online[i]._id]).emit("friend_offline", { user: tmp_user })
                                        // console.log("users_online[i]._id: " + users_online[i]._id)
                                    }
                                }
                            }
                            // user_status[user._id] = {}

                        })
                        db.close()
                    })
                    //console.log(x)

                    // socket_id[x._id] = null

                    // Emit to Friend Following
                    // for(var i = 0 ;i< user.following.length;i++){
                    //     //socket[user.following[i].username].emit("key_")
                    // }
                    // if (users_online.length > 0) {
                    //     global.io.emit("listupdate", { list: users_online })
                    // }
                })

                // When login, follow online and recommend
                socket.on("key_online_friend", function (data) {
                    var x = JSON.parse(data)
                    console.log("key_online_friend")
                    var check = false
                    for (var i = 0; i < list_online_friend.length; i++) {
                        if (JSON.stringify(list_online_friend[i]._id) === JSON.stringify(x._id)) {
                            check = true
                            break
                        }
                    }
                    if (!check) {
                        list_online_friend.push(x)
                        var res_online = []
                        for (var i = 0; i < list_online_friend.length; i++) {
                            var x1 = list_online_friend[i]
                            res_online.push({
                                _id: x1._id, uid: x1.uid, username: x1.username, name: x1.name,
                                url_photo: x1.url_photo, status: x1.status, code_room: x1.code_room // FOLLOWING_ONLINE
                            })
                        }

                        var check_recommend = false
                        for (var i = 0; i < list_user_recommend.length; i++) {
                            if (JSON.stringify(list_user_recommend[i]._id) === JSON.stringify(x._id)) {
                                list_user_recommend[i].follow = true
                                check_recommend = true
                                break
                            }
                        }
                        console.log(">> *** ONLINE")

                        socket.emit("key_friend_online", { list: res_online })

                        if (check_recommend) {
                            socket.emit("key_recommend", { list: list_user_recommend })
                        }
                    }
                })

                // When Logout, Un_follow
                socket.on("key_offline_friend", function (data) {
                    var x = JSON.parse(data)

                    for (var i = 0; i < list_online_friend.length; i++) {
                        if (JSON.stringify(list_online_friend[i]._id) === JSON.stringify(x._id)) {
                            list_online_friend.splice(i, 1)
                            break
                        }
                    }

                    var res_online = []
                    for (var i = 0; i < list_online_friend.length; i++) {
                        var x1 = list_online_friend[i]
                        res_online.push({
                            _id: x1._id, uid: x1.uid, username: x1.username, name: x1.name,
                            url_photo: x1.url_photo, status: x1.status, code_room: x1.code_room // FOLLOWING_ONLINE
                        })
                    }
                    console.log("key_offline_friend" + res_online)
                    socket.emit("key_friend_online", { list: res_online })
                })

                // ***************** FOLLOW ********************
                socket.on('key_user_follow', function (res) {

                    var x = JSON.parse(res) // x users(_id: , uid: , username: , name: url_photo: )
                    console.log(x.toString())

                    var user_add = { _id: user._id, uid: user.uid, username: user.username, name: user.name, url_photo: user.url_photo }


                    MongoClient.connect(url, function (err, db) {

                        var dbo = db.db("testdb");

                        // Update Data User Following
                        dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, result) {
                            var x1 = JSON.parse(JSON.stringify(result[0]))
                            var list_following = x1.following
                            list_following.push(x)

                            dbo.collection("users").findOneAndUpdate({ _id: ObjectId(x1._id) }, {
                                uid: x1.uid, username: x1.username, name: x1.name, url_photo: x1.url_photo,
                                list_room: x1.list_room, follower: x1.follower, following: list_following, block: x1.block
                            }, function (err, res) {
                                console.log("Update Following Successfully")
                                //console.log(res.result.nModified + " document(s) updated");
                                user.size_following = list_following.length
                                socket.emit("key_user_main", { user: user })

                            });
                        })

                        // Update Data User Follower
                        dbo.collection("users").find({ _id: ObjectId(x._id) }).toArray(function (err, res) {

                            //console.log(res.result.nModified + " document(s) updated");
                            var friend = JSON.parse(JSON.stringify(res[0]))
                            var list_follower = friend.follower
                            if (list_follower == null) {
                                list_follower = []
                            }
                            list_follower.push(user_add)

                            dbo.collection("users").findOneAndUpdate({ _id: ObjectId(x._id) }, {
                                uid: friend.uid, username: friend.username, name: friend.name, url_photo: friend.url_photo,
                                list_room: friend.list_room, follower: list_follower, following: friend.following, block: friend.block
                            }, function (err, res) {
                                console.log("Update Follower Successfully")
                                //console.log(res.result.nModified + " document(s) updated");
                                // for (var i = 0; i < users_online.length; i++) {
                                //     if (JSON.stringify(users_online[i]._id) === JSON.stringify(x._id)) {
                                //         console.log("Emit friend_online")
                                for (var i = 0; i < users_online.length; i++) {
                                    if (compare(users_online[i]._id, x._id)) {
                                        var o = {
                                            _id: friend._id,
                                            uid: friend.uid, username: friend.username, name: friend.name,
                                            url_photo: friend.url_photo, status: users_online[i].status, code_room: users_online[i].code_room
                                        }

                                        var check = false
                                        for (var i = 0; i < list_online_friend.length; i++) {
                                            if (JSON.stringify(list_online_friend[i]._id) === JSON.stringify(o._id)) {
                                                check = true
                                                break
                                            }
                                        }
                                        if (!check) {
                                            list_online_friend.push(x)
                                            var res_online = []
                                            for (var i = 0; i < list_online_friend.length; i++) {
                                                var x1 = list_online_friend[i]
                                                res_online.push({
                                                    _id: x1._id, uid: x1.uid, username: x1.username, name: x1.name,
                                                    url_photo: x1.url_photo, status: x1.status, code_room: x1.code_room // FOLLOWING_ONLINE
                                                })
                                            }
                                            console.log("*********** EMIT TRUE **************")

                                            socket.emit("friend_online", { user: o })
                                        }
                                    }
                                }

                                var check_recommend = false

                                for (var i = 0; i < list_user_recommend.length; i++) {
                                    if (JSON.stringify(list_user_recommend[i]._id) === JSON.stringify(x._id)) {
                                        list_user_recommend[i].follow = true
                                        check_recommend = true
                                        break
                                    }
                                }

                                var check_search = false
                                var index_search = -1

                                for (var i = 0; i < list_search.length; i++) {
                                    if (JSON.stringify(list_search[i]._id) === JSON.stringify(x._id)) {
                                        list_search[i].follow = true
                                        check_search = true
                                        index_search = i
                                        break
                                    }
                                }

                                console.log(">> *** ONLINE")


                                if (check_recommend) {
                                    socket.emit("key_recommend", { list: list_user_recommend })
                                }

                                console.log("Update search " + index_search)
                                if (check_search) {
                                    socket.emit("key_update_search", { index: index_search, user: list_search[index_search] })
                                }
                                // socket.emit("friend_online", { user: o })
                                // break
                                //}
                                //}
                                // var check = false
                                // for (var i = 0; i < list_user_recommend.length; i++) {
                                //     if (list_user_recommend[i]._id == x._id) {
                                //         list_user_recommend[i].follow = true
                                //         check = true;
                                //         break
                                //     }
                                // }
                                // if (check) {
                                //     socket.emit("key_recommend", { list: list_user_recommend })
                                // }
                            });
                            db.close()
                        });
                    });
                })

                // ***************** UN_FOLLOW ********************
                socket.on('key_user_unfollow', function (res) {

                    var x = JSON.parse(res)

                    MongoClient.connect(url, function (err, db) {

                        var dbo = db.db("testdb");
                        dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, result) {
                            var x1 = JSON.parse(JSON.stringify(result[0]))
                            var list_following = x1.following
                            for (var i = 0; i < list_following.length; i++) {
                                if (list_following[i]._id === x._id) {
                                    list_following.splice(i, 1)
                                    break
                                }
                            }

                            dbo.collection("users").findOneAndUpdate({ _id: ObjectId(user._id) }, {
                                uid: x1.uid, username: x1.username, name: x1.name, url_photo: x1.url_photo,
                                list_room: x1.list_room, follower: x1.follower, following: list_following, block: x1.block
                            }, function (err, res) {

                                user.size_following = list_following.length

                                socket.emit("key_user_main", { user: user })
                                console.log("Updated Successfully")
                                // db.close();
                            });
                        })

                        dbo.collection("users").find({ _id: ObjectId(x._id) }).toArray(function (err, res) {
                            //console.log(res.result.nModified + " document(s) updated");
                            var friend = JSON.parse(JSON.stringify(res[0]))
                            var list_follower = friend.follower
                            if (list_follower == null) {
                                list_follower = []
                            }
                            for (var i = 0; i < list_follower.length; i++) {
                                if (user.username == list_follower[i].username) {
                                    list_follower.splice(i, 1)
                                    break
                                }
                            }

                            dbo.collection("users").findOneAndUpdate({ _id: ObjectId(x._id) }, {
                                uid: friend.uid, username: friend.username, name: friend.name, url_photo: friend.url_photo,
                                list_room: friend.list_room, follower: list_follower, following: friend.following, block: friend.block
                            }, function (err, res) {
                                //console.log(res.result.nModified + " document(s) updated")

                                for (var i = 0; i < list_online_friend.length; i++) {
                                    if (JSON.stringify(list_online_friend[i]._id) === JSON.stringify(x._id)) {
                                        list_online_friend.splice(i, 1)
                                        break
                                    }
                                }

                                var res_online = []
                                for (var i = 0; i < list_online_friend.length; i++) {
                                    var x1 = list_online_friend[i]
                                    res_online.push({
                                        _id: x1._id, uid: x1.uid, username: x1.username, name: x1.name,
                                        url_photo: x1.url_photo, status: x1.status, code_room: x1.code_room // FOLLOWING_ONLINE
                                    })
                                }
                                console.log("key_offline_friend" + res_online)
                                // socket.emit("key_friend_online", { list: res_online })

                                console.log("Emit friend_offline")

                                var o = {
                                    _id: x._id, uid: x.uid, username: x.username, name: x.name,
                                    url_photo: x.url_photo, status: x.status, code_room: x.code_room
                                }

                                socket.emit("friend_offline", { user: o }) // ********* FRIEND_OFFLINE **************


                                var check = false

                                for (var i = 0; i < list_user_recommend.length; i++) {
                                    if (JSON.stringify(list_user_recommend[i]._id) === JSON.stringify(x._id)) {
                                        check = true
                                        list_user_recommend[i].follow = false
                                        break
                                    }
                                }

                                var check_search = false
                                var index_search = -1

                                for (var i = 0; i < list_search.length; i++) {
                                    if (JSON.stringify(list_search[i]._id) === JSON.stringify(x._id)) {
                                        list_search[i].follow = false
                                        check_search = true
                                        index_search = i
                                        break
                                    }
                                }

                                if (check_search) {
                                    socket.emit("key_update_search", { index: index_search, user: list_search[index_search] })
                                }

                                console.log(">> *** OFFLINE")

                                console.log("Update search " + index_search)

                                if (check) {
                                    socket.emit("key_recommend", { list: list_user_recommend })
                                }

                                // socket.emit("friend_offline", { user: o })

                                // var check = false
                                // for (var i = 0; i < list_user_recommend.length; i++) {
                                //     if (list_user_recommend[i]._id == x._id) {
                                //         list_user_recommend[i].follow = false
                                //         check = true;
                                //         break
                                //     }
                                // }
                                // if (check) {
                                //     socket.emit("key_recommend", { list: list_user_recommend })
                                // }
                                console.log("Updated Successfully")
                            });
                            db.close()
                        });
                    });
                })

                // ************ BLOCK **************
                socket.on('key_user_block', (res) => {

                    var x = JSON.parse(res)
                    console.log(x.toString())
                    // var list_block = user.block
                    // list_block.push(x)

                    // MongoClient.connect(url, function (err, db) {
                    //     if (err) throw err;
                    //     var dbo = db.db("testdb");
                    //     dbo.collection("users").findOneAndUpdate({ _id: ObjectId(user._id) }, {
                    //         uid: user.uid, username: user.username, name: user.name, photo_url: user.photo_url,
                    //         list_room: user.list_room, follower: user.follower, following: user.following, block: list_block
                    //     }, function (err, res) {
                    //         if (err) throw err;
                    //         //console.log(res.result.nModified + " document(s) updated");
                    //         console.log("Updated Successfully")
                    //         // db.close();
                    //     });
                    //     dbo.collection("users").find({ username: x.username }).toArray(function (err, res) {
                    //         if (err) throw err;
                    //         //console.log(res.result.nModified + " document(s) updated");
                    //         var friend = JSON.parse(JSON.stringify(res[0]))
                    //         var list_follower = friend.follower
                    //         if (list_follower == null) {
                    //             list_follower = []
                    //         }
                    //         for (var i = 0; i < list_following.length; i++) {
                    //             if (user.username == list_follower[i].username) {
                    //                 list_follower.splice(i, 1)
                    //                 break
                    //             }
                    //         }

                    //         dbo.collection("users").findOneAndUpdate({ username: x.username }, {
                    //             uid: friend.uid, username: friend.username, name: friend.name, photo_url: friend.photo_url,
                    //             list_room: friend.list_room, follower: list_follower, following: friend.following, block: friend.block
                    //         }, function (err, res) {
                    //             if (err) throw err;
                    //             //console.log(res.result.nModified + " document(s) updated");
                    //             console.log("Updated Successfully")
                    //         });
                    //         db.close()
                    //     });
                    // });
                    MongoClient.connect(url, function (err, db) {
                        if (err) throw err;
                        var dbo = db.db("testdb");
                        dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, result) {
                            if (result.length > 0) {
                                var o = JSON.parse(JSON.stringify(result[0]))
                                var block = o.block
                                block.push(x)

                                dbo.collection("users").findOneAndUpdate({ _id: ObjectId(user._id) }, {
                                    uid: o.uid, username: o.username, name: o.name, url_photo: o.url_photo,
                                    list_room: o.list_room, follower: o.follower, following: o.following, block: block
                                }, function (err, res) {

                                    // socket.emit("key_user_main", { user: user })
                                    console.log("Updated Successfully")
                                });
                            }
                            db.close()
                        })
                    })
                })


                // ************ UNBLOCK ****************
                socket.on('key_user_unblock', (data) => {
                    var x = JSON.parse(data); // users _id: String, uid: String, username: String, name: String, url_photo: String

                    MongoClient.connect(url, function (err, db) {
                        if (err) throw err;
                        var dbo = db.db("testdb");
                        dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, result) {
                            if (result.length > 0) {
                                var o = JSON.parse(JSON.stringify(result[0]))
                                var block = o.block
                                // Delete user block
                                for (var i = 0; i < block.length; i++) {
                                    if (compare(block[i]._id, x._id)) {
                                        block.splice(i, 1)
                                        break
                                    }
                                }
                                dbo.collection("users").findOneAndUpdate({ _id: ObjectId(user._id) }, {
                                    uid: o.uid, username: o.username, name: o.name, url_photo: o.url_photo,
                                    list_room: o.list_room, follower: o.follower, following: o.following, block: block
                                }, function (err, res) {


                                    // socket.emit("key_user_main", { user: user })
                                    console.log("Updated Successfully")
                                });
                            }
                            db.close()
                        })
                    })
                })

                // **** REQUEST LIST FRIEND ****

                socket.on("key_list_follow", (res) => {
                    console.log(">> User request list follow")

                    var x = JSON.parse(res)
                    console.log(x)
                    // x = { users: , type_follow: 0?following: follower}

                    MongoClient.connect(url, function (err, db) {
                        if (err) throw err;
                        var dbo = db.db("testdb");
                        dbo.collection("users").find({ _id: ObjectId(x.user._id) }).toArray(function (err, result) {
                            if (err) throw err;
                            else {
                                var x1 = JSON.parse(JSON.stringify(result[0]))
                                if (x.user._id == user._id && x.type_follow == FOLLOWING) {
                                    var following = x1.following
                                    var list = []
                                    for (var i = 0; i < following.length; i++) {
                                        list.push({
                                            _id: following[i]._id, uid: following[i].uid, username: following[i].username,
                                            name: following[i].name, follow: true, block: false, size_following: following[i].size_following,
                                            size_follower: following[i].size_follower, url_photo: following[i].url_photo
                                        })
                                    }
                                    socket.emit("list_user", { list: list })
                                }
                                else {
                                    if (x.type_follow == FOLLOWING) {
                                        // FOLLOWING
                                        var following = x1.following
                                        dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, result) {
                                            if (err) throw err;
                                            else {
                                                var x2 = JSON.parse(JSON.stringify(result[0]))
                                                // Update user
                                                user = {
                                                    _id: x2._id, username: x2.username, name: x2.name, size_following: x2.following.length,
                                                    size_follower: x2.follower.length, url_photo: x2.url_photo
                                                }
                                                var user_following = x2.following
                                                // Check had in user_following
                                                let set = new Set()
                                                for (var i = 0; i < user_following.length; i++) {
                                                    set.add(user_following[i]._id)
                                                }
                                                var list = []
                                                for (var i = 0; i < following.length; i++) {
                                                    var x3 = following[i]
                                                    var temp = false
                                                    if (set.has(following[i]._id)) {
                                                        temp = true
                                                    }
                                                    list.push({
                                                        _id: x3._id, uid: x3.uid, username: x3.username, name: x3.name, follow: temp, block: false,
                                                        size_following: x3.size_following, size_follower: x3.size_following, url_photo: x3.url_photo
                                                    })
                                                }
                                                socket.emit("list_user", { list: list })
                                            }
                                        })
                                    }
                                    else {
                                        // FOLLOWER
                                        var follower = x1.follower
                                        dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, result) {
                                            if (err) throw err;
                                            else {
                                                var x2 = JSON.parse(JSON.stringify(result[0]))
                                                // Update user
                                                user = {
                                                    _id: x2._id, username: x2.username, name: x2.name, size_following: x2.following.length,
                                                    size_follower: x2.follower.length, url_photo: x2.url_photo
                                                }
                                                var user_following = x2.following
                                                // Check had in user_following
                                                let set = new Set()
                                                for (var i = 0; i < user_following.length; i++) {
                                                    set.add(JSON.stringify(user_following[i]._id))
                                                }
                                                var list = []
                                                for (var i = 0; i < follower.length; i++) {
                                                    var x3 = follower[i]
                                                    var temp = false
                                                    if (set.has(JSON.stringify(follower[i]._id))) {
                                                        temp = true
                                                    }
                                                    list.push({
                                                        _id: x3._id, uid: x3.uid, username: x3.username, name: x3.name, follow: temp, block: false,
                                                        size_following: x3.size_following, size_follower: x3.size_following, url_photo: x3.url_photo
                                                    })
                                                }
                                                socket.emit("list_user", { list: list })
                                            }
                                        })
                                    }
                                }
                            }
                        })
                    })
                })

                socket.on("key_list_block", (res) => {
                    // var x = JSON.parse(res)
                    // x = { , type_follow: 0?following: follower}

                    MongoClient.connect(url, function (err, db) {
                        if (err) throw err;
                        var dbo = db.db("testdb");
                        dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, res) {
                            var x1 = JSON.parse(JSON.stringify(res[0]))
                            if (err) throw err;
                            else {
                                socket.emit("list_user", { list: x1.block })
                            }
                        })
                    })
                })

                socket.on("key_profile_user", function (data) {
                    MongoClient.connect(url, function (err, db) { // get data from database mongodb collections
                        if (err) throw err;
                        var dbo = db.db("testdb");

                        dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, result) {
                            if (err) {

                            }
                            else {
                                var x1 = JSON.parse(JSON.stringify(result[0]))
                                console.log(x1)

                                // **** SAVE USER ****
                                user = {
                                    _id: x1._id, username: x1.username, name: x1.name, size_following: x1.following.length,
                                    size_follower: x1.follower.length, url_photo: x1.url_photo
                                } // *** ASSIGN USER LOGIN *** 

                                socket.emit("key_user_main", { user: user })
                            }
                        })
                    })
                })

                // **** REQUEST PROFILE FRIEND ****
                socket.on("key_profile_friend", function (data) {
                    console.log(data)
                    var x = JSON.parse(data)
                    // x = { , type_follow: 0?following: follower}
                    console.log(x._id)

                    MongoClient.connect(url, function (err, db) { // get data from database mongodb collections
                        if (err) throw err;
                        var dbo = db.db("testdb");

                        dbo.collection("users").find({ _id: ObjectId(x._id) }).toArray(function (err, result) {
                            if (result.length > 0) {

                                var x1 = JSON.parse(JSON.stringify(result[0]))
                                var x2 = {
                                    _id: x1._id, uid: x1.uid, username: x1.username, name: x1.name, follow: false, block: false,
                                    size_following: x1.following.length, size_follower: x1.follower.length, url_photo: x1.url_photo
                                }

                                dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, res) {
                                    if (err) throw err;
                                    var o = JSON.parse(JSON.stringify(res[0]))
                                    var follow = o.following
                                    var block = o.block
                                    // Check Follow
                                    for (var i = 0; i < follow.length; i++) {
                                        if (compare(follow[i]._id, x._id)) {
                                            x2.follow = true
                                            break
                                        }
                                    }
                                    // Check Block
                                    for (var i = 0; i < block.length; i++) {
                                        if (compare(block[i]._id, x._id)) {
                                            x2.block = true
                                            break
                                        }
                                    }
                                    socket.emit("key_receive_profile_friend", { user: x2 })
                                })
                            }
                        })
                    })
                })

                // room save all room of server 

                // ***************** CREATE ROOM ********************
                // class users(
                //     var _id: String,
                //     var uid: String,
                //     var username: String,
                //     var name: String,
                //     var size_following: Int,
                //     var size_follower: Int,
                //     var url_photo: String
                // ) 

                socket.on('key_create_room', (data) => {
                    var x = JSON.parse(data) // {private : true or false, admin: user._id, }
                    // socket.join(data)
                    if (list_room.length == 0) {
                        var list_users = []
                        var admin = { user: { _id: user._id, uid: user.uid, username: user.username, name: user.name, url_photo: user.url_photo }, mute: false }
                        list_users.push(admin)
                        for (var i = 0; i < 9; i++) {
                            // push null user
                            list_users.push({ user: { _id: "", uid: "", username: "", name: "", url_photo: "" }, mute: true })
                        }
                        // console.log("list_users: " + list_users)
                        var room = { code: "3001", private: x.private, users: list_users, type: x.type, admin: admin }

                        ind_room = 0 // index not important

                        // user_status
                        // user_status[user._id] = { status: x.type, code_room: "3001" }

                        list_room.push(room) // push to list_room

                        console.log("List_room " + list_room[0].admin._id)
                        // ********** UPDATE USERS_ONLINE ****************
                        for (var i = 0; i < users_online.length; i++) {
                            if (compare(users_online[i]._id, user._id)) {
                                users_online[i].status = x.type
                                users_online[i].code_room = "3001"
                                break;
                            }
                        }

                        // ********** UPDATE USER ****************
                        user.status = x.type
                        user.code_room = "3001"
                        // important

                        socket.join("3001")
                        socket.emit("result_create_room", { code: "3001", private: x.private, type: x.type, users: list_users, admin: admin })
                        console.log("key_create_room")

                        // send to follower
                        MongoClient.connect(url, function (err, db) { // get data from database mongodb collections
                            if (err) throw err;
                            var dbo = db.db("testdb");
                            // console.log("UserName: " + user._id)
                            dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, result) {
                                if (result.length > 0) {

                                    var o = JSON.parse(JSON.stringify(result[0]))
                                    var follower = o.follower

                                    console.log("********** CONNECT DB ***********")

                                    let st_follower = new Set()
                                    for (var i = 0; i < follower.length; i++) {
                                        st_follower.add(JSON.stringify(follower[i]._id))
                                    }

                                    for (var i = 0; i < users_online.length; i++) {
                                        if (st_follower.has(JSON.stringify(users_online[i]._id))) {
                                            // socket_id[users_online[i]._id].emit()
                                            var data = {
                                                _id: user._id, uid: user.uid, username: user.username, name: user.name, url_photo: user.url_photo,
                                                status: user.status, code_room: user.code_room
                                            } // FOLLOWING ONLINE
                                            console.log("************ EMIT FRIEND OK *******************")

                                            socket_id[users_online[i]._id].emit("friend_online", { user: data }) // send to client of follower
                                        }
                                    }

                                }
                            })
                        })
                    }
                    else {

                        var code = parseInt(list_room[list_room.length - 1].code)
                        code += (Math.floor(Math.random() * 20) + 1)
                        console.log("Code: " + code)
                        var list_users = []
                        var admin = { user: { _id: user._id, uid: user.uid, username: user.username, name: user.name, url_photo: user.url_photo }, mute: false }
                        list_users.push(admin)
                        for (var i = 0; i < 9; i++) {
                            // push null user
                            list_users.push({ user: { _id: "", uid: "", username: "", name: "", url_photo: "" }, mute: true })
                        }
                        // console.log("list_users: " + list_users)
                        var room = { code: code.toString(), private: x.private, users: list_users, type: x.type, admin: admin }

                        ind_room = list_room.length // no important    
                        // code_room = code.toString() // save to user in db reconnect to find

                        // user_status[user._id] = { status: x.type, code_room: code_room }
                        for (var i = 0; i < users_online.length; i++) {
                            if (compare(users_online[i]._id, user._id)) {
                                users_online[i].status = x.type
                                users_online[i].code_room = code.toString()
                                break;
                            }
                        }
                        // ********** UPDATE USER ****************
                        user.status = x.type
                        user.code_room = "3001"
                        // ********** Important *************

                        list_room.push(room) // push to list_room
                        socket.join(code.toString())
                        socket.emit("result_create_room", { code: code.toString(), private: x.private, type: x.type, users: list_users, admin: admin })

                        // send to follower
                        MongoClient.connect(url, function (err, db) { // get data from database mongodb collections
                            if (err) throw err;
                            var dbo = db.db("testdb");
                            console.log("UserName: " + user._id)
                            dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, result) {
                                if (result.length > 0) {
                                    var o = JSON.parse(JSON.stringify(result[0]))
                                    var follower = o.follower

                                    let st_follower = new Set()
                                    for (var i = 0; i < follower.length; i++) {
                                        st_follower.add(JSON.stringify(follower[i]._id))
                                    }

                                    for (var i = 0; i < users_online.length; i++) {
                                        if (st_follower.has(JSON.stringify(users_online[i]._id))) {
                                            // socket_id[users_online[i]._id].emit()
                                            var data = {
                                                _id: user._id, uid: user.uid, username: user.username, name: user.name, url_photo: user.url_photo,
                                                status: user.status, code_room: user.code_room
                                            } // FOLLOWING ONLINE

                                            socket_id[users_online[i]._id].emit("friend_online", { user: data }) // send to client of follower
                                        }
                                    }

                                }
                            })
                        })

                    }
                })

                // ***************** JOIN ROOM ***********************
                // room: code: init length = 0: 3001, String generate by code number of final room in list_room + random(1-20)
                //  type: 0-10, users: save users, admin: host create room or user join after, private: true or false  

                socket.on('key_join_room', (data) => {
                    var x = JSON.parse(data)
                    // check id of room is valid
                    // socket.to(roomId).broadcast.emit('user_connected', userId)
                    // io.sockets.in("room-" + roomno).emit()
                    console.log("JOIN ROOM")
                    console.log("type: " + x.type)
                    var ind = -1
                    var min = 10

                    // Find the room is public and has same type and has the minimum user join
                    for (var i = 0; i < list_room.length; i++) {
                        if (!list_room[i].private && list_room[i].type == x.type) {
                            var cnt = 0
                            for (var j = 0; j < 10; j++) {
                                if (JSON.stringify(list_room[i].users[j].user._id) != JSON.stringify("")) {
                                    cnt++
                                }
                            }
                            if (cnt < min) {
                                min = cnt
                                ind = i
                            }
                        }
                    }

                    ind_room = ind // ind_room status of user

                    console.log(ind_room)
                    if (ind == -1 || min == 10) {
                        // { found: found the room, }
                        socket.emit("key_join_room", { found: false, room: null })
                        // user_status[user._id] = { status: Status.ONLINE, code_room: "" }
                    }
                    else {

                        for (var i = 1; i < 10; i++) {
                            if (JSON.stringify(list_room[ind].users[i].user._id) == JSON.stringify("")) {
                                var user_room = { user: { _id: user._id, uid: user.uid, username: user.username, name: user.name, url_photo: user.url_photo }, mute: false }
                                list_room[ind].users[i] = user_room
                                break
                            }
                        }

                        socket.join(list_room[ind].code) // socket join room 

                        socket.emit("key_join_room", { found: true, room: list_room[ind] }) // send to user 

                        var user_send = { _id: user._id, uid: user.uid, user_name: user.user_name, name: user.name, url_photo: user.url_photo }
                        socket.to(list_room[ind].code).emit("key_room_update", { room: list_room[ind], user_send: user_send, type_message: MESSAGE_JOINED, message: "" }) // send to other user in room

                        // user_status 
                        // user_status[user._id] = { status: x.type, code_room: code_room}
                        for (var i = 0; i < users_online.length; i++) {
                            if (compare(users_online[i]._id, user._id)) {
                                users_online[i].status = x.type
                                users_online[i].code_room = list_room[ind].code
                                break
                            }
                        }

                        // ********** UPDATE USER ****************
                        user.status = x.type
                        user.code_room = list_room[ind].code // Update Code Room

                        // send to follower
                        MongoClient.connect(url, function (err, db) { // get data from database mongodb collections
                            if (err) throw err;
                            var dbo = db.db("testdb");

                            dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, result) {
                                if (result.length > 0) {
                                    var o = JSON.parse(JSON.stringify(result[0]))
                                    var follower = o.follower

                                    let st_follower = new Set()
                                    for (var i = 0; i < follower.length; i++) {
                                        st_follower.add(JSON.stringify(follower[i]._id))
                                    }

                                    for (var i = 0; i < users_online.length; i++) {
                                        if (st_follower.has(JSON.stringify(users_online[i]._id))) {
                                            // socket_id[users_online[i]._id].emit()
                                            var data = {
                                                _id: user._id, uid: user.uid, username: user.username, name: user.name, url_photo: user.url_photo,
                                                status: user.status, code_room: user.code_room
                                            } // FOLLOWING ONLINE

                                            socket_id[users_online[i]._id].emit("friend_online", { user: data }) // send to client of follower
                                        }
                                    }

                                }
                            })
                        })
                        // io.in(list_room[ind].code).emit("join_room", {
                        //     found: true, room: list_room[ind]
                        // })
                    }
                })

                // ********************* LEAVE ROOM ********************
                socket.on("key_leave_room", (data) => {
                    var x = JSON.parse(data)
                    console.log("Leave Room")

                    for (var i = 0; i < list_room.length; i++) {
                        if (JSON.stringify(list_room[i].code) == JSON.stringify(user.code_room)) {
                            /* Update Admin of room 
                            *  if no one 
                            *  delete room
                            *  else swap to 0 and update new admin 
                            */
                            console.log("list_room " + list_room[i].admin._id)
                            console.log("list_room " + user._id)
                            if (JSON.stringify(list_room[i].admin.user._id) == JSON.stringify(user._id)) {

                                console.log("check_admin")
                                var check_admin = false
                                list_room[i].users[0] = { user: { _id: "", uid: "", username: "", name: "", url_photo: "" }, mute: true }
                                for (var j = 1; j < 10; j++) {
                                    if (list_room[i].users[j].user._id.length > 0) {
                                        console.log("Id Admin: " + list_room[i].admin.user._id)
                                        check_admin = true
                                        list_room[i].users[0] = list_room[i].users[j]
                                        list_room[i].users[j] = { user: { _id: "", uid: "", username: "", name: "", url_photo: "" }, mute: true }
                                        list_room[i].admin = list_room[i].users[0]
                                        console.log("Id Admin: " + list_room[i].admin.user._id)
                                        break
                                    }
                                }

                                console.log("Admin: " + list_room[i].admin)

                                // update status
                                // user_status[user._id] = { status: x.type, code_room: code_room}

                                if (!check_admin) { // check no user in room
                                    list_room.splice(i, 1) // ********************** DELETE ROOM *********************
                                    console.log("Splice")
                                }
                                else {
                                    var room = list_room[i]
                                    var user_send = { _id: user._id, uid: user.uid, user_name: user.user_name, name: user.name, url_photo: user.url_photo }

                                    socket.to(room.code).emit("key_room_update", { room: room, user_send: user_send, type_message: MESSAGE_NULL, message: "" })
                                }

                            }
                            else {
                                for (var j = 0; j < 10; j++) {
                                    if (list_room[i].users[j].user._id.length > 0 && JSON.stringify(list_room[i].users[j].user._id) == JSON.stringify(user._id)) {
                                        list_room[i].users[j] = { user: { _id: "", uid: "", username: "", name: "", url_photo: "" }, mute: true }
                                        var room = list_room[i]

                                        // update status
                                        // user_status[user._id] = { status: x.type, code_room: code_room}
                                        var user_send = { _id: user._id, uid: user.uid, user_name: user.user_name, name: user.name, url_photo: user.url_photo }


                                        socket.to(room.code).emit("key_room_update", { room: room, user_send: user_send, type_message: MESSAGE_NULL, message: "" })

                                        break
                                    }
                                }
                            }
                            break
                        }
                    }

                    // ***************** UPDATE USERS_ONLINE *************
                    for (var i = 0; i < users_online.length; i++) {
                        if (compare(users_online[i]._id, user._id)) {
                            users_online[i].status = Status.ONLINE
                            users_online[i].code_room = ""
                            break
                        }
                    }

                    socket.leave(user.code_room) // *************** LEAVE ROOM RTC *********************
                    console.log("Leave: " + list_room)

                    // ********** UPDATE USER ****************
                    user.status = Status.ONLINE
                    user.code_room = ""

                    // ************** SEND TO FOLLOWER **************
                    MongoClient.connect(url, function (err, db) { // get data from database mongodb collections
                        if (err) throw err;
                        var dbo = db.db("testdb");

                        dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, result) {
                            if (result.length > 0) {

                                var o = JSON.parse(JSON.stringify(result[0]))
                                var follower = o.follower

                                let st_follower = new Set()
                                for (var i = 0; i < follower.length; i++) {
                                    st_follower.add(JSON.stringify(follower[i]._id))
                                }

                                for (var i = 0; i < users_online.length; i++) {
                                    if (st_follower.has(JSON.stringify(users_online[i]._id))) {
                                        // socket_id[users_online[i]._id].emit()
                                        var data = {
                                            _id: user._id, uid: user.uid, username: user.username, name: user.name, url_photo: user.url_photo,
                                            status: user.status, code_room: user.code_room
                                        } // FOLLOWING ONLINE

                                        socket_id[users_online[i]._id].emit("friend_online", { user: data }) // send to client of follower
                                    }
                                }

                            }
                        })
                    })
                    // update status
                    ind_room = -1
                })

                // ***************** CHAT IN ROOM ***********************
                socket.on('key_room_chat', (res) => {
                    var x = JSON.parse(res)
                    console.log(x.message)
                    for (var i = 0; i < list_room.length; i++) {
                        if (compare(user.code_room, list_room[i].code)) {
                            var room = list_room[i]

                            var user_send = { _id: user._id, uid: user.uid, user_name: user.user_name, name: user.name, url_photo: user.url_photo }

                            socket.to(user.code_room).emit("key_room_update", { room: room, user_send: user_send, type_message: MESSAGE_CHAT, message: x.message, pos: x.pos })
                            break
                        }
                    }
                    //socket.broadcast
                })

                // ***************** MIC ON - MUTE ***********************
                socket.on("key_room_mute", (data) => {
                    var x = JSON.parse(data)

                    for (var i = 0; i < list_room.length; i++) {
                        if (JSON.stringify(list_room[i].code) == JSON.stringify(user.code_room)) {

                            var user_room = {
                                user: {
                                    _id: user._id, uid: user.uid, username: user.username,
                                    name: user.name, url_photo: user.url_photo
                                }, mute: false
                            }

                            for (var j = 0; j < 10; j++) {
                                if (JSON.stringify(list_room[i].users[j].user._id) == JSON.stringify(user._id)) {
                                    list_room[i].users[j].mute = !list_room[i].users[j].mute
                                    break
                                }
                            }

                            var room = list_room[i]

                            socket.to(room.code).emit("key_room_update_mute", {
                                room: room, user_send: user_room,
                                type_message: MESSAGE_NULL, message: ""
                            })

                            break
                        }
                    }
                })

                // **************************** PRIVATE ***********************
                socket.on("key_change_private", (data) => {
                    var x = JSON.parse(data)

                    for (var i = 0; i < list_room.length; i++) {
                        if (JSON.stringify(list_room[i].code) == JSON.stringify(user.code_room)) {
                            list_room[i].private = !list_room[i].private
                            var room = list_room[i]

                            var user_send = { _id: user._id, uid: user.uid, user_name: user.user_name, name: user.name, url_photo: user.url_photo }

                            if (!list_room[i].private) {
                                socket.to(room.code).emit("key_room_update", { room: room, user_send: user_send, type_message: MESSAGE_PUBLIC, message: "" })
                            }
                            else {
                                socket.to(room.code).emit("key_room_update", { room: room, user_send: user_send, type_message: MESSAGE_PRIVATE, message: "" })
                            }
                            break
                        }
                    }
                })

                function compare(a, b) {
                    return JSON.stringify(a) == JSON.stringify(b)
                }

                // ***************************** NEXT ROOM ***************************
                socket.on("key_next_room", (res) => {
                    var x = JSON.parse(res)

                    for (var i = 0; i < list_room.length; i++) {
                        if (JSON.stringify(list_room[i].code) == JSON.stringify(user.code_room)) {

                            for (var j = 0; j < 10; j++) {
                                if (compare(list_room[i].users[j]._id, user._id)) {

                                    // NULL USER 
                                    list_room[i].users[j] = { user: { _id: "", uid: "", username: "", name: "", url_photo: "" }, mute: true }
                                    socket.leave(room.code)

                                    socket.to(room.code).emit("key_room_update", {
                                        room: room, user_send: user_send,
                                        type_message: MESSAGE_PUBLIC, message: ""
                                    })

                                    


                                    break;
                                }
                            }
                        }
                    }

                })

                // ***************************** INVITE ***********************
                socket.on("key_invite_user", (res) => {

                    var x = JSON.parse(res)
                    console.log(x._id + " " + x.name)
                    var user_invite = { _id: user._id, uid: user.uid, username: user.username, name: user.name, url_photo: user.url_photo }
                    MongoClient.connect(url, function (err, db) { // get data from database mongodb collections
                        if (err) throw err;
                        var dbo = db.db("testdb");

                        dbo.collection("users").find({ _id: ObjectId(x._id) }).toArray(function (err, result) {
                            if (result.length > 0) {
                                var o = JSON.parse(JSON.stringify(result[0]))

                                var check_friend = false
                                for (var i = 0; i < o.following.length; i++) {
                                    if (compare(user.__v, o.following[i]._id)) {
                                        check_friend = true
                                        break
                                    }
                                }

                                socket_id[x._id].emit('key_user_invite', { user: user_invite, type: user.status, code: user.code_room, friend: check_friend })
                            }
                        })
                    })
                })

                // ***************** RECEIVE INVITE IN ROOM ***********************
                socket.on("key_receive_invite", (res) => {
                    var x = JSON.parse(res)
                    // socket[x.uid].emit()
                    var check_exist = false
                    for (var i = 0; i < list_room.length; i++) {
                        if (compare(list_room[i].code, x.code)) {
                            check_exist = true

                            var check_full = true
                            var user_room = {
                                user: {
                                    _id: user._id, uid: user.uid, username: user.username,
                                    name: user.name, url_photo: user.url_photo
                                }, mute: false
                            }

                            for (var j = 1; j < 10; j++) {
                                if (JSON.stringify(list_room[i].users[j].user._id) == JSON.stringify("")) {

                                    list_room[i].users[j] = user_room
                                    check_full = false
                                    break
                                }
                            }

                            if (!check_full) {
                                socket.join(list_room[i].code) // socket join room 

                                socket.emit("key_join_room", { found: true, room: list_room[i] }) // send to user 
                                var user_send = { _id: user._id, uid: user.uid, user_name: user.user_name, name: user.name, url_photo: user.url_photo }

                                socket.to(list_room[i].code).emit("key_room_update", {room: list_room[i], user_send: user_send, type_message: MESSAGE_JOINED, message: "" }) // send to other user in room

                                // user_status 
                                // user_status[user._id] = { status: x.type, code_room: code_room}
                                for (var j = 0; j < users_online.length; j++) {
                                    if (compare(users_online[j]._id, user._id)) {
                                        users_online[j].status = list_room[i].type
                                        users_online[j].code_room = list_room[i].code
                                        break
                                    }
                                }

                                // ********** UPDATE USER ****************
                                user.status = list_room[i].type
                                user.code_room = list_room[i].code

                                // send to follower
                                MongoClient.connect(url, function (err, db) { // get data from database mongodb collections
                                    if (err) throw err;
                                    var dbo = db.db("testdb");

                                    dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, result) {
                                        if (result.length > 0) {
                                            var o = JSON.parse(JSON.stringify(result[0]))
                                            var follower = o.follower

                                            let st_follower = new Set()
                                            for (var i = 0; i < follower.length; i++) {
                                                st_follower.add(JSON.stringify(follower[i]._id))
                                            }

                                            for (var i = 0; i < users_online.length; i++) {
                                                if (st_follower.has(JSON.stringify(users_online[i]._id))) {
                                                    // socket_id[users_online[i]._id].emit()
                                                    var data = {
                                                        _id: user._id, uid: user.uid, username: user.username, name: user.name, url_photo: user.url_photo,
                                                        status: user.status, code_room: user.code_room
                                                    } // FOLLOWING ONLINE

                                                    socket_id[users_online[i]._id].emit("key_update_following_online", { user: data }) // send to client of follower
                                                }
                                            }

                                        }
                                    })
                                })
                            }
                            else {
                                socket.emit("key_error", { type_error: ERROR_FULL }) // FULL USER
                            }

                            break
                        }
                    }

                    if (!check_exist) {
                        socket.emit("key_error", { type_error: ERROR_ }) // Room is removed
                    }
                })

                socket.on("key_join_friend", (res) => {
                    var x = JSON.parse(res)
                    //  code: String
                    var check_private = true

                    for (var i = 0; i < list_room.length; i++) {
                        if (compare(list_room[i].code, x.code)) {
                            if (!list_room[i].private) {
                                check_private = false

                                var check_full = true

                                for (var j = 1; j < 10; j++) {
                                    if (JSON.stringify(list_room[i].users[j].user._id) == JSON.stringify("")) {

                                        var user_room = {
                                            user: {
                                                _id: user._id, uid: user.uid, username: user.username,
                                                name: user.name, url_photo: user.url_photo
                                            }, mute: false
                                        }

                                        list_room[i].users[j] = user_room
                                        check_full = false
                                        break
                                    }
                                }

                                if (!check_full) {
                                    socket.join(list_room[i].code) // socket join room 

                                    socket.emit("key_join_room", { found: true, room: list_room[i] }) // send to user 

                                    var user_send = {
                                        _id: user._id, uid: user.uid, user_name: user.user_name,
                                        name: user.name, url_photo: user.url_photo
                                    }

                                    socket.to(list_room[i].code).emit("key_room_update", {
                                        room: list_room[i], user_send: user_send,
                                        type_message: MESSAGE_JOINED, message: ""
                                    }) // send to other user in room

                                    // user_status 
                                    // user_status[user._id] = { status: x.type, code_room: code_room}
                                    for (var j = 0; j < users_online.length; j++) {
                                        if (compare(users_online[j]._id, user._id)) {
                                            users_online[j].status = list_room[i].type
                                            users_online[j].code_room = list_room[i].code
                                            break
                                        }
                                    }

                                    // ********** UPDATE USER ****************
                                    user.status = list_room[i].type
                                    user.code_room = list_room[i].code

                                    // send to follower
                                    MongoClient.connect(url, function (err, db) { // get data from database mongodb collections
                                        if (err) throw err;
                                        var dbo = db.db("testdb");

                                        dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, result) {
                                            if (result.length > 0) {
                                                var o = JSON.parse(JSON.stringify(result[0]))
                                                var follower = o.follower

                                                let st_follower = new Set()
                                                for (var i = 0; i < follower.length; i++) {
                                                    st_follower.add(JSON.stringify(follower[i]._id))
                                                }

                                                for (var i = 0; i < users_online.length; i++) {
                                                    if (st_follower.has(JSON.stringify(users_online[i]._id))) {
                                                        // socket_id[users_online[i]._id].emit()
                                                        var data = {
                                                            _id: user._id, uid: user.uid, username: user.username, name: user.name, url_photo: user.url_photo,
                                                            status: user.status, code_room: user.code_room
                                                        } // FOLLOWING ONLINE

                                                        socket_id[users_online[i]._id].emit("friend_online", { user: data }) // send to client of follower
                                                    }
                                                }

                                            }
                                        })
                                    })
                                }
                                else {
                                    socket.emit("key_error", { type_error: ERROR_FULL })
                                }
                            }
                            break
                        }
                    }

                    if (check_private) {
                        socket.emit("key_error", { type_error: ERROR_PRIVATE })
                    }

                })

                socket.on("key_room_recommend", (data) => {
                    var x1 = JSON.parse(data)

                    MongoClient.connect(url, function (err, db) { // get data from database mongodb collections
                        if (err) throw err;
                        var dbo = db.db("testdb");

                        dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, result) {

                            if (result.length > 0) {
                                console.log("Room  - RECOMMEND")
                                var x = JSON.parse(JSON.stringify(result[0]))

                                let st_following = new Set()

                                var list_recommend = []


                                for (var i = 0; i < x.following.length; i++) {
                                    st_following.add(JSON.stringify(x.following[i]._id))
                                }

                                var list_friend = []

                                for (var i = 0; i < users_online.length; i++) {
                                    if (st_following.has(JSON.stringify(users_online[i]._id))) {
                                        var o = users_online[i]
                                        var o1 = {
                                            _id: o._id, uid: o.uid, username: o.username, name: o.name,
                                            url_photo: o.url_photo
                                        }
                                        list_friend.push(o1)
                                    }
                                }

                                var cnt = 0

                                var limit = 0

                                while (cnt < Math.min(20, users_online.length)) {
                                    var rand = Math.floor(Math.random() * users_online.length)

                                    if (!st_following.has(JSON.stringify(users_online[rand]._id)) && users_online[rand].status == Status.ONLINE) {
                                        var o1 = users_online[rand]

                                        list_recommend.push({
                                            _id: o1._id, uid: o1.uid, username: o1.username, name: o1.name,
                                            url_photo: o1.url_photo
                                        }) // RECOMMEND

                                        st_following.add(JSON.stringify(users_online[rand]._id))
                                    }
                                    limit++
                                    cnt += 1
                                    if (limit == 1000) {
                                        break
                                    }
                                }

                                console.log("Recommend", list_recommend)
                                socket.emit("key_list_invite", { list_friend: list_friend, list: list_recommend })
                            }
                        })
                    })
                })

                socket.on("key_room_user", (data) => {
                    var x = JSON.parse(data)

                    MongoClient.connect(url, function (err, db) { // get data from database mongodb collections
                        if (err) throw err;
                        var dbo = db.db("testdb");

                        dbo.collection("users").find({ _id: ObjectId(x.user._id) }).toArray(function (err, result) {

                            if (result.length > 0) {
                                var o = JSON.parse(JSON.stringify(result[0]))

                                console.log("key_room_user")
                                var following = o.following
                                var block = o.block

                                var check_following = false
                                var check_block = false

                                for (var i = 0; i < following.length; i++) {
                                    if (compare(following[i]._id, x._id)) {
                                        check_following = true
                                        break
                                    }
                                }

                                for (var i = 0; i < following.length; i++) {
                                    if (compare(following[i]._id, x._id)) {
                                        check_following = true
                                        break
                                    }
                                }

                                for (var i = 0; i < block.length; i++) {
                                    if (compare(block[i]._id, x._id)) {
                                        check_block = true
                                        break
                                    }
                                }

                                socket.emit("key_user_found", {
                                    _id: x.user._id, uid: x.user.uid, username: x.user.username, name: x.user.name,
                                    url_photo: x.user.url_photo, follow: check_following, block: check_block, mute: false
                                })
                            }

                        })
                    })
                })

                socket.on("key_change_name", (data) => {
                    var x = JSON.parse(data)

                    MongoClient.connect(url, function (err, db) { // get data from database mongodb collections
                        if (err) throw err;
                        var dbo = db.db("testdb");

                        dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, res) {
                            var o = JSON.parse(JSON.stringify(res[0]))

                            dbo.collection("users").findOneAndUpdate({ _id: ObjectId(user._id) }, {
                                uid: o.uid, username: o.username, name: x.name, url_photo: o.url_photo,
                                list_room: o.list_room, follower: o.follower, following: o.following, block: o.block
                            }, function (err, res) {

                                // Update Name
                                socket.emit("key_user_main", {
                                    user: {
                                        _id: user._id, uid: o.uid, username: o.username, name: x.name,
                                        size_following: o.following.length, size_follower: o.follower.length, status: user.status, code_room: user.code_room
                                    }
                                })

                                // Update following

                                for (var i = 0; i < o.following.length; i++) {
                                    dbo.collection("users").find({ _id: ObjectId(o.following[i]._id) }).toArray(function (err, res) {

                                        var o1 = JSON.parse(JSON.stringify(res[0]))

                                        for (var j = 0; j < o1.follower.length; j++) {
                                            if (compare(o1.follower[j]._id, user._id)) {
                                                o1.follower[j].name = x.name
                                                break
                                            }
                                        }

                                        // update follower of following
                                        dbo.collection("users").findOneAndUpdate({ _id: ObjectId(o1._id) }, {
                                            uid: o1.uid, username: o1.username, name: o1.name,
                                            url_photo: o1.url_photo, list_room: o1.list_room, follower: o1.follower, following: o1.following, block: o1.block
                                        }, null, function (err, res) {

                                        })
                                    })
                                }

                                // Update follower

                                for (var i = 0; i < o.follower.length; i++) {
                                    dbo.collection("users").find({ _id: ObjectId(o.follower[i]._id) }).toArray(function (err, res) {

                                        var o1 = JSON.parse(JSON.stringify(res[0]))

                                        for (var j = 0; j < o1.following.length; j++) {
                                            if (compare(o1.following[j]._id, user._id)) {
                                                o1.following[j].name = x.name
                                                break
                                            }
                                        }

                                        // update following of follower
                                        dbo.collection("users").findOneAndUpdate({ _id: ObjectId(o1._id) }, {
                                            uid: o1.uid, username: o1.username, name: o1.name,
                                            url_photo: o1.url_photo, list_room: o1.list_room, follower: o1.follower, following: o1.following, block: o1.block
                                        }, null, function (err, res) {

                                        })
                                    })
                                }
                                //
                            })
                        })
                    })
                })

                socket.on("key_content_search", (data) => {
                    var x = JSON.parse(data)
                    var content = x.content

                    MongoClient.connect(url, function (err, db) { // get data from database mongodb collections
                        if (err) throw err;
                        var dbo = db.db("testdb");

                        dbo.collection("users").find({ name: { $regex: ".*" + content + ".*" } }).toArray(function (err, res) {
                            var list = []

                            // Find User following
                            dbo.collection("users").find({ _id: ObjectId(user._id) }).toArray(function (err, result) {

                                let st = new Set()

                                if (result.length > 0) {
                                    var o = JSON.parse(JSON.stringify(result[0]))

                                    var following = o.following
                                    for (var i = 0; i < following.length; i++) {
                                        var o1 = following[i]
                                        st.add(JSON.stringify(o1._id))
                                    }
                                }

                                if (res.length > 0) {
                                    for (var i = 0; i < res.length; i++) {
                                        var x1 = JSON.parse(JSON.stringify(res[i]))

                                        console.log(x1.name)
                                        var following = false
                                        if (st.has(JSON.stringify(x1._id))) {
                                            following = true
                                        }

                                        list.push({ _id: x1._id, uid: x1.uid, username: x1.username, name: x1.name, url_photo: x1.url_photo, follow: following })

                                    }
                                }

                                list_search = list // Ux`x`x`pdate list_search
                                console.log("Search : " + list)

                                socket.emit("key_result_search", { list: list })
                            })
                        })
                    })
                })

                // socket.on("key_")

                socket.on("key_report_user", (data) => {
                    var x = JSON.parse(data)


                })

                // ***************** END ********************


                socket.on("key_update", (res) => {
                    let st = new Set()
                    st.add(socket.id)
                    var list_recommend = []
                    var cnt = 0;
                    for (var i = 0; cnt < 20; i++) {
                        var rand = Math.floor(Math.random() * users_online.length())
                        if (!st.has(users_online[rand].uid)) {
                            list_recommend.push(users_online[rand])
                            st.add(users_online[rand].uid)
                            cnt += 1
                        }
                    }
                    console.log("list_recommend")
                    console.log(list_recommend.toString())
                    socket.emit("key_recommend", { list: list_recommend })

                })

                socket.on('cancel_meeting', (res) => {
                    var x = JSON.parse(res)
                    console.log("X " + x.toString())
                    socket_id[x.uid].emit('u_rejected', {})
                })

                socket.on('accepted', (res) => {
                    var x = JSON.parse(res)
                    socket_id[x.uid].emit('u_accepted', {})
                    //peerConnection
                })

                socket.on("rejected", (res) => {
                    var x = JSON.parse(res)
                    console.log(x.toString())
                    socket_id[x.uid].emit('u_rejected', {})
                })
                // Update List

                socket.on("swipelistupdate", (res) => {
                    console.log("swipe_list_update")
                    socket.emit("listupdate", { list: users_online })
                })

                // chat
                socket.on('key_chat', (res) => {
                    socket.emit()
                })
                // create room js


                // *Receive call from another*
                // receive call from socket of sender
                // socket.on('receive_call', (res) => {
                //     console.log("receive_call")
                //     socket.emit('client_receive_call', {})
                // })

                socket.on("call_video", (res) => {
                    if (check_user(res) !== null) {
                        var x = JSON.parse(res)
                        console.log("check_user(res)")
                        socket.emit('on_call', { res: true, user: check_user(res) }) // emit to client of sender
                        console.log("Socket receiver:  " + socket_id[x.uid].toString())
                        var ind = -1
                        for (var i = 0; i < users_online.length; i++) {
                            if (users_online[i].uid == socket.id) {
                                ind = i
                            }
                        }
                        console.log("IND " + ind)
                        socket_id[x.uid].emit('client_receive_call', { res: true, user: users_online[ind] }) //node emit to socket of receiver
                    }
                    else {
                        console.log("User is offline")
                        socket.emit('on_call', { res: false, user: null })
                    }
                })

                function check_user(user) {
                    var x = JSON.parse(user)
                    console.log(x)
                    for (var i = 0; i < users_online.length; i++) {
                        if (users_online[i].toString() === x.toString()) {
                            console.log("Check User: " + x.toString())
                            return x
                        }
                    }
                    return null
                }

                socket.on('end_calling1', (res) => {
                    var x = JSON.parse(res)
                    socket_id[x.uid].emit('end_calling', {})
                })

                // User Follow and UnFollow



                // *Call to anther*

                // receive id from client to call
                // socket.on('on_call', (req, user) => {
                //     if (check_user(user)) {
                //         //global
                //     }
                //     else {

                //     }
                // })


                // Note Room


                // socket.on('leave-room', (data) => {
                //     var x = JSON.parse(data)

                // })

                //
                socket.on('contact_id', (req, res) => {
                    if (users_online.includes(res.toString())) {
                        // socket.emit
                        // send user is online and broadcast to user had id
                    }
                    else {
                        socket.emit()
                    }
                })



                // chat in room
                socket.on("user_chat_room", function (data) {
                    io.sockets.in(data.id).emit()
                })
                app.get('/:room', (req, res) => {
                    res.render('room', { roomId: req.params.room })
                })
                async function callUser(socketId) {
                    const offer = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

                    socket.emit("call-user", {
                        offer,
                        to: socketId
                    });
                }


                // app.get('/login', (req, res) => {
                //     online.push()
                //     console.log("asdasd")
                //     let token = req.body.token
                //     console.log(token)
                //     async function verify() {
                //         const ticket = await client.verifyIdToken({
                //             idToken: token,
                //             audience: CLIENT_ID,
                //         });
                //         const payload = ticket.getPayload();
                //         const userid = payload['sub'];
                //         console.log(payload)
                //     }
                //     verify().catch(console.error);
                // })
                // app.use(passport.initialize())

                // app.use(session({
                //     secret: '51be6ffc95e55ae695b5d55ff7680dcb',
                //     saveUninitialized: true,
                //     resave: true,
                //     cookie: { secure: false }
                // }));
                // app.use(cookieParser());
                // // app.use(session({ secret: "cbc64923ea74c0b12164218b19af015d" }))
                // app.use(passport.initialize());
                // app.use(passport.session());
                // passport.use(new facebookStrategy({
                //     clientID: "418845776210890",
                //     clientSecret: "51be6ffc95e55ae695b5d55ff7680dcb",
                //     callbackURL: "http://localhost:4000/",
                //     profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)', 'email']
                // },
                //     function (token, refreshToken, profile, done) {
                //         process.nextTick(function () {

                //             // find the user in the database based on their facebook id
                //             UserSchema.findOne({ 'uid': profile.id }, function (err, user) {

                //                 // if there is an error, stop everything and return that
                //                 // ie an error connecting to the database
                //                 if (err)
                //                     return done(err);

                //                 // if the user is found, then log them in
                //                 if (user) {
                //                     console.log("user found")
                //                     console.log(user)
                //                     return done(null, user); // user found, return that user
                //                 } else {
                //                     // if there is no user found with that facebook id, create them
                //                     var newUser = new UserSchema();

                //                     // set all of the facebook information in our user model
                //                     newUser.uid = profile.id; // set the users facebook id                   
                //                     newUser.token = token; // we will save the token that facebook provides to the user                    
                //                     newUser.name = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                //                     newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                //                     newUser.gender = profile.gender
                //                     newUser.pic = profile.photos[0].value
                //                     // save our user to the database
                //                     newUser.save(function (err) {
                //                         if (err)
                //                             throw err;

                //                         // if successful, return the new user
                //                         return done(null, newUser);
                //                     });
                //                 }

                //             });

                //         })
                //     }
                // ))

                async function callUser(socketId) {
                    const offer = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
                    io.to(socketId).emit("call-user", {
                        offer,
                        to: socketId
                    });
                }

                socket.on("call", function (socketId) {
                    callUser(socketId)
                })

                // socket.emit("update-user-list", {
                //     users: this.activeSockets.filter(
                //         existingSocket => existingSocket !== socket.id
                //     )
                // });

                app.get('/profile', isLoggedin, (req, res) => {
                    res.send("You are a valid user")
                    console.log("You are a valid user")
                    console.log(res)
                    res.render('profile', { user: req.user })
                })

                socket.on("watcher", () => {
                    socket.to(broadcaster).emit("watcher", socket.id);
                });

                socket.on('event_call', (roomId) => {
                    console.log("Watching")
                })
                // app.post('/login', passport.authenticate('local', {
                //     successRedirect: '/secret',
                //     failureRedirect: '/login',
                // }), (req, res) => {

                // });
                // create room node js

                function isLoggedin(req, res, next) {
                    if (req.isAuthenticated()) {
                        return next()
                    }
                    res.redirect('/login')
                }
                app.get('/login_failed', (req, res) => {
                    res.send("You are a invalid user")
                })

                passport.serializeUser(function (user, done) {
                    done(null, user.id)
                })
                passport.deserializeUser(function (id, done) {
                    //    User.findById(id, function(err, user){
                    //        done(err, user)
                    //    }) 
                    return done(null, id)
                })


                // //global.io.emit('load_data', { list: UserNames })
                // MongoClient.connect(url, function (err, db) { // get data from database mongodb collections
                //     if (err) throw err;
                //     var dbo = db.db("testdb");
                //     dbo.collection("users").find().toArray(function (err, result) {
                //         console.log(result);
                //         var x = JSON.parse(JSON.stringify(result))
                //         console.log(x)
                //         db.close();
                //     })
                // });

                // Receive Register From User
                socket.on('dangki', function (data) {
                    var check_exist = false
                    console.log('Vua Dang ki ' + data)
                    socket.id = data
                    if (UserNames.indexOf(data) > -1) {
                        check_exist = true
                        console.log("User name da ton tai")
                    }
                    else {
                        UserNames.push(data)
                        console.log("Dang ki thanh cong username")
                        global.io.emit("server_send_list", { list: UserNames })
                    }
                    socket.emit('result_regis', { noidung: check_exist })
                })

                // Receive Login From User
                socket.on('login', function (data) {
                    var user_login = JSON.parse(JSON.stringify(data))
                    var username = user_login.username
                    var password = user_login.password
                    var dbo = db.db("testdb");
                    dbo.collection("users").find({ 'name': new RegExp(username, 'i') }, function (err, result) {
                        if (result.password === password) {
                            socket.emit('Login_result', { noidung: true, data: result })
                        }
                        else {
                            socket.emit('Login_result', { noidung: false, data: null })
                        }
                    });
                })

                // Receive Logout From User

                // Receive User send Message to Server
                socket.on('user_chat', function (data) {
                    var x = JSON.parse(JSON.stringify(data))
                    global.io.emit("send_message_to_user", {})
                })

                // Receive Typing    
                socket.on('chatting', function (data) {
                    global.io.emit("receive_chatting", { noidung: socket.id + " is typing a message" })
                })

                socket.on('disconnect', function (socket) {
                    // var logger = require('winston');
                    // return function (data) {
                    //     logger.warn(socket.id + ' disconnected');
                    // };
                })
                console.log('Anyone Connected')
            })

        });
        fulfill();
    });
};

module.exports = start;

