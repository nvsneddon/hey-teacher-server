const express = require('express');
const socket = require('socket.io');
const EventEmitter = require('events');
const app = express();
const server = app.listen(8080, '0.0.0.0', function(){
    console.log("Listening on port 8080");
});
const io = socket(server);

class MyEmitter extends EventEmitter {}

const theEmitter = new MyEmitter();


var roomObjects = [];

function disconnectRoom(roomNr){
  var index = indexOfRoomCode(roomNr);
  if(index != -1){
    roomObjects.splice(index, 1);
  }
  console.log("The found index is " + index);
  printArray();
  console.log("The length of the array now is " + roomObjects.length);
}

function roomCodeExists(rmCode){
  for(var i = 0; i < roomObjects.length; i++){
    if (roomObjects[i].room_id === rmCode) return true;
  }
  return false;
}

function indexOfRoomCode(rmCode){
  for(var i = 0; i < roomObjects.length; i++){
    if(roomObjects[i].room_id === rmCode) return i;
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
  this.printRoomStats = function(){
    console.log("Room ID: " + this.room_id + "\tTeacher: " + this.teacherName);
  };
}
function printArray(){
	for(var i = 0; i < roomObjects.length; i++){
		roomObjects[i].printRoomstats();
	}
}

theEmitter.on('empty-room', (roomNumber) => {
  //Destroy room
});

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
	    printArray();
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
   socket.on('student-connect', function(data){

   });
   socket.on('student-disconnect', function(data){

   });
   socket.on('student-help-request', function(data){

   });
});
