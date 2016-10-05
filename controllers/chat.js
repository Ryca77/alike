var socket_io = require('socket.io');
var http = require('http');
var express = require('express');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

io.on('connection', function (socket) {
    console.log('Client connected');
});


app.get('/chat/:id', function(req, res) {
    res.send('chat chat chat!!');
    /*res.render(CHAT_VIEW, data);*/
});

exports.app = app;
//connect client with socket


    
    //broadcast messages to both connected sockets
    /*socket.on('message', function(user, message) {
        
        console.log('Received message:', message);
        socket.broadcast.emit('message', user, message);
    });*/



//chat api requirements...

//get new conversation request from client side including instagram user id of sender and receiver
//connect both user ids and deliver new conversation request from sender to reviever and generate chat id
//if conversation request is accepted keep connection and redirect to chat screens
//if conversation request is declined close connection and delete chat id
//reconnect the two clients when chat screens are accessed from current conversations button on feed page
//use chat id in url .com/chat/chat-id to connect the two users
//enable real time broadcast of new messages between the two connected clients in the chat screens
//use mongo to store conversation thread by chat id each time a new message is sent, including user id and timestamp
//retrieve conversation history when a current conversation is accessed from the feed page
//delete conversation history and access to connection if a user chooses to end the chat