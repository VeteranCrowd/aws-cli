/*
****************************** DO NOT EDIT ****************************** 
This code and all related intellectual property is owned by Veteran Crowd 
Rewards, LLC. It is not to be disclosed, copied or used without written 
permission.
*************************************************************************
*/

// npm imports
import branch from 'git-branch';

export const parseEnvFromBranch = async (branchName) => {
  try {
    branchName ??= (await branch()) ?? '';
  } catch {
    branchName ??= '';
  }

  const { frontToken, backToken } =
    branchName?.match(/^(?<frontToken>[^/]+)(?:\/(?<backToken>[^/]+))?$/)
      ?.groups ?? {};

  return frontToken === 'main' && !backToken
    ? 'prod'
    : frontToken === 'release'
    ? 'release'
    : frontToken === 'preview'
    ? backToken
    : frontToken && !backToken
    ? frontToken
    : undefined;
};
