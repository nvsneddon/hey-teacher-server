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
  this.teachers = new Array("Any teacher", name);
  this.waitlist = [];
  this.printRoomStats = function(){
    console.log("Room ID: " + this.room_id + "\tTeachers" + this.teachers);
  };
}

function printArray(){
	for(var i = 0; i < roomObjects.length; i++){
		roomObjects[i].printRoomStats();
	}
}

io.on('connection', function(socket){
   console.log('Made socket connection');
   socket.on('teacher-connect', function(name){
     console.log(name + " has connected");
     var roomCode = generateRoomCode();
     console.log("Socket ID is " + socket.id);
     roomObjects.push(new RoomObject(roomCode, name));
     socket.join(roomCode);
	    printArray();
     var emitObject = {
       'roomCode': roomCode
     };
     io.sockets.in(socket.id).emit('get-roomcode', emitObject);
   });
   socket.on('teacher-disconnect', function(roomCode){
     console.log("The teacher from room number " + roomCode + " has disconnected");
     socket.leave(roomCode);
     disconnectRoom(roomCode);
   });
   socket.on('student-connect', function(data){
	   console.log(data);
     var dataobj = JSON.parse(data);
	   var roomCode = dataobj.roomCode;
     if(roomCodeExists(roomCode)){
       var index = indexOfRoomCode(roomCode);
       var response = JSON.stringify(roomObjects[index].teachers);
       io.sockets.in(socket.id).emit('student-successful', response);
     }else{
       io.sockets.in(socket.id).emit('student-unsuccessful', "Loser");
     }
   });
   socket.on('student-disconnect', function(data){

   });
   socket.on('student-help-request', function(data){

   });
});
