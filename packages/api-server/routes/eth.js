const express = require('express');
const ethController = require('../controllers/eth.controller');
const { requireAuth } = require('../middlewares/auth');

const router = express.Router();

// this route should require authentication
router.use(requireAuth);

router.post('/call', ethController.callContract);
router.post('/methodtx', ethController.createUnsignedTx);
router.post('/deploytx', ethController.createUnsignedDeployTx);
router.post('/send', ethController.sendSignedTx);

module.exports = router;
