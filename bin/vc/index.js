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
import { typegen } from '../../lib/local/typegen.js';
import { parseBranch } from '../../lib/parseBranch.js';
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

const local = new Command()
  .name('openapi')
  .description('OpenAPI-related commands')
  .configureHelp({ showGlobalOptions: true })
  .enablePositionalOptions()
  .passThroughOptions()
  .addCommand(typegen);

const cli = getCli({
  defaultOptions: {
    defaultEnv: 'dev',
    dynamicPath: './env/dynamic.js',
    paths: './ ./env',
    vars: 'LOG_LEVEL=info',
  },
  preHook: async (options) => {
    const branch = await parseBranch();
    if (branch) options.defaultEnv = branch;
    return options;
  },
  postHook: async () =>
    await getAwsSsoCredentials(process.env.AWS_LOCAL_PROFILE),
})
  .addCommand(aws)
  .addCommand(local);

await cli.parseAsync();
