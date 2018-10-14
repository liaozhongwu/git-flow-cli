import * as path from 'path';
import { constants } from 'fs';
import { format } from 'util';
import { logger, fsAsync } from '../utils';
import {
  hooks,
  writeIntoHookTpl,
  writeNewHookTpl,
  customHookTpl,
  getGitFolderPath,
} from './common';

async function postInstall() {
  const gitFolderPath = await getGitFolderPath();
  if (gitFolderPath === null) {
    return;
  }
  for (const hook of hooks) {
    const customHookName = `${hook}.git-flow`;
    const hookPath = path.resolve(gitFolderPath, 'hooks', hook);
    const customHookPath = path.resolve(gitFolderPath, 'hooks', customHookName);
    // write hook.git-flow 
    logger.info(`write ${customHookName}`);
    const content = format(customHookTpl, path.join(__dirname, '../hooks', hook));
    await fsAsync.writeFile(customHookPath, content, { mode: '755' });
    // write hook
    try {
      // check hook writable
      await fsAsync.access(hookPath, constants.W_OK);
      const writeIntoHookContent = format(writeIntoHookTpl, customHookPath);
      const content = (await fsAsync.readFile(hookPath)).toString('utf8');
      if (!content.includes(writeIntoHookContent)) {
        logger.info(`append ${hook}`);
        await fsAsync.appendFile(hookPath, writeIntoHookContent);
      }
    } catch (err) {
      logger.info(`write ${hook}`);
      await fsAsync.writeFile(
        hookPath,
        format(writeNewHookTpl, customHookPath),
        { mode: '755' }
      );
    }
  }
}

postInstall();