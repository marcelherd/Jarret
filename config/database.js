const knex = require('knex');
const { Model } = require('objection');

const knexfile = require('../database/knexfile');

module.exports = function () {
  const database = knex(knexfile.development);
  Model.knex(database);
};
