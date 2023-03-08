import commands from './commands';
/**
 * This is the name of the platform that users will use to register the plugin in the Homebridge config.json
 */
export const PLATFORM_NAME = 'GreeAirConditioner';
export const ACCESSORY_NAME = 'AirConditioner';

export type SwitchName =
  'power' |
  'verticalSwing' |
  'horizontalSwing' |
  'quietMode' |
  'powerfulMode' |
  'light' |
  'dryMode' |
  'fanMode' |
  'sleepMode';

/**
 * This must match the name of your plugin as defined the package.json
 */
export const PLUGIN_NAME = 'homebridge-gree-air-conditioner';

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
}
export interface DeviceConfig {
  name?: string;
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
}


export const DEFAULT_DEVICE_CONFIG: DeviceConfig = {
  hasFanMode: true,
  minimumTargetTemperature: 16,
  maximumTargetTemperature: 30,
  sensorOffset: 40,
  defaultSpeed: commands.speed.value.medium,
  defaultVerticalSwing: commands.swingVertical.value.default,
  defaultHorizontalSwing: commands.swingHorizontal.value.default,
  statusUpdateInterval: 20,
  switches: 'power,verticalSwing,horizontalSwing,quietMode,powerfulMode,light,dryMode,fanMode,sleepMode',
};

export const DEFAULT_PLATFORM_CONFIG = {
  name: 'Gree Air Conditioner',
  port: 7002,
  scanCount: 10,
  language: 'zh-CN',
  scanTimout: 3000,
  scanAddress: '192.168.1.255',
  defaultValue: DEFAULT_DEVICE_CONFIG,
  devices: [],
};

export const UDP_SCAN_PORT = 7000;
