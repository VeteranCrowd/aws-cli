// npm imports
import { dotenvExpand } from '@karmaniverous/get-dotenv';
import { Command } from 'commander';
import { execaCommand } from 'execa';
import { globby } from 'globby';
import { packageDirectory } from 'pkg-dir';
import path from 'path';

// lib imports
import { list } from './list.js';

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
  .option('-g, --glob <string>', 'repo glob from root path', '*')
  .option(
    '-c, --command <string>',
    'dotenv-expanded shell command string',
    dotenvExpand
  )
  .hook('preSubcommand', async (thisCommand) => {
    // Execute shell command.
    const { command, glob, rootPath } = thisCommand.opts();
    const { logger = console } = thisCommand.getdotenvOptions ?? {};

    thisCommand.paths = await globPaths(glob, logger, rootPath);

    if (command) await bulkCommand(command, logger, thisCommand.paths);

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

        const { args } = command;
        if (args.length) await bulkCommand(args.join(' '), logger, paths);

        console.log('');
      }),
    { isDefault: true }
  )
  .addCommand(list);

const globPaths = async (glob, logger, rootPath) => {
  const pkgDir = (await packageDirectory())
    .split(path.sep)
    .join(path.posix.sep);
  const absRootPath = path.posix.join(pkgDir, rootPath);

  const paths = await globby(glob, {
    cwd: absRootPath,
    onlyDirectories: true,
    absolute: true,
  });

  if (!paths.length) {
    logger.error(`No paths found for glob '${glob}' at '${absRootPath}'.`);
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
