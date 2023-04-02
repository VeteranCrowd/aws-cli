// npm imports
import { getDotenv } from '@karmaniverous/get-dotenv';
import { Command } from 'commander';
import _ from 'lodash';

export const getCli = (getdotenvOptions = {}) =>
  new Command()
    .name('npm run cli --- [cli options]')
    .description('Base CLI. Set paths to load dotenvs.')
    .enablePositionalOptions()
    .passThroughOptions()
    .option('-l, --log-level <string>', 'max log level', 'info')
    .option('-x, --suppress-defaults', 'suppress default getdotenv options')
    .option(
      '-p, --paths <strings...>',
      'space-delimited paths to dotenv directory'
    )
    .option(
      '-t, --dotenv-token <string>',
      "token indicating a dotenv file (default: '.env')",
      '.env'
    )
    .option(
      '-i, --private-token <string>',
      "token indicating private variables (default: 'local')",
      'local'
    )
    .option('-d, --defaultEnvironment <string>', 'default environment')
    .option('-e, --environment <string>', 'environment')
    .option('-v, --variable <string>', 'environment from variable')
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
    .option('-y, --dynamic-path <string>', 'dynamic variables path')
    .option('-s, --show', 'show extracted variables (default: false)')
    .hook('preSubcommand', async (thisCommand) => {
      const {
        defaultEnvironment,
        dotenvToken,
        dynamicPath,
        environment,
        excludeEnv,
        excludeGlobal,
        excludePrivate,
        excludePublic,
        logLevel,
        paths,
        privateToken,
        show,
        suppressDefaults,
        variable,
      } = thisCommand.opts();

      if (
        (paths && paths.length) ||
        (!suppressDefaults &&
          getdotenvOptions.paths &&
          getdotenvOptions.paths.length)
      ) {
        // Get environment.
        const env = environment ?? process.env[variable] ?? defaultEnvironment;

        const dotenvOptions = {
          ...(suppressDefaults ? {} : getdotenvOptions),
          ...(dotenvToken ? { dotenvToken } : {}),
          ...(env ? { env } : {}),
          ...(!_.isUndefined(excludeEnv) ? { excludeEnv } : {}),
          ...(!_.isUndefined(excludeGlobal) ? { excludeGlobal } : {}),
          ...(!_.isUndefined(excludePrivate) ? { excludePrivate } : {}),
          ...(!_.isUndefined(excludePublic) ? { excludePublic } : {}),
          ...(dynamicPath ? { dynamicPath } : {}),
          ...(paths ? { paths } : {}),
          ...(privateToken ? { privateToken } : {}),
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
