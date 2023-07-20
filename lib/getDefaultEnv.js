// npm imports
import { getDotenv } from '@karmaniverous/get-dotenv';

// lib imports
import { parseEnvFromBranch } from './parseEnvFromBranch.js';

export const getDefaultEnv = async () => {
  // Get default environment from .env.local.
  const { DEFAULT_ENV } = await getDotenv({
    excludeDynamic: true,
    excludeEnv: true,
    excludePublic: true,
  });

  return DEFAULT_ENV ?? (await parseEnvFromBranch());
};
