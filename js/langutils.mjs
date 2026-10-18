const iso1to3 = new Map([
    ['tam','ta'],
    ['san','sa'],
    ['fra','fr'],
    ['eng','en'],
    ['ara','ar'],
    ['deu','de'],
    ['pli','pi'],
    ['por','pt'],
    ['lat','la'],
    ['bod','bo'],
    ['mal','ml'],
    ['mar','mr'],
    ['hin','hi'],
    ['guj','gu'],
    ['sin','si'],
    ['mya','my'],
    ['tel','te'],
    ['kan','kn'],
    ['zh','zho']
]);

const scriptToIso = new Map([ // TODO: add Chinese
    ['tamil','Taml'],
    ['bengali','Beng'],
    ['devanagari','Deva'],
    ['grantha','Gran'],
    ['malayalam','Mlym'],
    ['newa','Newa'],
    ['sarada','Shrd'],
    ['sinhala','Sinh'],
    ['telugu','Telu'],
    ['kannada','Knda'],
    ['nandinagari','Nand'],
    ['burmese','Mymr'],
    ['dbumed','Tibt'],
    ['dbucan','Tibt']
]);

const langscripts = new Map([
  ['sa',['Deva','Beng','Gran','Mlym','Newa','Shrd','Sinh','Telu','Knda','Nand','Mymr','Tibt']],
  ['mr',['Deva']],
  ['hi',['Deva']],
  ['gu',['Deva']],
  ['raj',['Deva']],
  ['bra',['Deva']],
  ['new',['Newa']],
  ['ta',['Taml']],
  ['te',['Gran','Telu']],
  ['ml',['Mlym']],
  ['kn',['Knda']],
  ['pi',['Sinh','Mymr']],
  ['si',['Sinh']],
  ['my',['Mymr']],
  ['bo',['Tibt']]
]);

const UTF8 = str => String.fromCodePoint(`0x${str}`);

console.log(`[${UTF8('11305')}-${UTF8('11339')}]`);


const scriptranges = new Map([
  ['Deva',/[\u0900-\u097F]/u],
  ['Beng',/[\u0980-\u09FF]/u],
  ['Gran',/[\u{11300}-\u{1137F}]/u],
  ['Mlym',/[\u0D00-\u0D7F]/u],
  ['Newa',/[\u{11400}-\u{1147F}]/u],
  ['Shrd',/[\u{11180}-\u{111DF}]/u],
  ['Sinh',/[\u0D80-\u0DFF]/u],
  ['Telu',/[\u0C00-\u0C7F]/u],
  ['Knda',/[\u0C80-\u0CFF]/u],
  ['Nand',/[\u{119A0}-\u{119FF}]/u],
  ['Mymr',/[\u1000-\u109F]/],
  ['Tibt',/[\u0F00-\u0FFF]/],
  ['Taml',/[\u0B80-\u0BFF]/]
]);

export {iso1to3, langscripts, scriptranges, scriptToIso};
