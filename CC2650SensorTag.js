/* ------------------------------------------------------------------
* CC2650SensorTag.js
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-12-27
*
* [References]
*  - CC2650 SensorTag User's Guide
*      http://processors.wiki.ti.com/index.php/CC2650_SensorTag_User's_Guide
* ---------------------------------------------------------------- */
'use strict';

/* ------------------------------------------------------------------
* Constructor: CC2650SensorTag()
* ---------------------------------------------------------------- */
function CC2650SensorTag() {
	/* Public properties */
	this.connected = false;
	this.onbatterynotify = null;
	this.ontemperaturenotify = null;
	this.onmovementnotify = null;
	this.onhumiditynotify = null;
	this.onpressurenotify = null;
	this.onopticalnotify = null;
	this.onkeysnotify = null;
	this.ondisconnect = null;

	/* Private properties */
	this._device = null; // BluetoothDevice object
	this._server = null; // BluetoothRemoteGATTServer object
	this._info = null; // Device Information
	this._services = {
		// Device Information
		info: {
			uuid: 0x180a,
			service: null, // BluetoothRemoteGATTService object
			chars: {
				system: { // System ID
					uuid: 0x2a23,
					char: null // BluetoothRemoteGATTCharacteristic object
				},
				model: { // Model Number String
					uuid: 0x2a24,
					char: null // BluetoothRemoteGATTCharacteristic object
				},
				firm: { // Firmware Revision String
					uuid: 0x2a26,
					char: null // BluetoothRemoteGATTCharacteristic object
				},
				hard: { // Hardware Revision String
					uuid: 0x2a27,
					char: null // BluetoothRemoteGATTCharacteristic object
				},
				soft: { // Software Revision String
					uuid: 0x2a28,
					char: null // BluetoothRemoteGATTCharacteristic object
				},
				manu: { // Manufacturer Name String
					uuid: 0x2a29,
					char: null // BluetoothRemoteGATTCharacteristic object
				}
			}
		},
		// Battery Service
		battery: {
			//uuid: 'battery_service',
			uuid: 0x180f,
			service: null, // BluetoothRemoteGATTService object
			chars: {
				level: { // Battery Level
					//uuid: 'battery_level',
					uuid: '00002a19-0000-1000-8000-00805f9b34fb',
					char: null // BluetoothRemoteGATTCharacteristic object
				}
			}
		},
		//IR Temperature Sensor
		temperature: {
			uuid: 'f000aa00-0451-4000-b000-000000000000',
			service: null, // BluetoothRemoteGATTService object
			chars: {
				data: { // Data
					uuid: 'f000aa01-0451-4000-b000-000000000000',
					char: null // BluetoothRemoteGATTCharacteristic object
				},
				conf: {// Configuration
					uuid: 'f000aa02-0451-4000-b000-000000000000',
					char: null // BluetoothRemoteGATTCharacteristic object
				},
				peri: { // Period
					uuid: 'f000aa03-0451-4000-b000-000000000000',
					char: null // BluetoothRemoteGATTCharacteristic object
				}
			}
		},
		// Movement Sensor
		movement: {
			uuid: 'f000aa80-0451-4000-b000-000000000000',
			service: null, // BluetoothRemoteGATTService object
			chars: {
				data: { // Data
					uuid: 'f000aa81-0451-4000-b000-000000000000',
					char: null // BluetoothRemoteGATTCharacteristic object
				},
				conf: {// Configuration
					uuid: 'f000aa82-0451-4000-b000-000000000000',
					char: null // BluetoothRemoteGATTCharacteristic object
				},
				peri: { // Period
					uuid: 'f000aa83-0451-4000-b000-000000000000',
					char: null // BluetoothRemoteGATTCharacteristic object
				}
			}
		},
		// Humidity Sensor
		humidity: {
			uuid: 'f000aa20-0451-4000-b000-000000000000',
			service: null, // BluetoothRemoteGATTService object
			chars: {
				data: { // Data
					uuid: 'f000aa21-0451-4000-b000-000000000000',
					char: null // BluetoothRemoteGATTCharacteristic object
				},
				conf: {// Configuration
					uuid: 'f000aa22-0451-4000-b000-000000000000',
					char: null // BluetoothRemoteGATTCharacteristic object
				},
				peri: { // Period
					uuid: 'f000aa23-0451-4000-b000-000000000000',
					char: null // BluetoothRemoteGATTCharacteristic object
				}
			}
		},
		// Barometric Pressure Sensor
		pressure: {
			uuid: 'f000aa40-0451-4000-b000-000000000000',
			service: null, // BluetoothRemoteGATTService object
			chars: {
				data: { // Data
					uuid: 'f000aa41-0451-4000-b000-000000000000',
					char: null // BluetoothRemoteGATTCharacteristic object
				},
				conf: {// Configuration
					uuid: 'f000aa42-0451-4000-b000-000000000000',
					char: null // BluetoothRemoteGATTCharacteristic object
				},
				peri: { // Period
					uuid: 'f000aa44-0451-4000-b000-000000000000',
					char: null // BluetoothRemoteGATTCharacteristic object
				}
			}
		},
		// Optical Sensor
		optical: {
			uuid: 'f000aa70-0451-4000-b000-000000000000',
			service: null, // BluetoothRemoteGATTService object
			chars: {
				data: { // Data
					uuid: 'f000aa71-0451-4000-b000-000000000000',
					char: null // BluetoothRemoteGATTCharacteristic object
				},
				conf: {// Configuration
					uuid: 'f000aa72-0451-4000-b000-000000000000',
					char: null // BluetoothRemoteGATTCharacteristic object
				},
				peri: { // Period
					uuid: 'f000aa73-0451-4000-b000-000000000000',
					char: null // BluetoothRemoteGATTCharacteristic object
				}
			}
		},
		// IO Service
		io: {
			uuid: 'f000aa64-0451-4000-b000-000000000000',
			service: null, // BluetoothRemoteGATTService object
			chars: {
				data: { // Data
					uuid: 'f000aa65-0451-4000-b000-000000000000',
					char: null // BluetoothRemoteGATTCharacteristic object
				},
				conf: {// Configuration
					uuid: 'f000aa66-0451-4000-b000-000000000000',
					char: null // BluetoothRemoteGATTCharacteristic object
				}
			}
		},
		// Simple Keys Service
		keys: {
			uuid: '0000ffe0-0000-1000-8000-00805f9b34fb',
			service: null, // BluetoothRemoteGATTService object
			chars: {
				data: { // Data
					uuid: '0000ffe1-0000-1000-8000-00805f9b34fb',
					char: null // BluetoothRemoteGATTCharacteristic object
				}
			}
		}
	};

	this._config = {
		temperature: {
			enable_ir_temperature_sensor: false
		},
		movement: {
			enable_gyroscope_x: false,
			enable_gyroscope_y: false,
			enable_gyroscope_z: false,
			enable_accelerometer_x: false,
			enable_accelerometer_y: false,
			enable_accelerometer_z: false,
			enable_magnetometer: false,
			enable_wake_on_motion: false,
			accelerometer_range: 0 // 0=2G, 1=4G, 3=16G
		},
		humidity: {
			enable_humidity_sensor: false
		},
		pressure: {
			enable_barometric_pressure_sensor: false
		},
		optical: {
			enable_optical_sensor: false
		},
		io: {
			mode: 0 // 0: local mode, 1: remote mode, 2: test mode
		}
	};

	/* -------------------------------------------------------
	* Sensing period
	*   - The unit is 1 ms.
	*   - The range is from 300 ms to 2550 ms.
	*   - Note that the effectual resolution is 10 ms.
	* ----------------------------------------------------- */
	this._periods = {
		temperature : 1000, // The range is from 300 ms to 2550 ms. The default is 1000 ms.
		movement    : 1000, // The range is from 100 ms to 2550 ms. The default is 1000 ms.
		humidity    : 1000, // The range is from 100 ms to 2550 ms. The default is 1000 ms.
		pressure    : 1000, // The range is from 100 ms to 2550 ms. The default is 1000 ms.
		optical     : 1000  // The range is from 100 ms to 2550 ms. The default is 800 ms.
	};

	this._io_status = {
		red    : false,
		green  : false,
		buzzer : false
	};
}

