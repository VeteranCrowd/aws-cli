// npm imports
import { Logger } from '@karmaniverous/edge-logger';
import Ajv from 'ajv';
import { Command } from 'commander';
import fs from 'fs-extra';
import { generateTypesForDocument } from 'openapi-client-axios-typegen';

// lib imports
import { dotenvExpand } from '../dotenvExpand.js';

const configSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      source: { type: 'string' },
      target: { type: 'string' },
    },
    required: ['source', 'target'],
    additionalProperties: false,
  },
};

export const typegen = new Command()
  .name('typegen')
  .description('Generate Axios types from OpenAPI definitions.')
  .enablePositionalOptions()
  .passThroughOptions()
  .option(
    '-s, --sources <string...>',
    'space-delimited list of source URLs or file paths (prefix with $ to use env var)'
  )
  .option(
    '-t, --targets <string...>',
    'space-delimited list of target file paths (prefix with $ to use env var)'
  )
  .option(
    '-c, --config-path <string>',
    'JSON file containing array of objects with "source" and "target" properties (prefix with $ to use env var)'
  )
  .action(async ({ sources, targets, configPath }) => {
    const logger = new Logger({ maxLevel: process.env.LOG_LEVEL });

    try {
      if (
        (configPath && (sources || targets)) ||
        (!configPath && !(sources && targets))
      ) {
        throw new Error(
          'Either configPath, or sources and targets, must be specified, but not both.'
        );
      }

      let config;
      if (configPath) {
        configPath = dotenvExpand(configPath);

        config = await fs.readJSON(configPath);

        const validate = new Ajv({ strictRequired: true }).compile(
          configSchema
        );
        if (!validate(config)) {
          throw new Error(
            `Invalid typegen config file at ${configPath}: ${validate.errors}`
          );
        }
      } else {
        if (sources.length !== targets.length) {
          throw new Error('Number of sources and targets must be equal.');
        }

        config = [];
        for (let i = 0; i < sources.length; i++) {
          const source = dotenvExpand(sources[i]);
          if (!source) {
            throw new Error(`Source '${sources[i]}' not found.`);
          }

          const target = dotenvExpand(targets[i]);
          if (!target) {
            throw new Error(`Target '${targets[i]}' not found.`);
          }

          config.push({ source, target });
        }
      }

      logger.info('Generating OpenAPI types...');

      for (const { source, target } of config) {
        logger.debug(`  ${source} > ${target}`);

        const types = await generateTypesForDocument(source, {
          transformOperationName: (name) => name,
        });

        await fs.writeFile(target, types.join('\n'));
      }

      logger.info('Done.');
      console.log('');
    } catch ({ message }) {
      logger.error(message);
      console.log('');
      process.exit();
    }
  });
