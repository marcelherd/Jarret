const { Model } = require('objection');

class Branch extends Model {
  static get tableName() {
    return 'branch';
  }
}

module.exports = Branch;
