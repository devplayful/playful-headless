import * as migration_20261028_195833_initial from './20261028_195833_initial';
import * as migration_20261029_114031 from './20261029_114031';
import * as migration_20261030_100000_home from './20261030_100000_home';
import * as migration_20261030_120000_paginas_codigo from './20261030_120000_paginas_codigo';
import * as migration_20261116_190000_podcast_equipo from './20261116_190000_podcast_equipo';

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
  {
    up: migration_20261030_100000_home.up,
    down: migration_20261030_100000_home.down,
    name: '20261030_100000_home',
  },
  {
    up: migration_20261030_120000_paginas_codigo.up,
    down: migration_20261030_120000_paginas_codigo.down,
    name: '20261030_120000_paginas_codigo',
  },
  {
    up: migration_20261116_190000_podcast_equipo.up,
    down: migration_20261116_190000_podcast_equipo.down,
    name: '20261116_190000_podcast_equipo',
  },
];
