// Device Info
// 云恬
const DEVICE_1 = {
  t: 'dev',
  cid: '',
  bc: 'gree',
  catalog: 'gree',
  mid: '11002',
  lock: 0,
  model: 'gree',
  name: 'GR-AC_11002_02_1fa7',
  series: 'gree',
  vender: '1',
  ver: 'V1.2.1',
  brand: 'gree',
  mac: '502cc6091fa7',
};

//
const DEVICE_2 = {
  t: 'dev',
  cid: '',
  bc: '4P83401017015__',
  brand: '',
  catalog: '',
  mac: 'c8f742f85ad9',
  mid: '11002',
  model: '',
  name: '42f85ad9',
  lock: 0,
  series: '',
  vender: '',
  ver: '',
};

const DEVICE_3 = {
  t: 'dev',
  cid: '',
  bc: '4P11691051009__',
  brand: '',
  catalog: '',
  mac: 'c8f74290a147',
  mid: '11002',
  model: '',
  name: '4290a147',
  lock: 0,
  series: '',
  vender: '',
  ver: '',
};


// Example Status for Mode;

const MODE_0 = {
  Pow: 1,
  Mod: 0,
  SetTem: 25,
  TemSen: 67,
  TemUn: 0,
  TemRec: 0,
  WdSpd: 3,
  SwingLfRig: 0,
  SwUpDn: 0,
  Blo: 0,
  Lig: 0,
  Quiet: 0,
  Tur: 0,
};

const MODE_1 = {
  Pow: 1,
  Mod: 1,
  SetTem: 28,
  TemSen: 68,
  TemUn: 0,
  TemRec: 0,
  WdSpd: 0,
  SwingLfRig: 0,
  SwUpDn: 0,
  Blo: 0,
  Lig: 0,
  Quiet: 0,
  Tur: 0,
};

const MODE_2 = {
  Pow: 1,
  Mod: 2,
  SetTem: 25,
  TemSen: 67,
  TemUn: 0,
  TemRec: 0,
  WdSpd: 1,
  SwingLfRig: 0,
  SwUpDn: 0,
  Blo: 0,
  Lig: 0,
  Quiet: 0,
  Tur: 0,
};

var MODE_3 = {
  Pow: 1,
  Mod: 3,
  SetTem: 26,
  TemSen: 67,
  TemUn: 0,
  TemRec: 0,
  WdSpd: 3,
  SwingLfRig: 0,
  SwUpDn: 0,
  Blo: 0,
  Lig: 0,
  Quiet: 0,
  Tur: 0,
};

const MODE_4 = {
  Pow: 1,
  Mod: 4,
  SetTem: 27,
  TemSen: 64,
  TemUn: 0,
  TemRec: 0,
  WdSpd: 3,
  SwingLfRig: 0,
  SwUpDn: 0,
  Blo: 0,
  Lig: 0,
  Quiet: 0,
  Tur: 0,
};

const FS_L2 = {'Pow':1, 'Mod':1, 'SetTem':27, 'TemSen':69, 'TemUn':0, 'TemRec':0, 'WdSpd':2, 'SwingLfRig':1, 'SwUpDn':1, 'Blo':0, 'Lig':0, 'Quiet':0, 'Tur':0, 'HeatCoolType':0, 'SvSt':0, 'SwhSlp':0, 'time':'2022-07-31 09:08:29'};
const FS_L3 = {'Pow':1, 'Mod':1, 'SetTem':27, 'TemSen':69, 'TemUn':0, 'TemRec':0, 'WdSpd':3, 'SwingLfRig':1, 'SwUpDn':1, 'Blo':0, 'Lig':0, 'Quiet':0, 'Tur':0, 'HeatCoolType':0, 'SvSt':0, 'SwhSlp':0, 'time':'2022-07-31 09:09:29'};
const FS_L4 = {'Pow':1, 'Mod':1, 'SetTem':27, 'TemSen':69, 'TemUn':0, 'TemRec':0, 'WdSpd':4, 'SwingLfRig':1, 'SwUpDn':1, 'Blo':0, 'Lig':0, 'Quiet':0, 'Tur':0, 'HeatCoolType':0, 'SvSt':0, 'SwhSlp':0, 'time':'2022-07-31 09:10:09'};
const FS_L5 = {'Pow':1, 'Mod':1, 'SetTem':27, 'TemSen':69, 'TemUn':0, 'TemRec':0, 'WdSpd':5, 'SwingLfRig':1, 'SwUpDn':1, 'Blo':0, 'Lig':0, 'Quiet':0, 'Tur':0, 'HeatCoolType':0, 'SvSt':0, 'SwhSlp':0, 'time':'2022-07-31 09:10:39'};
// powerful
const FS_PO = {'Pow':1, 'Mod':1, 'SetTem':27, 'TemSen':69, 'TemUn':0, 'TemRec':0, 'WdSpd':5, 'SwingLfRig':1, 'SwUpDn':1, 'Blo':0, 'Lig':0, 'Quiet':0, 'Tur':1, 'HeatCoolType':0, 'SvSt':0, 'SwhSlp':0, 'time':'2022-07-31 09:11:09'};
// auto
const FS_AU = {'Pow':1, 'Mod':1, 'SetTem':27, 'TemSen':69, 'TemUn':0, 'TemRec':0, 'WdSpd':0, 'SwingLfRig':1, 'SwUpDn':1, 'Blo':0, 'Lig':0, 'Quiet':0, 'Tur':0, 'HeatCoolType':0, 'SvSt':0, 'SwhSlp':0, 'time':'2022-07-31 09:11:29'};
// quiet
const FS_QT = {'Pow':1, 'Mod':1, 'SetTem':27, 'TemSen':69, 'TemUn':0, 'TemRec':0, 'WdSpd':1, 'SwingLfRig':1, 'SwUpDn':1, 'Blo':0, 'Lig':0, 'Quiet':2, 'Tur':0, 'HeatCoolType':0, 'SvSt':0, 'SwhSlp':0, 'time':'2022-07-31 09:11:49'};
