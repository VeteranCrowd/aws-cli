// npm imports
import { Logger } from '@karmaniverous/edge-logger';
import { Command } from 'commander';
import fs from 'fs-extra';
import { generateTypesForDocument } from 'openapi-client-axios-typegen';

// lib imports
import { envMerge } from '../envMerge.js';

export const typegen = new Command()
  .name('typegen')
  .description('Generate Axios types from OpenAPI definitions.')
  .enablePositionalOptions()
  .passThroughOptions()
  .requiredOption(
    '-s, --sources <string...>',
    'space-delimited list of source URLs or file paths (prefix with $ to use env var)'
  )
  .requiredOption(
    '-t, --targets <string...>',
    'space-delimited list of target file paths (prefix with $ to use env var)'
  )
  .action(async ({ sources, targets }) => {
    const logger = new Logger({ maxLevel: process.env.LOG_LEVEL });

    if (sources.length !== targets.length) {
      throw new Error('Number of sources and targets must be equal.');
    }

    logger.info('Generating OpenAPI types...');

    for (let i = 0; i < sources.length; i++) {
      const source = envMerge(sources[i]);
      if (!source) {
        throw new Error(`Source '${sources[i]}' not found.`);
      }

      const target = envMerge(targets[i]);
      if (!target) {
        throw new Error(`Target '${targets[i]}' not found.`);
      }

      logger.debug(`  ${source} > ${target}`);

      const types = await generateTypesForDocument(source, {
        transformOperationName: (name) => name,
      });
      await fs.writeFile(target, types.join('\n'));
    }

    logger.info('Done.');
    console.log('');
  });
