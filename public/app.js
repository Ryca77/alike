$(document).ready(function() {
var alert = 'div where location failure alert is displayed'

//code that does something after user authentication and calls getLocation

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

//code which uses userLocation to refine instagram feed (maybe this should be server side)

//mock api data for instagram feed
var mockFeed = {
    "data": [
    {
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
    },  
    {
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
    }
    ]
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
});


//mock api data for list of users who liked the same media (uses two endpoints)

var whoLiked = {
    "data": [{
        "username": "jack",
        "first_name": "Jack",
        "last_name": "Dorsey",
        "type": "user",
        "id": "66"
    }]
};

var profile = {
    "data": {
        "id": "1574083",
        "username": "snoopdogg",
        "full_name": "Snoop Dogg",
        "profile_picture": "http://distillery.s3.amazonaws.com/profiles/profile_1574083_75sq_1295469061.jpg",
        "bio": "This is my bio",
        "website": "http://snoopdogg.com",
        "counts": {
            "media": 1320,
            "follows": 420,
            "followed_by": 3410
        }
    }
};


//mock api data for messaging





});