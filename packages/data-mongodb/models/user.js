const mongoose = require('mongoose');

const authTypes = {
  google: 'Google',
};

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  authProvider: { type: String, required: true },
  profile: {
    id: String,
    displayName: String,
  },
});


userSchema.statics.upsertGoogleUser = function (id, displayName, cb) {
  return this.findOne({
    authProvider: authTypes.google,
    'profile.id': id,
  }, (err, user) => {

    const format = (user) => {
      return {id : user.profile.id, displayName: user.profile.displayName};
    }

    if (!user) {
      const newUser = new this({
        _id: new mongoose.Types.ObjectId(),
        authProvider: authTypes.google,
        profile: {
          id,
          displayName,
        },
      });

      newUser.save((error, savedUser) => cb(error, format(savedUser)));
    } else {
      return cb(err, format(user));
    }
  });
};

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
