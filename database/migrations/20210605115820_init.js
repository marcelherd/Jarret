exports.up = function (knex) {
  return knex.schema
    .createTable('repository', (table) => {
      table.increments();
      table.string('name').notNullable().unique();
      table.string('uri').notNullable().unique();
      table.timestamps(true, true);
    })
    .createTable('branch', (table) => {
      table.increments();
      table.string('name').notNullable();
      table.integer('repositoryId').references('id').inTable('repository');
      table.unique(['repositoryId', 'name']);
      table.timestamps(true, true);
    })
    .createTable('release', (table) => {
      table.increments();
      table.string('name').notNullable().unique();
      table.string('branch').notNullable();
      table.string('commit').notNullable();
      table.integer('repositoryId').references('id').inTable('repository');
      table.timestamps(true, true);
    })
    .createTable('task', (table) => {
      table.increments();
      table.timestamp('started_at').notNullable();
      table.timestamp('finished_at').notNullable();
      table.string('result').notNullable();
      table.integer('releaseId').references('id').inTable('release');
      table.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('repository')
    .dropTableIfExists('branch')
    .dropTableIfExists('release')
    .dropTableIfExists('task');
};
