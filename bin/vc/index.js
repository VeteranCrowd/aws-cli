#!/usr/bin/env node

// npm imports
import { generateGetDotenvCli } from '@karmaniverous/get-dotenv';
import fs from 'fs-extra';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// lib imports
import { aws } from '../../lib/aws/index.js';
import { dc } from '../../lib/depcheck.js';
import { getDefaultEnv } from '../../lib/getDefaultEnv.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const defaultGetDotenvCliOptionsPath = resolve(
  __dirname,
  '../getdotenv.config.json'
);

const defaultGetDotenvCliOptions = (await fs.exists(
  defaultGetDotenvCliOptionsPath
))
  ? JSON.parse(await fs.readFile(defaultGetDotenvCliOptionsPath).toString())
  : {};

const cli = generateGetDotenvCli({
  ...defaultGetDotenvCliOptions,
  preHook: async (options) => {
    const defaultEnv = await getDefaultEnv();
    if (defaultEnv) options.defaultEnv = defaultEnv;
    return options;
  },
})
  .addCommand(aws)
  .addCommand(dc);

await cli.parseAsync();
