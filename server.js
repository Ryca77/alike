var http = require('http');
var express = require('express');
var session = require('express-session')({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
  });
var unirest = require('unirest');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');

var moment = require('moment');
moment().format();

var Like = require('./models/like');
var Chat = require('./models/chat');

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var sharedSession = require('express-socket.io-session');

app.use(session);

io.use(sharedSession(session, {
    autoSave:true
}));

app.use(bodyParser.json());
app.use(express.static('public'));

//changed this to enable use of session inside socket (keeping for reference)
/*app.use(session({
    secret: 'no one saw this',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));*/

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
            .end(function(response) {
                var accessToken  = response.body.access_token;
                var userId = response.body.user.id;
                var userPic = response.body.user.profile_picture;
                var userBio = response.body.user.bio;
                
                session.access_token = accessToken;
                session.user_id = userId;
                session.profile_picture = userPic;
                session.bio = userBio;
                console.log(session);

                //redirect to feed.html
                res.redirect('/feed.html');
            }
        );
    }
});

//get route to make user id and profile pic available on front end
app.get('/api/globalUserAttributes', function(req, res) {
    var session = req.session;
    var attributes = {user_id: session.user_id, user_profile_pic: session.profile_picture};
    console.log(attributes);
    res.send(attributes);
});

var timeStamp = moment().format();
console.log(timeStamp);

//get route for media feed using location
app.get('/api/getFeed', function(req, res) {
    var lat = req.query.lat;
    var lng = req.query.lng;
    var distance = 5000;
    var session = req.session;
    var accessToken = session.access_token;
    var params = {lat: lat, lng: lng, distance: distance, access_token: accessToken};
    
    //temporary code to delete everything in like db while testing
    /*Like.remove(function(err, p) {
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
        
        //alternative method of returning user details (keeping for reference)
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

//connect to database and run http server
var runServer = function(callback) {
    mongoose.Promise = global.Promise;
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

//temporary code to delete everything in chat db while testing
/*Chat.remove(function(err, p) {
    if(err){ 
        throw err;
    } else {
    console.log('Number of documents deleted:' + p);
    }
});*/

//get route for collecting and storing two user ids to for mongo conversation history
app.get('/api/startChat', function(req, res) {
    var session = req.session;
    var userIdSender = session.user_id;
    var userPicSender = session.profile_picture;
    var userBioSender = session.bio;
    var userIdReceiver = req.query.user_id_receiver;
    var userPicReceiver = req.query.user_pic_receiver;
    var userBioReciever = req.query.user_bio_receiver;
    var introMessage = req.query.intro_message;
    var timeStamp = Date();
    
    //save the intro message to the database
    Chat.create({
            user_id_sender: userIdSender,
            user_pic_sender: userPicSender,
            user_bio_sender: userBioSender,
            user_id_receiver: userIdReceiver,
            user_pic_receiver: userPicReceiver,
            user_bio_receiver: userBioReciever,
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

//check db for messages from other users on connection and send to client
app.get('/api/notifyChats', function(req, res) {    
    var session = req.session;
    var userId = session.user_id;
    Chat.find({user_id_receiver: userId}, 'user_id_sender user_pic_sender user_bio_sender intro_message new_message user_id_receiver', function(err, data) {
        if (err) {
            throw err;
        } else {
            res.send(data);
        }
    });
});

//check db for chats sent by user and send to client to notify on connection
app.get('/api/sentChats', function(req, res) {
    var session = req.session;
    var userId = session.user_id;
    Chat.find({user_id_sender: userId}, 'user_id_receiver user_pic_receiver user_bio_receiver intro_message new_message user_id_sender', function(err, data) {
        if (err) {
            throw err;
        } else {
            res.send(data);
        }
    });
});

//save new messages to the database
app.get('/api/addMessages', function(req, res) {
    var chatId = req.query.chat_id;
    var message = req.query.new_message;
    var icon = req.query.sender_icon;
    console.log(chatId);
    console.log(message);
    Chat.findByIdAndUpdate({_id: chatId}, {$push: {new_message: {message, icon}}}, {new: true}, function(err, data) {
        if (err) {
            throw err;
        } else {
            res.send(data);
        }
    });
});

//check if user is connected and send back to client
    app.get('/api/checkUserConnected', function(req, res) {
        var receiverId = req.query.receiver_id;
        if(clients.hasOwnProperty(receiverId)) {
            res.send(true);
        }
        else {
            res.send(false);
        }
    });

var clients = {};
var rooms = {};

//connect clients with socket
io.on('connection', function(socket) {
    console.log('Client connected');
    var userId = (socket.handshake.session.user_id);
    
    //map user id with socket id and add to clients object
    socket.on('storeIds', function() {
        var clientId = socket.id;
        clients[userId] = {'client_id': clientId};
        console.log(clients);
    });
    
    //remove ids from clients array on disconnect
    socket.on('disconnect', function() {
        delete clients[userId];
        console.log('removed from clients: ' + userId);
        console.log(clients);
    });
    
    //joins client to room when conversation is selected
    socket.on('join', function(data) {
        socket.join(data.room);
        rooms[userId] = data.room;
        console.log(rooms);
        var roomsObj = io.sockets.clients();
        console.log(roomsObj.adapter.rooms);
    });
    
    //broadcasts messages to current room
    socket.on('messages', function(data) {
        var room = data.room;
        var receiver = data.receiver_id;
        var senderIcon = data.sender_icon;
        var newMessage = data.new_message;
        console.log(data.room);
        if(rooms.hasOwnProperty(receiver) && rooms[receiver] == room) {
            socket.broadcast.to(room).emit('messages', room, senderIcon, newMessage);
        }
    });
    
    //removes client from room when chat overlay is closed
    socket.on('leave', function(data) {
        socket.leave(data.room);
        delete rooms[userId];
        console.log(rooms);
        console.log(data.room);
        var roomsObj = io.sockets.clients();
        console.log(roomsObj.adapter.rooms);
    });

    //check if connected user is in the room    
    app.get('/api/checkInRoom', function(req, res) {
        var receiverId = req.query.receiver_id;
        var room = req.query.chat_id;
        if(rooms.hasOwnProperty(receiverId) && rooms[receiverId] == room) {
            res.send(true);
        }
        else {
            res.send(false);
        }
    });
    
});

exports.app = app;
exports.runServer = runServer;
