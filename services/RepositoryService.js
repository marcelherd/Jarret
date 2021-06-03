const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

function getBranches(repository) {
  const buildFolder = '/tmp/jarret/work';
  let currentWorkingDirectory = `${buildFolder}/${repository.name}-meta_${Math.random()
    .toString(36)
    .substring(5)}`;

  try {
    fs.accessSync(buildFolder);
  } catch (e) {
    if (e.code === 'ENOENT') fs.mkdirSync(buildFolder);
  }

  fs.mkdirSync(currentWorkingDirectory);

  let stdout = childProcess.execSync(`git clone ${repository.source} ${repository.name}`, {
    cwd: currentWorkingDirectory,
  });
  currentWorkingDirectory += `/${repository.name}`;

  stdout = childProcess.execSync('git branch -a', {
    cwd: currentWorkingDirectory,
  });

  return stdout
    .toString()
    .split('\n')
    .filter((line) => line.includes('remotes') && !line.includes('HEAD'))
    .map((line) => line.trim())
    .map((line) => line.replace('remotes/', ''));
}

function getRepositories() {
  const files = fs.readdirSync('data');
  const fileNames = files.map((file) => path.parse(file).name);
  return { repositories: fileNames };
}

function getRepository(name) {
  const bufRepository = fs.readFileSync(`data/${name}.json`);
  const repository = JSON.parse(bufRepository);
  repository.branches = getBranches(repository);
  return repository;
}

function deploy(name, branch, commit, release) {
  const startedAt = new Date().toISOString();

  const repository = getRepository(name);

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

  updateRepository(repository);

  return repository;
}

function updateRepository(repository) {
  const fileContents = JSON.stringify(repository, null, 2);
  return fs.writeFileSync(`data/${repository.name}.json`, fileContents);
}

module.exports = {
  getBranches,
  getRepositories,
  getRepository,
  updateRepository,
  deploy,
};
