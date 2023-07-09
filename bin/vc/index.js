#!/usr/bin/env node

// npm imports
import { Logger } from '@karmaniverous/edge-logger';
import { getDotenvCli } from '@karmaniverous/get-dotenv';
import fs from 'fs-extra';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// lib imports
import { aws } from '../../lib/aws/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// lib imports
import { getDefaultEnv } from '../../lib/getDefaultEnv.js';

// Load default options.
const cliDefaultOptionsCustomPath = resolve(
  __dirname,
  '../../getdotenv.config.json'
);

const cliDefaultOptionsCustom = (await fs.exists(cliDefaultOptionsCustomPath))
  ? JSON.parse(await fs.readFile(cliDefaultOptionsCustomPath))
  : {};

const cli = getDotenvCli({
  ...cliDefaultOptionsCustom,
  logger: new Logger(),
  preHook: async (options) => {
    const defaultEnv = await getDefaultEnv();
    if (defaultEnv) options.defaultEnv = defaultEnv;
    return options;
  },
}).addCommand(aws);

await cli.parseAsync();
