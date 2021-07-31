import commands from './commands';
/**
 * This is the name of the platform that users will use to register the plugin in the Homebridge config.json
 */
export const PLATFORM_NAME = 'GreeAirConditioner';
export const ACCESSORY_NAME = 'AirConditioner';

/**
 * This must match the name of your plugin as defined the package.json
 */
export const PLUGIN_NAME = 'homebridge-gree-air-conditioner';

export const DEFAULT_DEVICE_CONFIG = {
  minimumTargetTemperature: 16,
  maximumTargetTemperature: 30,
  sensorOffset: 40,
  defaultSpeed: commands.speed.value.medium,
  statusUpdateInterval: 20,
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
}