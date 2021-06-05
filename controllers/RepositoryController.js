const repositoryService = require('../services/RepositoryService');

function getRepositories(req, res) {
  const repositories = repositoryService.getRepositories();
  return res.send(repositories);
}

function getRepository(req, res) {
  const { id } = req.params;
  const repository = repositoryService.getRepository(id);
  return res.json(repository);
}

module.exports = {
  getRepositories,
  getRepository,
};
