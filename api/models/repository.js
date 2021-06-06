const { Model } = require('objection');

class Repository extends Model {
  static get tableName() {
    return 'repository';
  }

  static get relationMappings() {
    const Branch = require('./branch');
    const Release = require('./release');
    const Task = require('./task');

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
      tasks: {
        relation: Model.ManyToManyRelation,
        modelClass: Task,
        join: {
          from: 'repository.id',
          through: {
            from: 'release.repositoryId',
            to: 'release.id',
          },
          to: 'task.releaseId',
        },
      },
    };
  }
}

module.exports = Repository;
