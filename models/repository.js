const { Model } = require('objection');

class Repository extends Model {
  static get tableName() {
    return 'repository';
  }
}

module.exports = Repository;
