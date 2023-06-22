// npm imports
import { Command } from 'commander';

// lib imports
import { dotenvExpand } from '../dotenvExpand.js';
import { getCredentials } from './getCredentials.js';

export const getAws = () =>
  new Command()
    .name('aws')
    .description('AWS CLI.')
    .enablePositionalOptions()
    .passThroughOptions()
    .option(
      '-p, --local-profile <string>',
      'local profile (follows dotenv-expand rules)',
      dotenvExpand
    )
    .hook('preSubcommand', async (thisCommand) => {
      let { localProfile } = thisCommand.opts();
      if (!localProfile) localProfile = process.env.AWS_LOCAL_PROFILE;

      // Get credentials.
      getCredentials(localProfile);
    });
