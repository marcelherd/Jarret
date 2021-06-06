const { exec } = require('./cmd');

async function parseBranchData(repository) {
  const out = await exec(`git ls-remote ${repository.uri}`);
  const lines = out.split('\n');

  // Extract relevant data
  const branchData = lines
    .filter((line) => !line.endsWith('HEAD') && line.length > 1)
    .map((line) => line.split('\t'))
    .map((line) => ({ branch: line[1].split('refs/heads/')[1], commit: line[0] }));

  // Have 'master' be the first branch
  const sortedData = branchData.reduce((acc, branchData) => {
    if (branchData.branch === 'master') {
      return [branchData, ...acc];
    }
    return [...acc, branchData];
  }, []);

  return sortedData;
}

async function clone(repository, workingDirectory) {
  const out = await exec(`git clone ${repository.uri} ${repository.name}`, {
    cwd: workingDirectory,
  });
}

async function checkout(commit, workingDirectory) {
  const out = await exec(`git checkout ${commit}`, {
    cwd: workingDirectory,
  });
}

module.exports = {
  parseBranchData,
  clone,
  checkout,
};