/* ------------------------------------------------------------------
* Method: discover([namePrefix[, callback]])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.discover = function(name_prefix, callback) {
	if(!name_prefix) {
		name_prefix = 'CC2650 SensorTag'
	}

	var service_uuid_list = [];
	for(var name in this._services) {
		service_uuid_list.push(this._services[name]['uuid']);
	}
	var promise = new Promise((resolve, reject) => {
		navigator.bluetooth.requestDevice({
			filters: [{namePrefix: name_prefix}],
			optionalServices: service_uuid_list
		}).then((device) => {
			this._device = device;
			resolve({id: device.id, name: device.name});
		}).catch((error) => {
			reject(error);
		});
	});

	if(this._isValidCallback(callback)) {
		promise.then((info) => {
			this._execCallback(callback, null, info);
		}).catch((error) => {
			this._execCallback(callback, error, null);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._isValidCallback = function(callback) {
	return (callback && typeof(callback) === 'function') ? true : false;
};

CC2650SensorTag.prototype._execCallback = function(callback, arg1, arg2) {
	if(this._isValidCallback(callback)) {
		callback(arg1, arg2);
	}
};

/* ------------------------------------------------------------------
* Method: disconnect()
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.disconnect = function() {
	if(this._device && this._device.gatt.connected) {
		var handler = this.ondisconnect;
		if(handler) {
			this.ondisconnect = null;
		}
		this._device.gatt.disconnect();
		this.ondisconnect = handler;
	}
	this.connected = false;
};

/* ------------------------------------------------------------------
* Method: connect([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.connect = function(callback) {
	var promise = new Promise((resolve, reject) => {
		if(this._device) {
			this._device.gatt.connect().then((server) => {
				this._server = server;
				this._getAllServices(Object.keys(this._services), (error) => {
					if(error) {
						reject(error);
					} else {
						var s = {red: false, green: false, buzzer: false};
						this._activatingIo(s).then(() => {
							var c = {io: {mode: 1}};
							return this.writeConfigurations(c);
						}).then(() => {
							this._device.ongattserverdisconnected = function() {
								if(this.ondisconnect && typeof(this.ondisconnect) === 'function') {
									this.ondisconnect();
								}
							}.bind(this);
							this.connected = true;
							resolve();
						}).catch((error) => {
							reject(error);
						});
					}
				});
			}).catch((error) => {
				reject(error);
			});
		} else {
			reject(new Error('No device has not been selected.'));
		}
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._getAllServices = function(service_name_list, callback) {
	var name = service_name_list.shift();
	if(name) {
		this._getService(name, (error) => {
			if(error) {
				callback(error);
			} else {
				this._getAllServices(service_name_list, callback);
			}
		});
	} else {
		callback();
	}
};

CC2650SensorTag.prototype._getService = function(name, callback) {
	var uuid = this._services[name]['uuid'];
	this._server.getPrimaryService(uuid).then((service) => {
		this._services[name]['service'] = service;
		var char_name_list = Object.keys(this._services[name]['chars']);
		this._getAllCharacteristics(name, char_name_list, (error) => {
			if(error) {
				callback(error);
			} else {
				callback();
			}
		});
	}).catch((error) => {
		console.dir(error);
	});
};

CC2650SensorTag.prototype._getAllCharacteristics = function(service_name, char_name_list, callback) {
	var char_name = char_name_list.shift();
	if(char_name) {
		this._getCharacteristic(service_name, char_name, (error) => {
			if(error) {
				callback(error);
			} else {
				this._getAllCharacteristics(service_name, char_name_list, callback);
			}
		});
	} else {
		callback();
	}
};

CC2650SensorTag.prototype._getCharacteristic = function(service_name, char_name, callback) {
	var uuid = this._services[service_name]['chars'][char_name]['uuid'];
	this._services[service_name]['service'].getCharacteristic(uuid).then((char) => {
		this._services[service_name]['chars'][char_name]['char'] = char;
		callback();
	}).catch((error) => {
		callback(error);
	});
};

/* ------------------------------------------------------------------
* Method: readDeviceInformation([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.readDeviceInformation = function(callback) {
	if(!this._info) {
		this._info = {};
	}
	var promise = new Promise((resolve, reject) => {
		var chars = this._services['info']['chars'];
		var name_list = Object.keys(chars);
		this._readDeviceInformationAllValues(name_list, (error) => {
			if(error) {
				reject(error);
			} else {
				resolve(Object.assign({}, this._info));
			}
		});
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			var res = Object.assign({}, this._info);
			this._execCallback(callback, null, res);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._readDeviceInformationAllValues = function(char_name_list, callback) {
	var char_name = char_name_list.shift();
	if(char_name) {
		this._readDeviceInformationValue(char_name, (error, string) => {
			if(error) {
				callback(error);
			} else {
				this._info[char_name] = string;
				this._readDeviceInformationAllValues(char_name_list, callback);
			}
		});
	} else {
		callback();
	}
};

CC2650SensorTag.prototype._readDeviceInformationValue = function(char_name, callback) {
	var char = this._services['info']['chars'][char_name]['char'];
	char.readValue().then((dataview) => {
		var string = '';
		for(var i=0; i<dataview.byteLength; i++) {
			var code = dataview.getUint8(i);
			if(char_name === 'system') {
				string += ('0' + code.toString(16)).slice(-2)
			} else {
				string += String.fromCharCode(code);
			}
		}
		callback(null, string);
	}).catch((error) => {
		callback(error);
	});
};

/* ------------------------------------------------------------------
* Method: readBatteryLevel([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.readBatteryLevel = function(callback) {
	var promise = new Promise((resolve, reject) => {
		var char = this._services['battery']['chars']['level']['char'];
		char.readValue().then((dataview) => {
			var data = {
				level: dataview.getUint8(0)
			};
			resolve(data);
		}).catch((error) => {
			reject(error);
		});
	});
	if(this._isValidCallback(callback)) {
		promise.then((level) => {
			this._execCallback(callback, null, level);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

/* ------------------------------------------------------------------
* Method: readConfigurations([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.readConfigurations = function(callback) {
	var promise = new Promise((resolve, reject) => {
		var service_name_list = [];
		for(var service_name in this._services) {
			var chars = this._services[service_name]['chars'];
			if(chars && chars['conf'] && chars['conf']['char']) {
				service_name_list.push(service_name);
			}
		}
		this._readConfigurationsAllValues(service_name_list, (error) => {
			if(error) {
				reject(error);
			} else {
				resolve(Object.assign({}, this._config));
			}
		});
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			var res = Object.assign({}, this._config);
			this._execCallback(callback, null, res);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._readConfigurationsAllValues = function(service_name_list, callback) {
	var service_name = service_name_list.shift();
	if(service_name) {
		this._readConfigurationValue(service_name, (error, data) => {
			if(error) {
				callback(error);
			} else {
				for(var k in data) {
					this._config[service_name][k] = data[k];
				}
				this._readConfigurationsAllValues(service_name_list, callback);
			}
		});
	} else {
		callback();
	}
};

CC2650SensorTag.prototype._readConfigurationValue = function(service_name, callback) {
	var char = this._services[service_name]['chars']['conf']['char'];
	char.readValue().then((dataview) => {
		var data = this._parseConfigurationData(service_name, dataview);
		callback(null, data);
	}).catch((error) => {
		callback(error);
	});
};

CC2650SensorTag.prototype._parseConfigurationData = function(service_name, dataview) {
	var res = {};
	if(service_name === 'temperature') {
		res['enable_ir_temperature_sensor'] = dataview.getUint8(0) ? true : false;
	} else if(service_name === 'movement') {
		var v = dataview.getUint8(0);
		res['enable_gyroscope_z']     = (v & 0b00000001) ? true : false;
		res['enable_gyroscope_y']     = (v & 0b00000010) ? true : false;
		res['enable_gyroscope_x']     = (v & 0b00000100) ? true : false;
		res['enable_accelerometer_z'] = (v & 0b00001000) ? true : false;
		res['enable_accelerometer_y'] = (v & 0b00010000) ? true : false;
		res['enable_accelerometer_x'] = (v & 0b00100000) ? true : false;
		res['enable_magnetometer']    = (v & 0b01000000) ? true : false;
		res['enable_wake_on_motion']  = (v & 0b10000000) ? true : false;
		var v2 = dataview.getUint8(1);
		res['accelerometer_range']    = v2;
	} else if(service_name === 'humidity') {
		res['enable_humidity_sensor'] = dataview.getUint8(0) ? true : false;
	} else if(service_name === 'pressure') {
		res['enable_barometric_pressure_sensor'] = dataview.getUint8(0) ? true : false;
	} else if(service_name === 'optical') {
		res['enable_optical_sensor'] = dataview.getUint8(0) ? true : false;
	} else if(service_name === 'io') {
		res['mode'] = dataview.getUint8(0);
	}
	return res;
};

/* ------------------------------------------------------------------
* Method: writeConfigurations(config, [callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.writeConfigurations = function(config, callback) {
	var c = Object.assign({}, config);
	var promise = new Promise((resolve, reject) => {
		var err_text = this._checkConfigurationData(c);
		if(err_text) {
			reject(new Error(err_text));
		} else {
			var service_name_list = Object.keys(c);
			this._writeConfigurationsAllValues(service_name_list, c, (error) => {
				if(error) {
					reject(error);
				} else {
					resolve(Object.assign({}, this._config));
				}
			});
		}
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			var res = Object.assign({}, this._config);
			this._execCallback(callback, null, res);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._writeConfigurationsAllValues = function(service_name_list, config, callback) {
	var service_name = service_name_list.shift();
	if(service_name) {
		var c = config[service_name];
		this._writeConfigurationValue(service_name, c, (error) => {
			if(error) {
				callback(error);
			} else {
				this._writeConfigurationsAllValues(service_name_list, config, callback);
			}
		});
	} else {
		callback();
	}
};

CC2650SensorTag.prototype._writeConfigurationValue = function(service_name, config, callback) {
	var char = this._services[service_name]['chars']['conf']['char'];
	var buffer_view = this._createConfigrationBufferView(service_name, config);
	char.writeValue(buffer_view).then(() => {
		for(var k in config) {
			this._config[service_name][k] = config[k];
		}
		callback(null);
	}).catch((error) => {
		callback(error);
	});
};

CC2650SensorTag.prototype._createConfigrationBufferView = function(service_name, c) {
	if(service_name === 'temperature') {
		var v = c['enable_ir_temperature_sensor'] ? 1 : 0;
		return new Uint8Array([v]);
	} else if(service_name === 'movement') {
		// The first byte
		var pname_list = [
			'enable_gyroscope_z',
			'enable_gyroscope_y',
			'enable_gyroscope_x',
			'enable_accelerometer_z',
			'enable_accelerometer_y',
			'enable_accelerometer_x',
			'enable_magnetometer',
			'enable_wake_on_motion'
		];
		var orig = this._config[service_name];
		var v1 = 0b00000000;
		for(var i=0; i<8; i++) {
			var p = pname_list[i];
			var nv = (orig[p] ? 1 : 0) << i;
			if(p in c) {
				nv = (c[p] ? 1 : 0) << i;
			}
			v1 = v1 | nv;
		}
		var abv1 = new Uint8Array([v1]);
		// The second byte
		var v2 = orig['accelerometer_range'];
		if('accelerometer_range' in c) {
			v2 = c['accelerometer_range'];
		}
		var abv2 = new Uint8Array([v2]);
		// Marge the two bytes
		var abv = new Uint8Array(2);
		abv.set(abv1, 0);
		abv.set(abv2, 1);
		return abv;
	} else if(service_name === 'humidity') {
		var v = c['enable_humidity_sensor'] ? 1 : 0;
		return new Uint8Array([v]);
	} else if(service_name === 'pressure') {
		var v = c['enable_barometric_pressure_sensor'] ? 1 : 0;
		return new Uint8Array([v]);
	} else if(service_name === 'optical') {
		var v = c['enable_optical_sensor'] ? 1 : 0;
		return new Uint8Array([v]);
	} else if(service_name === 'io') {
		var v = c['mode'];
		return new Uint8Array([v]);
	}
	return null;
};

CC2650SensorTag.prototype._checkConfigurationData = function(c) {
	var err_text = '';
	for(var service_name in c) {
		if(!(service_name in this._config)) {
			err_text = 'The service name `' + service_name + '` is unknown.';
			break;
		}
		for(var property_name in c[service_name]) {
			if(!(property_name in this._config[service_name])) {
				err_text = 'The property `' + property_name + '` is unknown.';
				break;
			}
			var v = c[service_name][property_name];
			if(property_name.match(/^enable_/)) {
				if(typeof(v) !== 'boolean') {
					err_text = 'The value of the property `' + property_name + '` must be boolean.'
					break;
				}
			} else {
				if(typeof(v) !== 'number' || v % 1 !== 0) {
					err_text = 'The value of the property `' + property_name + '` must be an integer.';
					break;
				}
				if(property_name === 'accelerometer_range') {
					if(!(v === 0 || v === 1 || v === 2 || v === 3)) {
						err_text = 'The value of the property `' + property_name + '` must be an integer in the range of 0 to 3.';
						break;
					}
				}
				if(property_name === 'mode') {
					if(!(v === 0 || v === 1 || v === 2)) {
						err_text = 'The value of the property `' + property_name + '` must be an integer in the range of 0 to 2.';
						break;
					}
				}
			}
		}
		if(err_text) {
			break;
		}
	}
	return err_text;
};

/* ------------------------------------------------------------------
* Method: readPeriods([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.readPeriods = function(callback) {
	var promise = new Promise((resolve, reject) => {
		var service_name_list = [];
		for(var service_name in this._services) {
			var chars = this._services[service_name]['chars'];
			if(chars && chars['peri'] && chars['peri']['char']) {
				service_name_list.push(service_name);
			}
		}
		this._readPeriodsAllValues(service_name_list, (error) => {
			if(error) {
				reject(error);
			} else {
				resolve(Object.assign({}, this._periods));
			}
		});
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			var res = Object.assign({}, this._periods);
			this._execCallback(callback, null, res);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._readPeriodsAllValues = function(service_name_list, callback) {
	var service_name = service_name_list.shift();
	if(service_name) {
		this._readPeriodValue(service_name, (error, data) => {
			if(error) {
				callback(error);
			} else {
				this._periods[service_name] = data;
				this._readPeriodsAllValues(service_name_list, callback);
			}
		});
	} else {
		callback();
	}
};

CC2650SensorTag.prototype._readPeriodValue = function(service_name, callback) {
	var char = this._services[service_name]['chars']['peri']['char'];
	char.readValue().then((dataview) => {
		var data = dataview.getUint8(0) * 10;
		callback(null, data);
	}).catch((error) => {
		callback(error);
	});
};

/* ------------------------------------------------------------------
* Method: writePeriods(periods, [callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.writePeriods = function(periods, callback) {
	var c = Object.assign({}, periods);
	var promise = new Promise((resolve, reject) => {
		var err_text = this._checkPeriodData(c);
		if(err_text) {
			reject(new Error(err_text));
		} else {
			var service_name_list = Object.keys(c);
			this._writePeriodsAllValues(service_name_list, c, (error) => {
				if(error) {
					reject(error);
				} else {
					resolve(Object.assign({}, this._periods));
				}
			});
		}
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			var res = Object.assign({}, this._periods);
			this._execCallback(callback, null, res);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._writePeriodsAllValues = function(service_name_list, periods, callback) {
	var service_name = service_name_list.shift();
	if(service_name) {
		this._writePeriodValue(service_name, periods[service_name], (error, data) => {
			if(error) {
				callback(error);
			} else {
				this._periods[service_name] = data;
				this._writePeriodsAllValues(service_name_list, periods, callback);
			}
		});
	} else {
		callback();
	}
};

CC2650SensorTag.prototype._writePeriodValue = function(service_name, period, callback) {
	var char = this._services[service_name]['chars']['peri']['char'];
	var d = parseInt(period / 10, 10);
	var buffer_view = new Uint8Array([d]);
	char.writeValue(buffer_view).then(() => {
		callback(null);
	}).catch((error) => {
		callback(error);
	});
};

CC2650SensorTag.prototype._checkPeriodData = function(c) {
	var err_text = '';
	for(var service_name in c) {
		if(!(service_name in this._periods)) {
			err_text = 'The service name `' + service_name + '` is unknown.';
			break;
		}
		var v = c[service_name];
		if(typeof(v) !== 'number' || v % 1 !== 0) {
			err_text = 'The value of the property `' + service_name + '` must be an integer.';
			break;
		}
		var min = 100;
		var max = 2550;
		if(service_name === 'temperature') {
			min = 300;
		}
		if(v < min || v > max) {
			err_text = 'The value of the property `' + service_name + '` must be in the range of ' + min + ' to ' + max + '.';
			break;
		}
	}
	return err_text;
};

/* ------------------------------------------------------------------
* Method: readTemperature([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.readTemperature = function(callback) {
	var promise = new Promise((resolve, reject) => {
		this._readData('temperature').then((dataview) => {
			resolve(this._parseDataValueTemperature(dataview));
		}).catch((error) => {
			reject(error);
		});
	});
	if(this._isValidCallback(callback)) {
		promise.then((data) => {
			this._execCallback(callback, null, data);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._readData = function(service_name, callback) {
	var promise = new Promise((resolve, reject) => {
		var s = this._services[service_name];
		if(s && s['chars'] && s['chars']['data']) {
			var char = this._services[service_name]['chars']['data']['char'];
			char.readValue().then((dataview) => {
				resolve(dataview);
			}).catch((error) => {
				reject(error);
			});
		} else {
			reject(new Error('The specified service name is unknown.'));
		}
	});
	return promise;
};

CC2650SensorTag.prototype._parseDataValueTemperature = function(dataview) {
	var SCALE_LSB = 0.03125;
	var res = {
		object: (dataview.getUint16(0, true) >> 2) * SCALE_LSB,
		ambience: (dataview.getUint16(2, true) >> 2) * SCALE_LSB
	};
	return res;
};

/* ------------------------------------------------------------------
* Method: readMovement([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.readMovement = function(callback) {
	var promise = new Promise((resolve, reject) => {
		this._readData('movement').then((dataview) => {
			resolve(this._parseDataValueMovement(dataview));
		}).catch((error) => {
			reject(error);
		});
	});
	if(this._isValidCallback(callback)) {
		promise.then((data) => {
			this._execCallback(callback, null, data);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._parseDataValueMovement = function(dataview) {
	var res = {
		gyrx: 0,
		gyry: 0,
		gyrz: 0,
		accx: 0,
		accy: 0,
		accz: 0,
		magx: 0,
		magy: 0,
		magz: 0
	};
	// Calculate rotation, unit deg/s, range -250, +250
	res['gyrx'] = dataview.getInt16(0, true) / (65536 / 500);
	res['gyry'] = dataview.getInt16(2, true) / (65536 / 500);
	res['gyrz'] = dataview.getInt16(4, true) / (65536 / 500);
	// Calculate acceleration, unit G.
	var acc_range = this._config['movement']['accelerometer_range'];
	var ACC_RANGE_2G = 0;
	var ACC_RANGE_4G = 1;
	var ACC_RANGE_8G = 2;
	var ACC_RANGE_16G = 3;
	var acc_div = 1;
	if(acc_range === ACC_RANGE_2G) { // range -2, +2
		acc_div = 2;
	} else if(acc_range === ACC_RANGE_4G) { // range -4, +4
		acc_div = 4;
	} else if(acc_range === ACC_RANGE_8G) { // range -8, +8
		acc_div = 8;
	} else if(acc_range === ACC_RANGE_16G) { // range -16, +16
		acc_div = 16;
	};
	res['accx'] = dataview.getInt16(6, true) / (32768 / acc_div);
	res['accy'] = dataview.getInt16(8, true) / (32768 / acc_div);
	res['accz'] = dataview.getInt16(10, true) / (32768 / acc_div);
	// Calculate magnetism, unit uT, range +-4900
	res['magx'] = dataview.getInt16(12, true);
	res['magy'] = dataview.getInt16(14, true);
	res['magz'] = dataview.getInt16(16, true);
	return res;
};

/* ------------------------------------------------------------------
* Method: readHumidity([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.readHumidity = function(callback) {
	var promise = new Promise((resolve, reject) => {
		this._readData('humidity').then((dataview) => {
			resolve(this._parseDataValueHumidity(dataview));
		}).catch((error) => {
			reject(error);
		});
	});
	if(this._isValidCallback(callback)) {
		promise.then((data) => {
			this._execCallback(callback, null, data);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._parseDataValueHumidity = function(dataview) {
	var res = {
		temperature: (dataview.getUint16(0, true) / 65536) * 165 - 40,
		humidity   : (dataview.getUint16(2, true) / 65536) * 100
	};
	return res;
};

/* ------------------------------------------------------------------
* Method: readPressure([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.readPressure = function(callback) {
	var promise = new Promise((resolve, reject) => {
		this._readData('pressure').then((dataview) => {
			resolve(this._parseDataValuePressure(dataview));
		}).catch((error) => {
			reject(error);
		});
	});
	if(this._isValidCallback(callback)) {
		promise.then((data) => {
			this._execCallback(callback, null, data);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._parseDataValuePressure = function(dataview) {
	var res = {
		temperature: ((dataview.getUint16(1, true) << 8) + dataview.getUint8(0)) / 100,
		pressure   : ((dataview.getUint16(4, true) << 8) + dataview.getUint8(3)) / 100
	};
	return res;
};

/* ------------------------------------------------------------------
* Method: readOptical([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.readOptical = function(callback) {
	var promise = new Promise((resolve, reject) => {
		this._readData('optical').then((dataview) => {
			resolve(this._parseDataValueOptical(dataview));
		}).catch((error) => {
			reject(error);
		});
	});
	if(this._isValidCallback(callback)) {
		promise.then((data) => {
			this._execCallback(callback, null, data);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._parseDataValueOptical = function(dataview) {
	var rawData = dataview.getUint16(0, true);
	var m = rawData & 0x0FFF;
	var e = (rawData & 0xF000) >> 12;
	var res = {
		light : m * (0.01 * Math.pow(2.0, e))
	};
	return res;
};

/* ------------------------------------------------------------------
* Method: redLedOn([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.redLedOn = function(callback) {
	var promise = this._activatingIo({red: true});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

/* ------------------------------------------------------------------
* Method: redLedOff([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.redLedOff = function(callback) {
	var promise = this._activatingIo({red: false});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

/* ------------------------------------------------------------------
* Method: greenLedOn([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.greenLedOn = function(callback) {
	var promise = this._activatingIo({green: true});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

/* ------------------------------------------------------------------
* Method: greenLedOff([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.greenLedOff = function(callback) {
	var promise = this._activatingIo({green: false});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

/* ------------------------------------------------------------------
* Method: buzzerOn([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.buzzerOn = function(callback) {
	var promise = this._activatingIo({buzzer: true});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

/* ------------------------------------------------------------------
* Method: buzzerOff([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.buzzerOff = function(callback) {
	var promise = this._activatingIo({buzzer: false});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._activatingIo = function(status) {
	var promise = new Promise((resolve, reject) => {
		//if(this._config['io']['mode'] === 1) {
			var err_text = this._checkIoStatus(status);
			if(err_text) {
				reject(new Error(err_text));
			} else {
				var char = this._services['io']['chars']['data']['char'];
				var s = Object.assign({}, this._io_status);
				for(var k in status) {
					if(k in s) {
						s[k] = status[k];
					}
				}
				var v = 0b00000000;
				if(s['red']) {
					v = v | 0b00000001;
				}
				if(s['green']) {
					v = v | 0b00000010;
				}
				if(s['buzzer']) {
					v = v | 0b00000100;
				}
				var buffer_view = new Uint8Array([v]);
				char.writeValue(buffer_view).then(() => {
					for(var k in status) {
						this._io_status[k] = status[k];
					}
					resolve();
				}).catch((error) => {
					reject(error);
				});
			}
		//} else {
		//	reject(new Error('The IO service is not in the remote mode. Set the value of the `io.mode` in the configuration to 1.'));
		//}
	});
	return promise;
};

CC2650SensorTag.prototype._checkIoStatus = function(status) {
	var err_text = '';
	for(var k in status) {
		if(k.match(/^(red|green|buzzer)$/)) {
			if(typeof(status[k]) !== 'boolean') {
				err_text = 'The value of the `' + k + '` property must be a boolean.';
				break;
			}
		} else {
			err_text = 'The specified property `' + k + '` is unknown.';
			break;
		}
	}
	return err_text;
};

/* ------------------------------------------------------------------
* Method: startBatteryNotifications([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.startBatteryNotifications = function(callback) {
	var promise = new Promise((resolve, reject) => {
		var char = this._services['battery']['chars']['level']['char'];
		if(char) {
			char.startNotifications().then(() => {
				this._setBatteryNotifications(char);
				resolve();
			}).catch((error) => {
				reject(error);
			});
		} else {
			reject(new Error('The device has not been connected yet.'));
		}
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._setBatteryNotifications = function(char) {
	char.oncharacteristicvaluechanged = function(event) {
		if(this.onbatterynotify && typeof(this.onbatterynotify) === 'function') {
			var dataview = event.target.value;
			var data = {
				level: dataview.getUint8(0)
			};
			this.onbatterynotify(data);
		}
	}.bind(this);
};

/* ------------------------------------------------------------------
* Method: stopBatteryNotifications([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.stopBatteryNotifications = function(callback) {
	var promise = new Promise((resolve, reject) => {
		var char = this._services['battery']['chars']['level']['char'];
		if(char) {
			char.oncharacteristicvaluechanged = null;
			resolve();
			// Chrome has not implemente the stopNotifications() method for now.
			/*
			char.stopNotifications().then(() => {
				resolve();
			}).catch((error) => {
				reject(error);
			});
			*/
		} else {
			reject(new Error('The device has not been connected yet.'));
		}
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

