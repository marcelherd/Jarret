const { Model } = require('objection');

class Task extends Model {
  static get tableName() {
    return 'task';
  }

  static get relationMappings() {
    const Release = require('./release');

    return {
      release: {
        relation: Model.HasOneRelation,
        modelClass: Release,
        join: {
          from: 'task.releaseId',
          to: 'release.id',
        },
      },
    };
  }
}

module.exports = Task;
