// npm imports
import {
  dotenvExpand,
  getAwsSsoCredentials,
  getDotenv,
  parseBranch,
} from '@karmaniverous/get-dotenv';
import { Command } from 'commander';

export const getCli = (getdotenvOptions = {}) =>
  new Command()
    .name('npm run cli --- [cli options]')
    .description('Base CLI. Set paths to load dotenvs.')
    .enablePositionalOptions()
    .passThroughOptions()
    .option(
      '-p, --paths <strings...>',
      'space-delimited paths to dotenv directory'
    )
    .option('-y, --dynamic-path <string>', 'dynamic variables path')
    .option(
      '-o, --output-path <string>',
      'consolidated output file (follows dotenv-expand rules using loaded env vars)'
    )
    .option(
      '-e, --environment <string>',
      'environment name (follows dotenv-expand rules)',
      dotenvExpand
    )
    .option(
      '-d, --defaultEnvironment <string>',
      'default environment (follows dotenv-expand rules)',
      dotenvExpand
    )
    .option(
      '-b, --branch-to-default',
      'derive default environment from the current git branch (default: false)'
    )
    .option(
      '-n, --exclude-env',
      'exclude environment-specific variables (default: false)'
    )
    .option(
      '-g, --exclude-global',
      'exclude global & dynamic variables (default: false)'
    )
    .option(
      '-r, --exclude-private',
      'exclude private variables (default: false)'
    )
    .option('-u, --exclude-public', 'exclude public variables (default: false)')
    .option(
      '-z, --exclude-dynamic',
      'exclude dynamic variables (default: false)'
    )
    .option(
      '-t, --dotenv-token <string>',
      'token indicating a dotenv file',
      '.env'
    )
    .option(
      '-i, --private-token <string>',
      'token indicating private variables',
      'local'
    )
    .option('-s, --log', 'log extracted variables (default: false)')
    .option('-l, --log-level <string>', 'max log level')
    .option('-x, --suppress-dotenv', 'suppress dotenv loading (default: false)')
    .option(
      '-a, --aws-sso-profile <string>',
      'local AWS SSO profile (follows dotenv-expand rules)',
      '$AWS_LOCAL_PROFILE'
    )
    .hook('preSubcommand', async (thisCommand) => {
      const options = {
        ...getdotenvOptions,
        ...(process.env['getdotenvOptions']
          ? JSON.parse(process.env['getdotenvOptions'])
          : {}),
        ...thisCommand.opts(),
      };

      const {
        awsSsoProfile,
        branchToDefault,
        env,
        environment,
        defaultEnvironment,
        logLevel,
        paths,
        suppressDotenv,
        ...rest
      } = options;

      if (branchToDefault) {
        var { envToken } = parseBranch();
      }

      if (paths && paths.length && !suppressDotenv)
        await getDotenv({
          ...rest,
          env: environment ?? envToken ?? defaultEnvironment ?? env,
          loadProcess: true,
          paths,
        });

      if (logLevel) process.env.LOG_LEVEL = logLevel;

      const profile = dotenvExpand(awsSsoProfile);
      if (profile) getAwsSsoCredentials(profile);
    });
