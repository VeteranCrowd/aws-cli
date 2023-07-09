// npm imports
import { Command } from 'commander';

export const list = new Command()
  .name('list')
  .description('Create or update local environment variable from API Key.')
  .enablePositionalOptions()
  .passThroughOptions()
  .action(async (options, command) => {
    const { paths } = command.parent;
    const { logger = console } = command.parent?.parent?.getdotenvOptions ?? {};

    console.log('');
    logger.info('Resolved paths:\n', paths.join('\n'));
    console.log('');
  });
