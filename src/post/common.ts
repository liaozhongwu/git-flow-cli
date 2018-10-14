import * as path from 'path';
import { constants } from 'fs';
import { logger, getGitTopLevelPath, fsAsync } from '../utils';

const manifest = require('../../package.json');

export const hooks = [
  'pre-commit',
  'commit-msg',
  'pre-push',
];

export const customHookTpl =
`#!/usr/bin/env bash
set -e
node %s $*`;

export const writeIntoHookTpl =`
# created by ${manifest.name}
PATH="$PATH:/usr/local/bin"
if [ -f $HOME/.nvm/nvm.sh ]
then
  . $HOME/.nvm/nvm.sh
  PATH="$PATH:$HOME/.nvm/versions/node/$(nvm current)/bin"
fi
gitFlowHook="%s"
if [ -x "$gitFlowHook" ]; then 
  $gitFlowHook $*
fi
# created by ${manifest.name}`;

export const writeIntoHookRegExp = new RegExp(`\n# created by ${manifest.name}[\\s\\S]*# created by ${manifest.name}`, 'g');

export const writeNewHookTpl =
`#!/usr/bin/env bash
set -e
${writeIntoHookTpl}
`;

export async function getGitFolderPath(): Promise<string | null> {
  let topLevelPath = process.cwd();
  // get git top level path
  try {
    topLevelPath = await getGitTopLevelPath();
  } catch (err) {
    logger.error('exec git failed, please check:');
    logger.error('1. git is installed?');
    logger.error(`2. ${topLevelPath} is a git repository?`);
    return null;
  }
  const gitFolderPath = path.resolve(topLevelPath, '.git');
  // check .git folder
  try {
    try {
      await fsAsync.access(gitFolderPath, constants.W_OK);
    } catch (err) {
      throw new Error(`${gitFolderPath} cann't be access by write mode`);
    }
    const stat = await fsAsync.lstat(gitFolderPath);
    if (!stat.isDirectory()) {
      throw new Error(`${gitFolderPath} is not a directory`);
    }
  } catch (err) {
    logger.error('check .git failed, caused by:');
    logger.error(err);
    return null;
  }
  return gitFolderPath;
}
