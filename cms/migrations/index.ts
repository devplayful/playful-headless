import * as migration_20261028_195833_initial from './20261028_195833_initial';
import * as migration_20261029_114031 from './20261029_114031';

export const migrations = [
  {
    up: migration_20261028_195833_initial.up,
    down: migration_20261028_195833_initial.down,
    name: '20261028_195833_initial',
  },
  {
    up: migration_20261029_114031.up,
    down: migration_20261029_114031.down,
    name: '20261029_114031',
  },
];
