const express = require('express');

const frontendController = require('../controllers/FrontendController');

const router = express.Router();

router.route('/').get(frontendController.index);

module.exports = router;