/* ------------------------------------------------------------------
* Method: startTemperatureNotifications([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.startTemperatureNotifications = function(callback) {
	var promise = new Promise((resolve, reject) => {
		var char = this._services['temperature']['chars']['data']['char'];
		if(char) {
			if(this._config['temperature']['enable_ir_temperature_sensor']) {
				char.startNotifications().then(() => {
					this._setTemperatureNotifications(char);
					resolve();
				}).catch((error) => {
					reject(error);
				});
			} else {
				reject(new Error('The IR temperature sensor has not been activated yet.'));
			}
		} else {
			reject(new Error('The device has not been connected yet.'));
		}
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._setTemperatureNotifications = function(char) {
	char.oncharacteristicvaluechanged = function(event) {
		if(this.ontemperaturenotify && typeof(this.ontemperaturenotify) === 'function') {
			var dataview = event.target.value;
			var data = this._parseDataValueTemperature(dataview);
			this.ontemperaturenotify(data);
		}
	}.bind(this);
};

/* ------------------------------------------------------------------
* Method: stopTemperatureNotifications([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.stopTemperatureNotifications = function(callback) {
	var promise = new Promise((resolve, reject) => {
		var char = this._services['temperature']['chars']['data']['char'];
		if(char) {
			char.oncharacteristicvaluechanged = null;
			resolve();
			// Chrome has not implemente the stopNotifications() method for now.
			/*
			char.stopNotifications().then(() => {
				resolve();
			}).catch((error) => {
				reject(error);
			});
			*/
		} else {
			reject(new Error('The device has not been connected yet.'));
		}
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

