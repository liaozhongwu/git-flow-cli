import * as path from 'path';
import { getGitTopLevelPath, runCommand, logger } from '../utils';

export default abstract class BaseHook {
  /**
   * @desc hook name
   */
  public name: string;

  constructor(name: string) {
    this.name = name;
    this.start();
  }
  /**
   * @desc start hook
   */
  public async start() {
    logger.info(`${this.name} check start.`);
    const defaultCheckResult = await this.runDefaultCheck();
    if (!defaultCheckResult) {
      const code = 1;
      this.displayFailureMessage(`default ${this.name} check`, code);
      return process.exit(code);
    }
    const commands = await this.getCommands();
    if (commands.length === 0) {
      logger.warn(this.name, 'has been skipped since there is no config.');
      logger.warn('');
      return process.exit(0);
    }
    for(const command of commands) {
      logger.info(this.name, `\`${command}\`.`);
      const code = await runCommand(command);
      logger.info(this.name, `\`${command}\` command exit with code ${code}.`);
      if (code !== 0) {
        this.displayFailureMessage(command, code);
        return process.exit(code);
      }
    }
  }
  /**
   * @description run default check
   */
  public abstract async runDefaultCheck(): Promise<boolean>;
  /**
   * @desc get default commands when config is empty
   */
  public abstract async getDefaultCommands(): Promise<string[]>;
  /**
   * @desc get hook commands
   */
  public async getCommands() {
    const topLevelPath = await getGitTopLevelPath();
    let commands: string[] = [];
    try {
      const configs = require(path.resolve(topLevelPath, 'gitflow'));
      const config = configs[this.name];
      commands = typeof config === 'string' ? [ config ] : config;
    } catch (err) {}

    if (!Array.isArray(commands) || commands.length === 0) {
      logger.info(this.name, 'config is empty.');
      logger.info(this.name, 'try to generate default commands.');
      commands = await this.getDefaultCommands();
      if (commands.length === 0) {
        [
          `${this.name} fail to generate default commands. please set config in your {project_root}/gitflow.js(on) like:`,
          '',
          '{',
          `  "${this.name}": [ "npm run lint" ]`,
          '}',
          '',
        ].forEach(msg => logger.warn(msg));
        return [];
      }
    }
    logger.info(this.name, 'load as', `[ ${commands.map(command => `"${command}"`).join(', ')} ].`);
    return commands;
  }
  /**
   * @desc generate hook failure message
   * @param command failure command
   * @param code exit code
   */
  public abstract getFailureMessage(command: string, code: number): string[];

  /**
   * @desc show failure message
   * @param command 
   * @param code 
   */
  public displayFailureMessage(command: string, code: number) {
    const messages = this.getFailureMessage(command, code);
    messages.forEach(msg => logger.error(msg));
  }
}