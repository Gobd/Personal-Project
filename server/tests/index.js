var chai = require('chai')
  , chaiHttp = require('chai-http')
  , server = require('../index.js')
  , should = chai.should()
  , expect = chai.expect;

chai.use(chaiHttp);

describe('index.js', function() {
    it('should create a new product', function (done) {
        chai.request(server)
            .post('/products').send(testProd).end(function (err, res) {
            res.should.have.status(200);
            done();
        });
    });
});
