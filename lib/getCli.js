// npm imports
import { getDotenv } from '@karmaniverous/get-dotenv';
import { Command } from 'commander';
import _ from 'lodash';

export const envMerge = (value) =>
  !_.isUndefined(value) && value.startsWith('$')
    ? process.env[value.slice(1)]
    : value;

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
      '-e, --environment <string>',
      'environment name (prefix with $ to use environment variable)',
      envMerge
    )
    .option(
      '-d, --defaultEnvironment <string>',
      'default environment (prefix with $ to use environment variable)',
      envMerge
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
    .option('-l, --log-level <string>', 'max log level', 'info')
    .option('-s, --show', 'show extracted variables (default: false)')
    .option('-x, --suppress-defaults', 'suppress default getdotenv options')
    .hook('preSubcommand', async (thisCommand) => {
      const options = thisCommand.opts();
      const {
        defaultEnvironment,
        environment,
        logLevel,
        paths,
        show,
        suppressDefaults,
      } = options;

      if (
        (paths && paths.length) ||
        (!suppressDefaults &&
          getdotenvOptions.paths &&
          getdotenvOptions.paths.length)
      ) {
        // Get environment.
        const env = environment ?? defaultEnvironment;

        const dotenvOptions = {
          ...(suppressDefaults ? {} : getdotenvOptions),
          ..._.forOwn(options, (value, key, obj) => {
            if (_.isUndefined(value)) delete obj[key];
          }),
          ...(env ? { env } : {}),
        };
        process.env['aws-cli-dotenvoptions'] = JSON.stringify(dotenvOptions);

        await getDotenv({
          ...dotenvOptions,
          loadProcess: true,
          log: show,
        });
      }
      process.env.LOG_LEVEL = logLevel;
    })
    .hook('postAction', () => {
      delete process.env['aws-cli-dotenvoptions'];
    });
