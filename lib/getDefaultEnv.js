/*
******************* DO NOT EDIT THIS NOTICE *****************
This code and all related intellectual property is owned by  
Veteran Crowd Rewards, LLC. It is not to be disclosed, copied
or used without written permission.                          
*************************************************************
*/

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
