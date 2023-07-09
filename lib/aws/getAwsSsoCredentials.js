// npm imports
import { execaCommand } from 'execa';

export const getAwsSsoCredentials = async (localProfile) => {
  if (!localProfile?.length) {
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_SESSION_TOKEN;
    return;
  }

  try {
    var { stdout } = await execaCommand(
      `aws configure export-credentials --profile ${localProfile}`
    );
  } catch ({ message }) {
    console.log(message);
    process.exit();
  }

  const { AccessKeyId, SecretAccessKey, SessionToken } = JSON.parse(
    stdout.toString()
  );

  process.env.AWS_ACCESS_KEY_ID = AccessKeyId;
  process.env.AWS_SECRET_ACCESS_KEY = SecretAccessKey;
  process.env.AWS_SESSION_TOKEN = SessionToken;
};
