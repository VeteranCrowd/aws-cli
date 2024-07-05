// npm imports
import { getDotenv } from '@karmaniverous/get-dotenv';

// lib imports
import { getAwsSsoCredentials } from './aws/getAwsSsoCredentials.js';
import { getDefaultEnv } from './getDefaultEnv.js';

export const testSetup = async () => {
  if (!process.env.ENV) {
    const defaultEnv = await getDefaultEnv();
    await getDotenv({ env: defaultEnv });
  }

  if (
    process.env.AWS_LOCAL_PROFILE &&
    process.env.AWS_LOCAL_PROFILE !== 'undefined'
  )
    await getAwsSsoCredentials(process.env.AWS_LOCAL_PROFILE);

  console.log(`Running tests in '${process.env.ENV}' environment.\n`);
};
