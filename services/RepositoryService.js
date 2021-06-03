const fs = require('fs');
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

function getRepository(name) {
  const bufRepository = fs.readFileSync(`data/${name}.json`);
  const repository = JSON.parse(bufRepository);
  repository.branches = getBranches(repository);
  return repository;
}

function updateRepository(repository) {
  const fileContents = JSON.stringify(repository, null, 2);
  return fs.writeFileSync(`data/${repository.name}.json`, fileContents);
}

module.exports = {
  getBranches,
  getRepository,
  updateRepository,
};
