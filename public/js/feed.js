$(document).ready(function() {
    
    var socket = io();
    
    var closeIcon = './images/close-icon-20px.png';
    var messageIcon = './images/message-icon-30px.png';
    var chatIcon = './images/chat-icon-30px.png';
    var likeIcon = './images/circle-heart-icon-30px.png';

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
    };

    //get requests to the server to like and unlike posts on double click
    $('.feed').on('dblclick', '.media', function() {
        var mediaId = $(this).data('id');
        var isLiked = $(this).hasClass('liked');
        var param = {
            media_id: mediaId
        };
        if (isLiked == true) {
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
            for (var i = 0; i < profiles.length; i++) {
                var profilePic = profiles[i].body.data.profile_picture;
                var profileBio = profiles[i].body.data.bio;
                var profileId = profiles[i].body.data.id;
                $(thisPost).parent().parent().append('<div class="profiles-list" id="user-' + profileId + '" data-id="' + profileId + '">' + '<img class="profile-pic" src="' + profilePic + '" width="60px" height="45px">' + '<p class="profile-bio">' + profileBio + '</p>' + '<img class="start-chat" src="' + messageIcon + '">' + '</div>');
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

    //function to send user id of conversation recipient to server to store in db
    var introSend = function(id) {
        $('.feed').on('click', '.intro-send', function() {
            $(this).hide();
            $(this).siblings().hide();
            var newFriendPic = $(this).parents().siblings('.profile-pic').attr('src');
            var newFriendBio = $(this).parents().siblings('.profile-bio').html();
            console.log(newFriendPic);
            console.log(newFriendBio);
            $('.chat-list').append('<div class="chat-friend"' + '</div>' + '<img class="friend-pic" src="' + newFriendPic + '" width="60px" height="45px">' + '<p class="friend-bio">' + newFriendBio + '</p>' + '<img class="go-to-chat" src="' + chatIcon + '">');
            
            console.log(id);
            var introMessage = $(this).siblings('.intro-message').val();
            console.log(introMessage);
            var params = {
                user_id_receiver: id,
                intro_message: introMessage
            };
            
            $.get('/api/startChat', params, function(response) {
                console.log(response);
                var chatId = response[0]._id;
                var userIdSender = response[0].user_id_sender;
                var userIdReceiver = response[0].user_id_receiver;
                var introMessage = response[0].intro_message;
                
                if (chatId.length) {
                    $('.my-chats').show(); //need to show this button to recipient as well
                    $('.feed').css('margin-top', '0px');
                    sendMessage(chatId, userIdReceiver, introMessage);
                }
            });
        });
    };
    
    //from profiles in my chats list, click to chat page with mongo chat id

    //use variables from 140 to 144
    //socket.emit('intro', userIdSender, userIdReceiver, introMessage);
    
    //emit user id to map with socket id to enable targeted messages
    socket.on('connect', function () {
        socket.emit('storeIds');
    });
    
    //emit message data to send to receiver and navigate to chat screen with mongo id
    var sendMessage = function(chat, receiver, message) {
        addIntro(message);
        socket.emit('intro', {chat_id: chat, receiver_id: receiver, message: message});
        
        $('.chat-list').on('click', '.go-to-chat', function() {
            $('.chat-overlay').show();
            /*location.href = '/chat/' + chat;*/
        });
    };
    
    var addIntro = function(message) {
        $('.chat').append('<div>' + message + '</div');
    };

    getLocation();
    
    //hide and show my chats list
    $('.my-chats').on('click', function() {
        $('.chat-list').show();
        $('.my-chats').hide();
        $('.hide-chats').show();
    });
    $('.hide-chats').on('click', function() {
        $('.chat-list').hide();
        $('.my-chats').show();
        $('.hide-chats').hide();
    });

    //close intro chat box if open
    $('.feed').on('click', '.intro-close', function() {
        if ($('.intro').is(':visible')) {
            $('.intro').hide();
            $('.start-chat').show();
        }
    });
    
    //close chat overlay if open
    $('.chat-close').on('click', function() {
        $('.chat-overlay').hide();
    });
});