/* ------------------------------------------------------------------
* Method: startMovementNotifications([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.startMovementNotifications = function(callback) {
	var promise = new Promise((resolve, reject) => {
		var char = this._services['movement']['chars']['data']['char'];
		if(char) {
			var enabled = this._config['movement']['enable_gyroscope_x'] ||
			              this._config['movement']['enable_gyroscope_y'] ||
			              this._config['movement']['enable_gyroscope_z'] ||
			              this._config['movement']['enable_accelerometer_x'] ||
			              this._config['movement']['enable_accelerometer_y'] ||
			              this._config['movement']['enable_accelerometer_z'] ||
			              this._config['movement']['enable_magnetometer'];
			if(enabled) {
				char.startNotifications().then(() => {
					this._setMovementNotifications(char);
					resolve();
				}).catch((error) => {
					reject(error);
				});
			} else {
				reject(new Error('Any sensors relevant to the movement service have not been activated yet.'));
			}
		} else {
			reject(new Error('The device has not been connected yet.'));
		}
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._setMovementNotifications = function(char) {
	char.oncharacteristicvaluechanged = function(event) {
		if(this.onmovementnotify && typeof(this.onmovementnotify) === 'function') {
			var dataview = event.target.value;
			var data = this._parseDataValueMovement(dataview);
			this.onmovementnotify(data);
		}
	}.bind(this);
};

/* ------------------------------------------------------------------
* Method: stopMovementNotifications([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.stopMovementNotifications = function(callback) {
	var promise = new Promise((resolve, reject) => {
		var char = this._services['movement']['chars']['data']['char'];
		if(char) {
			char.oncharacteristicvaluechanged = null;
			resolve();
			// Chrome has not implemente the stopNotifications() method for now.
			/*
			char.stopNotifications().then(() => {
				resolve();
			}).catch((error) => {
				reject(error);
			});
			*/
		} else {
			reject(new Error('The device has not been connected yet.'));
		}
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

