const express = require('express');

const repositoryController = require('../controllers/RepositoryController');

const router = express.Router();

router.route('/').get(repositoryController.getRepositories);
router.route('/:repositoryId').get(repositoryController.getRepository);

router
  .route('/:repositoryId/branches')
  .get(repositoryController.getBranches)
  .put(repositoryController.updateBranches);

router
  .route('/:repositoryId/releases')
  .get(repositoryController.getReleases)
  .post(repositoryController.createRelease);
router.route('/:repositoryId/releases/:releaseId').get(repositoryController.getRelease);
router.route('/:repositoryId/releases/:releaseId/deploy').post(repositoryController.deploy);

router.route('/:repositoryId/tasks').get(repositoryController.getTasks);

module.exports = router;
