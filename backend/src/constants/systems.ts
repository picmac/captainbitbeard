/**
 * All supported emulator systems and their metadata
 * Matches EmulatorJS cores available in frontend
 */

export interface SystemInfo {
  id: string;
  name: string;
  manufacturer: string;
  core: string;
  extensions: string[];
  biosRequired: boolean;
}

export const SUPPORTED_SYSTEMS: SystemInfo[] = [
  // Nintendo
  {
    id: 'nes',
    name: 'Nintendo Entertainment System',
    manufacturer: 'Nintendo',
    core: 'fceumm',
    extensions: ['nes', 'fds', 'unf', 'unif'],
    biosRequired: false,
  },
  {
    id: 'snes',
    name: 'Super Nintendo',
    manufacturer: 'Nintendo',
    core: 'snes9x',
    extensions: ['smc', 'sfc', 'swc', 'fig'],
    biosRequired: false,
  },
  {
    id: 'n64',
    name: 'Nintendo 64',
    manufacturer: 'Nintendo',
    core: 'mupen64plus_next',
    extensions: ['n64', 'v64', 'z64', 'bin', 'u1'],
    biosRequired: false,
  },
  {
    id: 'gba',
    name: 'Game Boy Advance',
    manufacturer: 'Nintendo',
    core: 'mgba',
    extensions: ['gba', 'bin'],
    biosRequired: false,
  },
  {
    id: 'nds',
    name: 'Nintendo DS',
    manufacturer: 'Nintendo',
    core: 'melonds',
    extensions: ['nds', 'bin'],
    biosRequired: true,
  },
  {
    id: 'gb',
    name: 'Game Boy',
    manufacturer: 'Nintendo',
    core: 'gambatte',
    extensions: ['gb'],
    biosRequired: false,
  },
  {
    id: 'gbc',
    name: 'Game Boy Color',
    manufacturer: 'Nintendo',
    core: 'gambatte',
    extensions: ['gbc', 'gb'],
    biosRequired: false,
  },
  {
    id: 'vb',
    name: 'Virtual Boy',
    manufacturer: 'Nintendo',
    core: 'beetle_vb',
    extensions: ['vb', 'vboy', 'bin'],
    biosRequired: false,
  },

  // Sega
  {
    id: 'genesis',
    name: 'Sega Genesis / Mega Drive',
    manufacturer: 'Sega',
    core: 'genesis_plus_gx',
    extensions: ['md', 'bin', 'gen', 'smd'],
    biosRequired: false,
  },
  {
    id: 'megadrive',
    name: 'Sega Mega Drive',
    manufacturer: 'Sega',
    core: 'genesis_plus_gx',
    extensions: ['md', 'bin', 'gen', 'smd'],
    biosRequired: false,
  },
  {
    id: 'sega32x',
    name: 'Sega 32X',
    manufacturer: 'Sega',
    core: 'picodrive',
    extensions: ['32x', 'bin'],
    biosRequired: false,
  },
  {
    id: 'segacd',
    name: 'Sega CD',
    manufacturer: 'Sega',
    core: 'genesis_plus_gx',
    extensions: ['cue', 'chd', 'iso', 'bin'],
    biosRequired: true,
  },
  {
    id: 'saturn',
    name: 'Sega Saturn',
    manufacturer: 'Sega',
    core: 'yabause',
    extensions: ['cue', 'chd', 'iso', 'bin'],
    biosRequired: true,
  },
  {
    id: 'sms',
    name: 'Sega Master System',
    manufacturer: 'Sega',
    core: 'smsplus',
    extensions: ['sms', 'bin'],
    biosRequired: false,
  },
  {
    id: 'gg',
    name: 'Game Gear',
    manufacturer: 'Sega',
    core: 'genesis_plus_gx',
    extensions: ['gg', 'bin'],
    biosRequired: false,
  },

  // Sony
  {
    id: 'psx',
    name: 'PlayStation',
    manufacturer: 'Sony',
    core: 'mednafen_psx_hw',
    extensions: ['cue', 'chd', 'iso', 'bin', 'img', 'pbp'],
    biosRequired: true,
  },
  {
    id: 'ps1',
    name: 'PlayStation 1',
    manufacturer: 'Sony',
    core: 'mednafen_psx_hw',
    extensions: ['cue', 'chd', 'iso', 'bin', 'img', 'pbp'],
    biosRequired: true,
  },
  {
    id: 'psp',
    name: 'PlayStation Portable',
    manufacturer: 'Sony',
    core: 'ppsspp',
    extensions: ['iso', 'cso', 'pbp', 'elf'],
    biosRequired: false,
  },

  // Atari
  {
    id: 'atari2600',
    name: 'Atari 2600',
    manufacturer: 'Atari',
    core: 'stella2014',
    extensions: ['a26', 'bin'],
    biosRequired: false,
  },
  {
    id: 'atari5200',
    name: 'Atari 5200',
    manufacturer: 'Atari',
    core: 'a5200',
    extensions: ['a52', 'bin'],
    biosRequired: true,
  },
  {
    id: 'atari7800',
    name: 'Atari 7800',
    manufacturer: 'Atari',
    core: 'prosystem',
    extensions: ['a78', 'bin'],
    biosRequired: false,
  },
  {
    id: 'lynx',
    name: 'Atari Lynx',
    manufacturer: 'Atari',
    core: 'handy',
    extensions: ['lnx', 'o'],
    biosRequired: true,
  },
  {
    id: 'jaguar',
    name: 'Atari Jaguar',
    manufacturer: 'Atari',
    core: 'virtualjaguar',
    extensions: ['j64', 'jag', 'rom', 'abs', 'cof', 'bin', 'prg'],
    biosRequired: false,
  },

  // Other Consoles
  {
    id: '3do',
    name: '3DO',
    manufacturer: 'Panasonic',
    core: 'opera',
    extensions: ['iso', 'chd', 'cue'],
    biosRequired: true,
  },
  {
    id: 'colecovision',
    name: 'ColecoVision',
    manufacturer: 'Coleco',
    core: 'gearcoleco',
    extensions: ['col', 'bin', 'rom'],
    biosRequired: false,
  },
  {
    id: 'ngp',
    name: 'Neo Geo Pocket',
    manufacturer: 'SNK',
    core: 'mednafen_ngp',
    extensions: ['ngp', 'ngc'],
    biosRequired: false,
  },
  {
    id: 'pce',
    name: 'PC Engine / TurboGrafx-16',
    manufacturer: 'NEC',
    core: 'mednafen_pce',
    extensions: ['pce', 'bin', 'sgx'],
    biosRequired: true,
  },
  {
    id: 'pcfx',
    name: 'PC-FX',
    manufacturer: 'NEC',
    core: 'mednafen_pcfx',
    extensions: ['cue', 'chd', 'toc', 'ccd'],
    biosRequired: true,
  },
  {
    id: 'ws',
    name: 'WonderSwan',
    manufacturer: 'Bandai',
    core: 'mednafen_wswan',
    extensions: ['ws', 'wsc'],
    biosRequired: false,
  },

  // Computers
  {
    id: 'c64',
    name: 'Commodore 64',
    manufacturer: 'Commodore',
    core: 'vice_x64',
    extensions: ['d64', 't64', 'prg', 'p00', 'crt', 'bin', 'zip', 'gz', 'tap'],
    biosRequired: false,
  },
  {
    id: 'c128',
    name: 'Commodore 128',
    manufacturer: 'Commodore',
    core: 'vice_x128',
    extensions: ['d64', 'd71', 'd81', 't64', 'prg', 'p00', 'crt', 'bin'],
    biosRequired: false,
  },
  {
    id: 'vic20',
    name: 'VIC-20',
    manufacturer: 'Commodore',
    core: 'vice_xvic',
    extensions: ['prg', 'd64', 't64', 'tap'],
    biosRequired: false,
  },
  {
    id: 'amiga',
    name: 'Commodore Amiga',
    manufacturer: 'Commodore',
    core: 'puae',
    extensions: ['adf', 'dms', 'fdi', 'ipf', 'hdf', 'hdz', 'zip'],
    biosRequired: true,
  },
  {
    id: 'amstradcpc',
    name: 'Amstrad CPC',
    manufacturer: 'Amstrad',
    core: 'cap32',
    extensions: ['dsk', 'sna', 'zip', 'tap', 'cdt', 'voc', 'cpr', 'm3u'],
    biosRequired: false,
  },
  {
    id: 'zxspectrum',
    name: 'ZX Spectrum',
    manufacturer: 'Sinclair',
    core: 'fuse',
    extensions: ['tzx', 'tap', 'z80', 'rzx', 'scl', 'trd', 'dsk'],
    biosRequired: false,
  },
  {
    id: 'zx81',
    name: 'ZX81',
    manufacturer: 'Sinclair',
    core: '81',
    extensions: ['p', '81'],
    biosRequired: false,
  },
  {
    id: 'dos',
    name: 'DOS',
    manufacturer: 'IBM PC',
    core: 'dosbox_pure',
    extensions: ['exe', 'com', 'bat', 'iso', 'cue', 'ins', 'img', 'ima', 'vhd', 'jrc', 'tc', 'm3u', 'zip'],
    biosRequired: false,
  },

  // Arcade
  {
    id: 'arcade',
    name: 'Arcade',
    manufacturer: 'Various',
    core: 'fbneo',
    extensions: ['zip'],
    biosRequired: false,
  },
  {
    id: 'mame',
    name: 'MAME',
    manufacturer: 'Various',
    core: 'mame2003_plus',
    extensions: ['zip'],
    biosRequired: false,
  },
  {
    id: 'neogeo',
    name: 'Neo Geo',
    manufacturer: 'SNK',
    core: 'fbneo',
    extensions: ['zip'],
    biosRequired: true,
  },
  {
    id: 'cps1',
    name: 'Capcom CPS-1',
    manufacturer: 'Capcom',
    core: 'fbalpha2012_cps1',
    extensions: ['zip'],
    biosRequired: false,
  },
  {
    id: 'cps2',
    name: 'Capcom CPS-2',
    manufacturer: 'Capcom',
    core: 'fbalpha2012_cps2',
    extensions: ['zip'],
    biosRequired: false,
  },

  // Other
  {
    id: 'doom',
    name: 'Doom',
    manufacturer: 'id Software',
    core: 'prboom',
    extensions: ['wad', 'iwad', 'pwad'],
    biosRequired: false,
  },
  {
    id: 'cdi',
    name: 'Philips CD-i',
    manufacturer: 'Philips',
    core: 'same_cdi',
    extensions: ['cue', 'chd', 'iso'],
    biosRequired: true,
  },
];

// Helper functions
export const getSystemById = (id: string): SystemInfo | undefined => {
  return SUPPORTED_SYSTEMS.find((sys) => sys.id === id);
};

export const getSystemNames = (): string[] => {
  return SUPPORTED_SYSTEMS.map((sys) => sys.name);
};

export const getSystemIds = (): string[] => {
  return SUPPORTED_SYSTEMS.map((sys) => sys.id);
};

export const isValidSystem = (id: string): boolean => {
  return SUPPORTED_SYSTEMS.some((sys) => sys.id === id);
};

export const getSystemsByManufacturer = (manufacturer: string): SystemInfo[] => {
  return SUPPORTED_SYSTEMS.filter((sys) => sys.manufacturer === manufacturer);
};