/* ------------------------------------------------------------------
* Method: startHumidityNotifications([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.startHumidityNotifications = function(callback) {
	var promise = new Promise((resolve, reject) => {
		var char = this._services['humidity']['chars']['data']['char'];
		if(char) {
			if(this._config['humidity']['enable_humidity_sensor']) {
				char.startNotifications().then(() => {
					this._setHumidityNotifications(char);
					resolve();
				}).catch((error) => {
					reject(error);
				});
			} else {
				reject(new Error('The humidity sensor has not been activated yet.'));
			}
		} else {
			reject(new Error('The device has not been connected yet.'));
		}
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._setHumidityNotifications = function(char) {
	char.oncharacteristicvaluechanged = function(event) {
		if(this.onhumiditynotify && typeof(this.onhumiditynotify) === 'function') {
			var dataview = event.target.value;
			var data = this._parseDataValueHumidity(dataview);
			this.onhumiditynotify(data);
		}
	}.bind(this);
};

/* ------------------------------------------------------------------
* Method: stopHumidityNotifications([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.stopHumidityNotifications = function(callback) {
	var promise = new Promise((resolve, reject) => {
		var char = this._services['humidity']['chars']['data']['char'];
		if(char) {
			char.oncharacteristicvaluechanged = null;
			resolve();
			// Chrome has not implemente the stopNotifications() method for now.
			/*
			char.stopNotifications().then(() => {
				resolve();
			}).catch((error) => {
				reject(error);
			});
			*/
		} else {
			reject(new Error('The device has not been connected yet.'));
		}
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

