import { Service, Characteristic, CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';
import { GreeAirConditioner } from './platformAccessory';
import { SwitchName } from './settings';

export class HeaterCoolerToggleSwitch {
  private readonly Service: typeof Service = this.parent.platform.api.hap.Service;
  private readonly Characteristic: typeof Characteristic = this.parent.platform.api.hap.Characteristic;

  public service: Service;

  constructor(
    private parent: GreeAirConditioner,
    private attribute: SwitchName,
    private displayName: string,
  ) {
    this.service = this.parent.accessory.getService(this.displayName) ||
      this.parent.accessory.addService(this.Service.Switch, this.displayName, this.attribute);

    this.service.setCharacteristic(this.Characteristic.Name, this.displayName);

    this.service.getCharacteristic(this.Characteristic.On)
      .on('get', this.getOnHandler.bind(this))
      .on('set', this.setOnHandler.bind(this));
  }

  getOnHandler(callback: CharacteristicGetCallback) {
    this.parent.getCharacteristic(this.attribute, callback);
  }

  setOnHandler(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.parent.setCharacteristic(this.attribute, value, callback);
    // this.parent[this.attribute] = value;
    // callback(null);
  }

  update() {
    const value = this.parent[this.attribute] as CharacteristicValue;
    this.service.updateCharacteristic(this.Characteristic.On, value);
  }
}