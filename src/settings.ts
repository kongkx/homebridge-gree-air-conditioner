import commands from './commands';
import { GreePlatformConfig, BaseDeviceConfig } from './types';

/**
 * This is the name of the platform that users will use to register the plugin in the Homebridge config.json
 */
export const PLATFORM_NAME = 'GreeAirConditioner';
export const ACCESSORY_NAME = 'AirConditioner';

/**
 * This must match the name of your plugin as defined the package.json
 */
export const PLUGIN_NAME = 'homebridge-gree-air-conditioner';

export const DEFAULT_DEVICE_CONFIG: BaseDeviceConfig = {
  hasFanMode: true,
  hasDryMode: true,
  minimumTargetTemperature: 16,
  maximumTargetTemperature: 30,
  sensorOffset: 40,
  defaultSpeed: commands.speed.value.medium,
  defaultVerticalSwing: commands.swingVertical.value.default,
  defaultHorizontalSwing: commands.swingHorizontal.value.default,
  statusUpdateInterval: 20,
  switches:
    'power,verticalSwing,horizontalSwing,quietMode,powerfulMode,light,dryMode,fanMode,sleepMode,xFan',
  subAccessoryPrefix: '',
};

export const DEFAULT_PLATFORM_CONFIG: GreePlatformConfig = {
  name: 'Gree Air Conditioner',
  port: 7002,
  scanCount: 10,
  language: 'zh-CN',
  scanTimeout: 3000,
  scanAddress: '192.168.1.255',
  defaultValue: DEFAULT_DEVICE_CONFIG,
  devices: [],
  logStatus: true,
};

export const UDP_SCAN_PORT = 7000;

// 自动模式温度范围
export const AUTO_MIN_F = 68;
export const AUTO_MAX_F = 77;
export const AUTO_MIN_C = 20;
export const AUTO_MAX_C = 25;
