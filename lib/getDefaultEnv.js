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

  if (DEFAULT_ENV) return DEFAULT_ENV;
  else {
    // Otherwise try getting it from the current branch.
    const branchEnv = await parseEnvFromBranch();
    if (branchEnv) return branchEnv;
  }
};
