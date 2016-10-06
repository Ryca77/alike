$(document).ready(function() {

    //rework this code - collect message object and display on page
    var chatRoom = function(message) {
        $('.feed').on('click', '.intro-send', function() {
            $(this).hide();
            $(this).siblings().hide();
            console.log(message);
            var introMessage = $(this).siblings('.intro-message').val();
            console.log(introMessage);
            var params = {
                user_id_receiver: message,
                intro_message: introMessage
            };
            $.get('/api/chatRoom', params, function(response) {
                console.log(response);
                var chatId = response[0].user_id_sender;
                if (response[0].user_id_sender.length) {
                    $('.chat-list').show();
                    $('.feed').css('margin-top', '0px');
                    goToChats(chatId);
                }
            });
        });
    };




    $('.message').on('keydown', function(event) {
        if (event.keyCode != 13) {
            return;
        }
        var message = $('.message').val();
        addMessage(message);

        $('.message').val('');
    });

    var addMessage = function(message) {
        $('.chat').append('<div>' + message + '</div>');
    };

    //chat request button which sends user id of sender and receiver to server
    //accept and decline buttons for when a conversation request has been made
    //button on the feed page which displays list of current conversations using profile pics and bios
    //chat screens showing conversation history, input field and send button
    //button to close down current chat and send user back to feed
    //button to end chat completely and remove from current conversations list

});
