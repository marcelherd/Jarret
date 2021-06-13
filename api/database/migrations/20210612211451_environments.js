exports.up = function (knex) {
  return knex.schema.alterTable('task', (table) => {
    table.string('environment');
  });
};

exports.down = function (knex) {
  return knex.schema.table('task', (table) => {
    table.dropColumn('environment');
  });
};
