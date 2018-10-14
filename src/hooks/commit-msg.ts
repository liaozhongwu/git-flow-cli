import BaseHook from './base';
import { logger, fsAsync } from '../utils';
import { EOL } from 'os';

class CommitMessageHook extends BaseHook {
  constructor() {
    super('commit-msg');
  }
  /**
   * @description run default check
   */
  public async runDefaultCheck(): Promise<boolean> {
    // get commit msg temp file by process arguments
    const commitMsgFile = process.argv[2];
    const msg = (await fsAsync.readFile(commitMsgFile)).toString('utf8');
    const lines = msg.split(EOL);
    for (const line of lines) {
      if (/^\s*$/.test(line)) {
        continue;
      }
      const types = ['feature', 'fix', 'docs', 'style', 'refactor', 'test', 'chore'];
      // check first line match <type>(<scope>): <subject>
      if (new RegExp(`^(${types.join('|')})(\(.*\))?:.*$`).test(line)) {
        return true;
      } else {
        logger.error(`commit message header must be similar to <type>(<scope>): <subject>, where type in [${types.join(', ')}].`);
        return false;
      }
    }
    logger.error('valid commit message is not found.');
    return false;
  }
  /**
   * @desc get default commands, 
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
      `your commit had been broken by the following command:`,
      '',
      `  ${command}`,
      '',
      'please check your commit. dangerously you could use -n(--no-verify) to skip.',
    ];
  }
}

new CommitMessageHook();
