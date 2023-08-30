export type SwitchName =
  | 'power'
  | 'verticalSwing'
  | 'horizontalSwing'
  | 'quietMode'
  | 'powerfulMode'
  | 'light'
  | 'dryMode'
  | 'fanMode'
  | 'sleepMode'
  | 'xFan';

export type BaseDeviceConfig = {
  hasFanMode?: boolean;
  hasDryMode?: boolean;
  minimumTargetTemperature: number;
  maximumTargetTemperature: number;
  sensorOffset: number;
  defaultSpeed: number;
  defaultVerticalSwing?: number;
  defaultHorizontalSwing?: number;
  statusUpdateInterval: number;
  switches: string; // commas separated string
  disabled?: boolean;
};

export type DeviceConfig = BaseDeviceConfig & {
  name?: string;
  mac: string;
};

export type GreePlatformConfig = {
  name: string;
  port: number;
  language: string;
  scanCount: number;
  scanTimeout: number;
  scanAddress: string;
  defaultValue: BaseDeviceConfig;
  devices: Array<DeviceConfig>;
  logStatus?: boolean;
};

export interface LocaleMessages {
  power: string;
  mode: string;
  verticalSwing: string;
  horizontalSwing: string;
  quietMode: string;
  powerfulMode: string;
  light: string;
  dryMode: string;
  fanMode: string;
  fanSpeed: string;
  sleepMode: string;
  xFan: string;
}