/* ------------------------------------------------------------------
* Method: startPressureNotifications([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.startPressureNotifications = function(callback) {
	var promise = new Promise((resolve, reject) => {
		var char = this._services['pressure']['chars']['data']['char'];
		if(char) {
			if(this._config['pressure']['enable_barometric_pressure_sensor']) {
				char.startNotifications().then(() => {
					this._setPressureNotifications(char);
					resolve();
				}).catch((error) => {
					reject(error);
				});
			} else {
				reject(new Error('The barometric pressure sensor has not been activated yet.'));
			}
		} else {
			reject(new Error('The device has not been connected yet.'));
		}
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._setPressureNotifications = function(char) {
	char.oncharacteristicvaluechanged = function(event) {
		if(this.onpressurenotify && typeof(this.onpressurenotify) === 'function') {
			var dataview = event.target.value;
			var data = this._parseDataValuePressure(dataview);
			this.onpressurenotify(data);
		}
	}.bind(this);
};

/* ------------------------------------------------------------------
* Method: stopPressureNotifications([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.stopPressureNotifications = function(callback) {
	var promise = new Promise((resolve, reject) => {
		var char = this._services['pressure']['chars']['data']['char'];
		if(char) {
			char.oncharacteristicvaluechanged = null;
			resolve();
			// Chrome has not implemente the stopNotifications() method for now.
			/*
			char.stopNotifications().then(() => {
				resolve();
			}).catch((error) => {
				reject(error);
			});
			*/
		} else {
			reject(new Error('The device has not been connected yet.'));
		}
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

