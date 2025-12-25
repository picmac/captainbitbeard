/**
 * All supported emulator systems
 * Matches backend system definitions
 */

export interface SystemInfo {
  id: string;
  name: string;
  manufacturer: string;
  extensions: string[];
}

export const SUPPORTED_SYSTEMS: SystemInfo[] = [
  // Nintendo
  {
    id: 'nes',
    name: 'Nintendo Entertainment System',
    manufacturer: 'Nintendo',
    extensions: ['nes', 'fds', 'unf', 'unif'],
  },
  {
    id: 'snes',
    name: 'Super Nintendo',
    manufacturer: 'Nintendo',
    extensions: ['smc', 'sfc', 'swc', 'fig'],
  },
  {
    id: 'n64',
    name: 'Nintendo 64',
    manufacturer: 'Nintendo',
    extensions: ['n64', 'v64', 'z64', 'bin', 'u1'],
  },
  {
    id: 'gba',
    name: 'Game Boy Advance',
    manufacturer: 'Nintendo',
    extensions: ['gba', 'bin'],
  },
  {
    id: 'nds',
    name: 'Nintendo DS',
    manufacturer: 'Nintendo',
    extensions: ['nds', 'bin'],
  },
  {
    id: 'gb',
    name: 'Game Boy',
    manufacturer: 'Nintendo',
    extensions: ['gb'],
  },
  {
    id: 'gbc',
    name: 'Game Boy Color',
    manufacturer: 'Nintendo',
    extensions: ['gbc', 'gb'],
  },
  {
    id: 'vb',
    name: 'Virtual Boy',
    manufacturer: 'Nintendo',
    extensions: ['vb', 'vboy', 'bin'],
  },

  // Sega
  {
    id: 'genesis',
    name: 'Sega Genesis / Mega Drive',
    manufacturer: 'Sega',
    extensions: ['md', 'bin', 'gen', 'smd'],
  },
  {
    id: 'megadrive',
    name: 'Sega Mega Drive',
    manufacturer: 'Sega',
    extensions: ['md', 'bin', 'gen', 'smd'],
  },
  {
    id: 'sega32x',
    name: 'Sega 32X',
    manufacturer: 'Sega',
    extensions: ['32x', 'bin'],
  },
  {
    id: 'segacd',
    name: 'Sega CD',
    manufacturer: 'Sega',
    extensions: ['cue', 'chd', 'iso', 'bin'],
  },
  {
    id: 'saturn',
    name: 'Sega Saturn',
    manufacturer: 'Sega',
    extensions: ['cue', 'chd', 'iso', 'bin'],
  },
  {
    id: 'sms',
    name: 'Sega Master System',
    manufacturer: 'Sega',
    extensions: ['sms', 'bin'],
  },
  {
    id: 'gg',
    name: 'Game Gear',
    manufacturer: 'Sega',
    extensions: ['gg', 'bin'],
  },

  // Sony
  {
    id: 'psx',
    name: 'PlayStation',
    manufacturer: 'Sony',
    extensions: ['cue', 'chd', 'iso', 'bin', 'img', 'pbp'],
  },
  {
    id: 'ps1',
    name: 'PlayStation 1',
    manufacturer: 'Sony',
    extensions: ['cue', 'chd', 'iso', 'bin', 'img', 'pbp'],
  },
  {
    id: 'psp',
    name: 'PlayStation Portable',
    manufacturer: 'Sony',
    extensions: ['iso', 'cso', 'pbp', 'elf'],
  },

  // Atari
  {
    id: 'atari2600',
    name: 'Atari 2600',
    manufacturer: 'Atari',
    extensions: ['a26', 'bin'],
  },
  {
    id: 'atari5200',
    name: 'Atari 5200',
    manufacturer: 'Atari',
    extensions: ['a52', 'bin'],
  },
  {
    id: 'atari7800',
    name: 'Atari 7800',
    manufacturer: 'Atari',
    extensions: ['a78', 'bin'],
  },
  {
    id: 'lynx',
    name: 'Atari Lynx',
    manufacturer: 'Atari',
    extensions: ['lnx', 'o'],
  },
  {
    id: 'jaguar',
    name: 'Atari Jaguar',
    manufacturer: 'Atari',
    extensions: ['j64', 'jag', 'rom', 'abs', 'cof', 'bin', 'prg'],
  },

  // Other Consoles
  {
    id: '3do',
    name: '3DO',
    manufacturer: 'Panasonic',
    extensions: ['iso', 'chd', 'cue'],
  },
  {
    id: 'colecovision',
    name: 'ColecoVision',
    manufacturer: 'Coleco',
    extensions: ['col', 'bin', 'rom'],
  },
  {
    id: 'ngp',
    name: 'Neo Geo Pocket',
    manufacturer: 'SNK',
    extensions: ['ngp', 'ngc'],
  },
  {
    id: 'pce',
    name: 'PC Engine / TurboGrafx-16',
    manufacturer: 'NEC',
    extensions: ['pce', 'bin', 'sgx'],
  },
  {
    id: 'pcfx',
    name: 'PC-FX',
    manufacturer: 'NEC',
    extensions: ['cue', 'chd', 'toc', 'ccd'],
  },
  {
    id: 'ws',
    name: 'WonderSwan',
    manufacturer: 'Bandai',
    extensions: ['ws', 'wsc'],
  },

  // Computers
  {
    id: 'c64',
    name: 'Commodore 64',
    manufacturer: 'Commodore',
    extensions: ['d64', 't64', 'prg', 'p00', 'crt', 'bin', 'zip', 'gz', 'tap'],
  },
  {
    id: 'c128',
    name: 'Commodore 128',
    manufacturer: 'Commodore',
    extensions: ['d64', 'd71', 'd81', 't64', 'prg', 'p00', 'crt', 'bin'],
  },
  {
    id: 'vic20',
    name: 'VIC-20',
    manufacturer: 'Commodore',
    extensions: ['prg', 'd64', 't64', 'tap'],
  },
  {
    id: 'amiga',
    name: 'Commodore Amiga',
    manufacturer: 'Commodore',
    extensions: ['adf', 'dms', 'fdi', 'ipf', 'hdf', 'hdz', 'zip'],
  },
  {
    id: 'amstradcpc',
    name: 'Amstrad CPC',
    manufacturer: 'Amstrad',
    extensions: ['dsk', 'sna', 'zip', 'tap', 'cdt', 'voc', 'cpr', 'm3u'],
  },
  {
    id: 'zxspectrum',
    name: 'ZX Spectrum',
    manufacturer: 'Sinclair',
    extensions: ['tzx', 'tap', 'z80', 'rzx', 'scl', 'trd', 'dsk'],
  },
  {
    id: 'zx81',
    name: 'ZX81',
    manufacturer: 'Sinclair',
    extensions: ['p', '81'],
  },
  {
    id: 'dos',
    name: 'DOS',
    manufacturer: 'IBM PC',
    extensions: ['exe', 'com', 'bat', 'iso', 'cue', 'ins', 'img', 'ima', 'vhd', 'jrc', 'tc', 'm3u', 'zip'],
  },

  // Arcade
  {
    id: 'arcade',
    name: 'Arcade',
    manufacturer: 'Various',
    extensions: ['zip'],
  },
  {
    id: 'mame',
    name: 'MAME',
    manufacturer: 'Various',
    extensions: ['zip'],
  },
  {
    id: 'neogeo',
    name: 'Neo Geo',
    manufacturer: 'SNK',
    extensions: ['zip'],
  },
  {
    id: 'cps1',
    name: 'Capcom CPS-1',
    manufacturer: 'Capcom',
    extensions: ['zip'],
  },
  {
    id: 'cps2',
    name: 'Capcom CPS-2',
    manufacturer: 'Capcom',
    extensions: ['zip'],
  },

  // Other
  {
    id: 'doom',
    name: 'Doom',
    manufacturer: 'id Software',
    extensions: ['wad', 'iwad', 'pwad'],
  },
  {
    id: 'cdi',
    name: 'Philips CD-i',
    manufacturer: 'Philips',
    extensions: ['cue', 'chd', 'iso'],
  },
];

