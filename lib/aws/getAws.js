// npm imports
import { Command } from 'commander';

export const getAws = () =>
  new Command()
    .name('aws')
    .description('AWS CLI.')
    .enablePositionalOptions()
    .passThroughOptions();
