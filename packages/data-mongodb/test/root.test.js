const mongoose = require('mongoose');

before((done) => {
  mongoose.connect('mongodb://localhost:27017/justdapps-test', {useUnifiedTopology: true, useNewUrlParser: true});
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error'));
  db.once('open', () => {
    console.log('We are connected to test database!');
    done();
  });
});

after(() => {
  mongoose.disconnect();
});
