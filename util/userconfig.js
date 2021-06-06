const YAML = require('yaml');

const { getFileList, getFileContents } = require('./filesystem');

async function getConfigurations() {
  const configurations = [];

  const configFiles = await getFileList('/taskConfigs/');

  for (const file of configFiles) {
    const filePath = `/taskConfigs/${file}`;
    const fileContents = await getFileContents(filePath);
    const configuration = YAML.parse(fileContents);
    configurations.push(configuration.repository);
  }

  return configurations;
}

async function getConfiguration(repository) {
  // TODO: This should really be the other way around
  const configurations = await getConfigurations();
  return configurations.find((configuration) => configuration.name === repository.name);
}

module.exports = {
  getConfigurations,
  getConfiguration,
};
