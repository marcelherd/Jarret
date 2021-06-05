exports.seed = async function (knex) {
  await knex('repository').insert([
    {
      id: 1,
      name: 'Jarret',
      uri: 'https://github.com/marcelherd/jarret.git',
    },
    {
      id: 2,
      name: 'SAMP Race',
      uri: 'https://github.com/marcelherd/SAMP-Race.git',
    },
  ]);

  await knex('branch').insert([
    {
      name: 'master',
      repositoryId: 1,
    },
    {
      name: 'master',
      repositoryId: 2,
    },
  ]);

  await knex('release').insert([
    {
      id: 1,
      name: 'master-1',
      branch: 'master',
      commit: '9e19fd39172e9b7fd2c70a479e693f15deb27180',
      repositoryId: 1,
    },
    {
      id: 2,
      name: 'master-2',
      branch: 'master',
      commit: '93acd3ddb0164acf01a960292f3d94e885b8157c',
      repositoryId: 1,
    },
  ]);

  await knex('task').insert([
    {
      id: 1,
      started_at: new Date(),
      finished_at: new Date(),
      result: 'success',
      releaseId: 1,
    },
    {
      id: 2,
      started_at: new Date(),
      finished_at: new Date(),
      result: 'failure',
      releaseId: 2,
    },
    {
      id: 3,
      started_at: new Date(),
      finished_at: new Date(),
      result: 'success',
      releaseId: 1,
    },
  ]);
};
