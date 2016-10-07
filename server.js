var http = require('http');
var express = require('express');
var session = require('express-session');
var unirest = require('unirest');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');
var path = require('path');

var Like = require('./models/like');
var Chat = require('./models/chat');

/*var app = express();*/

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(bodyParser.json());
app.use(express.static('public'));

app.use(require('./controllers/chat.js'));

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
                res.redirect('/feed.html');
            }
        );
    }
});

//get route to send user id
app.get('/api/userId', function(req, res) {
    var session = req.session;
    var userId = session.user_id;
    console.log(userId);
    res.send(userId);
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
    
    //temporary code to delete everything in like db while testing
    /*Like.remove(function(err, p){
        if(err){ 
            throw err;
        } else {
            console.log('Number of documents deleted:' + p);
        }
    });*/
    
    //get search results using location params and pass back to client
    unirest.get('https://api.instagram.com/v1/media/search')
           .qs(params)
           .end(function(response) {
               res.send(response);
           });
});

//get routes for media likes
app.get('/api/saveLike', function(req, res) {
    var mediaId = req.query.media_id;
    var session = req.session;
    var accessToken = session.access_token;
    var userId = session.user_id;
    var param = {access_token: accessToken};
    
    //save the like to the database
    Like.create({
            media_id: mediaId,
            user_id: userId
        }, (function(err, ids) {
        if (err) {
            throw err;
        } else {
            console.log('successfully saved');
            checkSave();
        }
    }));
        
    //temporary function to check if data is being stored
    var checkSave = function () {
        Like.find(function(err, data) {
            if (err) {
                throw err;
            } else {
                console.log(data);
            }
        });
    };

    //post like request to instagram and send response back to client
    unirest.post('https://api.instagram.com/v1/media/' + mediaId + '/likes')
           .qs(param)
           .end(function(response) {
                res.send(response);
           });
});

//get routes for media unlikes
app.get('/api/deleteLike', function(req, res) {
    var mediaId = req.query.media_id;
    var session = req.session;
    var accessToken = session.access_token;
    var userId = session.user_id;
    var param = {access_token: accessToken};
    
    //delete the like to the database
    Like.findOneAndRemove({
            media_id: mediaId,
            user_id: userId
        }, (function(err, ids) {
        if (err) {
            throw err;
        } else {
            console.log('successfully removed');
            checkRemove();
        }
    }));
    
    //temporary function to check if data is being removed
    var checkRemove = function() {
        Like.find(function(err, data) {
            if (err) {
                throw err;
            } else {
                console.log(data);
                }
        });
    };
    
    //delete like request to instagram and send response back to client      
    unirest.delete('https://api.instagram.com/v1/media/' + mediaId + '/likes')
           .qs(param)
           .end(function(response) {
                res.send(response);
           });

});

//look up other users who have liked media by media id 
app.get('/api/getLikers', function(req, res) {
    var mediaId = req.query.mediaID;
    var session = req.session;
    var accessToken = session.access_token;
    var param = {access_token: accessToken};
   
    Like.find({media_id: mediaId}, 'user_id', function(err, user) {
        if (err) {
            throw err;
        } else {
            console.log(user);
        }

        //get details on these users and return to front end
        var likerArr = [];
        for (var i = 0; i < user.length; i++) {
            var userId = user[i].user_id;
            likerArr.push(new Promise(function(resolve) {
                return unirest.get('https://api.instagram.com/v1/users/' + userId + '/')
                              .qs(param)
                              .end(function(response) {
                                  resolve(response);
                              });
            }));
        }
    
        Promise.all(likerArr).then(function(response) {
            res.send(response);
        });
        
        //alternative method of returning user details 
        /*var likerArr = [];
        var counter = 0;
        for (var i = 0; i < user.length; i++) {
            var userId = user[i].user_id;
        
            unirest.get('https://api.instagram.com/v1/users/' + userId + '/')
                   .qs(param)
                   .end(function(response) {
                        counter++;
                        likerArr.push(response);
                        if(counter == user.length) {
                            console.log(likerArr);
                            res.send(likerArr);
                        }
                    });
        }*/
    });
});
        
//storing likes generated from with the app...
//use mongo to collect media-id and user-id
//look up database to generate list of user-ids who liked current media-id from within the app
//use user-ids to get profile pics and bios as required above

//connect to database and run http server
var runServer = function(callback) {
    mongoose.connect(config.DATABASE_URL, function(err) {
        if (err && callback) {
            return callback(err);
        }
        //server.listen but need to make sure server var is available
        server.listen(config.PORT, function() {
            console.log('Listening on localhost:' + config.PORT);
            if (callback) {
                callback();
            }
        });
    });
};

if (require.main === module) {
    runServer(function(err) {
        if (err) {
            console.error(err);
        }
    });
}

//get route for collecting and storing two user ids to for mongo conversation history
app.get('/api/startChat', function(req, res) {
    var session = req.session;
    var userIdSender = session.user_id;
    var userIdReceiver = req.query.user_id_receiver;
    var introMessage = req.query.intro_message;
    var timeStamp = Date.now();
    console.log(userIdSender);
    console.log(userIdReceiver);
    console.log(introMessage);
    console.log(timeStamp);
    
    //temporary code to delete everything in chat db while testing
    /*Chat.remove(function(err, p){
        if(err){ 
            throw err;
        } else {
            console.log('Number of documents deleted:' + p);
        }
    });*/
    
    //save the intro message to the database
    Chat.create({
            user_id_sender: userIdSender,
            user_id_receiver: userIdReceiver,
            intro_message: introMessage,
            time_stamp: timeStamp
        }, (function(err, ids) {
        if (err) {
            throw err;
        } else {
            console.log('saved new chat');
            checkDb();
            
        }
    }));
    
    //check if data is being stored and send most recent
    var checkDb = function () {
        Chat.find({}).sort({_id:-1}).limit(1).exec(function(err, data) {
            if (err) {
                throw err;
            } else {
                console.log(data);
                res.send(data);
            }
        });
    };

});

/*//get route to send user to chat screen
app.get('/chat/:id', function(req, res) {
    res.sendFile(path.join(__dirname, './public', 'chat.html'));
});


//get initial chat object to chat.js and then make the ability to add to it
    app.get('/api/chatRoom', function(req, res) {
        Chat.find({}).sort({_id:-1}).limit(1).exec(function(err, data) {
            if (err) {
                throw err;
            } else {
                console.log(data);
                res.send(data);
            }
        });
    });*/
    
var clients = [];

//connect clients with socket
io.on('connection', function (socket) {
    console.log('Client connected');
    
    //map user id with socket id and push to array
    socket.on('storeIds', function (data) {
        var mapIds = new Object();
        mapIds.userId = data.userId;
        mapIds.clientId = socket.id;
        clients.push(mapIds);
        console.log(clients);
    });
    
    //remove ids from clients array on disconnect
    socket.on('disconnect', function (data) {
        for (var i = 0, length = clients.length; i < length; ++i) {
            var c = clients[i];
            if(c.clientId == socket.id) {
                clients.splice(i,1);
                break;
            }
        }
    });
    
    //broadcast messages to specific sockets
    socket.on('message', function (id, message) {
        for (var i = 0; i < clients.length; i++) {
            if (clients[i].userId == id) {    
                socket.broadcast.to(clients[i].clientId).emit('message', message);
            }
        }
    });
    
    
    /*socket.on('message', function(message) {
        console.log('Received message:', message);
        socket.broadcast.emit('message', message);
    });*/
});




exports.app = app;
exports.runServer = runServer;
