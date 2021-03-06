var express = require('express'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  port = 3001,
  compression = require('compression'),
  mongoose = require('mongoose'),
  config = require('./config'),
  jwt = require('jwt-simple'),
  moment = require('moment'),
  accounts = require('./endpoints/accounts.js'),
  geolocation = require('./endpoints/geolocation.js'),
  _ = require('lodash'),
  helmet = require('helmet'),
  app = express();

mongoose.connect('mongodb://localhost/personal');
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function() {
  console.log('Connected to MongoDB!');
});

app.use(helmet());
app.use(compression());
app.use(express.static('./dist'));
app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/api/me', checkRole('user'), accounts.getApiMe);
app.put('/api/me', checkRole('user'), accounts.putApiMe);
app.post('/auth/login', accounts.postAuthLogin);
app.post('/auth/signup', accounts.postAuthSignup);
app.post('/auth/google', accounts.postAuthGoogle);
app.post('/auth/facebook', accounts.postAuthFacebook);
app.post('/auth/unlink', checkRole('user'), accounts.postAuthUnlink);
app.post('/addHome', checkRole('user'), accounts.addHome, geolocation.getBrewery);
app.get('/getAddress', geolocation.getAddress);
app.get('/getCoords', geolocation.getCoords);
app.get('/getRand', geolocation.getRand);
app.get('/breweryDetail/:id', geolocation.breweryDetail);
//need a put and delete for this route

app.get('/getBrewery', geolocation.getBrewery);
app.post('/addBrewery', checkRole('user'), geolocation.addBrewery);
app.put('/editBrewery/:id', checkRole('user'), geolocation.editBrewery);

app.post('/addBeer', checkRole('user'), geolocation.addBeer);
//need a put, delete, and get for this route

app.post('/review', checkRole('user'), geolocation.addReview);
app.put('/review/:id', checkRole('user'), geolocation.editReview);
app.delete('/review/:id', checkRole('user'), geolocation.deleteReview);

function checkRole(role) {
  return function(req, res, next) {
    var role = role;
    if (!req.header('Authorization')) {
      return res.status(401).send({
        message: 'Please make sure your request has an Authorization header'
      });
    }
    var token = req.header('Authorization').split(' ')[1];
    var payload = null;
    try {
      payload = jwt.decode(token, config.TOKEN_SECRET, false, 'HS256');
    } catch (err) {
      return res.status(401).send({
        message: err.message
      });
    }
    if (payload.exp <= moment().unix()) {
      return res.status(401).send({
        message: 'Token has expired'
      });
    } else if (_.indexOf(payload.role, userRoles) >= _.indexOf(role, userRoles)) {
      req.user = payload.sub;
      next();
    } else {
      return res.status(401).send({
        message: 'Incorrect role'
      });
    }
  };
}

app.listen(port, function() {
  console.log('Listening on port ' + port);
});

module.exports = app;
