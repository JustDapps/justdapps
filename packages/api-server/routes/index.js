const express = require('express');
const authRouter = require('./auth');
const modelsRouter = require('./models');

const router = express.Router();
router.use('/auth', authRouter);
router.use('/models', modelsRouter);

module.exports = router;
