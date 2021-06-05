const express = require('express');

const repositoryController = require('../controllers/RepositoryController');

const router = express.Router();

router.route('/').get(repositoryController.getRepositories);
router.route('/:id').get(repositoryController.getRepository);

module.exports = router;
