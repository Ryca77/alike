$(document).ready(function() {
var alert = 'div where location failure alert is displayed';
var feed = $('#feed');
var messageIcon = './images/message-icon-30px.png';

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
	
	//use location lat and lng in get request to server
	$.get('/api/getFeed', userLocation, function(response) {
        console.log(response);
        displayFeed(response);
	});
};

var locationError = function() {
    alert.html('Your browser does not support geolocation');
};

if (window.location.pathname == '/feed.html') {
   getLocation();
}

//functions to get and display feed of images
var displayFeed = function(data) {
    for (var i = 0; i < 20; i++) {
        var image = data.body.data[i].images.standard_resolution.url;
        $('#feed').append('<div class="spacing">' + '<img src="' + image + '" width="240px" height="180px">' + '</div>');
    }
};

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

$('#feed').dblclick(function() {
    likeUnlike();
});

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