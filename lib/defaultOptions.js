// npm imports
import { getDotenv } from '@karmaniverous/get-dotenv';
import { existsSync, readFileSync } from 'fs';
import _ from 'lodash';
import { packageDirectory } from 'pkg-dir';
import { resolve } from 'path';

// lib imports
import { parseEnvFromBranch } from './parseEnvFromBranch.js';

// Load vc.json if it exists.
const vcPath = resolve(await packageDirectory(), 'vc.json');
const vcOptions = existsSync(vcPath) ? JSON.parse(readFileSync(vcPath)) : {};

const defaultCliOptions = {
  cliInvocation: 'vc',
  defaultEnv: 'dev',
  dynamicPath: './env/dynamic.js',
  paths: './ ./env',
  pathsDelimiter: '\\s+',
  vars: 'LOG_LEVEL=info',
  varsAssignor: '=',
  varsDelimiter: '\\s+',
  ...vcOptions,
};

const defaultDotenvOptions = _.pick(defaultCliOptions, [
  'dotenvToken',
  'env',
  'dynamicPath',
  'excludeDynamic',
  'excludeEnv',
  'excludeGlobal',
  'excludePrivate',
  'excludePublic',
  'loadProcess',
  'log',
  'outputPath',
  'paths',
  'privateToken',
  'vars',
]);

if (_.isString(defaultCliOptions.paths))
  defaultDotenvOptions.paths = defaultDotenvOptions.paths.split(' ');

const { DEFAULT_ENV } = await getDotenv({
  ...defaultDotenvOptions,
  excludeDynamic: true,
  excludeEnv: true,
});

if (DEFAULT_ENV) defaultCliOptions.defaultEnv = DEFAULT_ENV;
else {
  const branchEnv = await parseEnvFromBranch();
  if (branchEnv) defaultCliOptions.defaultEnv = branchEnv;
}

export { defaultCliOptions, defaultDotenvOptions };
