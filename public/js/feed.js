$(document).ready(function() {
    
    $(window).load(function() {
	    $('.loader').fadeOut('slow');
    });
    
    var socket = io();
    
    var closeIcon = './images/close-icon-20px.png';
    var messageIcon = './images/message-icon-30px.png';
    var chatIcon = './images/chat-icon-30px.png';
    var likeIcon = './images/circle-heart-icon-30px.png';
    
    //get user id and profile to use in conditionals for displaying messages
    $.get('/api/globalUserAttributes', function(response) {
        var userId = response.user_id;
        var userProfilePic = response.user_profile_pic;
        console.log(response);
    
    //get user location
    var getLocation = function() {
        navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
        if (!navigator.geolocation) {
            locationError();
        }
    };

    var locationSuccess = function(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        var userLocation = {
            lat: latitude,
            lng: longitude
        };
        console.log(userLocation);
        
        //get feed response back from server and call displayFeed function
        $.get('/api/getFeed', userLocation, function(response) {
            console.log(response);
            displayFeed(response.body.data);
        });
    };

    var locationError = function() {
        $('.location-fail').html('Your browser does not support geolocation');
    };

    //function to get and display feed of images
    //checks for user_has_liked and appends like icon and likers button if true
    var displayFeed = function(data) {
        for (var i = 0; i < data.length; i++) {
            var image = data[i].images.standard_resolution.url;
            var mediaId = data[i].id;
            var hasLiked = data[i].user_has_liked;
            if (hasLiked == false) {
                $('#feed').append('<div class="media" id="media-' + mediaId + '" data-id="' + mediaId + '">' + '<img src="' + image + '" max-width="500px">' + '</div>');
            }
            else {
                $('#feed').append('<div class="media liked" id="media-' + mediaId + '" data-id="' + mediaId + '">' + '<img src="' + image + '" max-width="500px">' + '<div class="append">' + '<img class="like" src="' + likeIcon + '">' + '<button class="likers">' + 'See who else liked' + '</button>' + '<button class="hidelikers" style="display: none">' + 'Hide who else liked' + '</button>' + '</div>' + '</div>');
            }
        }
        notifyChats();
        
        //check if any chats stored in database and show my chats button if true
        $.get('/api/sentChats', function(response) {
            console.log(response);
            if(response.length) {
                if (userId == response[0].user_id_sender) {
                    var show = sessionStorage.getItem('show');
                    if(show === 'true') {
                    $('.my-chats').hide();
                        $('.feed').css('margin-top', '0px');
                    }
                    else {
                        $('.my-chats').show();
                        $('.feed').css('margin-top', '0px');
                    }
                }
                //loop through matching chats from database and display user info in chat list
                for(var i = 0; i < response.length; i++) {
                    var chatId = response[i]._id;
                    var userIdSender = response[i].user_id_sender;
                    var userIdReceiver = response[i].user_id_receiver;
                    var userPicReceiver = response[i].user_pic_receiver;
                    var userBioReciever = response[i].user_bio_receiver;
                    var introMessage = response[i].intro_message;
                    var newMessage = response[i].new_message;
                    $('.chat-list').append('<div class="chat-friend"' + '</div>' + '<img class="friend-pic" src="' + userPicReceiver + '" width="60px" height="45px">' + '<p class="friend-bio">' + userBioReciever + '</p>' + '<img class="go-to-chat" data-chat_id="' + chatId + '" data-user_id="' + userIdReceiver + '" src="' + chatIcon + '">');
                    addIntro(chatId, userProfilePic, introMessage);

                    //loop through new messages and add to chat history
                    if(newMessage.length) {
                        for(var k = 0; k < newMessage.length; k++) {
                            var newMessages = newMessage[k].message;
                            var senderIcon = newMessage[k].icon;
                            addHistory(chatId, senderIcon, newMessages);
                        }
                    }
                } 
            }
        });
    };
    
    //get requests to the server to like and unlike posts on double click
    //ADD DOUBLE TAP FOR MOBILE AND PUT OUTCOME INTO A FUNCTION WHICH IS CALLED BY EACH EVENT
    $('.feed').on('dblclick', '.media', function() {
        var mediaId = $(this).data('id');
        var isLiked = $(this).hasClass('liked');
        var param = {
            media_id: mediaId
        };
        if(isLiked == true) {
            $(this).removeClass('liked');
            $(this).find('.append').remove();
            $(this).find('.profiles-list').remove();
            $.get('/api/deleteLike', param, function(response) {
                console.log(response);
            });
        }
        else {
            $(this).addClass('liked');
            $(this).append('<div class="append">' + '<img class="like" src="' + likeIcon + '">' + '<button class="likers">' + 'See who else liked' + '</button>' + '<button class="hidelikers" style="display: none">' + 'Hide who else liked' + '</button>' + '</div>');
            $.get('/api/saveLike', param, function(response) {
                console.log(response);
            });
        }
    });
    
    //hide other likers list
    $('.feed').on('click', '.hidelikers', function() {
        $(this).parents().siblings('.profiles-list').remove();
        $(this).hide();
        $(this).siblings('.likers').show();
    });

    //get list of other users who liked the same post
    $('.feed').on('click', '.likers', function() {
        $(this).hide();
        $(this).siblings('.hidelikers').show();
        var media_id = $(this).parent().parent().data('id');
        var thisPost = $(this);
        console.log(media_id);
        var param = {
            mediaID: media_id
        };
        
        $.get('/api/getLikers', param, function(response) {
            console.log(response);
            usersWhoLiked(response);
        });

        //get user profile pic and bio and display on page
        var usersWhoLiked = function(profiles) {
            console.log(profiles);
            for(var i = 0; i < profiles.length; i++) {
                var profilePic = profiles[i].body.data.profile_picture;
                var profileBio = profiles[i].body.data.bio;
                var profileId = profiles[i].body.data.id;
                if(userId !== profileId) {
                    $(thisPost).parent().parent().append('<div class="profiles-list" id="user-' + profileId + '" data-id="' + profileId + '">' + '<img class="profile-pic" src="' + profilePic + '" width="60px" height="45px">' + '<p class="profile-bio">' + profileBio + '</p>' + '<img class="start-chat" src="' + messageIcon + '">' + '</div>');
                }
            }
            //add profile to chat list when conversation started
            $('.feed').on('click', '.start-chat', function() {
                var newFriendId = $(this).parent().data('id');
                $(this).hide();
                $(this).parent().append('<div class="intro" id="user-' + newFriendId + '" data-id="' + newFriendId + '">' + '<textarea class="intro-message" rows="5" cols="30" placeholder="Your message">' + '</textarea>' + '<button class="intro-send">' + 'Send' + '</button>' + '<img class="intro-close" src="' + closeIcon + '">' + '</div>');
                introSend(newFriendId);
            });
        };
    });
    
    //check for new chats in database and show my chats button if true ...and add to list
    var notifyChats = function() {    
        $.get('/api/notifyChats', function (response) {
            if(response.length) {
                if(userId == response[0].user_id_receiver) {
                    var show = sessionStorage.getItem('show');
                    if(show === 'true') {
                    $('.my-chats').hide();
                        $('.feed').css('margin-top', '0px');
                    }
                    else {
                        $('.my-chats').show();
                        $('.feed').css('margin-top', '0px');
                    }
                }
                //loop through matching chats from database and display user info in chat list
                for(var i = 0; i < response.length; i++) {
                    var chatId = response[i]._id;
                    var userIdReceiver = response[i].user_id_receiver;
                    var userIdSender = response[i].user_id_sender;
                    var userPicSender = response[i].user_pic_sender;
                    var userBioSender = response[i].user_bio_sender;
                    var introMessage = response[i].intro_message;
                    var newMessage = response[i].new_message;
                    
                    //NEED TO ATTACH SENDER ID AS DATA ID TO CHAT ICON
                    $('.chat-list').append('<div class="chat-friend"' + '</div>' + '<img class="friend-pic" src="' + userPicSender + '" width="60px" height="45px">' + '<p class="friend-bio">' + userBioSender + '</p>' + '<img class="go-to-chat" data-chat_id="' + chatId + '" data-user_id="' + userIdSender + '" src="' + chatIcon + '">');
                    addIntro(chatId, userPicSender, introMessage);
                    
                    //loop through new messages and add to chat history
                    if(newMessage.length) {
                        for(var k = 0; k < newMessage.length; k++) {
                            var newMessages = newMessage[k].message;
                            var senderIcon = newMessage[k].icon;
                            addHistory(chatId, senderIcon, newMessages);
                        }
                    }
            
                }
            }
        });
    };
    
    //function to send user id of conversation recipient to server to store in db
    var introSend = function(id) {
        $('.feed').on('click', '.intro-send', function() {
            $('.hide-chats').hide();
            $(this).hide();
            $(this).siblings().hide();
            var newFriendId = $(this).parents().parents().data('id');
            var newFriendPic = $(this).parents().siblings('.profile-pic').attr('src');
            var newFriendBio = $(this).parents().siblings('.profile-bio').html();
            var introMessage = $(this).siblings('.intro-message').val();
            console.log('the new friend id is: ' + newFriendId);
            console.log(newFriendPic);
            console.log(newFriendBio);
            console.log(id);
            console.log(introMessage);
            var params = {
                user_id_receiver: id,
                user_pic_receiver: newFriendPic,
                user_bio_receiver: newFriendBio,
                intro_message: introMessage
            };
            $.get('/api/startChat', params, function(response) {
                console.log(response);
                var userPicSender = userProfilePic;
                var chatId = response[0]._id;
                var userIdSender = response[0].user_id_sender;
                var introMessage = response[0].intro_message;
                if(userId == userIdSender) {
                    if($('.my-chats').is(':hidden')) {
                        $('.my-chats').show();
                        $('.feed').css('margin-top', '0px');
                    }
                    $('.chat-list').append('<div class="chat-friend"' + '</div>' + '<img class="friend-pic" src="' + newFriendPic + '" width="60px" height="45px">' + '<p class="friend-bio">' + newFriendBio + '</p>' + '<img class="go-to-chat" data-chat_id="' + chatId + '" data-user_id="' + newFriendId + '" src="' + chatIcon + '">');
                    addIntro(chatId, userPicSender, introMessage);
                }
            });
        });
    };
    
    //function to display intro messages
    var addIntro = function(id, icon, message) {
        $('.chat-list').on('click', '.go-to-chat', function() {
            var chatId = $(this).data('chat_id');
            var receiverId = $(this).data('user_id');
            console.log('adding intro with ' + chatId);
            joinRoom(chatId);
            if(chatId == id) {
                setAttribute(chatId, receiverId);
                $('.chat').append('<div class="intro-chat" data-id="' + id + '">' + '<img class="message-pic" src="' + icon + '">' +  message + '</div>');
                $('.chat-overlay').show();
                console.log('i clicked on the chat list icon and this is the id: ' + receiverId);
                messageSend(receiverId);
            }
        });
    };
    
    //function to add conversation history when accessing chat
    var addHistory = function(id, icon, message) {
        $('.chat-list').on('click', '.go-to-chat', function() {
            var chatId = $(this).data('chat_id');
            var receiverId = $(this).data('user_id');
            console.log('adding history with ' + chatId);
            joinRoom(chatId);
            if(chatId == id) {
                setAttribute(chatId, receiverId);
                $('.chat').append('<div class="new-chat" data-id="' + id + '">' + '<img class="message-pic" src="' + icon + '">' + message + '</div');
                $('.chat-overlay').show();
                console.log('i clicked on the chat list icon and this is the id: ' + receiverId);
                $('.chat').scrollTop($('#chat')[0].scrollHeight);
                messageSend(receiverId);
            }        
        });
    };
    
    var setAttribute = function(chatid, receiver) {
        $('.send').attr('data-chat_id', chatid);
        $('.send').attr('data-user_id', receiver);
    };
    
    //function to display messages and send to server to store in database
    var out = document.getElementById('chat');
    var addMessage = function(id, icon, message) {
        var scrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
        var chatId = $('.intro-chat').data('id');
        $('.chat').append('<div class="new-chat" data-id="'+ chatId +'">' + '<img class="message-pic" src="' + icon + '">' + message + '</div>');
        if (scrolledToBottom) {
            out.scrollTop = out.scrollHeight - out.clientHeight;
        }
        var params = {
            chat_id: id,
            new_message: message,
            sender_icon: icon
        };
        $.get('/api/addMessages', params, function(response) {
            console.log(response);
        });
    };
    
    var addLiveMessage = function(room, icon, message) {
        var scrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
        var chatId = room;
        $('.chat').append('<div class="new-chat" data-id="'+ chatId +'">' + '<img class="message-pic" src="' + icon + '">' + message + '</div>');
        if (scrolledToBottom) {
            out.scrollTop = out.scrollHeight - out.clientHeight;
        }
    };    
    
    var addLiveToDatabase = function(room, icon, message) {
        var params = {
            chat_id: room,
            new_message: message,
            sender_icon: icon
        };
        $.get('/api/addMessages', params, function(response) {
            console.log(response);
        });
    };
    
    
    //collect new messages
    var messageSend = function(receiver) {
        $('.send').on('click', function() {
            var newMessage = $('.message').val();
            var senderIcon = userProfilePic;
            var chatId = $(this).data('chat_id');
            var receiverId = $(this).data('user_id');
            if(newMessage.length) {
                $('.message').val('');
                var params = {receiver_id: receiverId};
                $.get('/api/checkUserConnected', params, function(response) {
                    console.log(response);
                    if(response === true) {
                        checkInRoom(chatId, receiverId, senderIcon, newMessage);
                    }
                    else {
                        addMessage(chatId, senderIcon, newMessage);
                    }
                });
            }
        });
    };
    
    var checkInRoom = function(id, receiver, icon, message) {
        var params = {chat_id: id, receiver_id: receiver};
        $.get('/api/checkInRoom', params, function(response) {
            console.log(response);
            if(response === true) {
                liveChat(id, receiver, icon, message);
            }
            else {
                addMessage(id, icon, message);
            }
        });
    };

    //emit to server on connection to store store instagram id against socket id
    socket.on('connect', function () {
        socket.emit('storeIds');
    });
    
    var joinRoom = function(id) {
        var room = id;
        socket.emit('join', {room: room});
    };
        
    var liveChat = function(room, receiver, icon, message) {
        addLiveMessage(room, icon, message);
        addLiveToDatabase(room, icon, message);
        socket.emit('messages', {room: room, receiver_id: receiver, sender_icon: icon, new_message: message});
    };
    
    var leaveRoom = function(id) {
        var room = id;
        socket.emit('leave', {room: room});
    };
    
    socket.on('messages', addLiveMessage);
    
        //add chat id as class (or data) to chat overlay so that live messages can be shown to the right chat
        //remove chat id class when user closes chat overlay. but need to be able to go back into
        //chat overlay and see recent live chat messages - maybe make a different div for live chat messages
        //which is deleted on disconnect (so only one set of messages is there when history retrieved later)

    getLocation();
    
    //hide and show my chats list
    $('.my-chats').on('click', function() {
        $('.chat-list').show();
        $('.my-chats').hide();
        $('.hide-chats').show();
        sessionStorage.setItem('show', 'true');
    });
    
    $('.hide-chats').on('click', function() {
        $('.chat-list').hide();
        $('.my-chats').show();
        $('.hide-chats').hide();
    });
    
    var show = sessionStorage.getItem('show');
    if(show === 'true') {
        $('.chat-list').show();
        $('.my-chats').hide();
        $('.hide-chats').show();
    }

    //close intro chat box if open
    $('.feed').on('click', '.intro-close', function() {
        if ($('.intro').is(':visible')) {
            $('.intro').hide();
            $('.start-chat').show();
        }
    });
    
    //close chat overlay if open, leave room and remove messages
    $('.chat-close').on('click', function() {
        var chatId = $(this).siblings('.send').data('chat_id');
        console.log(chatId);
        leaveRoom(chatId);
        var messages = $(this).siblings('.chat').children();
        console.log(messages);
        messages.remove();
        $('.feed, .chat, .message, .send, .chat-close').hide();
        $('.send').attr('data-chat_id', "");
        $('.send').attr('data-user_id', "");
        window.location.reload();
        $('.loader').show();
    });
    
    //remove messages from chat overlay on page reload
    window.onload = function() {
        var messages = $('.chat').children()
        messages.remove();
    };
});

});