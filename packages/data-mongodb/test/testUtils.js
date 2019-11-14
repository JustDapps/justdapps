const mongoose = require('mongoose');

const {users, models} = require('./testData');
const {cleanupAndSave} = require('../utils');

module.exports.cleanupAndSave = () => cleanupAndSave(users, models);
