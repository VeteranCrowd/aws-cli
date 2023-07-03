// npm imports
import { getDotenv } from '@karmaniverous/get-dotenv';

// lib imports
import { getAwsSsoCredentials } from './getAwsSsoCredentials.js';
import { parseBranch } from './parseBranch.js';

export const testSetup = async () => {
  if (!process.env.ENV)
    await getDotenv({
      dynamicPath: './env/dynamic.js',
      env: (await parseBranch()) ?? 'dev',
      loadProcess: true,
      paths: ['./', './env'],
    });

  if (process.env.AWS_LOCAL_PROFILE)
    getAwsSsoCredentials(process.env.AWS_LOCAL_PROFILE);

  console.log(`Running tests in '${process.env.ENV}' environment.\n`);
};
