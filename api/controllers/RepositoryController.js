const repositoryService = require('../services/RepositoryService');

// TODO: Validations, error-handling, status codes/responses

async function getRepositories(req, res) {
  const repositories = await repositoryService.getRepositories();
  return res.json(repositories);
}

async function getRepository(req, res) {
  const { repositoryId } = req.params;
  const repository = await repositoryService.getRepository(repositoryId);
  return res.json(repository);
}

async function getBranches(req, res) {
  const { repositoryId } = req.params;
  const branches = await repositoryService.getBranches(repositoryId);
  return res.json(branches);
}

async function updateBranches(req, res) {
  const { repositoryId } = req.params;
  const branches = await repositoryService.updateBranches(repositoryId);
  return res.json(branches);
}

async function getReleases(req, res) {
  const { repositoryId } = req.params;
  const releases = await repositoryService.getReleases(repositoryId);
  return res.json(releases);
}

async function getRelease(req, res) {
  const { repositoryId, releaseId } = req.params;
  const release = await repositoryService.getRelease(repositoryId, releaseId);
  return res.json(release);
}

async function createRelease(req, res) {
  const { repositoryId } = req.params;
  const { branch } = req.body;
  const release = await repositoryService.createRelease(repositoryId, branch);
  return res.json(release);
}

async function deploy(req, res) {
  const { repositoryId, releaseId } = req.params;
  const { environment } = req.body;
  await repositoryService.deploy(repositoryId, releaseId, environment);
  return res.json();
}

async function getTasks(req, res) {
  const { repositoryId } = req.params;
  const tasks = await repositoryService.getTasks(repositoryId);
  return res.json(tasks);
}

async function getEnvironments(req, res) {
  const { repositoryId } = req.params;
  const environments = await repositoryService.getEnvironments(repositoryId);
  return res.json(environments);
}

module.exports = {
  getRepositories,
  getRepository,
  getBranches,
  updateBranches,
  getReleases,
  getRelease,
  createRelease,
  deploy,
  getTasks,
  getEnvironments,
};
