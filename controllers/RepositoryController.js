const repositoryService = require('../services/RepositoryService');

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
  await repositoryService.deploy(repositoryId, releaseId);
  return res.json();
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
};
