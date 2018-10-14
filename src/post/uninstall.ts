import * as path from 'path';
import { constants } from 'fs';
import { logger, fsAsync } from '../utils';
import { hooks, writeIntoHookRegExp, getGitFolderPath } from './common';

async function postUnInstall() {
  const gitFolderPath = await getGitFolderPath();
  if (gitFolderPath === null) {
    return;
  }
  for (const hook of hooks) {
    const customHookName = `${hook}.git-flow`;
    const hookPath = path.resolve(gitFolderPath, 'hooks', hook);
    const customHookPath = path.resolve(gitFolderPath, 'hooks', customHookName);
    try {
      await fsAsync.access(customHookPath);
      logger.info(`remove ${customHookName}`);
      // remove hook
      await fsAsync.unlink(customHookPath);
    } catch (err) {
      // do nothing
    }
    try {
      // check hook writable
      await fsAsync.access(hookPath, constants.W_OK);
      const content = (await fsAsync.readFile(hookPath)).toString('utf8');
      await fsAsync.writeFile(
        hookPath,
        content.replace(writeIntoHookRegExp, ''),
        { mode: '755' }
      );
    } catch (err) {
      // do nothing
    }
  }
}

postUnInstall();