// npm imports
import { getDotenv } from '@karmaniverous/get-dotenv';

// lib imports
import { parseEnvFromBranch } from './parseEnvFromBranch.js';

const defaultDotenvOptions = {
  dynamicPath: './env/dynamic.js',
  paths: ['./', './env'],
  vars: 'LOG_LEVEL=info',
};

const defaultCliOptions = {
  cliInvocation: 'vc',
  defaultEnv: 'dev',
  dynamicPath: './env/dynamic.js',
  paths: './ ./env',
  vars: 'LOG_LEVEL=info',
};

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
