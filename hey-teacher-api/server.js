var express = require('express');
var socket = require('socket.io');

var app = express();

var roomObjects = [];

var server = app.listen(8080, '0.0.0.0', function(){
    console.log("Listening on port 8080");
});

var io = socket(server);

function disconnectRoom(roomNr){
  openRooms.splice(openRooms.indexOf(roomNr), 1);
  console.log(openRooms.toString());
  //todo Disconnect others in room from the room
}


/*
*Generates a random number and checks to see if the number happens to be used already.
Hence the need for a do while loop.
*/
function generateRoomCode(){
  do{
    var rmCode = Math.floor(Math.random() * 10000);
  } while (function(){
    for(x in roomObjects){
      if (x.room_id === rmCode) return true;
    }
    return false;
  });
  return rmCode;
}

function RoomObject(roomCode, name){
  this.room_id = roomCode;
  this.teacherName = name;
  this.waitlist = [];
}

io.on('connection', function(socket){
   console.log('made socket connection');
  /* socket.on('teacher-room', function(room){
     socket.join(room);
     openRooms.push(room);
     console.log("New room has been created: " + room);
   });*/
   socket.on('teacher-connect', function(name){
     var roomCode = generateRoomCode();
     var roomNumber = roomObjects.length;
     roomObjects[roomNumber] = new RoomObject(roomCode, name);
     socket.join(roomNumber);
     io.sockets.in(roomNumber).emit('get-roomcode', roomCode);

   });
  socket.on('teacher-disconnect', function(roomNr){
     console.log("The teacher from room number " + roomNr + " has disconnected");
     disconnectRoom(roomNr);
   });
});
