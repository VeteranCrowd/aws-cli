// npm imports
import { getDotenv } from '@karmaniverous/get-dotenv';
import { Command } from 'commander';

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
      "token indicating a dotenv file (default: '.env')"
    )
    .option(
      '-i, --private-token <string>',
      "token indicating private variables (default: 'local')"
    )
    .option('-d, --defaultEnvironment <string>', 'default environment')
    .option('-e, --environment <string>', 'environment')
    .option('-v, --variable <string>', 'environment from variable')
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

        await getDotenv({
          ...(suppressDefaults ? {} : getdotenvOptions),
          ...(dotenvToken ? { dotenvToken } : {}),
          ...(env ? { env } : {}),
          ...(excludePrivate ? { excludePrivate } : {}),
          ...(excludePublic ? { excludePublic } : {}),
          ...(dynamicPath ? { dynamicPath } : {}),
          loadProcess: true,
          log: show,
          ...(paths ? { paths } : {}),
          ...(privateToken ? { privateToken } : {}),
        });
      }
      process.env.LOG_LEVEL = logLevel;
    });