/* ------------------------------------------------------------------
* Method: startOpticalNotifications([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.startOpticalNotifications = function(callback) {
	var promise = new Promise((resolve, reject) => {
		var char = this._services['optical']['chars']['data']['char'];
		if(char) {
			if(this._config['optical']['enable_optical_sensor']) {
				char.startNotifications().then(() => {
					this._setOpticalNotifications(char);
					resolve();
				}).catch((error) => {
					reject(error);
				});
			} else {
				reject(new Error('The optical sensor has not been activated yet.'));
			}
		} else {
			reject(new Error('The device has not been connected yet.'));
		}
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._setOpticalNotifications = function(char) {
	char.oncharacteristicvaluechanged = function(event) {
		if(this.onopticalnotify && typeof(this.onopticalnotify) === 'function') {
			var dataview = event.target.value;
			var data = this._parseDataValueOptical(dataview);
			this.onopticalnotify(data);
		}
	}.bind(this);
};

/* ------------------------------------------------------------------
* Method: stopOpticalNotifications([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.stopOpticalNotifications = function(callback) {
	var promise = new Promise((resolve, reject) => {
		var char = this._services['optical']['chars']['data']['char'];
		if(char) {
			char.oncharacteristicvaluechanged = null;
			resolve();
			// Chrome has not implemente the stopNotifications() method for now.
			/*
			char.stopNotifications().then(() => {
				resolve();
			}).catch((error) => {
				reject(error);
			});
			*/
		} else {
			reject(new Error('The device has not been connected yet.'));
		}
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

