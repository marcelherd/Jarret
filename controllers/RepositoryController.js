const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const repositoryService = require('../services/RepositoryService');

exports.getRepositories = function (req, res) {
  const files = fs.readdirSync('data');
  const fileNames = files.map((file) => path.parse(file).name);
  const result = { repositories: fileNames };
  return res.send(result);
};

exports.getRepository = function (req, res) {
  const name = req.params.name;
  const repository = repositoryService.getRepository(name);
  return res.json(repository);
};

exports.deploy = function (req, res) {
  const name = req.params.name;
  let { branch, commit, release } = req.body; // TODO: this is unsafe
  const startedAt = new Date().toISOString();

  if (!branch) res.send(400);

  const repository = repositoryService.getRepository(name);
  let buildNumber = repository.builds.filter((b) => b.branch === branch).length + 1;
  if (release) {
    buildNumber = release.split('-')[1];
  } else if (commit) {
    // I know that this entire project is a goddamn mess but this is on another level
    // TODO cleanup code
    buildNumber = repository.builds.filter((b) => b.commit === commit)[0].version.split('-')[1];
  }
  const buildFolder = '/tmp/jarret/work';
  let currentWorkingDirectory = `${buildFolder}/${branch.replace(
    '/',
    '_',
  )}-${buildNumber}_${Math.random().toString(36).substring(5)}`;

  try {
    fs.accessSync(buildFolder);
  } catch (e) {
    if (e.code === 'ENOENT') return fs.mkdirSync(buildFolder);
  }
  fs.mkdirSync(currentWorkingDirectory);

  let stdout = childProcess.execSync(`git clone ${repository.source} ${repository.name}`, {
    cwd: currentWorkingDirectory,
  });

  currentWorkingDirectory += `/${repository.name}`;

  const checkoutTarget = commit ? commit : branch;

  stdout = childProcess.execSync(`git checkout ${checkoutTarget}`, {
    cwd: currentWorkingDirectory,
  });

  if (!commit) {
    stdout = childProcess.execSync('git rev-parse HEAD', {
      cwd: currentWorkingDirectory,
    });
    commit = stdout.toString().trim();
  }

  for (const cmd of repository.commands) {
    stdout = childProcess.execSync(cmd, {
      cwd: currentWorkingDirectory,
    });
  }

  if (!repository.preserveWorkDir) {
    fs.rmSync(buildFolder, { recursive: true });
  }

  repository.builds.push({
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    result: 'Success',
    version: `${branch}-${buildNumber}`,
    branch: branch,
    commit: commit,
  });

  repository.builds.sort((a, b) => {
    const t1 = new Date(a['started_at']);
    const t2 = new Date(b['started_at']);
    return t2 - t1;
  });

  repositoryService.updateRepository(repository);

  res.send({
    status: 'Success',
    repository,
  });
};
