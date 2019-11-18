const express = require('express');
const auth = require('../middlewares/auth.js');
const modelController = require('../controllers/model.controller');

const router = express.Router();

// this route should require authentication
router.use(auth);

router.get('/', modelController.find);
router.post('/', modelController.create);
router.put('/', modelController.update);
router.delete('/', modelController.delete);

module.exports = router;
