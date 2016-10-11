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
var path = require('path');

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

/*app.use(require('./controllers/chat.js'));*/

//changed this to enable use of session inside socket
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

//get route for collecting and storing two user ids to for mongo conversation history
app.get('/api/startChat', function(req, res) {
    var session = req.session;
    var userIdSender = session.user_id;
    var userPicSender = session.profile_picture;
    var userBioSender = session.bio;
    var userIdReceiver = req.query.user_id_receiver;
    var introMessage = req.query.intro_message;
    var timeStamp = Date.now();

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
            user_pic_sender: userPicSender,
            user_bio_sender: userBioSender,
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

//NOW IN CHAT.JS get route to send user to chat screen
/*app.get('/chat/:id', function(req, res) {
    res.sendFile(path.join(__dirname, './public', 'chat.html'));
});*/

//NOW IN CHAT.JS get initial chat object to chat.js and then make the ability to add to it
    /*app.get('/api/chatRoom', function(req, res) {
        Chat.find({}).sort({_id:-1}).limit(1).exec(function(err, data) {
            if (err) {
                throw err;
            } else {
                console.log(data);
                res.send(data);
            }
        });
    });*/
    
var clients = {};

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
    
    //check db for messages from other users on connection and send to client
    app.get('/api/notifyChats', function(req, res) {    
        Chat.find({user_id_receiver: userId}, 'user_pic_sender user_bio_sender intro_message', function(err, data) {
            if (err) {
                throw err;
            } else {
                console.log(data);
                res.send(data);
            }
        });
    });
    
    app.get('/api/addMessages', function(req, res) {
        var chatId = req.query.chat_id;
        var message = req.query.new_message;
        console.log(chatId);
        console.log(message);
        //Chat.find by id and update
    });
    
    //socket chatroom functionality between the two users
    //add to mongo as new messages are entered
    //enable messages to be sent to specific users when they connect
    //retrieve additional messages from mongo when a conversation is launched
    
    
    //broadcast messages between specific sockets
    /*socket.on('intro', function(data) {
        var receiver = data.receiver_id;
        var message = data.message;
        var receiverSocket = clients[receiver].client_id;
        console.log('this is ' + receiverSocket);
        socket.to(receiverSocket).emit('intro', message);
    });*/
    
    /*socket.on('message', function(message) {
        console.log('Received message:', message);
        socket.broadcast.emit('message', message);
    });*/
    
});

//User connects - 
//adds instagram id and socket id to clients object

//Intro message -
//creates object in mongo
//emits both instagram ids to server
//checks ids against clients object
//broadcasts new chat request notification to the receiver socket, including sender profile pic and bio, and accept/decline buttons
//receiver id accepts - redirects to chat page with mongo id in url, and sender profile pic and bio appends to current chats list
//broadcasts chat acceptance to sender socket, receiver profile pic and bio appends to current chats list
//receiver id declines - does nothing

//Chats list -
//shows user profiles for all accepted chat requests, either as sender or receiver
//click on profile, redirects to chat page using corresponding mongo id

//Chat page -
//shows profile of other user at the top
//retrieves conversation history using mongo id
//new messages emit both instagram ids to server
//checks ids against clients object
//broadcasts all new messages to both corresponding sockets
//adds all new messages to corresponding mongo object

//Other things to consider -
//once a user has instigated a chat request, remove the ability to instigate another one with the same user
//ability to delete current chats from chat list and block users


exports.app = app;
exports.runServer = runServer;
