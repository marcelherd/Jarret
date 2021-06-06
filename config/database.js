const knex = require('knex');
const { Model } = require('objection');

const { getConfigurations } = require('../util/userconfig');
const knexfile = require('../database/knexfile');
const Repository = require('../models/repository');

async function updateUserConfiguration() {
  const configurations = await getConfigurations();

  // TODO: You can't actually delete (or rename) repositories
  const queries = [];
  for (const configuration of configurations) {
    const query = Repository.query().where({ name: configuration.name }).update({
      name: configuration.name,
      uri: configuration.uri,
    });
    queries.push(query);
  }
  await Promise.all(queries);
}

module.exports = async function () {
  const database = knex(knexfile.development);
  Model.knex(database);
  await updateUserConfiguration();
};
