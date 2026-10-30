import * as migration_20261028_195833_initial from './20261028_195833_initial';
import * as migration_20261030_120000_paginas_codigo from './20261030_120000_paginas_codigo';

export const migrations = [
  {
    up: migration_20261028_195833_initial.up,
    down: migration_20261028_195833_initial.down,
    name: '20261028_195833_initial',
  },
  {
    up: migration_20261030_120000_paginas_codigo.up,
    down: migration_20261030_120000_paginas_codigo.down,
    name: '20261030_120000_paginas_codigo',
  },
];
