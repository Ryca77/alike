var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server.js');

var should = chai.should();
/*var app = server.app;*/

chai.use(chaiHttp);

describe('Social Network Connections', function() {
    it('should successfully hit the url', function(done) {
        chai.request(function(server) {
            should.have.status(200);
        });
        done();
    });
    
});

