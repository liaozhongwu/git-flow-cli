import BaseHook from './base';
import { getCurrentGitBranch, logger } from '../utils';

class PrePushHook extends BaseHook {
  constructor() {
    super('pre-push');
  }
  /**
   * @description run default check
   */
  public async runDefaultCheck(): Promise<boolean> {
    const branch = await getCurrentGitBranch();
    const invalid = /^(master|staging|qa|release|develop)/.test(branch);
    if (invalid) {
      logger.error(`branch ${branch} is forbidden to push.`);
    }
    return !invalid;
  }
  /**
   * @desc get default commands
   * @rule find package.json scripts where includes tslint or eslint
   */
  public async getDefaultCommands() {
    return [];
  }
  /**
   * @desc generate hook failure message
   * @param command failure command
   * @param code exit code
   */
  public getFailureMessage(command: string) {
    return [
      `your push had been broken by the following command:`,
      '',
      `  ${command}`,
      '',
      'please check your push.',
    ];
  }
}

new PrePushHook();
