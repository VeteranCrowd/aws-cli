// npm imports
import fs from 'fs-extra';
import _ from 'lodash';

export const updateDotenv = async (
  resolvedPaths,
  templateExtension,
  secrets
) => {
  // Iterate through dotenv paths.
  let resolvedTargetPath;
  for (const p of resolvedPaths) {
    // Break if file exists.
    if (await fs.exists(p)) {
      resolvedTargetPath = p;
      break;
    }

    // Resolve dotenv template path.
    const templatePath = `${p}.${templateExtension}`;

    // Copy template & break if template exists.
    if (await fs.exists(templatePath)) {
      await fs.copyFile(templatePath, p);
      resolvedTargetPath = p;
      break;
    }
  }
  if (!resolvedTargetPath) await fs.createFile(resolvedPaths[0]);

  // Get file contents.
  let contents = (await fs.readFile(resolvedTargetPath)).toString();

  // Replace contents with new secrets.
  _.forOwn(secrets, (value, key) => {
    const pattern = new RegExp(
      `${key}(?<separator> *= *)(?<value>".*?"|[^\n]*)`,
      'gs'
    );

    const conformedValue = value.includes('\n') ? `"${value}"` : value;

    if (pattern.test(contents)) {
      contents = contents.replace(
        pattern,
        `${key}$<separator>${conformedValue}`
      );
    } else contents += `\n\n${key}=${conformedValue}`;
  });

  // Write file contents.
  await fs.writeFile(resolvedTargetPath, contents);
};
