const knex = require('knex');
const { Model } = require('objection');

const { getConfigurations } = require('../util/userconfig');
const RepositoryService = require('../services/RepositoryService');
const knexfile = require('../database/knexfile');
const Repository = require('../models/repository');

async function updateUserConfiguration() {
  const configurations = await getConfigurations();
  // TODO: Validate configurations

  // TODO: You can't actually delete repositories
  const queries = [];
  for (const configuration of configurations) {
    const query = Repository.query()
      .insert({
        name: configuration.name,
        uri: configuration.uri,
      })
      .onConflict('name')
      .merge();

    queries.push(query);
  }
  await Promise.all(queries);

  // For some reason the query above does not return the correct ids
  // which is why a separate query is used to get all repositories _again_.
  // TODO: Check if there is any way to fix this.
  const repositories = await RepositoryService.getRepositories();
  for (const repository of repositories) {
    await RepositoryService.updateBranches(repository.id);
  }
}

module.exports = async function () {
  const database = knex(knexfile.development);
  Model.knex(database);
  await updateUserConfiguration();
};
