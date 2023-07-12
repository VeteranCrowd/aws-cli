// npm imports
import { dotenvExpand } from '@karmaniverous/get-dotenv';
import { Command } from 'commander';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import { globby } from 'globby';
import { packageDirectory } from 'pkg-dir';
import path from 'path';
import { fileURLToPath } from 'url';

// lib imports
import { list } from './list.js';

// Load scripts.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptsPath = path.resolve(__dirname, './scripts.json');
const scripts = (await fs.exists(scriptsPath))
  ? JSON.parse(await fs.readFile(scriptsPath))
  : {};

export const bulk = new Command()
  .name('bulk')
  .description('Bulk commands across local repos.')
  .enablePositionalOptions()
  .passThroughOptions()
  .option(
    '-r, --root-path <string>',
    'dotenv-expanded path to common root directory from current package root',
    dotenvExpand,
    '../'
  )
  .option(
    '-g, --globs <strings>',
    'space-delimited repo globs from root path',
    '*'
  )
  .option(
    '-c, --command <string>',
    'dotenv-expanded shell command string',
    dotenvExpand
  )
  .hook('preSubcommand', async (thisCommand) => {
    // Execute shell command.
    const { command, globs, rootPath } = thisCommand.opts();
    const { logger = console } = thisCommand.getdotenvOptions ?? {};

    thisCommand.paths = await globPaths(globs.split(' '), logger, rootPath);

    if (command)
      await bulkCommand(scripts[command] ?? command, logger, thisCommand.paths);

    console.log('');
  })
  .addCommand(
    new Command()
      .name('cmd')
      .description('execute shell command string (default command)')
      .enablePositionalOptions()
      .passThroughOptions()
      .action(async (options, command) => {
        const { paths } = command.parent;
        const { logger = console } =
          command.parent?.parent?.getdotenvOptions ?? {};

        const cmd = (command.args ?? []).join(' ');
        if (cmd.length) await bulkCommand(scripts[cmd] ?? cmd, logger, paths);

        console.log('');
      }),
    { isDefault: true }
  )
  .addCommand(list);

const globPaths = async (globs, logger, rootPath) => {
  const pkgDir = (await packageDirectory())
    .split(path.sep)
    .join(path.posix.sep);
  const absRootPath = path.posix.join(pkgDir, rootPath);

  const paths = await globby(globs, {
    cwd: absRootPath,
    onlyDirectories: true,
    absolute: true,
  });

  if (!paths.length) {
    logger.error(`No paths found for globs '${globs}' at '${absRootPath}'.`);
    process.exit(0);
  }

  return paths;
};

const bulkCommand = async (command, logger, paths) => {
  for (const path of paths) {
    console.log('');
    const pathLabel = `CWD: ${path}`;
    const commandLabel = `CMD: ${command}`;
    logger.info('*'.repeat(Math.max(pathLabel.length, commandLabel.length)));
    logger.info(pathLabel);
    logger.info(commandLabel);
    console.log('');

    await execaCommand(command.replace(/ /g, '\\ '), {
      cwd: path,
      stdio: 'inherit',
      shell: true,
    });
  }
};
