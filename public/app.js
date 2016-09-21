$(document).ready(function() {
var alert = 'div where location failure alert is displayed'

//need code that does something after user authentication and calls getLocation

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
};

var locationError = function() {
    alert.html('Your browser does not support geolocation');
};

//need code which uses userLocation to refine instagram feed (maybe this should be server side)

//mock api data for instagram feed
var mockFeed = {
    "data": [{
        "type": "image",
        "user": {
            "username": "josh",
            "profile_picture": "...",
            "id": "33"
        },
        "created_time": "1296531955",
        "images": {
            "low_resolution": {
                "url": "http://distillery.s3.amazonaws.com/media/2011/01/31/32d364527512437a8a17ba308a7c83bb_6.jpg",
                "width": 306,
                "height": 306
            },
            "thumbnail": {
                "url": "http://distillery.s3.amazonaws.com/media/2011/01/31/32d364527512437a8a17ba308a7c83bb_5.jpg",
                "width": 150,
                "height": 150
            },
            "standard_resolution": {
                "url": "http://image.shutterstock.com/display_pic_with_logo/399361/197046800/stock-photo-racing-bike-197046800.jpg",
                "width": 612,
                "height": 612
            }
        },
        "id": "22097367",
        "location": {
            "latitude": 37.780885099999999,
            "id": "514276",
            "longitude": -122.3948632,
            "name": "Instagram"
        }
    },  {
        "type": "image",
        "user": {
            "username": "josh",
            "profile_picture": "...",
            "id": "33"
        },
        "created_time": "1296531955",
        "images": {
            "low_resolution": {
                "url": "http://distillery.s3.amazonaws.com/media/2011/01/31/32d364527512437a8a17ba308a7c83bb_6.jpg",
                "width": 306,
                "height": 306
            },
            "thumbnail": {
                "url": "http://distillery.s3.amazonaws.com/media/2011/01/31/32d364527512437a8a17ba308a7c83bb_5.jpg",
                "width": 150,
                "height": 150
            },
            "standard_resolution": {
                "url": "http://image.shutterstock.com/display_pic_with_logo/399361/201936568/stock-photo-racing-bike-201936568.jpg",
                "width": 612,
                "height": 612
            }
        },
        "id": "22097367",
        "location": {
            "latitude": 37.780885099999999,
            "id": "514276",
            "longitude": -122.3948632,
            "name": "Instagram"
        }
    }]
};

//functions to get and display feed of images
var getFeed = function(callbackFn) {
    setTimeout(function() {
        callbackFn(mockFeed)}, 100);
};

var displayFeed = function(data) {
    for (var i = 0; i < 20; i++) {
        var image = mockFeed.data[i].images.standard_resolution.url;
        $('#feed').append('<img src="' + image + '" width="240px" height="180px">' + '</br>');
    }
};

var getAndDisplayFeed = function() {
    getFeed(displayFeed);
};

getAndDisplayFeed();


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
var likeUnLike = function() {
    if (postLike.data == 200) {
        console.log('like');
    }
    console.log('unlike');
};

$('#feed').dblclick(function() {
    likeUnLike();
    $('#likers').show();
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
var getProfileInfo = function(likers) {
    for (var i = 0; i < 20; i++) {
        var matchId = likers[i];
        var profileId = profile.data.id;
        if (matchId === profileId) {
            var profilePic = profile.data.profile_picture;
            var profileBio = profile.data.bio;
            $('#profiles').append('<img src="' + profilePic + '" width="60px" height="45px">' + profileBio + '</br>') ;
        }
    }
};

$('#likers').on('click', function() {
    usersWhoLiked();
});

$('#profiles').dblclick(function() {
    $('#chat').show();
});


//mock api data for messaging





});