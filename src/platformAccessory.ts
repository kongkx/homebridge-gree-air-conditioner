import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { Socket } from 'dgram';
import crypto from './crypto';
import commands from './commands';

import { GreePlatform, GreeAcDeviceConfig } from './platform';
import { DEFAULT_PLATFORM_CONFIG } from './settings';
import { HeaterCoolerToggleSwitch } from './HeaterCoolerToggleSwitch';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class GreeAirConditioner {
  // services
  private HeaterCooler: Service;

  private PowerSwitch: HeaterCoolerToggleSwitch;
  private QuietModeSwitch: HeaterCoolerToggleSwitch;
  private LightSwitch: HeaterCoolerToggleSwitch;
  private PowerfulModeSwitch: HeaterCoolerToggleSwitch;
  private VerticalSwing: HeaterCoolerToggleSwitch;
  private HorizontalSwing: HeaterCoolerToggleSwitch;

  private key: string | undefined;
  public socket: Socket;
  private binded: boolean;
  private updateTimer: NodeJS.Timeout | undefined;
  private cols: Array<string> | undefined;
  private status: Record<string, unknown>;

  constructor(
    public readonly platform: GreePlatform,
    public readonly accessory: PlatformAccessory,
    public readonly deviceConfig: GreeAcDeviceConfig,
  ) {
    this.socket = platform.socket;
    this.binded = false;
    this.key = undefined;
    this.status = {};
    // register event handler
    this.socket.on('message', this.handleMessage);
    // try to bind device;
    this.sendBindRequest();
    // set accessory information
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        this.accessory.context.device.brand,
      )
      .setCharacteristic(
        this.platform.Characteristic.Model,
        this.accessory.context.device.name,
      )
      .setCharacteristic(this.platform.Characteristic.Name, this.getName())
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        this.accessory.context.device.mac,
      )
      .setCharacteristic(
        this.platform.Characteristic.FirmwareRevision,
        this.accessory.context.device.ver,
      );

    // 电源控制
    this.PowerSwitch = new HeaterCoolerToggleSwitch(
      this,
      'power',
      this.platform.messages.power,
    );

    this.HeaterCooler =
      this.accessory.getService(this.platform.messages.mode) ||
      this.accessory.addService(this.platform.Service.HeaterCooler,
        this.platform.messages.mode,
      );

    this.HeaterCooler.getCharacteristic(this.platform.Characteristic.Active)
      .on('get', this.getCharacteristic.bind(this, 'deviceActive'))
      .on('set', this.setCharacteristic.bind(this, 'deviceActive'));
    this.HeaterCooler.getCharacteristic(
      this.platform.Characteristic.CurrentTemperature,
    )
      .updateValue(25)
      .on('get', this.getCharacteristic.bind(this, 'currentTemperature'));
    this.HeaterCooler.getCharacteristic(
      this.platform.Characteristic.CurrentHeaterCoolerState,
    ).on('get', this.getCharacteristic.bind(this, 'currentState'));
    this.HeaterCooler.getCharacteristic(
      this.platform.Characteristic.TargetHeaterCoolerState,
    )
      .on('get', this.getCharacteristic.bind(this, 'targetState'))
      .on('set', this.setCharacteristic.bind(this, 'targetState'));

    // Optional Characteristic
    this.HeaterCooler.getCharacteristic(
      this.platform.Characteristic.CoolingThresholdTemperature,
    )
      .setProps({
        minValue: this.getConfig('minimumTargetTemperature'),
        maxValue: this.getConfig('maximumTargetTemperature'),
        minStep: 0.1,
      })
      .updateValue(25)
      .on('get', this.getCharacteristic.bind(this, 'targetTemperature'))
      .on('set', this.setCharacteristic.bind(this, 'targetTemperature'));
    this.HeaterCooler.getCharacteristic(
      this.platform.Characteristic.HeatingThresholdTemperature,
    )
      .setProps({
        minValue: this.getConfig('minimumTargetTemperature'),
        maxValue: this.getConfig('maximumTargetTemperature'),
        minStep: 0.1,
      })
      .on('get', this.getCharacteristic.bind(this, 'targetTemperature'))
      .on('set', this.setCharacteristic.bind(this, 'targetTemperature'));
    this.HeaterCooler.getCharacteristic(
      this.platform.Characteristic.TemperatureDisplayUnits,
    )
      .on('get', this.getCharacteristic.bind(this, 'units'))
      .on('set', this.setCharacteristic.bind(this, 'units'));

    this.HeaterCooler.getCharacteristic(
      this.platform.Characteristic.RotationSpeed,
    )
      .setProps({
        minValue: 0,
        maxValue: 7,
        minStep: 1,
      })
      .on('get', this.getCharacteristic.bind(this, 'speed'))
      .on('set', this.getCharacteristic.bind(this, 'speed'));

    this.LightSwitch = new HeaterCoolerToggleSwitch(
      this,
      'light',
      this.platform.messages.light,
    );
    this.QuietModeSwitch = new HeaterCoolerToggleSwitch(
      this,
      'quietMode',
      this.platform.messages.quietMode,
    );
    this.PowerfulModeSwitch = new HeaterCoolerToggleSwitch(
      this,
      'powerfulMode',
      this.platform.messages.powerfulMode,
    );
    this.VerticalSwing = new HeaterCoolerToggleSwitch(
      this,
      'verticalSwing',
      this.platform.messages.verticalSwing,
    );
    this.HorizontalSwing = new HeaterCoolerToggleSwitch(
      this,
      'horizontalSwing',
      this.platform.messages.horizontalSwing,
    );
  }

  getCharacteristic(key, callback) {
    const value = this[key];
    this.platform.log.debug(
      `[${this.getDeviceLabel()}] Get characteristic: ${key}, value: ${value}`,
    );
    if (value === null || value !== value) {
      callback(new Error(`Failed to get characteristic value for key: ${key}`));
    } else {
      callback(null, value);
    }
  }

  setCharacteristic(key, value: CharacteristicValue, callback) {
    this.platform.log.debug(
      `[${this.getDeviceLabel()}] Set characteristic: ${key} to value: ${value}`,
    );
    this[key] = value;
    callback(null);
  }

  get power() {
    return this.status[commands.power.code] === commands.power.value.on
      ? this.platform.Characteristic.Active.ACTIVE
      : this.platform.Characteristic.Active.INACTIVE;
  }

  // TRUE OR FALSE
  set power(value) {
    this.platform.log.debug('power', this.power, value);
    if (value === this.power) {
      return;
    }
    const power = value ? commands.power.value.on : commands.power.value.off;
    const command: Record<string, unknown> = { [commands.power.code]: power };
    if (this.status[commands.mode.code] !== undefined) {
      command[commands.mode.code] = this.status[commands.mode.code];
    }
    this.sendCommand(command);
  }

  get deviceActive() {
    return this.status[commands.power.code] === commands.power.value.on
      ? this.platform.Characteristic.Active.ACTIVE
      : this.platform.Characteristic.Active.INACTIVE;
  }

  set deviceActive(value) {
    this.platform.log.debug('deviceActive', value);
    if (this.deviceActive !== value) {
      this.sendCommand({
        [commands.power.code]:
          value === this.platform.Characteristic.Active.ACTIVE
            ? commands.power.value.on
            : commands.power.value.off,
      });
    }
  }

  get currentTemperature() {
    if (this.status[commands.temperature.code] !== undefined) {
      const temperature = this.status[commands.temperature.code] as number;
      return temperature - (this.getConfig('sensorOffset') || 0);
    }
    return this.status[commands.targetTemperature.code];
  }

  get currentState() {
    if (!this.power) {
      return this.platform.Characteristic.CurrentHeaterCoolerState.INACTIVE;
    }
    switch (this.status[commands.mode.code]) {
      case commands.mode.value.cool:
        return this.platform.Characteristic.CurrentHeaterCoolerState.COOLING;
      case commands.mode.value.heat:
        return this.platform.Characteristic.CurrentHeaterCoolerState.HEATING;
      default:
        return this.platform.Characteristic.CurrentHeaterCoolerState.IDLE;
    }
  }

  get targetState() {
    const mode = this.status[commands.mode.code];
    if (mode === undefined) {
      return;
    }
    switch (mode) {
      case commands.mode.value.auto:
        return this.platform.Characteristic.TargetHeaterCoolerState.AUTO;
      case commands.mode.value.cool:
        return this.platform.Characteristic.TargetHeaterCoolerState.COOL;
      case commands.mode.value.heat:
        return this.platform.Characteristic.TargetHeaterCoolerState.HEAT;
    }
  }

  set targetState(value) {
    let mode;
    this.platform.log.debug('*****************', value);
    switch (value) {
      case this.platform.Characteristic.TargetHeaterCoolerState.AUTO:
        mode = commands.mode.value.auto;
        break;
      case this.platform.Characteristic.TargetHeaterCoolerState.HEAT:
        mode = commands.mode.value.heat;
        break;
      case this.platform.Characteristic.TargetHeaterCoolerState.COOL:
        mode = commands.mode.value.cool;
    }
    if (mode === undefined || mode === this.status[commands.mode.code]) {
      return;
    }
    const command = {
      [commands.mode.code]: mode,
    };
    if (!this.power) {
      command[commands.power.code] = commands.power.value.on;
    }
    this.sendCommand(command);
  }

  get targetTemperature() {
    const magicNumber = 0.24; // Magic number here, don't change. Why? Because Gree is stupid and I am a genius.
    const temperature = this.status[commands.targetTemperature.code] as number;
    const offset = this.status[commands.temperatureOffset.code] as number;
    if (temperature === undefined || offset === undefined) {
      return this.getConfig('maximumTargetTemperature');
    }
    return Math.min(
      temperature + 0.5 * (offset - 1) + magicNumber,
      this.getConfig('maximumTargetTemperature'),
    );
  }

  set targetTemperature(value: number) {
    if (value === this.targetTemperature) {
      return;
    }
    this.sendCommand({
      [commands.targetTemperature.code]: Math.round(value),
      [commands.temperatureOffset.code]: value - Math.round(value) >= 0 ? 1 : 0,
    });
  }

  get units() {
    switch (this.status[commands.units.code]) {
      case commands.units.value.fahrenheit:
        return this.platform.Characteristic.TemperatureDisplayUnits.FAHRENHEIT;
      case commands.units.value.celsius:
        return this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS;
    }
  }

  set units(value) {
    if (value === this.units) {
      return;
    }

    if (value !== undefined) {
      this.HeaterCooler.getCharacteristic(
        this.platform.Characteristic.TemperatureDisplayUnits,
      ).updateValue(value);
    }

    const command = (() => {
      switch (value) {
        case this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS:
          return commands.units.value.celsius;
        case this.platform.Characteristic.TemperatureDisplayUnits.FAHRENHEIT:
          return commands.units.value.fahrenheit;
      }
    })();
    this.sendCommand({ [commands.units.code]: command });
  }

  get speed() {
    const speed = this.status[commands.speed.code] as number;
    const quietMode = this.status[commands.quietMode.code];
    const powerfulMode = this.status[commands.powerfulMode.code];
    if (
      quietMode === commands.quietMode.value.on &&
      speed === commands.speed.value.low
    ) {
      return 1;
    } else if (
      powerfulMode === commands.quietMode.value.on &&
      speed === commands.speed.value.high
    ) {
      return 7;
    } else if (speed === 0) {
      return speed;
    } else {
      return speed + 1;
    }
  }

  set speed(value) {
    if (value === this.speed) {
      return;
    }
    if (value === 0) {
      // 自动
      this.sendCommand({
        [commands.quietMode.code]: commands.quietMode.value.off,
        [commands.powerfulMode.code]: commands.powerfulMode.value.off,
        [commands.speed.code]: commands.speed.value.auto,
      });
    } else if (value === 1) {
      // 静音
      this.sendCommand({
        [commands.quietMode.code]: commands.quietMode.value.on,
        [commands.powerfulMode.code]: commands.powerfulMode.value.off,
        [commands.speed.code]: commands.speed.value.low,
      });
    } else if (value === 7) {
      // 强劲
      this.sendCommand({
        [commands.quietMode.code]: commands.quietMode.value.off,
        [commands.powerfulMode.code]: commands.powerfulMode.value.on,
        [commands.speed.code]: commands.speed.value.high,
      });
    } else {
      this.sendCommand({
        [commands.quietMode.code]: commands.quietMode.value.off,
        [commands.powerfulMode.code]: commands.powerfulMode.value.off,
        [commands.speed.code]: value - 1,
      });
    }
  }

  get light() {
    switch (this.status[commands.light.code]) {
      case commands.light.value.on:
        return this.platform.Characteristic.Active.ACTIVE;
      case commands.light.value.off:
        return this.platform.Characteristic.Active.INACTIVE;
    }
  }

  set light(value) {
    if (value === this.light) {
      return;
    }
    const command = {
      [commands.light.code]: value
        ? commands.light.value.on
        : commands.light.value.off,
    };
    this.sendCommand(command);
  }

  get quietMode() {
    switch (this.status[commands.quietMode.code]) {
      case commands.quietMode.value.on:
        return this.platform.Characteristic.Active.ACTIVE;
      case commands.quietMode.value.off:
        return this.platform.Characteristic.Active.INACTIVE;
      default:
        return null;
    }
  }

  set quietMode(value) {
    if (value === this.quietMode) {
      return;
    }
    if (value) {
      this.sendCommand({
        [commands.quietMode.code]: commands.quietMode.value.on,
        [commands.speed.code]: commands.speed.value.low,
        [commands.powerfulMode.code]: commands.powerfulMode.value.off,
      });
    } else {
      this.sendCommand({
        [commands.quietMode.code]: commands.quietMode.value.off,
        [commands.speed.code]: this.getConfig('defaultSpeed'),
        [commands.powerfulMode.code]: commands.powerfulMode.value.off,
      });
    }
  }

  get powerfulMode(): CharacteristicValue | null {
    switch (this.status[commands.powerfulMode.code]) {
      case commands.powerfulMode.value.on:
        return this.platform.Characteristic.Active.ACTIVE;
      case commands.powerfulMode.value.off:
        return this.platform.Characteristic.Active.INACTIVE;
      default:
        return null;
    }
  }

  set powerfulMode(value) {
    if (value === this.powerfulMode) {
      return;
    }
    if (value) {
      this.sendCommand({
        [commands.powerfulMode.code]: commands.powerfulMode.value.on,
        [commands.speed.code]: commands.speed.value.high,
        [commands.quietMode.code]: commands.quietMode.value.off,
      });
    } else {
      this.sendCommand({
        [commands.powerfulMode.code]: commands.powerfulMode.value.off,
        [commands.speed.code]: this.getConfig('defaultSpeed'),
        [commands.quietMode.code]: commands.quietMode.value.off,
      });
    }
  }

  get verticalSwing(): CharacteristicValue {
    switch (this.status[commands.swingVertical.code]) {
      case commands.swingVertical.value.full:
        return this.platform.Characteristic.Active.ACTIVE;
      default:
        return this.platform.Characteristic.Active.INACTIVE;
    }
  }

  set verticalSwing(value) {
    if (value === this.verticalSwing) {
      return;
    }
    if (value) {
      this.sendCommand({
        [commands.swingVertical.code]: commands.swingVertical.value.full,
      });
    } else {
      this.sendCommand({
        [commands.swingVertical.code]: commands.swingVertical.value.default,
      });
    }
  }

  get horizontalSwing(): CharacteristicValue {
    switch (this.status[commands.swingHorizontal.code]) {
      case commands.swingHorizontal.value.full:
        return this.platform.Characteristic.Active.ACTIVE;
      default:
        return this.platform.Characteristic.Active.INACTIVE;
    }
  }

  set horizontalSwing(value) {
    if (value === this.horizontalSwing) {
      return;
    }
    if (value) {
      this.sendCommand({
        [commands.swingHorizontal.code]: commands.swingHorizontal.value.full,
      });
    } else {
      this.sendCommand({
        [commands.swingHorizontal.code]: commands.swingHorizontal.value.default,
      });
    }
  }

  sendMessage(message) {
    const pack = crypto.encrypt(message, this.key);
    const payload = {
      cid: 'app',
      i: this.key === undefined ? 1 : 0,
      t: 'pack',
      uid: 0,
      tcid: this.getMac(),
      pack,
    };
    this.platform.log.debug(
      `[${this.getDeviceLabel()}] send request: %j, %j`,
      payload,
      message,
    );
    try {
      this.platform.socket.send(
        JSON.stringify(payload),
        this.getPort(),
        this.getAddress(),
      );
    } catch (err) {
      this.platform.log.error(err);
    }
  }

  handleMessage = (msg, rinfo) => {
    if (this.getAddress() === rinfo.address) {
      const message = JSON.parse(msg.toString());
      // this.platform.log.debug(`[${this.getDeviceLabel()}] handle message: %j`, message);
      const pack = crypto.decrypt(
        message.pack,
        message.i === 1 ? undefined : this.key,
      );
      switch (pack.t) {
        case 'bindok':
          this.key = pack.key;
          this.binded = true;
          this.platform.log.info(
            `[${this.getDeviceLabel()}] Device binded. ${this.key}`,
          );
          this.afterBinded();
          break;
        case 'dat': // update status
          this.updateStatus(fieldsToObject(pack.cols, pack.dat));
          break;
        case 'res':
          this.updateStatus(fieldsToObject(pack.opt, pack.p || pack.val));
          break;
      }
    }
  };

  sendBindRequest() {
    const message = {
      mac: this.getMac(),
      t: 'bind',
      uid: 0,
    };
    this.platform.log.debug(`Bind to device: ${this.getMac()}`);
    this.sendMessage(message);
  }

  requestDeviceStatus() {
    const message = {
      mac: this.getMac(),
      t: 'status',
      cols: this.getCols(),
    };
    this.sendMessage(message);
  }

  sendCommand(commands) {
    this.platform.log.debug(
      `[${this.getDeviceLabel()}] Send commands: %j`,
      commands,
    );
    const keys = Object.keys(commands);
    const values = keys.map((k) => commands[k]);
    const message = {
      t: 'cmd',
      opt: keys,
      p: values,
    };
    this.sendMessage(message);
  }

  updateStatus(patch) {
    this.platform.log.info(
      `[${this.getDeviceLabel()}] Update Status: %j`,
      patch,
    );
    this.status = {
      ...this.status,
      ...patch,
    };

    if (patch[commands.power.code] !== undefined) {
      this.PowerSwitch.update();
      this.HeaterCooler.getCharacteristic(
        this.platform.Characteristic.Active,
      ).updateValue(this.deviceActive);
    }

    // update accessory characteristic
    if (
      patch[commands.quietMode.code] !== undefined ||
      patch[commands.powerfulMode.code] !== undefined
    ) {
      this.QuietModeSwitch.update();
      this.PowerfulModeSwitch.update();
      this.HeaterCooler.getCharacteristic(
        this.platform.Characteristic.RotationSpeed,
      ).updateValue(this.speed);
    }
    if (patch[commands.swingHorizontal.code] !== undefined) {
      this.HorizontalSwing.update();
    }
    if (patch[commands.swingVertical.code] !== undefined) {
      this.VerticalSwing.update();
    }
  }

  afterBinded() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    this.requestDeviceStatus();
    this.updateTimer = setInterval(() => {
      this.requestDeviceStatus();
    }, this.getConfig('statusUpdateInterval') * 1000);
  }

  getMac() {
    return this.accessory.context.device.mac;
  }

  getAddress() {
    return this.accessory.context.device.address;
  }

  getPort() {
    return this.accessory.context.device.port;
  }

  getName() {
    return this.deviceConfig?.name || this.accessory.context.device.name;
  }

  getCols() {
    // TODO: may config features based on some static database;
    if (!this.cols) {
      this.cols = Object.keys(commands).map((k) => commands[k].code);
    }
    return this.cols;
  }

  getDeviceLabel() {
    return `${this.getMac()} -- ${this.getAddress()}:${this.getPort()}`;
  }

  getConfig(key) {
    return (
      this.deviceConfig?.[key] ??
      this.platform.config.defaultValue?.[key] ??
      DEFAULT_PLATFORM_CONFIG[key]
    );
  }
}

const fieldsToObject = (cols, values) => {
  const obj = {};
  cols.forEach((key, i) => {
    obj[key] = values[i];
  });
  return obj;
};
