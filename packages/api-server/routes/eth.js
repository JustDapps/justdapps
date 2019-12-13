const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const { accessModel } = require('../middlewares/access');

const router = express.Router();

// this route should require authentication
router.use(requireAuth);

router.post('/call',
  accessModel,
  (req, res, next) => {
    req.dataSource.getEntity(req.body.modelId, req.body.dappId);
  });
router.post('/methodtx', null);
router.post('/deploytx', null);
router.post('/send', null);

module.exports = router;
