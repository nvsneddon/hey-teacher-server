var express = require('express');
var socket = require('socket.io');

var app = express();

var roomObjects = [];

var server = app.listen(8080, '0.0.0.0', function(){
    console.log("Listening on port 8080");
});

var io = socket(server);

function disconnectRoom(roomNr){
  var index = indexOfRoomCode(roomNr);
  if(index != -1){
    roomObjects.splice(index, 1);
  //todo Disconnect others in room from the room
  }
}

function roomCodeExists(rmCode){
  for(x in roomObjects){
    if (x.room_id === rmCode) return true;
  }
  return false;
}

function indexOfRoomCode(rmCode){
  for(var i = 0; i < roomObjects.length; i++){
    if(roomObjects[i].room_id == rmCode) return i;
  }
  return -1;
}


/*
*Generates a random number and checks to see if the number happens to be used already.
Hence the need for a do while loop.
*/
function generateRoomCode(){
  do{
    var rmCode = Math.floor(Math.random() * 10000);
  } while (roomCodeExists(rmCode));
  return rmCode;
}

function RoomObject(roomCode, name){
  this.room_id = roomCode;
  this.teacherName = name;
  this.waitlist = [];
}

io.on('connection', function(socket){
   console.log('Made socket connection');
  /* socket.on('teacher-room', function(room){
     socket.join(room);
     openRooms.push(room);
     console.log("New room has been created: " + room);
   });*/
   socket.on('teacher-connect', function(name){
     console.log(name + " has connected");
     var roomCode = generateRoomCode();
     roomObjects.push(new RoomObject(roomCode, name));
     socket.join(roomCode);
     var emitObject = {
       'roomCode': roomCode
     };
     io.sockets.in(roomCode).emit('get-roomcode', emitObject);
   });
  socket.on('teacher-disconnect', function(roomCode){
     console.log("The teacher from room number " + roomCode + " has disconnected");
     socket.leave(roomCode);
     disconnectRoom(roomCode);
   });
});
