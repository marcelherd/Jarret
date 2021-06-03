const repositoryService = require('../services/RepositoryService');

function getRepositories(req, res) {
  const repositories = repositoryService.getRepositories();
  return res.send(repositories);
}

function getRepository(req, res) {
  const name = req.params.name;
  const repository = repositoryService.getRepository(name);
  return res.json(repository);
}

function deploy(req, res) {
  const name = req.params.name;
  let { branch, commit, release } = req.body; // TODO: this is unsafe

  if (!branch) res.send(400);

  const repository = repositoryService.deploy(name, branch, commit, release);

  res.send({
    status: 'Success',
    repository,
  });
}

module.exports = {
  getRepositories,
  getRepository,
  deploy,
};
