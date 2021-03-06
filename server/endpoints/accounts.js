var mongoose = require('mongoose'),
  _ = require('lodash'),
  config = require('../config'),
  jwt = require('jwt-simple'),
  request = require('request'),
  moment = require('moment'),
  qs = require('query-string'),
  User = require('../models/user.js');

mongoose.Promise = require('bluebird');

function createJWT(user) {
  var payload = {
    sub: user._id,
    role: user.role,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET, 'HS256');
}

function ratingDisp(rat){
  var ret = [];
  for (var i = 1; i <= Math.round(rat); i++) {
    if (rat % 1 === 0 || i < rat){
      ret.push(0);
    } else {
      ret.push(1);
    }
  }
  return ret;
}

module.exports = {

  addHome: function(req, res, next){
    User.findByIdAndUpdate(req.user, {home: req.body.home}, function(err, resp){
      req.query.location = req.body.home;
      next();
    });
  },

  getApiMe: function(req, res) {
    User
        .findById(req.user)
        .deepPopulate('reviews.beerId.brewery')
        .lean()
        .exec(function (err, resp) {
          _.forEach(resp.reviews, function(obj){
            obj.rating = ratingDisp(obj.rating);
          });
          err ? res.status(500).json(err) : res.status(200).json(resp);
        });
  },

  putApiMe: function(req, res) {
    User.findById(req.user, function(err, user) {
      if (!user) {
        return res.status(400).send({
          message: 'User not found'
        });
      }
      user.home = req.body.home;
      user.displayName = req.body.displayName;
      user.email = req.body.email;
      user.save(function(err) {
        res.status(200).end();
      });
    });
  },

  postAuthLogin: function(req, res) {
    User.findOne({
      email: req.body.email
    }, '+password', function(err, user) {
      if (!user) {
        return res.status(401).send({
          message: 'Invalid email and/or password'
        });
      }
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (!isMatch) {
          return res.status(401).send({
            message: 'Invalid email and/or password'
          });
        }
        res.send({
          token: createJWT(user)
        });
      });
    });
  },
  
  postAuthSignup: function(req, res) {
    User.findOne({
      email: req.body.email
    }, function(err, existingUser) {
      if (existingUser) {
        return res.status(409).send({
          message: 'Email is already taken'
        });
      }
      var user = new User({
        provider: 'Username & Password',
        displayName: req.body.displayName,
        email: req.body.email,
        password: req.body.password
      });
      user.save(function(err, result) {
        if (err) {
          res.status(500).send({
            message: err.message
          });
        }
        res.send({
          token: createJWT(result)
        });
      });
    });
  },

  postAuthGoogle: function(req, res) {
    var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
    var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.googleAuth.clientSecret,
      redirect_uri: req.body.redirectUri,
      grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    request.post(accessTokenUrl, {
      json: true,
      form: params
    }, function(err, response, token) {
      var accessToken = token.access_token;
      var headers = {
        Authorization: 'Bearer ' + accessToken
      };

      // Step 2. Retrieve profile information about the current user.
      request.get({
        url: peopleApiUrl,
        headers: headers,
        json: true
      }, function(err, response, profile) {
        if (profile.error) {
          return res.status(500).send({
            message: profile.error.message
          });
        }
        // Step 3a. Link user accounts.
        if (req.header('Authorization')) {
          User.findOne({ google: profile.sub }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({
                message: 'There is already a Google account that belongs to you'
              });
            }
            var token = req.header('Authorization').split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET, false, 'HS256' );
            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({
                  message: 'User not found'
                });
              }
              user.provider = 'Google';
              user.google = profile.sub;
              user.email = profile.email;
              user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
              user.displayName = user.displayName || profile.name;
              user.save(function() {
                var token = createJWT(user);
                res.send({
                  token: token
                });
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          User.findOne({email: profile.email}, function(err, existingUser) {
            if (existingUser) {
                if (existingUser.provider === 'Google') {
                  return res.send({
                    token: createJWT(existingUser)
                  });
                } else if  (existingUser.provider === 'Facebook' || existingUser.provider === 'Username & Password') {
                  return res.status(400).send({message: 'You already have a ' + existingUser.provider + ' Account'});
                }
            } else {
              var user = new User();
              user.provider = 'Google';
              user.google = profile.sub;
              user.email = profile.email;
              user.picture = profile.picture.replace('sz=50', 'sz=200');
              user.displayName = profile.name;
              user.save(function(err) {
                var token = createJWT(user);
                res.send({
                  token: token
                });
              });
            }
          });
        }
      });
    });
  },

  postAuthFacebook: function(req, res) {
    var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name'];
    var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
    var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.facebookAuth.clientSecret,
      redirect_uri: req.body.redirectUri
    };

    // Step 1. Exchange authorization code for access token.
    request.get({
      url: accessTokenUrl,
      qs: params,
      json: true
    }, function(err, response, accessToken) {
      if (response.statusCode !== 200) {
        return res.status(500).send({
          message: accessToken.error.message
        });
      }

      // Step 2. Retrieve profile information about the current user.
      request.get({
        url: graphApiUrl,
        qs: accessToken,
        json: true
      }, function(err, response, profile) {
        if (response.statusCode !== 200) {
          return res.status(500).send({
            message: profile.error.message
          });
        }
        if (req.header('Authorization')) {
          User.findOne({ facebook: profile.id }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({
                message: 'There is already a Facebook account that belongs to you'
              });
            }
            var token = req.header('Authorization').split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET, false, 'HS256');
            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({
                  message: 'User not found'
                });
              }
              user.provider = 'Facebook';
              user.facebook = profile.id;
              user.email = profile.email;
              user.picture = user.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large';
              user.displayName = user.displayName || profile.name;
              user.save(function() {
                var token = createJWT(user);
                res.send({
                  token: token
                });
              });
            });
          });
        } else {
          // Step 3. Create a new user account or return an existing one.
          User.findOne({email: profile.email}, function(err, existingUser) {
            if (existingUser) {
                if (existingUser.provider === 'Facebook') {
                  return res.send({
                    token: createJWT(existingUser)
                  });
                } else if  (existingUser.provider === 'Google' || existingUser.provider === 'Username & Password') {
                  return res.status(400).send({message: 'You already have a ' + existingUser.provider + ' Account'});
                }
            } else {
            var user = new User();
            user.provider = 'Facebook';
            user.facebook = profile.id;
            user.email = profile.email;
            user.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
            user.displayName = profile.name;
            user.save(function() {
              var token = createJWT(user);
              res.send({
                token: token
              });
            });
          }
          });
        }
      });
    });
  },

  postAuthUnlink: function(req, res) {
    var provider = req.body.provider;
    var providers = ['facebook', 'google'];

    if (providers.indexOf(provider) === -1) {
      return res.status(400).send({
        message: 'Unknown OAuth Provider'
      });
    }

    User.findById(req.user, function(err, user) {
      if (!user) {
        return res.status(400).send({
          message: 'User Not Found'
        });
      }
      user[provider] = undefined;
      user.save(function() {
        res.status(200).end();
      });
    });
  },

};
