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

  return frontToken === 'release'
    ? 'release'
    : frontToken === 'preview'
    ? backToken
    : frontToken;
};
