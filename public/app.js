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
    alert.html('Your browser does not support geolocation');
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

$('.feed').on('dblclick', ".media", function() {
    var media_id = $(this).data('id');
    var isLiked = $(this).hasClass('liked');
    var param = {mediaID: media_id};
    if (isLiked == true) {
        $(this).removeClass('liked');
        $(this).find('.append').remove();
        $.get('/api/getUnlike', param, function (response) {
            console.log(response);
        });
    } else {
        $(this).addClass('liked');
        $(this).append('<div class="append">' + '<img class="like" src="' + likeIcon + '">' + '<button class="likers">' + 'See who else liked' + '</button>' + '</div>');
        $.get('/api/getLike', param, function (response) {
            console.log(response);
        });
    }

 
   // Your server side like endpoint
   //   1. Save the like to Mongo
   //   2. Send the request to Instagram to like (post request)
   //handle request from instagram, now i have to notify the client
   // 
});

//mock api data for posting and deleting likes
var postLike = {
    "meta": {
        "code": 200
    }, 
    "data": null
};

var delLike = {
    "meta": {
        "code": 200
    }, 
    "data": null
};

//function to like and unlike posts
var likeUnlike = function() {
    for (var i = 0; i < 20; i++) {
        var mediaId = mockFeed.data[i].id;
        console.log(mediaId);
        $('#likers').show();
    }
};

/*$('#feed').dblclick(function() {
    likeUnlike();
});*/

//mock api data for list of users who liked the same media - uses two endpoints...
//first endpoint gets user id
var whoLiked = {
    "data": [{
        "username": "snoopdogg",
        "first_name": "Snoop",
        "last_name": "Dogg",
        "type": "user",
        "id": "12345"
    },  {
        "username": "drdre",
        "first_name": "Dr",
        "last_name": "Dre",
        "type": "user",
        "id": "67890"
    }]
};

//second endpoint gets profile info, using user id
var profile = {
    "data": {
        "id": "12345",
        "username": "snoopdogg",
        "full_name": "Snoop Dogg",
        "profile_picture": "http://image.shutterstock.com/display_pic_with_logo/606088/341534624/stock-photo-lucca-italy-july-snoop-dogg-famous-singer-performs-singing-on-stage-famous-singer-341534624.jpg",
        "bio": "This is the bio of snoop dogg",
        "counts": {
            "media": 1320,
            "follows": 420,
            "followed_by": 3410
        }
    }

    /*{
        "id": "67890",
        "username": "drdre",
        "full_name": "Dr Dre",
        "profile_picture": "http://image.shutterstock.com/display_pic_with_logo/667657/218008999/stock-photo-barcelona-may-kendrick-lamar-american-hip-hop-recording-artist-performs-at-heineken-218008999.jpg",
        "bio": "This is the bio of dre",
        "counts": {
            "media": 1320,
            "follows": 420,
            "followed_by": 3410
        }
    }*/
};

//function to push all liker ids into an array
var likerArr = [];
var usersWhoLiked = function() {
    for (var i = 0; i < 20; i++) {
        var likerId = whoLiked.data[i].id;
        likerArr.push(likerId);
        console.log(likerArr);
        getProfileInfo(likerArr);
    }
};

//function to get user profile pic and bio
var profileId = profile.data.id;
var getProfileInfo = function(likers) {
    for (var i = 0; i < 20; i++) {
        var matchId = likers[i];
        if (matchId === profileId) {
            var profilePic = profile.data.profile_picture;
            var profileBio = profile.data.bio;
            $('#profiles').append('<div class="spacing">' + '<img src="' + profilePic + '" width="60px" height="45px">' + profileBio + '<img src="' + messageIcon + '">' + '</div') ;
        }
    }
};

$('#likers').on('click', function() {
    $('#likers').hide();
    usersWhoLiked();
});

$('#profiles').on('click', function() {
    $('#chat, #send').show();
});


//mock api data for messaging





});