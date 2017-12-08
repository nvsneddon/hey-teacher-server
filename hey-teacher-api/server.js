var express = require('express');
var socket = require('socket.io');

var app = express();

var openRooms = [];

var server = app.listen(8080, '0.0.0.0', function(){
    console.log("Listening on port 8080");
});

var io = socket(server);

function disconnectRoom(roomNr){
  openRooms.splice(openRooms.indexOf(roomNr), 1);
  console.log(openRooms.toString());
  //todo Disconnect others in room from the room
}

io.on('connection', function(socket){
   console.log('made socket connection');
   socket.on('room', function(room){
     socket.join(room);
     openRooms.push(room);
     console.log("New room has been created: " + room);
   });
  socket.on('teacher-disconnect', function(roomNr){
     console.log("The teacher from room number " + roomNr + " has disconnected");
     disconnectRoom();
   });
});
