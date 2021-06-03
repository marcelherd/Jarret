const express = require('express');

const repositoryController = require('../controllers/RepositoryController');

const router = express.Router();

router.route('/').get(repositoryController.getRepositories);
router.route('/:name').get(repositoryController.getRepository);
router.route('/:name/deploy').post(repositoryController.deploy);

module.exports = router;
