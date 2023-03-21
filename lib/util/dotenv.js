export const updateDotenvContentsForEnvironmentVariable = (
  dotenvContents,
  key,
  value
) => {
  const toModify = [...dotenvContents];
  const indexOfCognitoSecret = toModify.findIndex((line) =>
    line.startsWith(`${key}=`)
  );
  if (indexOfCognitoSecret >= 0) {
    toModify[indexOfCognitoSecret] = `${key}=${value}`;
  } else {
    toModify.push(`${key}=${value}`);
  }
  return toModify;
};
