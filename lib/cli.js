// npm imports
import { getDotenv } from '@karmaniverous/get-dotenv';
import { Command } from 'commander';

export const cli = new Command()
  .name('npm run cli --- [cli options]')
  .enablePositionalOptions()
  .passThroughOptions()
  .option('-e, --env <string>', 'environment', 'dev')
  .option('-l, --log-level <string>', 'max log level', 'info')
  .hook('preSubcommand', async (thisCommand) => {
    const { env, logLevel } = thisCommand.opts();

    await getDotenv({
      dynamicPath: './env/dynamic.js',
      env,
      loadProcess: true,
      paths: ['./', './env'],
    });

    process.env.LOG_LEVEL = logLevel;
  });
