#!/usr/bin/env node

// npm imports
import { getCli } from '@karmaniverous/get-dotenv';
import { Command } from 'commander';

// lib imports
import { deleteSecret } from '../../lib/aws/deleteSecret.js';
import { flushApiCache } from '../../lib/aws/flushApiCache.js';
import { pullApiKey } from '../../lib/aws/pullApiKey.js';
import { pullCognito } from '../../lib/aws/pullCognito.js';
import { pullSecret } from '../../lib/aws/pullSecret.js';
import { pushAmplify } from '../../lib/aws/pushAmplify.js';
import { pushSecret } from '../../lib/aws/pushSecret.js';
import { redrive } from '../../lib/aws/redrive.js';
import { defaultCliOptions } from '../../lib/defaultOptions.js';
import { getAwsSsoCredentials } from '../../lib/getAwsSsoCredentials.js';

const aws = new Command()
  .name('aws')
  .description('AWS CLI.')
  .configureHelp({ showGlobalOptions: true })
  .enablePositionalOptions()
  .passThroughOptions()
  .addCommand(pullSecret)
  .addCommand(pushSecret)
  .addCommand(deleteSecret)
  .addCommand(pullApiKey)
  .addCommand(flushApiCache)
  .addCommand(pullCognito)
  .addCommand(pushAmplify)
  .addCommand(redrive);

const cli = getCli({
  defaultOptions: defaultCliOptions,
  postHook: async () => {
    if (process.env.AWS_LOCAL_PROFILE)
      await getAwsSsoCredentials(process.env.AWS_LOCAL_PROFILE);
  },
})
  .addCommand(aws)

await cli.parseAsync();
