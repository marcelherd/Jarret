const fs = require('fs').promises;
const util = require('util');
const path = require('path');
const childProcess = require('child_process');

/*
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);
const mkdir = util.promisify(fs.mkdir);
*/
const exec = util.promisify(childProcess.exec);

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const app = express();

app.use(morgan());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const copyFiles = async (src, dest) => {
  const files = await fs.readdir(src);
  for (let file of files) {
    if (file === '.git') continue;
    const filePath = `${src}/${file}`;
    const fileInfo = await fs.lstat(filePath);
    if (fileInfo.isDirectory()) {
      await copyFiles(filePath, dest);
    }
    await fs.copyFile(filePath, dest);
  }
};

const getRepository = async (name) => {
  const bufRepository = await fs.readFile(`data/${name}.json`);
  const repository = JSON.parse(bufRepository);
  return repository;
};

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/api/v1/repository', async (req, res) => {
  const files = await fs.readdir('data');
  const fileNames = files.map((file) => path.parse(file).name);
  const result = { repositories: fileNames };
  res.send(result);
});

app.get('/api/v1/repository/:name', async (req, res) => {
  const name = req.params.name;
  const repository = await getRepository(name);
  res.json(repository);
});

app.post('/api/v1/repository/:name/deploy', async (req, res) => {
  const name = req.params.name;
  const { branch, commit } = req.body;

  if (!branch) res.send(400);

  const repository = await getRepository(name);
  const buildNumber = repository.builds.filter((b) => b.branch === branch).length + 1;
  const buildFolder = './work';
  let currentWorkingDirectory = `${buildFolder}/${branch}-${buildNumber}`;

  fs.access(buildFolder).catch((e) => {
    if (e.code === 'ENOENT') return fs.mkdir(buildFolder);
  });

  await fs.mkdir(currentWorkingDirectory);

  let { stdout } = await exec(`git clone ${repository.source} ${repository.name}`, {
    cwd: currentWorkingDirectory,
  }).catch((e) => res.status(400).send(e.stderr));
  console.log(stdout);

  currentWorkingDirectory += `/${repository.name}`;

  const checkoutTarget = commit ? commit : branch;

  ({ stdout } = await exec(`git checkout ${checkoutTarget}`, {
    cwd: currentWorkingDirectory,
  }));
  console.log(stdout);

  copyFiles(currentWorkingDirectory, repository.target);

  res.send(200);
});

app.listen(3000, () => {
  console.log('Jarret is running on http://localhost:3000');
});
