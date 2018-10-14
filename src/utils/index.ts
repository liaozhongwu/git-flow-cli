import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { EOL } from 'os';
import { isatty } from 'tty';
import {
  access,
  lstat,
  writeFile,
  readFile,
  appendFile,
  rename,
  unlink,
} from 'fs';

const manifest = require('../../package.json');

export const childProcessAsync = {
  execAsync: promisify(exec),
};

/**
 * @desc 
 * @param command command
 */
export function runCommand(command: string, opts?: {
  pipe?: boolean;
}): Promise<number> {
  return new Promise(resolve => {
    const options = Object.assign({ pipe: true }, opts);
    const splits = command.split(' ');
    const stream = spawn(splits[0], splits.slice(1), {
      stdio: options.pipe ? 'pipe' : 'ignore',
    });
    if (options.pipe) {
      stream.stdout.pipe(process.stdout);
      stream.stderr.pipe(process.stderr);
    }
    stream.on('exit', code => {
      resolve(code);
    });
  });
}

export async function getGitTopLevelPath() {
  const { stdout } = await childProcessAsync.execAsync('git rev-parse --show-toplevel');
  return stdout.replace(/\n/g, '');
}

export async function getCurrentGitBranch() {
  const { stdout } = await childProcessAsync.execAsync('git symbolic-ref --short -q HEAD');
  return stdout.replace(/\n/g, '');
}

function getTalker(fd: number, color: number) {
  return isatty(fd) ?
    `\u001b[38;5;${color}m${manifest.name}: \u001b[39;0m` :
    `${manifest.name}: `;
}

function writeStdout(message: string, color: number) {
  process.stdout.write(
    `${getTalker(process.stdout.fd, color)}${message}${EOL}`);
}

function writeStderr(message: string, color: number) {
  process.stderr.write(
    `${getTalker(process.stderr.fd, color)}${message}${EOL}`);
}

export class Logger {
  info(...args: any[]) {
    writeStdout(args.join(' '), 87);
  }
  warn(...args: any[]) {
    writeStderr(args.join(' '), 11);
  }
  error(...args: any[]) {
    writeStderr(args.join(' '), 1);
  }
}

export const logger = new Logger();

export const fsAsync = {
  access: promisify(access),
  lstat: promisify(lstat),
  writeFile: promisify(writeFile),
  readFile: promisify(readFile),
  appendFile: promisify(appendFile),
  rename: promisify(rename),
  unlink: promisify(unlink),
};

function formatDateNum(num: number): string {
  return (num < 10 ? '0' : '') + num;
}

export function getCurrentDate() {
  const now = new Date();
  const year = formatDateNum(now.getFullYear());
  const month = formatDateNum(now.getMonth() + 1);
  const date = formatDateNum(now.getDate());
  return `${year}${month}${date}`;
}