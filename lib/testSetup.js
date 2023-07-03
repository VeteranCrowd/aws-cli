// npm imports
import { getDotenv } from '@karmaniverous/get-dotenv';

// lib imports
import { getAwsSsoCredentials } from './getAwsSsoCredentials.js';
import { defaultCliOptions, defaultDotenvOptions } from './defaultOptions.js';

export const testSetup = async () => {
  if (!process.env.ENV)
    await getDotenv({
      ...defaultDotenvOptions,
      env: defaultCliOptions.defaultEnv,
    });

  if (process.env.AWS_LOCAL_PROFILE)
    getAwsSsoCredentials(process.env.AWS_LOCAL_PROFILE);

  console.log(`Running tests in '${process.env.ENV}' environment.\n`);
};
