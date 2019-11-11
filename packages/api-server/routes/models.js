const express = require('express');
const auth = require('../middlewares/auth.js');

const router = express.Router();
router.use(auth);

/* GET users listing. */
router.get('/',
  (req, res, next) => {
    res.send('secret model test');
  });

module.exports = router;
