var express = require('express');
var socket = require('socket.io');

var app = express();

var server = app.listen(8080, '0.0.0.0', function(){
    console.log("Listening on port 8080");
    console.log("Testing Git stuff out!!");
});

var io = socket(server);

io.on('connection', function(socket){
   console.log('made socket connection');
});
