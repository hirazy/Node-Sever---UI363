const { exists } = require('../../models/song.js');
var UserNames = []

var index = function (socket) {
    console.log('conne' )
    // socket.emit('login', {
    //     message: 'welcome to socket server'
    // }); 
    
    
    socket.on('dangki', function(data){
        var check_exist = false
        console.log('Vua Dang ki ' + data)
        if(UserNames.indexOf(data)>-1){
            check_exist = true
            console.log("User name da ton tai")
        }
        else{
            socket.un = data
            UserNames.push(data)
            console.log("Dang ki thanh cong username")
            socket.emit("server_send_list", {list: UserNames})
        }
        socket.emit('result_regis', { noidung: check_exist})
    })

    
    

    socket.on('user_chat', function(data){

    })
    // socket.on('android otp', require('./skandroidotp.js')(socket));
    // socket.on('driver', require('./skdriver.js')(socket));
    // socket.on('user', require('./skuser.js')(socket));
    // socket.on('communicator', require('./skcommunicator.js')(socket));
    // socket.on('tracking', require('./sktracking.js')(socket));
    // socket.on('ping', function () {
    //     socket.emit('ping', '');
    // });
    console.log("sds"+ socket)
    socket.on('disconnect', require('./disconnect.js')(socket)); 
    console.log('Anyone Connected')
};
    
module.exports = index;