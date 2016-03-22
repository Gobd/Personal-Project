var mongoose = require('mongoose')
  , bcrypt = require('bcryptjs')
  , deepPopulate = require('mongoose-deep-populate')(mongoose);

GLOBAL.userRoles = ['user', 'brewer', 'root'];

var userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  displayName: String,
  provider: String,
  picture: String,
  facebook: String,
  google: String,
  role: { type: String, default: 'user', enum: userRoles },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
});

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(12, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    done(err, isMatch);
  });
};

userSchema.plugin(deepPopulate);

module.exports = mongoose.model('User', userSchema);
