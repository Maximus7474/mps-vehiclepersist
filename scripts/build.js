//@ts-check

import { exists, getFiles } from './utils.js';
import { createBuilder, createFxmanifest } from '@overextended/fx-utils';

const watch = process.argv.includes('--watch');

createBuilder(
  watch,
  {
    dropLabels: !watch ? ['DEV'] : undefined,
  },
  [
    {
      name: 'server',
      options: {
        platform: 'node',
        target: ['node16'],
        format: 'cjs',
      },
    },
  ],
  async (outfiles) => {
    const files = await getFiles('static');
    await createFxmanifest({
      server_scripts: [outfiles.server],
      files: files,
      dependencies: ['/server:10230', '/onesync', 'oxmysql', 'ox_core', 'ox_lib'],
      metadata: {
        server_only: 'yes'
      }
    });
  }
);