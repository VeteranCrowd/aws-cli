// npm imports
import branch from 'git-branch';

export const parseEnvFromBranch = async (branchName) => {
  try {
    branchName ??= (await branch()) ?? '';
  } catch {
    branchName ??= '';
  }

  return branchName.match(/[^/]+$/)?.[0];
};
