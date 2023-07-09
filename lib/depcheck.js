// npm imports
import { Command } from 'commander';
import depcheck from 'depcheck';
import parserBabel from 'depcheck-parser-babel';
import _ from 'lodash';
import { packageDirectory } from 'pkg-dir';

export const dc = new Command()
  .name('depcheck')
  .description('Check package.json dependencies.')
  .enablePositionalOptions()
  .passThroughOptions()
  .action(async () => {
    const pkgDir = await packageDirectory();

    const config = {
      ignoreMatches: [
        '~',
        'assets',
        'chai',
        'lefthook',
        'lib',
        'mocha',
        'pages',
        'styles.css',
        'tsx',
        '@types/*',
      ],
      parsers: {
        '**/*.js': parserBabel,
        '**/*.jsx': depcheck.parser.jsx,
        '**/*.mjs': depcheck.parser.es6,
        '**/*.ts': depcheck.parser.typescript,
        '**/*.tsx': depcheck.parser.typescript,
      },
    };

    const result = await depcheck(pkgDir, config);
    console.log(_.omit(result, ['invalidFiles', 'using']));
  });
