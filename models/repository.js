const { Model } = require('objection');
const Release = require('./release');

class Repository extends Model {
  static get tableName() {
    return 'repository';
  }

  static get relationMappings() {
    const Branch = require('./branch');

    return {
      branches: {
        relation: Model.HasManyRelation,
        modelClass: Branch,
        join: {
          from: 'repository.id',
          to: 'branch.repositoryId',
        },
      },
      releases: {
        relation: Model.HasManyRelation,
        modelClass: Release,
        join: {
          from: 'repository.id',
          to: 'release.repositoryId',
        },
      },
    };
  }
}

module.exports = Repository;
