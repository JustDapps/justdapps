const express = require('express');

const router = express.Router();

/* GET users listing. */
router.post('/google', (req, res, next) => {
    console.log('Authentication via Google');
    res.send('OK');
});

module.exports = router;
