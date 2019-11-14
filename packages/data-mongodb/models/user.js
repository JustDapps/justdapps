const mongoose = require('mongoose');

const authTypes = {
  google: 'Google',
};

const userSchema = mongoose.Schema({
  _id: {type: mongoose.Schema.Types.ObjectId, auto: true},
  authProvider: {type: String, required: true},
  profile: {
    id: String,
    displayName: String,
  },
});


userSchema.statics.upsertGoogleUser = function upsertGoogleUser(id, displayName, cb) {
  return this.findOne({
    authProvider: authTypes.google,
    'profile.id': id,
  }, (err, user) => {
    const format = (userToFormat) => ({
      key: userToFormat._id.toString(),
      id: userToFormat.profile.id,
      displayName: userToFormat.profile.displayName,
    });

    if (!user) {
      const newUser = new this({
        _id: new mongoose.Types.ObjectId(),
        authProvider: authTypes.google,
        profile: {
          id,
          displayName,
        },
      });

      return newUser.save((error, savedUser) => cb(error, format(savedUser)));
    }
    return cb(err, format(user));
  });
};


const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