/* ------------------------------------------------------------------
* Method: startKeysNotifications([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.startKeysNotifications = function(callback) {
	var promise = new Promise((resolve, reject) => {
		var char = this._services['keys']['chars']['data']['char'];
		if(char) {
			char.startNotifications().then(() => {
				this._setKeysNotifications(char);
				resolve();
			}).catch((error) => {
				reject(error);
			});
		} else {
			reject(new Error('The device has not been connected yet.'));
		}
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};

CC2650SensorTag.prototype._setKeysNotifications = function(char) {
	char.oncharacteristicvaluechanged = function(event) {
		if(this.onkeysnotify && typeof(this.onkeysnotify) === 'function') {
			var dataview = event.target.value;
			var data = this._parseDataValueKeys(dataview);
			this.onkeysnotify(data);
		}
	}.bind(this);
};

CC2650SensorTag.prototype._parseDataValueKeys = function(dataview) {
	var v = dataview.getUint8(0);
	var res = {
		leftButton  : (v & 0b00000001) ? true : false,
		rightButton : (v & 0b00000010) ? true : false,
		reedRelay   : (v & 0b00000100) ? true : false
	};
	return res;
};

/* ------------------------------------------------------------------
* Method: stopKeysNotifications([callback])
* ---------------------------------------------------------------- */
CC2650SensorTag.prototype.stopKeysNotifications = function(callback) {
	var promise = new Promise((resolve, reject) => {
		var char = this._services['keys']['chars']['data']['char'];
		if(char) {
			char.oncharacteristicvaluechanged = null;
			resolve();
			// Chrome has not implemente the stopNotifications() method for now.
			/*
			char.stopNotifications().then(() => {
				resolve();
			}).catch((error) => {
				reject(error);
			});
			*/
		} else {
			reject(new Error('The device has not been connected yet.'));
		}
	});
	if(this._isValidCallback(callback)) {
		promise.then(() => {
			this._execCallback(callback, null);
		}).catch((error) => {
			this._execCallback(callback, error);
		});
	} else {
		return promise;
	}
};
