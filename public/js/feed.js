$(document).ready(function() {
    
    var socket = io();
    
    var closeIcon = './images/close-icon-20px.png';
    var messageIcon = './images/message-icon-30px.png';
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

    //need new get request to get list of other users who liked the same post
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
        };

        //hide user profiles list
        $('.feed').on('click', '.hidelikers', function() {
            $(this).parents().siblings('.profiles-list').remove();
            $(this).hide();
            $(this).siblings('.likers').show();
        });

        //enable user to initiate conversation with a profile from the other likers list
        $('.feed').on('click', '.start-chat', function() {
            var userIdReceiver = $(this).parent().data('id');
            console.log(userIdReceiver);
            $(this).hide();
            $(this).parent().append('<div class="intro" id="user-' + userIdReceiver + '" data-id="' + userIdReceiver + '">' + '<textarea class="intro-message" rows="5" cols="30" placeholder="Your message">' + '</textarea>' + '<button class="intro-send">' + 'Send' + '</button>' + '<img class="intro-close" src="' + closeIcon + '">' + '</div>');
            introSend(userIdReceiver);
        });

        //close intro chat box if open
        $('.feed').on('click', '.intro-close', function() {
            if ($('.intro').is(':visible')) {
                $('.intro').hide();
                $('.start-chat').show();
            }
        });
    });

    //function to send user id of conversation recipient to server to store in db
    var introSend = function(receiver) {
        $('.feed').on('click', '.intro-send', function() {
            $(this).hide();
            $(this).siblings().hide();
            console.log(receiver);
            var introMessage = $(this).siblings('.intro-message').val();
            console.log(introMessage);
            var params = {
                user_id_receiver: receiver,
                intro_message: introMessage
            };
            $.get('/api/startChat', params, function(response) {
                console.log(response);
                var chatId = response[0]._id;
                var userIdReceiver = response[0].user_id_receiver;
                if (chatId.length) {
                    $('.chat-list').show();
                    $('.feed').css('margin-top', '0px');
                    goToChats(chatId);
                    
                }
            });
        });
    };
    
    $.get('/api/userId', function(response) {
        var userId = response;
        
        socket.on('connect', function (data) {
            socket.emit('storeIds', {userId: userId});
        });
    });    
    
    
    //need a conditional to show chat list button if user has any open chats
    //and get a notification for new chat

    //currently clicks straight through to chat
    //eventually needs to reveal list of current chats which
    //click to either the sender or logged in user chat page (whoever initiated the chat)
    
    var goToChats = function(id) {
        $('.chat-list, .new-chat').on('click', function() {
            location.href = '/chat/' + id;
        });
    };

    getLocation();

});