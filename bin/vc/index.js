#!/usr/bin/env node

// npm imports
import { generateGetDotenvCli } from '@karmaniverous/get-dotenv';

// lib imports
import { aws } from '../../lib/aws/index.js';
import { dc } from '../../lib/depcheck.js';
import { getDefaultEnv } from '../../lib/getDefaultEnv.js';

const cli = (
  await generateGetDotenvCli({
    importMetaUrl: import.meta.url,
    preHook: async (options) => {
      const defaultEnv = await getDefaultEnv();
      if (defaultEnv) options.defaultEnv = defaultEnv;
      return options;
    },
  })
)
  .addCommand(aws)
  .addCommand(dc);

await cli.parseAsync();
