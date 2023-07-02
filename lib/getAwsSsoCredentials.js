// npm imports
import { execaCommand } from 'execa';

export const getAwsSsoCredentials = async (localProfile) => {
  if (!localProfile?.length) {
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_SESSION_TOKEN;
    return;
  }

  const { exitCode, stdout, stderr } = await execaCommand(
    `aws configure export-credentials --profile ${localProfile}`
  );

  if (exitCode) throw new Error(stderr.toString());

  const { AccessKeyId, SecretAccessKey, SessionToken } = JSON.parse(
    stdout.toString()
  );

  process.env.AWS_ACCESS_KEY_ID = AccessKeyId;
  process.env.AWS_SECRET_ACCESS_KEY = SecretAccessKey;
  process.env.AWS_SESSION_TOKEN = SessionToken;
};
