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

/**
 * Fetches google-authed user data or inserts it.
 *
 * id:  Google identifier
 * displayNName: e-mail
 *
 * Returns Promise({id: _id, displayName: profile.displayName})
 */
userSchema.statics.upsertGoogleUser = function upsertGoogleUser(id, displayName) {
  return this.findOne({
    authProvider: authTypes.google,
    'profile.id': id,
  })
    .exec()
    .then((user) => {
      const format = (userToFormat) => ({
        id: userToFormat._id.toString(),
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

        return newUser.save().then((savedUser) => format(savedUser));
      }
      return format(user);
    });
};

/**
 * Returns string representation of specified user's _id
 */
userSchema.statics.getUserId = function getUserId(displayName, authProvider = authTypes.google) {
  return this.findOne({authProvider, 'profile.displayName': displayName})
    .exec()
    .then((user) => user._id.toString());
};


const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
