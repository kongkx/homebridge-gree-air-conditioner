# 格力 Gree Air Conditioner Platform

支持

- 格力空调
- EWPE 可控制的空调

Supports

- gree air conditioners.
- all AC controlled by EWPE Smart APP.

## 安装 [Installation]

```
npm install homebridge-gree-air-conditioner -g
```

## 配置（简单）[Configuration (mininal)]

```
{
    "platforms": [
        {
            "platform": "GreeAirConditioner",
            "scanAddress": "192.168.1.255",
        }
    ]
}
```

**提示**

如何获取合适的扫描（广播）地址。

1. 猜，如果路由 ip 是 `192.168.1.1`， 那么扫描地址很可能是 `192.168.1.225`
2. 或 在终端中执行脚本查看，如下

   ```bash
   ifconfig | grep broadcast
   # result
   # inet 192.168.1.102 netmask 0xffffff00 broadcast 192.168.1.255
   ```

**Tips**

How to get your scan address (broadcast address)?

1.  You may guess it based on your router address. If your router ip address is `192.168.1.1`, the scan address is likely `192.168.1.255`
2.  Or，run the code below in your terminal:

    ```bash
    ifconfig | grep broadcast
    # result
    # inet 192.168.1.102 netmask 0xffffff00 broadcast 192.168.1.255
    ```

## 配置（自定义） Configuration (optional)

可使用

```
{
    "platforms": [
        {
            "platform": "GreeAirConditioner",
            "name": "My Gree",
            "port": 7002,
            "scanCount": 10,
            "scanTimout": 3000,
            "scanAddress": "192.168.1.255",
            "defaultValue": {
                "minimumTargetTemperature": 16,
                "maximumTargetTemperature": 30,
                "sensorOffset": 40,
                "defaultSpeed": 3,
                "defaultVerticalSwing": 0,
                "statusUpdateInterval": 3,
                "switches": "power,verticalSwing,horizontalSwing,quietMode,powerfulMode,light,dryMode,fanMode"
            },
            "devices": [
                {
                    "mac": "c8f742xxxxxx",
                    "sensorOffset": 40,
                    "defaultSpeed": 3,
                    "disabled": false,
                }
            ]
        }
    ]
}
```

原遥控器功能在插件中的实现情况，可查看文档： [功能文档](./feature-mapping.md)

More info about what features have been implemented comparing to remote control, Ref: [功能文档](./feature-mapping.md)

**获取 MAC 地址 [GET MAC ADDRESS]**

A. 如果当前插件已经启用，并已成功添加设备。可在 家庭 应用中查看。

A. From Home App Accessory, if this plugin has enabled and successfuly added your device.

![mac_address](./device_mac.jpeg)

B. 从 Gree+ 应用中获取

B. From Gree+ App

![mac_address2](./device_mac2.jpeg)

## Features/TODO

- [x] 设备独立设置
- [x] 缓存模式状态，在切换模式时 像遥控器那样 保留原模式下的设置
- [x] 本地化语言，支持简体中文以及英文，方便通过 Siri 控制模式开关。 如 ”Siri， 打开静音模式“
- [x] 可配置功能开关的启用。示例：`power,light` 仅启用电源，灯光控制开关，其他强劲模式、静音模式等开关均不启用。

- [x] 电源控制
- [x] 温度调节
- [x] 模式调节 （不支持 送风，除湿）
- [x] 送风模式、除湿模式开关
- [x] 风速调节
- [x] 静音模式
- [x] 强劲模式
- [x] 左右扫风
- [x] 上下扫风
- [x] 指示灯控制
- [x] 默认风板位置，当退出自动模式时，风板回到预设的模式
- [x] 睡眠模式

## 开发

1. 安装 homebridge 以及 homebridge-config-ui-x

```bash
npm install -g homebridge homebridge-config-ui-x
```

2. 准备配置文件

```
cp homebridge/config.json.example homebridge/config.json
```

2. 启动开发服务

```
npm run watch
```

## Refs & Credits

- [gree-remote](https://github.com/tomikaa87/gree-remote)
- [homebridge-gree-heatercooler-v2](https://github.com/Elethom/homebridge-gree-heatercooler-v2)
- [Homebridge YeeLight Wi-Fi](https://github.com/vieira/homebridge-yeelight-wifi)
