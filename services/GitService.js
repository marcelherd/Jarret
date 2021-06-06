const path = require('path');

const { parseBranchData, clone, checkout } = require('../util/git');
const { withTempDirectory } = require('../util/filesystem');

const Repository = require('../models/repository');

async function updateBranches(repository) {
  // Branches fetched from the repository's URI
  const branchData = await getBranchData(repository);
  const branches = branchData.map((branchData) => branchData.branch);

  // TODO: Should be handled via SQL, but thats a problem for future me.
  // All branches that are already cached in the database
  const allCachedBranches = await Repository.relatedQuery('branches').for(repository.id);

  // Branches for the relevant repository that are already cached
  const cachedBranches = allCachedBranches.filter(
    (branch) => branch.repositoryId === repository.id,
  );

  // Only process branch names
  const branchNames = cachedBranches.map((branch) => branch.name);

  // Find all branches that exist in the remote repository but not in the DB cache
  const branchesToInsert = branches.filter((branch) => !branchNames.includes(branch));

  // Add results to our database 'cache'
  const queries = [];
  for (const branch of branchesToInsert) {
    queries.push(
      Repository.relatedQuery('branches').for(repository.id).insert({
        name: branch,
      }),
    );
  }
  await Promise.all(queries);

  // TODO: Delete branches that no longer exist remote

  return {
    branches,
    inserted: branchesToInsert,
  };
}

async function getBranchData(repository) {
  return await parseBranchData(repository);
}

async function provideWorkingCopy(repository, release, callback) {
  await withTempDirectory(
    async (location) => {
      const outputFolder = repository.name.replace(' ', '_');
      const repositoryPath = path.join(location, outputFolder);

      await clone(repository.uri, outputFolder, location);
      await checkout(release.commit, repositoryPath);
      await callback(repositoryPath);
    },
    (err) => console.error(err),
  );
}

module.exports = {
  updateBranches,
  getBranchData,
  provideWorkingCopy,
};
