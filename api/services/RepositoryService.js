const gitService = require('./GitService');

const Repository = require('../models/repository');
const Release = require('../models/release');
const Task = require('../models/task');

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
  const branches = repository.branches.sort((a, b) => {
    if (b.name === 'master') return 1;
    if (a.name === 'master') return -1;
    return b.id - a.id;
  });
  return branches;
}

async function updateBranches(repositoryId) {
  const repository = await Repository.query().findById(repositoryId);
  return gitService.updateBranches(repository);
}

async function getReleases(repositoryId) {
  const repository = await Repository.query().findById(repositoryId).withGraphFetched('releases');
  const releases = repository.releases.sort((a, b) => b.id - a.id);
  return releases;
}

async function getRelease(repositoryId, releaseId) {
  // TODO: repositoryId really is not necessary here, adjust API?
  const release = await Release.query().findById(releaseId);
  return release;
}

async function createRelease(repositoryId, branch) {
  const repository = await Repository.query().findById(repositoryId);
  const branchData = await gitService.getBranchData(repository);

  const queryResult = await Release.query().where({ repositoryId, branch }).count('id as releases');
  const counter = queryResult[0].releases + 1;
  const name = `${branch}-${counter}`;
  const commit = branchData.find((branchData) => branchData.branch === branch).commit;

  const release = {
    name,
    branch,
    commit,
    repositoryId,
  };

  return await Release.query().insert(release);
}

async function deploy(repositoryId, releaseId, environment) {
  const startTime = new Date();

  const release = await Release.query().findById(releaseId);
  const repository = await Repository.query().findById(repositoryId);
  const configuration = await getConfiguration(repository);

  if (!configuration) {
    // TODO: Fail deployment
  }

  const env = environment ? configuration.environments[environment] : process.env;

  // TODO: This callback crap is really ugly, use Promise API?
  await gitService.provideWorkingCopy(repository, release, async (path) => {
    for (const command of configuration.commands) {
      await exec(command, { cwd: path, env });
    }
  });

  // TODO: Set result to 'failure' if it failed
  const task = {
    started_at: startTime,
    finished_at: new Date(),
    result: 'success',
    releaseId: releaseId,
    ...(environment && { environment }),
  };

  await Task.query().insert(task);
}

async function getTasks(repositoryId) {
  const tasks = await Task.query().withGraphFetched('release');
  // TODO: Should be handled via SQL probably
  const tasksForRepository = tasks.filter(
    (task) => task.release.repositoryId.toString() === repositoryId,
  );
  return tasksForRepository.sort((a, b) => b.id - a.id);
}

async function getEnvironments(repositoryId) {
  const repository = await Repository.query().findById(repositoryId);
  const configuration = await getConfiguration(repository);
  if (!configuration) return {};
  return Object.keys(configuration.environments);
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
