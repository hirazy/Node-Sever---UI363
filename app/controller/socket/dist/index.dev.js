"use strict";

var index = function index(socket) {
  socket.emit('login', {
    message: 'welcome to socket server'
  });
  socket.on('dang_ki', function (data) {
    console.log('Vua Dang ki' + data);
  }); // socket.on('android otp', require('./skandroidotp.js')(socket));
  // socket.on('driver', require('./skdriver.js')(socket));
  // socket.on('user', require('./skuser.js')(socket));
  // socket.on('communicator', require('./skcommunicator.js')(socket));
  // socket.on('tracking', require('./sktracking.js')(socket));
  // socket.on('ping', function () {
  //     socket.emit('ping', '');
  // });

  console.log("sds" + socket);
  //socket.on('disconnect', require('./disconnect.js')(socket));
  console.log('Anyone Connected');
};

module.exports = index;