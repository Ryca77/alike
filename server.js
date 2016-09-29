var unirest = require('unirest');
var express = require('express');
var session = require('express-session');
var events = require('events');

var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');

var Like = require('./models/like');

var app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

app.use(session({
    secret: 'no one saw this',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

//instagram api requirements...
//user authentication
//get list of media objects from given location (/locations/location-id/media/recent)
//post and del like on media (/media/media-id/likes)
//get list of users who liked this media from within the app (/media/media-id/likes)
//get profile pic and bio of users who liked, using user-id (/users/user-id)

//get auth code in redirect
app.get('/authenticate', function(req, res) {
    console.log(req.query.code);
    var code = req.query.code;
    var session = req.session;
    if (code.length) {
        unirest.post('https://api.instagram.com/oauth/access_token')
            .send({
                'client_id': '7aa0824ae9384b4ab9bbc0ad586af8b7',
                'client_secret': '227d48b318da41048d77a1c3f8c316a8',
                'grant_type': 'authorization_code',
                'redirect_uri': 'https://thinkful-node-capstone-ryca77.c9users.io/authenticate/',
                'code': code})
            .end(function (response) {
                var accessToken  = response.body.access_token;
                console.log(accessToken);
                var userId = response.body.user.id;
                console.log(userId);
                
                session.access_token = accessToken;
                session.user_id = userId;
                
                console.log(session);

                //redirect to feed.html
                // res.redirect(/feed);
                res.redirect('/feed.html');
            }
        );
    }
});

//get route for media feed using location
app.get('/api/getFeed', function(req, res) {
    var lat = req.query.lat;
    var lng = req.query.lng;
    var distance = 5000;
    var session = req.session;
    var accessToken = session.access_token;
    console.log(accessToken);
    var userId = session.user_id;
    console.log(userId);
    var params = {lat: lat, lng: lng, distance: distance, access_token: accessToken};
    console.log(params);
    
    //temporary code to delete everything in db while testing
    /*Like.remove(function(err, p){
        if(err){ 
            throw err;
        } else {
            console.log('No Of Documents deleted:' + p);
        }
    });*/
    
    //get search results using location params and pass back to client
    unirest.get('https://api.instagram.com/v1/media/search')
           .qs(params)
           .end(function(response) {
               res.send(response);
           });
           
    //send user id to client to use in database requests
    /*app.get('/api/getUserId', function(req, res) {
        res.json({user_id: userId});
    });*/
});

//get routes for media likes
app.get('/api/saveLike', function(req, res) {
    var mediaId = req.query.mediaID;
    var session = req.session;
    var accessToken = session.access_token;
    var userId = session.user_id;
    var param = {access_token: accessToken};
    /*console.log(accessToken);
    console.log(mediaId);
    console.log(userId);*/
    
    //save the like to the database
    Like.create({
            media_id: mediaId,
            user_id: userId
        }, (function(err, ids) {
        if (err) {
            throw err;
        } else {
            console.log('successfully saved');
        }
        }));
        
    //temporary code to check if data is being stored
    Like.find(function(err, data) {
        if (err) {
            throw err;
        } else {
            console.log(data);
        }
        });

    //post like request to instagram and send response back to client
    unirest.post('https://api.instagram.com/v1/media/' + mediaId + '/likes')
           .qs(param)
           .end(function(response) {
                //response.otherUsers = Array from mongo
                res.send(response);
           });
});

//get routes for media unlikes
app.get('/api/deleteLike', function(req, res) {
    var mediaId = req.query.mediaID;
    var session = req.session;
    var accessToken = session.access_token;
    var userId = session.user_id;
    var param = {access_token: accessToken};
    /*console.log(accessToken);
    console.log(mediaId);
    console.log(userId);*/
    
    //like.delete(where media id = x and user id = x)
    //delete the like to the database
    Like.findOneAndRemove({
            media_id: mediaId,
            user_id: userId
        }, (function(err, ids) {
        if (err) {
            throw err;
        } else {
            console.log('successfully removed');
        }
        }));
    
    //temporary code to check if data is being removed
    Like.find(function(err, data) {
        if (err) {
            throw err;
        } else {
            console.log(data);
        }
        });
    
    //delete like request to instagram and send response back to client      
    unirest.delete('https://api.instagram.com/v1/media/' + mediaId + '/likes')
           .qs(param)
           .end(function(response) {
                res.send(response);
           });

});

// new get route to...
// look up other users who have liked media by media id 
// get details on these users and return to front end
app.get('/api/getLikers', function(req, res) {
    var mediaId = req.query.mediaID;
   
    Like.find({media_id: mediaId}, 'user_id', function(err, user) {
        if (err) {
            throw err;
        } else {
            console.log(user);
        }
    });
});
        
        

//storing likes generated from with the app...
//use mongo to collect media-id and user-id
//look up database to generate list of user-ids who liked current media-id from within the app
//use user-ids to get profile pics and bios as required above

//connect to database and run http server
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
}

//getUserDetails(users) {
    //unirest request to get users details
//}

exports.app = app;
exports.likeServer = likeServer;


//chat api requirements...
//broadcast new conversation request to specific client (identified using instagram user-id)
//broadcast new messages between two connected clients
//use mongo/mongoose to store conversation history



/*app.listen(process.env.PORT || 8080);*/