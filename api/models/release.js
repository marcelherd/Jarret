const { Model } = require('objection');

class Release extends Model {
  static get tableName() {
    return 'release';
  }
}

module.exports = Release;
