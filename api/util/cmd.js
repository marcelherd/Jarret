const childProcess = require('child_process');
const util = require('util');

const asyncExec = util.promisify(childProcess.exec);

async function exec(command, options) {
  const { stdout, stderr } = await asyncExec(command, options);
  // TODO: Git seems to output everything to stderr?
  //if (stderr) throw new Error(stderr);
  //console.log(command, 'stdout', stdout);
  //console.log(command, 'stderr', stderr);
  return stdout;
}

module.exports = {
  exec,
};
