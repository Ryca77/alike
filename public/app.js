$(document).ready(function() {
var alert = 'div where location failure alert is displayed';
var feed = $('#feed');
var messageIcon = './images/message-icon-30px.png';
var likeIcon = './images/circle-heart-icon-30px.png';

//need code that does something after user authentication and calls getLocation
$('#login').on('click', function() {
    location.href = "https://www.instagram.com/oauth/authorize/?client_id=7aa0824ae9384b4ab9bbc0ad586af8b7&redirect_uri=https://thinkful-node-capstone-ryca77.c9users.io/authenticate/&scope=public_content+likes&response_type=code";
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
    alert('Your browser does not support geolocation');
};

if (window.location.pathname == '/feed.html') {
   getLocation();
}

//function to get and display feed of images
var displayFeed = function(data) {
    for (var i = 0; i < data.length; i++) {
        var image = data[i].images.standard_resolution.url;
        var mediaId = data[i].id;
        $('#feed').append('<div class="media" id="media-' + mediaId + '" data-id="' + mediaId +'">' + '<img src="' + image + '" width="500px">' + '</div>');
    }
};

// <div class="spacing media liked" id="media-23423" data-id="23423"><img src="something.jpg" width="600px"></div>
// <div class="spacing media" id="media-2654" data-id="2654"><img src="something2.jpg" width="600px"></div>
// <div class="spacing media" id="media-588678" data-id="588678"><img src="something3.jpg" width="600px"></div>

//get requests to the server to like and unlike posts on double click
$('.feed').on('dblclick', '.media', function() {
    var media_id = $(this).data('id');
    var isLiked = $(this).hasClass('liked');
    var param = {mediaID: media_id};
    if (isLiked == true) {
        $(this).removeClass('liked');
        $(this).find('.append').remove();
        $.get('/api/deleteLike', param, function (response) {
            console.log(response);
        });
    } else {
        $(this).addClass('liked');
        $(this).append('<div class="append">' + '<img class="like" src="' + likeIcon + '">' + '<button class="likers">' + 'See who else liked' + '</button>' + '</div>');
        $.get('/api/saveLike', param, function (response) {
            console.log(response);
        });
    }

});

//need new get request to get list of other users who liked the same post
$('.feed').on('click', '.likers', function() {
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
            $(thisPost).parent().parent().append('<div class="profiles-list">' + '<img src="' + profilePic + '" width="60px" height="45px">' + profileBio + '<img src="' + messageIcon + '">' + '</div');
        }
    };
});

$('#likers').on('click', function() {
    $('#likers').hide();
    usersWhoLiked();
});

$('#profiles').on('click', function() {
    $('#chat, #send').show();
});

//mock api data for messaging





});