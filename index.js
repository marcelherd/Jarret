const fs = require('fs').promises;
const util = require('util');
const path = require('path');
const childProcess = require('child_process');

const exec = util.promisify(childProcess.exec);

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const app = express();

app.use(morgan());
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      scriptSrc: ["'self'", "cdn.jsdelivr.net"],
    }
  }
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');
app.locals.version = process.env.npm_package_version;

const getBranches = async (repository) => {
  const buildFolder = '/tmp/jarret/work';
  let currentWorkingDirectory = `${buildFolder}/${repository.name}-meta_${Math.random().toString(36).substring(5)}`;

  await fs.access(buildFolder).catch(async (e) => {
    if (e.code === 'ENOENT') return await fs.mkdir(buildFolder);
  });

  await fs.mkdir(currentWorkingDirectory);

  let { stdout, stderr } = await exec(`git clone ${repository.source} ${repository.name}`, {
    cwd: currentWorkingDirectory,
  });
  currentWorkingDirectory += `/${repository.name}`;

  ({ stdout, stderr } = await exec('git branch -a', {
    cwd: currentWorkingDirectory,
  }));
  
  return stdout
    .split('\n')
    .filter(line => line.includes('remotes') && !line.includes('HEAD'))
    .map(line => line.trim())
    .map(line => line.replace('remotes/', ''));
};

const getRepository = async (name) => {
  const bufRepository = await fs.readFile(`data/${name}.json`);
  const repository = JSON.parse(bufRepository);
  repository.branches = await getBranches(repository);
  return repository;
};

const updateRepository = async (repository) => {
  return await fs.writeFile(`data/${repository.name}.json`, JSON.stringify(repository, null, 2));
};

app.get('/', (req, res) => {
  res.render('index');
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
  let { branch, commit } = req.body; // TODO: this is unsafe
  const startedAt = new Date().toISOString();

  if (!branch) res.send(400);

  const repository = await getRepository(name);
  let buildNumber = repository.builds.filter((b) => b.branch === branch).length + 1;
  if (commit) {
    // I know that this entire project is a goddamn mess but this is on another level
    // TODO cleanup code
    buildNumber = repository.builds.filter((b) => b.commit === commit)[0].version.split('-')[1];
  }
  const buildFolder = '/tmp/jarret/work';
  let currentWorkingDirectory = `${buildFolder}/${branch.replace('/', '_')}-${buildNumber}_${Math.random().toString(36).substring(5)}`;

  await fs.access(buildFolder).catch(async (e) => {
    if (e.code === 'ENOENT') return await fs.mkdir(buildFolder);
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

  if (!commit) {
    ({ stdout, stderr } = await exec('git rev-parse HEAD', {
      cwd: currentWorkingDirectory,
    }));
    commit = stdout.trim();
  }

  for (const cmd of repository.commands) {
    ({ stdout, stderr } = await exec(cmd, {
      cwd: currentWorkingDirectory,
    }));
    console.log(stdout);
    console.error(stderr);
  }

  if (!repository.preserveWorkDir) {
    await fs.rm(buildFolder, { recursive: true });
  }

  repository.builds.push({
    "started_at": startedAt,
    "finished_at": new Date().toISOString(),
    "result": "Success",
    "version": `${branch}-${buildNumber}`,
    "branch": branch,
    "commit": commit,
  });

  repository.builds.sort((a, b) => {
    const t1 = new Date(a["started_at"]);
    const t2 = new Date(b["started_at"]);
    return t2 - t1;
  });

  await updateRepository(repository);

  res.send({
    status: 'Success',
    repository,
  });
});

app.listen(3000, () => {
  console.log('Jarret is running on http://localhost:3000');
});
