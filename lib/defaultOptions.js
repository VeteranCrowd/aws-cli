import { getDotenv } from '@karmaniverous/get-dotenv';

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

export { defaultCliOptions, defaultDotenvOptions };
