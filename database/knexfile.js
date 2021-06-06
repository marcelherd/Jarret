const { knexSnakeCaseMappers } = require('objection');

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: `/home/wsl/LocalWorkspaces/jarret/database/database.sqlite3`,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds',
    },
    useNullAsDefault: true,
    ...knexSnakeCaseMappers,
  },
  staging: {
    client: 'sqlite3',
    connection: {
      filename: `./database/database.sqlite3`,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds',
    },
    useNullAsDefault: true,
    ...knexSnakeCaseMappers,
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: `./database/database.sqlite3`,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds',
    },
    useNullAsDefault: true,
    ...knexSnakeCaseMappers,
  },
};
