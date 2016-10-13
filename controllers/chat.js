//NOT USING THIS ANYMORE AS NEED TO KEEP USER IN ONE PAGE

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var config = require('../config');

var Chat = require('../models/chat');

var chat = express.Router();

chat.use(bodyParser.json());
chat.use(express.static('public'));

//get route to send user to chat screen
chat.get('/chat/:id', function(req, res) {
    res.sendFile(path.join(__dirname, '../public', 'chat.html'));
});

//get initial chat object to chat.js and then make the ability to add to it
/*chat.get('/api/chatRoom', function(req, res) {
    Chat.find({}).sort({_id:-1}).limit(1).exec(function(err, data) {
        if (err) {
            throw err;
        } else {
            console.log(data);
            res.send(data);
        }
    });
});*/

    // Ex. /chat/57f7b78f340f44e3c48b1ff7
    // var chatID = req.params.id;
    // Lookup chatID in mongo
    //   return user_id_sender
    //   return user_id_receiver
    
    // Save the message using chatID

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

module.exports = chat;