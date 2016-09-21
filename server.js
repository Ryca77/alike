var unirest = require('unirest');
var express = require('express');
var events = require('events');
var app = express();

app.use(express.static('public'));

//media search api request
var mediaSearch = function(lat, lng, distance, token) {
    var emitter = new events.EventEmitter();
    unirest.get('https://api.instagram.com/v1/media/search?lat=48.858844&lng=2.294351&access_token=ACCESS-TOKEN')
           .end(function(response) {
        if (response.ok) {
            emitter.emit('end', response.body);
        }
        else {
            emitter.emit('error', response.code);
        }
    });
    return emitter;
};

//get route
app.get(function(req, res) {
    var searchReq = mediaSearch(lat, lng, distance, token);
});

//instagram api requirements...
//user authentication
//get list of media objects from given location (/locations/location-id/media/recent)
//post and del like on media (/media/media-id/likes)
//get list of users who liked this media from within the app (/media/media-id/likes)
//get profile pic and bio of users who liked, using user-id (/users/user-id)


//storing likes generated from with the app...
//use mongo to collect media-id and user-id
//look up database to generate list of user-ids who liked current media-id from within the app
//use user-ids to get profile pics and bios as required above


//chat api requirements...
//broadcast new conversation request to specific client (identified using instagram user-id)
//broadcast new messages between two connected clients
//use mongo/mongoose to store conversation history


app.listen(process.env.PORT || 8080);
