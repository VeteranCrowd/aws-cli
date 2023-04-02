// npm imports
import { Logger } from '@karmaniverous/edge-logger';
import { Command } from 'commander';
import fs from 'fs-extra';
import { generateTypesForDocument } from 'openapi-client-axios-typegen';

export const typegen = new Command()
  .name('typegen')
  .description('Generate types from environment variables.')
  .enablePositionalOptions()
  .passThroughOptions()
  .requiredOption(
    '-v, --variables <string...>',
    'Space-separated list of environment variables containing openapi URLs or file paths.'
  )
  .requiredOption(
    '-p, --paths <string...>',
    'Space-separated list of target file paths.'
  )
  .action(async ({ variables, paths }) => {
    const logger = new Logger({ maxLevel: process.env.LOG_LEVEL });

    if (variables.length !== paths.length) {
      throw new Error('Number of variables and paths must be equal.');
    }

    logger.info('Generating OpenAPI types...');

    for (let i = 0; i < variables.length; i++) {
      const variable = variables[i];
      const path = paths[i];

      const source = process.env[variable];

      if (!source) {
        throw new Error(`Environment variable "${variable}" not found.`);
      }

      logger.info(`  ${source} > ${path}`);

      const types = await generateTypesForDocument(source, {
        transformOperationName: (name) => name,
      });
      await fs.writeFile(path, types.join('\n'));
    }

    logger.info('Done.');
  });
