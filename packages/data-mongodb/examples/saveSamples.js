require('dotenv').config();

const mongoose = require('mongoose');
const {sampleUsers, sampleModels} = require('./sampleData.js');
const {User, Model} = require('../models');

mongoose.connect(process.env.DB_PATH, {useNewUrlParser: true}).then(
  () => {

  },
  (err) => console.log(err),
);
