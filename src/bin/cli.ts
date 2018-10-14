import * as Yargs from 'yargs';
import { logger, runCommand, getCurrentDate } from '../utils';

const manifest = require('../../package.json');

const yargs = Yargs
  .usage('Usage: $0 <command>')
  .command('feature <name>', 'create a new feature branch')
  .command('hotfix <name>', 'create a new hotfix branch')
  .help('help', 'show help')
  .alias('h', 'help')
  .version('version', 'show version', `${manifest.name} ${manifest.version}`)
  .alias('v', 'version');

async function createNewBranch(name: string) {
  const fetchOriginMasterCmd = 'git fetch origin master';
  logger.info(fetchOriginMasterCmd);
  await runCommand(fetchOriginMasterCmd);
  const checkoutCmd = `git checkout -b ${name} origin/master`;
  logger.info(checkoutCmd);
  await runCommand(checkoutCmd);
}

async function cli() {
  const args = yargs.argv._;
  const command = args[0];

  if (typeof command === 'undefined') {
    logger.warn('command is not found.');
    yargs.showHelp();
    return;
  }

  switch(command) {
    case 'feature': {
      const branchName = args[1];
      await createNewBranch(`feature/${branchName}`);
      break;
    }
    case 'hotfix': {
      const branchName = args[1];
      await createNewBranch(`hotfix/${getCurrentDate()}-${branchName}`);
      break;
    }
  }
}

cli();
