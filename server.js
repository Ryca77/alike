var unirest = require('unirest');
var express = require('express');
var events = require('events');

var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');

var app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

//get auth code in redirect

var code = require('./alike/public/index.html?');

app.get('code', function(req, res) {
    res = urlAuth.parse();
    var code = res.href;
    console.log(code);
});

//post auth code to get access token
app.post(
    {   form: { client_id: '7aa0824ae9384b4ab9bbc0ad586af8b7',
            client_secret: '227d48b318da41048d77a1c3f8c316a8',
            grant_type: 'authorization_code',
            redirect_uri: 'https://thinkful-node-capstone-ryca77.c9users.io/alike/public/index.html',
            code: code
            },
        url: 'https://api.instagram.com/oauth/access_token'
    },
    function (err, res, body) {
        if (err) {
        console.log("error in Post", err);
        } else {
        console.log(JSON.parse(body));
        }
    }
)

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


//connect to database
var likeServer = function(callback) {
    mongoose.connect(config.DATABASE_URL, function(err) {
        if (err && callback) {
            return callback(err);
        }
        app.listen(config.PORT, function() {
            console.log('Listening on localhost:' + config.PORT);
            if (callback) {
                callback();
            }
        });
    });
};

if (require.main === module) {
    likeServer(function(err) {
        if (err) {
            console.error(err);
        }
    });
};

var userId = require('');
var mediaId = require('');

app.get('???', function(req, res) {
    userId.find(function(err, ids) {
        if (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.json(ids);
    });
});


exports.app = app;
exports.likeServer = likeServer;


//storing likes generated from with the app...
//use mongo to collect media-id and user-id
//look up database to generate list of user-ids who liked current media-id from within the app
//use user-ids to get profile pics and bios as required above


//chat api requirements...
//broadcast new conversation request to specific client (identified using instagram user-id)
//broadcast new messages between two connected clients
//use mongo/mongoose to store conversation history


app.listen(process.env.PORT || 8080);