// Group systems by manufacturer
export const getSystemsByManufacturer = () => {
  const grouped = new Map<string, SystemInfo[]>();

  SUPPORTED_SYSTEMS.forEach((system) => {
    const existing = grouped.get(system.manufacturer) || [];
    existing.push(system);
    grouped.set(system.manufacturer, existing);
  });

  return grouped;
};

// Get all file extensions for accept attribute
// Includes common archive formats and generic types for better mobile compatibility
export const getAllExtensions = (): string => {
  const extensions = new Set<string>();
  SUPPORTED_SYSTEMS.forEach((system) => {
    system.extensions.forEach((ext) => extensions.add(`.${ext}`));
  });

  // Add common archive formats for ROMs
  extensions.add('.zip');
  extensions.add('.7z');
  extensions.add('.rar');
  extensions.add('.gz');

  // Add generic application types for better mobile browser support
  const extensionsList = Array.from(extensions).join(',');
  return `${extensionsList},application/octet-stream,application/zip,application/x-7z-compressed,application/x-rar-compressed`;
};

// Get extensions for specific system
export const getExtensionsForSystem = (systemId: string): string => {
  const system = SUPPORTED_SYSTEMS.find((s) => s.id === systemId);
  return system ? system.extensions.map((ext) => `.${ext}`).join(',') : '';
};
