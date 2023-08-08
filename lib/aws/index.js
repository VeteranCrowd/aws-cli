// npm imports
import { dotenvExpand } from '@karmaniverous/get-dotenv';
import { Command } from 'commander';
import { execaCommand } from 'execa';

// lib imports
import { deleteSecret } from './deleteSecret.js';
import { flushApiCache } from './flushApiCache.js';
import { pullApiKey } from './pullApiKey.js';
import { pullCognito } from './pullCognito.js';
import { pullSecret } from './pullSecret.js';
import { purgeCognito } from './purgeCognito.js';
import { purgeTable } from './purgeTable.js';
import { pushAmplify } from './pushAmplify.js';
import { pushSecret } from './pushSecret.js';
import { redrive } from './redrive.js';
import { getAwsSsoCredentials } from './getAwsSsoCredentials.js';

export const aws = new Command()
  .name('aws')
  .description('AWS CLI.')
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
  .addCommand(purgeCognito)
  .addCommand(purgeTable)
  .addCommand(pushAmplify)
  .addCommand(redrive);
