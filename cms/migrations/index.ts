import * as migration_20261028_195833_initial from './20261028_195833_initial';
import * as migration_20261030_100000_home from './20261030_100000_home';

export const migrations = [
  {
    up: migration_20261028_195833_initial.up,
    down: migration_20261028_195833_initial.down,
    name: '20261028_195833_initial',
  },
  {
    up: migration_20261030_100000_home.up,
    down: migration_20261030_100000_home.down,
    name: '20261030_100000_home',
  },
];
