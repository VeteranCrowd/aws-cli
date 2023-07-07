#!/usr/bin/env node

// npm imports
import { Logger } from '@karmaniverous/edge-logger';
import { dotenvExpand, getDotenvCli } from '@karmaniverous/get-dotenv';
import { Command } from 'commander';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// lib imports
import { deleteSecret } from '../../lib/aws/deleteSecret.js';
import { flushApiCache } from '../../lib/aws/flushApiCache.js';
import { pullApiKey } from '../../lib/aws/pullApiKey.js';
import { pullCognito } from '../../lib/aws/pullCognito.js';
import { pullSecret } from '../../lib/aws/pullSecret.js';
import { pushAmplify } from '../../lib/aws/pushAmplify.js';
import { pushSecret } from '../../lib/aws/pushSecret.js';
import { redrive } from '../../lib/aws/redrive.js';
import { getAwsSsoCredentials } from '../../lib/getAwsSsoCredentials.js';
import { getDefaultEnv } from '../../lib/getDefaultEnv.js';

const aws = new Command()
  .name('aws')
  .description('AWS CLI.')
  .configureHelp({ showGlobalOptions: true })
  .enablePositionalOptions()
  .passThroughOptions()
  .option(
    '-c, --command <string>',
    'dotenv-expanded shell command string',
    dotenvExpand
  )
  .hook('preSubcommand', async (thisCommand) => {
    if (process.env.AWS_LOCAL_PROFILE)
      await getAwsSsoCredentials(process.env.AWS_LOCAL_PROFILE);

    // Execute shell command.
    const { command } = thisCommand.opts();
    if (command)
      await execaCommand(command.replace(/ /g, '\\ '), {
        shell: true,
        stdio: 'inherit',
      });
  })
  .addCommand(
    new Command()
      .name('cmd')
      .description('execute shell command string (default command)')
      .configureHelp({ showGlobalOptions: true })
      .enablePositionalOptions()
      .passThroughOptions()
      .action(async (options, command) => {
        const { args } = command;
        if (args.length)
          await execaCommand(args.join('\\ '), {
            stdio: 'inherit',
            shell: true,
          });
      }),
    { isDefault: true }
  )
  .addCommand(pullSecret)
  .addCommand(pushSecret)
  .addCommand(deleteSecret)
  .addCommand(pullApiKey)
  .addCommand(flushApiCache)
  .addCommand(pullCognito)
  .addCommand(pushAmplify)
  .addCommand(redrive);

// Load default options.
const cliDefaultOptionsCustomPath = resolve(
  __dirname,
  '../../getdotenv.config.json'
);

const cliDefaultOptionsCustom = (await fs.exists(cliDefaultOptionsCustomPath))
  ? JSON.parse(await fs.readFile(cliDefaultOptionsCustomPath))
  : {};

const cli = getDotenvCli({
  ...cliDefaultOptionsCustom,
  logger: new Logger(),
  preHook: async (options) => {
    const defaultEnv = await getDefaultEnv();
    if (defaultEnv) options.defaultEnv = defaultEnv;
    return options;
  },
}).addCommand(aws);

await cli.parseAsync();
