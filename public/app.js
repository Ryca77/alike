$(document).ready(function() {

var feed = $('#feed');
var socket = io();
var messageIcon = './images/message-icon-30px.png';
var likeIcon = './images/circle-heart-icon-30px.png';

//need code that does something after user authentication and calls getLocation
$('#login').on('click', function() {
    location.href = 'https://www.instagram.com/oauth/authorize/?client_id=7aa0824ae9384b4ab9bbc0ad586af8b7&redirect_uri=https://thinkful-node-capstone-ryca77.c9users.io/authenticate/&scope=public_content+likes&response_type=code';
    $('#login').hide();
});

//get user location
var getLocation = function() {
	navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
	if(!navigator.geolocation) {
	    locationError();
	}
};

var locationSuccess = function(position) {
	var latitude = position.coords.latitude;
	var longitude = position.coords.longitude;
	var userLocation = {lat: latitude, lng: longitude};
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

if (window.location.pathname == '/feed.html') {
   getLocation();
}

//function to get and display feed of images
//checks for user_has_liked and appends like icon and likers button if true
var displayFeed = function(data) {
    for (var i = 0; i < data.length; i++) {
        var image = data[i].images.standard_resolution.url;
        var mediaId = data[i].id;
        var hasLiked = data[i].user_has_liked;
        if (hasLiked == false) {
            $('#feed').append('<div class="media" id="media-' + mediaId + '" data-id="' + mediaId +'">' + '<img src="' + image + '" width="500px">' + '</div>');
        }
        else {
            $('#feed').append('<div class="media liked" id="media-' + mediaId + '" data-id="' + mediaId +'">' + '<img src="' + image + '" width="500px">' + '<div class="append">' + '<img class="like" src="' + likeIcon + '">' + '<button class="likers">' + 'See who else liked' + '</button>' + '<button class="hidelikers" style="display: none">' + 'Hide who else liked' + '</button>' + '</div>' + '</div>');
        }
    }
};

// <div class="spacing media liked" id="media-23423" data-id="23423"><img src="something.jpg" width="600px"></div>
// <div class="spacing media" id="media-2654" data-id="2654"><img src="something2.jpg" width="600px"></div>
// <div class="spacing media" id="media-588678" data-id="588678"><img src="something3.jpg" width="600px"></div>

//get requests to the server to like and unlike posts on double click
$('.feed').on('dblclick', '.media', function() {
    var mediaId = $(this).data('id');
    var isLiked = $(this).hasClass('liked');
    var param = {media_id: mediaId};
    if (isLiked == true) {
        $(this).removeClass('liked');
        $(this).find('.append').remove();
        $(this).find('.profiles-list').remove();
        $.get('/api/deleteLike', param, function (response) {
            console.log(response);
        });
    } else {
        $(this).addClass('liked');
        $(this).append('<div class="append">' + '<img class="like" src="' + likeIcon + '">' + '<button class="likers">' + 'See who else liked' + '</button>' + '<button class="hidelikers" style="display: none">' + 'Hide who else liked' + '</button>' + '</div>');
        $.get('/api/saveLike', param, function (response) {
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
    var param = {mediaID: media_id};
    $.get('/api/getLikers', param, function (response) {
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
            $(thisPost).parent().parent().append('<div class="profiles-list" id="user-' + profileId + '" data-id="' + profileId +'">' + '<img src="' + profilePic + '" width="60px" height="45px">' + profileBio + '<img class="start-chat" src="' + messageIcon + '">' + '</div');
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
        $(this).parent().append('<div class="intro" id="user-' + userIdReceiver + '" data-id="' + userIdReceiver +'">' + '<textarea class="intro-message" rows="5" cols="30" placeholder="Your message">' + '</textarea>' + '<button class="intro-send">' + 'Send' + '</button>' + '</div>');
        introSend(userIdReceiver);
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
        var params = {user_id_receiver: receiver, intro_message: introMessage};
        $.get('/api/startChat', params, function (response) {
            console.log(response);
            for (var i = 0; i < response.length; i ++) {
                chatId = response[i]._id;
                if (response[i].user_id_sender.length) {
                    console.log(response[i]._id);
                    $('.chat-list').show();
                    $('.feed').css('margin-top', '0px');
                    /*location.href = 'https://thinkful-node-capstone-ryca77.c9users.io/chat/' + chatId + '/'*/
                }
                else if (response[i].user_id_receiver.length) {
                    console.log(response[i]._id);
                    /*location.href = 'https://thinkful-node-capstone-ryca77.c9users.io/chat/' + chatId + '/'*/
                }
            }
        });
    });
};

$('.chat-list').on('click', function() {
    location.href = 'https://thinkful-node-capstone-ryca77.c9users.io/chat.html'
});

if (window.location.pathname == '/chat.html') {
    $('.message').on('keydown', function(event) {
        if (event.keyCode !=13) {
            return;
        }
        var message = $('.message').val();
        addMessage(message);
        socket.emit('message', message);
        $('.message').val('');
    });
}

var addMessage = function(message) {
    $('.chat').append('<div>' + message + '</div>');
};



//click start chat = create record in db containing both user ids and then redirecting to the url with mongo id
//chat request button which sends user id of sender and receiver to server
//accept and decline buttons for when a conversation request has been made
//button on the feed page which displays list of current conversations using profile pics and bios
//chat screens showing conversation history, input field and send button
//button to close down current chat and send user back to feed
//button to end chat completely and remove from current conversations list


});