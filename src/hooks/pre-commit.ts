import BaseHook from './base';
import * as path from 'path';
import { getGitTopLevelPath, getCurrentGitBranch, logger } from '../utils';

class PreCommitHook extends BaseHook {
  constructor() {
    super('pre-commit');
  }
  /**
   * @description run default check
   */
  public async runDefaultCheck(): Promise<boolean> {
    const branch = await getCurrentGitBranch();
    const invalid = /^(master|staging|qa|release|develop)/.test(branch);
    if (invalid) {
      logger.error(`branch ${branch} is forbidden to apply commit.`);
    }
    return !invalid;
  }
  /**
   * @desc get default commands
   * @rule find package.json scripts where includes tslint or eslint
   */
  public async getDefaultCommands() {
    try {
      const commands: string[] = [];
      const topLevelPath = await getGitTopLevelPath();
      const manifest = require(path.resolve(topLevelPath, 'package.json'));
      if (manifest.scripts) {
        Object.keys(manifest.scripts).forEach(script => {
          const content: string = manifest.scripts[script];
          if (/(t|e)slint/.test(content) && !content.includes('fix')) {
            commands.push(`npm run ${script}`);
          }
        });
      }
      return commands;
    } catch (err) {
      return [];
    }
  }
  /**
   * @desc generate hook failure message
   * @param command failure command
   * @param code exit code
   */
  public getFailureMessage(command: string) {
    return [
      `your commit had been broken by the following command:`,
      '',
      `  ${command}`,
      '',
      'please check your commit. dangerously you could use -n(--no-verify) to skip.',
    ];
  }
}

new PreCommitHook();
