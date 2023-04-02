// npm imports
import { Command } from 'commander';

export const getdotenv = new Command()
  .name('getdotenv')
  .description('Execute getdotenv.')
  .enablePositionalOptions()
  .passThroughOptions()
  .action(async () => undefined);
