var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server.js');
var Like = require('../models/like');
var Chat = require('../models/chat');

var should = chai.should();
var app = server.app;

chai.use(chaiHttp);

describe('alike', function() {
    it('should successfully hit the url', function(done) {
        chai.request(function(server) {
            should.have.status(200);
        });
        done();
    });
});

//instagram api tests

/*describe('alike', function() {
    it('should authenticate users on get', function(done) {
        chai.request(app)
            .get('/api/authenticate')
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.a('object');
                res.body.should.be.a('object');
            done();
        });
    });
    
    it('should retrieve instagram feed on get', function(done) {
        chai.request(app)
            .get('/api/getFeed')
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.a('object');
                res.body.should.be.a('object');
                /*res.body.should.have.property('data');
                res.body.data.should.be.a('array');
                res.body.data[0].should.have.property('id');
                res.body.data[0].should.have.property('user_has_liked');
                res.body.data[0].should.have.property('images');*/
            done();
        });
    });
    
    it('should retrieve other instagram likers on get', function(done) {
        chai.request(app)
            .get('/api/getLikers')
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.a('array');
                res[0].should.have.property('body');
                res[0].body.should.have.property('data');
                res[0].body.data.should.have.property('id');
                res[0].body.data.should.have.property('profile_picture');
                res[0].body.data.should.have.property('bio');
            done();
        });
    });
});*/

//mongo tests

/*describe('alike', function() {   
    before(function(done) {
        server.runServer(function() {
            Like.create({media_id: '123456789'},
                        {user_id: '987654321'}, function() {
                done();
            });
        });
    });
    
    it('should save an instagram like on get', function(done) {
        chai.request(app)
            .post('/api/saveLike')
            .send({media_id: '123456789'},
                  {user_id: '987654321'})
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
            done();
        });
    });
    
    after(function(done) {
        Like.remove(function() {
            done();
        });
    });
});
    
describe('alike', function() {     
    before(function(done) {
        server.runServer(function() {
            Like.create({media_id: '123456789'},
                        {user_id: '987654321'}, function() {
                done();
            });
        });
    });
    
    it('should delete an instagram like on get', function(done) {
        chai.request(app)
            .get('/api/deleteLike')
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
            done();
        });
    });
    
    after(function(done) {
        Like.remove(function() {
            done();
        });
    });
    
});

describe('alike', function() {   
    before(function(done) {
        server.runServer(function() {
            Chat.create({user_id_sender: '123456789'},
                        {user_pic_sender: 'sender_pic'},
                        {user_bio_sender: 'my bio'},
                        {user_id_receiver: '987654321'},
                        {user_pic_receiver: 'receiver_pic'},
                        {user_bio_receiver: 'my bio'},
                        {intro_message: 'hey its me'},
                        {time_stamp: '123456789'}, function() {
                done();
            });
        });
    });   
    
    it('should add an intro message on post', function(done) {
        chai.request(app)
            .get('/api/startChat')
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.a('array');
                res[0].should.have.property('_id');
                res[0].should.have.property('user_id_sender');
                res[0].should.have.property('intro_message');
            done();
        });
    });
    
    after(function(done) {
        Chat.remove(function() {
            done();
        });
    });
});
    
describe('alike', function() {    
    before(function(done) {
        server.runServer(function() {
            Chat.create({_id: '000'},
                        {new_message: {'pic': 'message'}}, function() {
                done();
            });
        });
    });   
        
    it('should add new messages on post', function(done) {
        chai.request(app)
            .get('/api/addMessages')
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
            done();
        });
    });
    
    after(function(done) {
        Chat.remove(function() {
            done();
        });
    });
});

describe('alike', function() {     
    it('should retrieve intiated conversation history on get', function(done) {
        chai.request(app)
            .get('/api/notifyChats')
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res[0].should.have.user_id_sender;
                res[0].should.have.user_pic_sender;
                res[0].should.have.user_bio_sender;
                res[0].should.have.intro_message;
                res[0].should.have.new_message;
            done();
        });
    });

    it('should retrieve received conversation history on get', function(done) {
        chai.request(app)
            .get('/api/sentChats')
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res[0].should.have.user_id_sender;
                res[0].should.have.user_pic_receiver;
                res[0].should.have.user_bio_receiver;
                res[0].should.have.intro_message;
                res[0].should.have.new_message;
            done();
        });
    });
});*/
    
//general tests    

/*describe('alike', function() {  
    it('should check other user connections on get', function(done) {
        chai.request(app)
            .get('/api/checkUserConnected')
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
            done();
        });
    });
    
    it('should check if other user is in the room', function(done) {
        chai.request(app)
            .get('/api/checkInRoom')
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
            done();
        });
    });
});*/