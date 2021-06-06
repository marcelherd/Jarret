const gitService = require('./GitService');

const Repository = require('../models/repository');
const Release = require('../models/release');
const { getConfiguration } = require('../util/userconfig');
const { exec } = require('../util/cmd');

async function getRepositories() {
  return await Repository.query();
}

async function getRepository(repositoryId) {
  return await Repository.query().findById(repositoryId);
}

async function getBranches(repositoryId) {
  const repository = await Repository.query().findById(repositoryId).withGraphFetched('branches');
  return repository.branches;
}

async function updateBranches(repositoryId) {
  const repository = await Repository.query().findById(repositoryId);
  return gitService.updateBranches(repository);
}

async function getReleases(repositoryId) {
  const repository = await Repository.query().findById(repositoryId).withGraphFetched('releases');
  return repository.releases;
}

async function getRelease(repositoryId, releaseId) {
  // TODO: repositoryId really is not necessary here, adjust API?
  const release = await Release.query().findById(releaseId);
  return release;
}

async function createRelease(repositoryId, branch) {
  const repository = await Repository.query().findById(repositoryId);
  const queryResult = await Release.query().where({ repositoryId, branch }).count('id as releases');
  const counter = queryResult[0].releases + 1;
  const name = `${branch}-${counter}`;
  const branchData = await gitService.getBranchData(repository);
  const commit = branchData.find((branchData) => branchData.branch === branch).commit;

  const release = {
    name,
    branch,
    commit,
    repositoryId,
  };

  await Release.query().insert(release);

  return release;
}

async function deploy(repositoryId, releaseId) {
  const release = await Release.query().findById(releaseId);
  const repository = await Repository.query().findById(repositoryId);
  const configuration = await getConfiguration(repository);

  // TODO: This callback crap is really ugly, use Promise API?
  await gitService.provideWorkingCopy(repository, release, async (path) => {
    for (const command of configuration.commands) {
      await exec(command, { cwd: path });
    }
  });
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
