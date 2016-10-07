$(document).ready(function() {

    var socket = io();
    var message = $('.message');

    //get intro message object and display on page
    $.get('/api/chatRoom', function(response) {
        console.log(response);
        var introMessage = response[0].intro_message;
        var userIdReceiver = response[0].user_id_receiver;
        if (introMessage.length) {
            $('.chat').html(introMessage);
        }
    });
    
    //function to display messages
    var out = document.getElementById('chat');
    var addMessage = function(message) {
        var scrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
        $('.chat').append('<div>' + message + '</div>');
        if (scrolledToBottom) {
            out.scrollTop = out.scrollHeight - out.clientHeight;
        }
    };
    
    //collect message and emit to server
    message.on('keydown', function(event) {
        if (event.keyCode != 13) {
            return;
        }
        var message = $('.message').val();
        addMessage(message);
        
        $.get('/api/userId', function(response) {
            var userId = response;
        
            socket.emit('message', userId, message);
            $('.message').val('');
        });
    });
    
    //listener for message updates
    socket.on('message', addMessage);
    
    
    
    
    //chat request button which sends user id of sender and receiver to server
    //accept and decline buttons for when a conversation request has been made
    //button on the feed page which displays list of current conversations using profile pics and bios
    //chat screens showing conversation history, input field and send button
    //button to close down current chat and send user back to feed
    //button to end chat completely and remove from current conversations list

});
