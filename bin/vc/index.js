#!/usr/bin/env node

// npm imports
import { generateGetDotenvCli } from '@karmaniverous/get-dotenv';

// lib imports
import { aws } from '../../lib/aws/index.js';
import { dc } from '../../lib/depcheck.js';

// lib imports
import { getDefaultEnv } from '../../lib/getDefaultEnv.js';

const cli = generateGetDotenvCli({
  preHook: async (options) => {
    const defaultEnv = await getDefaultEnv();
    if (defaultEnv) options.defaultEnv = defaultEnv;
    return options;
  },
})
  .addCommand(aws)
  .addCommand(dc);

await cli.parseAsync();
