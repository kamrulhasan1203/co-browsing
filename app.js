var express = require('express');
var app = require('express')();
var http = require('http').Server(app);

var fs = require('fs');

var logStream ;


var io = require('socket.io')(http);

app.use(function(req, res, next) {
        res.setHeader("X-UA-Compatible", "chrome=1");
        return next();
    });
app.use(express.static(__dirname + '/public'));

/*
app.get('/', function(req, res){
  console.log(req.signedCookies['lhc_client0']);
  console.log(req.cookies);
  res.cookie('lhc_client0' , 'lhc_client_cookie val0',{path : '/chat', expires : new Date(Date.now()+3000000),signed: true});
  res.cookie('lhc_client1' , 'lhc_client_cookie val1',{path : '/chat', expires : new Date(Date.now()+3000000),signed: true });
  res.sendfile('index.html');
});

app.get('/cookie' , function(req , res){
  console.log(req.cookies);
  console.log('aaaaaaaaaaa');
  console.log(req.signedCookies['lhc_client0']);
  //console.log(signedCookies['lhc_client0']);
  res.sendfile('index1.html');

});

app.get('/chat', function(req, res){
  
  res.sendfile('chat.html');
}); */


io.on('connection', function(socket) {
    console.log('connected');
    socket.on('CreateSession', function(msg){
        logStream = fs.createWriteStream('log.csv',{flags:'a'});
        socket.join(msg);
        //console.log('Create session...................');
    });
    socket.on('PageChange', function(msg){
        logStream = fs.createWriteStream('log.csv', {'flags': 'a'});
        logStream.write("PageChange,SessionStarted,\n");
        socket.join(msg);
        io.sockets.in(msg).emit('SessionStarted', '');
        //console.log('SessionStarted');
    });
    socket.on('JoinRoom', function(msg){
        if(logStream)
            logStream.write("JoinRomm,SessionStarted,\n");
        socket.join(msg);
        //console.log('Join Room with ' + msg);
        io.sockets.in(msg).emit('SessionStarted', '');
        //console.log('connected to Room '+ msg +"    "+ getUsersInRoomNumber(msg) );
    });
    socket.on('ClientMousePosition', function(msg){
        //console.log('ClientMousePosition');
        //socket.emit('ClientMousePosition', {PositionLeft:msg.PositionLeft, PositionTop:msg.PositionTop});
        socket.broadcast.to(msg.room).emit('ClientMousePosition', {PositionLeft:msg.PositionLeft, PositionTop:msg.PositionTop});
    });

    socket.on('AdminScrollPosition', function(msg){
        socket.broadcast.to(msg.room).emit('AdminScrollPosition', {node : msg.node,scrollLeft: msg.scrollLeft, scrollTop: msg.scrollTop});
    });

    socket.on('AdminChanged', function(msg){
        socket.broadcast.to(msg.room).emit('AdminChanged', {f:msg.f, args:msg.args});
    });

    socket.on('AdminMousePosition', function(msg){
        //console.log('AdminMousePosition');
        socket.broadcast.to(msg.room).emit('AdminMousePosition', {PositionLeft:msg.PositionLeft, PositionTop:msg.PositionTop});
    });
    socket.on('AdminonClick', function(msg){
        //console.log('AdminMousePosition');
        socket.broadcast.to(msg.room).emit('AdminonClick', {node : msg.node});
    });

    socket.on('changeHappened', function(msg){
        if(msg.change.args){
            if(msg.change.f=='initialize'){
                //console.log('initialized    total : ' + getUsersInRoomNumber(msg.room));
                logStream.write("changeHappened(initialize),changes,\n");
            }
            else{
                logStream.write("changeHappened("+msg.change.f+"),changes,\n");
            }
        }
        socket.broadcast.to(msg.room).emit('changes', msg.change);
    });

    socket.on('ViewerchangeHappened', function(msg){
        if(msg.change.f=='initialize'){
                //console.log('initialized    total : ' + getUsersInRoomNumber(msg.room));
                logStream.write("ViewrchangeHappened(initialize),viewerchanges,\n");
            }
            else{
                logStream.write("ViewrchangeHappened("+msg.change.f+"),viewerchanges,\n");
        }
        //console.log('ViewerchangeHappened');
        socket.broadcast.to(msg.room).emit('viewerchanges', msg.change);
    });
    socket.on('DOMLoaded', function(msg){
        socket.broadcast.to(msg.room).emit('DOMLoaded', '');
    });

    socket.on('test', function(msg){
        //console.log('Test');
    });
});

var getUsersInRoomNumber = function(roomName, namespace) {
    if (!namespace) namespace = '/';
    var room = io.nsps[namespace].adapter.rooms[roomName];
    if (!room) return null;
    
    return room.length;
}

http.listen(3000,'localhost', function(){
  console.log('listening on *:3000');
}); 