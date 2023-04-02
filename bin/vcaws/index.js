#!/usr/bin/env node

// npm imports
import { Command } from 'commander';

// lib imports
import {
  deleteSecret,
  getCli,
  pullCognito,
  pullSecret,
  pushSecret,
  redrive,
  typegen,
} from '../../lib/index.js';

const aws = new Command()
  .name('aws')
  .description('AWS-related commands')
  .enablePositionalOptions()
  .passThroughOptions()
  .addCommand(deleteSecret)
  .addCommand(pullCognito)
  .addCommand(pullSecret)
  .addCommand(pushSecret)
  .addCommand(redrive);

const local = new Command()
  .name('openapi')
  .description('OpenAPI-related commands')
  .enablePositionalOptions()
  .passThroughOptions()
  .addCommand(typegen);

const cli = getCli({
  dynamicPath: './env/dynamic.js',
  env: 'dev',
  paths: ['./', './env'],
})
  .addCommand(aws)
  .addCommand(local);

await cli.parseAsync();
