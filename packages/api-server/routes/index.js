const express = require('express');
const authRouter = require('./auth');
const modelsRouter = require('./models');
const ethRouter = require('./eth');


const router = express.Router();
router.use('/auth', authRouter);
router.use('/models', modelsRouter);
router.use('/eth', ethRouter);
module.exports = router;
