#!/usr/bin/env node

// npm imports
import { Command } from 'commander';

// lib imports
import {
  createSecrets,
  deleteSecrets,
  getCli,
  redrive,
  retrieveCognito,
  retrieveSecrets,
  typegen,
  updateAmplify,
  updateSecrets,
} from '../../lib/index.js';

const aws = new Command()
  .name('aws')
  .description('AWS-related commands')
  .enablePositionalOptions()
  .passThroughOptions()
  .addCommand(createSecrets)
  .addCommand(retrieveSecrets)
  .addCommand(updateSecrets)
  .addCommand(deleteSecrets)
  .addCommand(retrieveCognito)
  .addCommand(updateAmplify)
  .addCommand(redrive);

const local = new Command()
  .name('local')
  .description('Local dev environment commands')
  .enablePositionalOptions()
  .passThroughOptions()
  .addCommand(typegen);

const cli = getCli({
  dynamicPath: './env/dynamic.js',
  paths: ['./', './env'],
})
  .addCommand(aws)
  .addCommand(local);

await cli.parseAsync();
