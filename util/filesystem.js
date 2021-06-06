const fs = require('fs').promises;
const path = require('path');

const tmp = require('tmp-promise');

// Private API

async function createWorkDirectory() {
  await fs.mkdir('/tmp/jarret/work', { recursive: true });
}

// Public API

async function getFileList(filePath) {
  return await fs.readdir(path.join(global.PROJECT_DIR, filePath));
}

async function getFileContents(filePath) {
  return await fs.readFile(path.join(global.PROJECT_DIR, filePath), 'utf-8');
}

async function withTempDirectory(callback, errorCallback) {
  try {
    await createWorkDirectory();
    const directory = await tmp.dir({ prefix: '/jarret/work/task', unsafeCleanup: true });
    await callback(directory.path);
    //await directory.cleanup();
  } catch (e) {
    errorCallback(e);
  }
}

module.exports = {
  getFileList,
  getFileContents,
  withTempDirectory,
};
