/* ------------------------------------------------------------------
* TI CC2650 SensorTag Monitor - monitor.js
*
* Copyright (c) 2016, Futomi Hatano, All rights reserved.
* Released under the MIT license
* Date: 2016-12-28
* ---------------------------------------------------------------- */

(function() {

$(document).ready(function() {
	(new SensorTagMonitor()).init();
});

/*-------------------------------------------------------------------
* Constructor
* ---------------------------------------------------------------- */
function SensorTagMonitor() {
	this.el = { // jQuery objects for the HTML elements
		'wrapper' : $('#main-wrapper'),
		'btn_con' : $('button.connect'),
		'mdl_msg' : $('#message-modal'),
		'mdl_con' : $('#connecting-modal'),
		'led_grn' : $('#led-green'),
		'led_red' : $('#led-red'),
		'buzzer'  : $('#buzzer')
	};

	this.config = {
		temperature: {
			enable_ir_temperature_sensor: true
		},
		movement: {
			enable_gyroscope_x: true,
			enable_gyroscope_y: true,
			enable_gyroscope_z: true,
			enable_accelerometer_x: true,
			enable_accelerometer_y: true,
			enable_accelerometer_z: true,
			enable_magnetometer: true,
			accelerometer_range: 3 // 0=2G, 1=4G, 3=16G
		},
		humidity: {
			enable_humidity_sensor: true
		},
		pressure: {
			enable_barometric_pressure_sensor: true
		},
		optical: {
			enable_optical_sensor: true
		},
	};

	this.periods = {
		movement    : 300, // The range is from 100 ms to 2550 ms. The default is 1000 ms.
	};

	this.info = {};
	this.device_connected = false;

	this.charts = {};
}

SensorTagMonitor.prototype.init = function() {
	this.el['btn_con'].on('click', this.pressedConnectButton.bind(this));
	this.el['led_red'].on('click', this.pressLedRedButton.bind(this));
	this.el['led_grn'].on('click', this.pressLedGreenButton.bind(this));
	this.el['buzzer'].on('click', this.pressBuzzerButton.bind(this));

	this.charts['irtempamb'] = $('#irtempamb').epoch({
		type: 'time.line',
		axes: ['right', 'bottom', 'left'],
		data: [
			{label: 'Ambience temperature', values: []}
		]
	});

	this.charts['irtempobj'] = $('#irtempobj').epoch({
		type: 'time.line',
		axes: ['right', 'bottom', 'left'],
		data: [
			{label: 'Object temperature', values: []}
		]
	});

	this.charts['humidityhum'] = $('#humidityhum').epoch({
		type: 'time.line',
		axes: ['right', 'bottom', 'left'],
		data: [
			{label: 'Humidity', values: []}
		]
	});

	this.charts['movementacc'] = $('#movementacc').epoch({
		type: 'time.line',
		axes: ['right', 'bottom', 'left'],
		data: [
			{label: 'x', values: []},
			{label: 'y', values: []},
			{label: 'z', values: []}
		]
	});

	this.charts['movementgyr'] = $('#movementgyr').epoch({
		type: 'time.line',
		axes: ['right', 'bottom', 'left'],
		data: [
			{label: 'x', values: []},
			{label: 'y', values: []},
			{label: 'z', values: []}
		]
	});

	this.charts['movementmag'] = $('#movementmag').epoch({
		type: 'time.line',
		axes: ['right', 'bottom', 'left'],
		data: [
			{label: 'x', values: []},
			{label: 'y', values: []},
			{label: 'z', values: []}
		]
	});

	this.charts['humiditytmp'] = $('#humiditytmp').epoch({
		type: 'time.line',
		axes: ['right', 'bottom', 'left'],
		data: [
			{label: 'Temperature', values: []}
		]
	});

	this.charts['pressurepre'] = $('#pressurepre').epoch({
		type: 'time.line',
		axes: ['right', 'bottom', 'left'],
		data: [
			{label: 'Barometric Pressure', values: []}
		]
	});

	this.charts['pressuretmp'] = $('#pressuretmp').epoch({
		type: 'time.line',
		axes: ['right', 'bottom', 'left'],
		data: [
			{label: 'Temperature', values: []}
		]
	});

	this.charts['optical'] = $('#optical').epoch({
		type: 'time.line',
		axes: ['right', 'bottom', 'left'],
		data: [
			{label: 'light', values: []}
		]
	});

	$(window).on('resize', this.adjustSize.bind(this));
};

SensorTagMonitor.prototype.adjustSize = function() {
	$('figure.graph-box').each((i, el) => {
		var rect = el.getBoundingClientRect() ;
		var w = rect.width;
		var id = $(el).find('div.epoch').attr('id');
		var chart = this.charts[id];
		if(chart) {
			chart.option('width', w);
		}
	});
};

SensorTagMonitor.prototype.pressedConnectButton = function(event) {
	if(this.device_connected === true) {
		this.disconnectDevice();
	} else {
		this.connectDevice();
	}
};

SensorTagMonitor.prototype.disconnectDevice = function() {
	if(this.tag.connected) {
		this.tag.disconnect();
	}
	this.device_connected = false;
	this.el['wrapper'].removeClass('connected');
	this.el['btn_con'].text('Connect');
};

SensorTagMonitor.prototype.connectDevice = function() {
	this.el['btn_con'].prop('disalbed', true);
	var tag = new CC2650SensorTag();
	this.tag = tag;
	tag.discover().then((info) => {
		this.showConnectingModal('Connecting to the selected ' + info.name + ' ...');
		return tag.connect();
	}).then(() => {
		this.setConnectingModalMessage('Reading the device information...');
		return tag.readDeviceInformation();
	}).then((info) => {
		this.info = info;
		for(var k in info) {
			$('#device-info-' + k).text(info[k]);
		}
		this.setConnectingModalMessage('Reading the battery Level...');
		return tag.readBatteryLevel();
	}).then((data) => {
		$('#battery-level').text(data['level']);
		this.setConnectingModalMessage('Starting the battery serivce...');
		return tag.startBatteryNotifications();
	}).then(() => {
		this.setConnectingModalMessage('Setting the configurations...');
		return tag.writeConfigurations(this.config);
	}).then((config) => {
		this.setConnectingModalMessage('Setting the periods for notifications...');
		tag.writePeriods(this.periods);
	}).then(() => {
		this.setConnectingModalMessage('Starting the temperature service...');
		return tag.startTemperatureNotifications();
	}).then(() => {
		this.setConnectingModalMessage('Starting the movement service...');
		return tag.startMovementNotifications();
	}).then(() => {
		this.setConnectingModalMessage('Starting the humidity service...');
		return tag.startHumidityNotifications();
	}).then(() => {
		this.setConnectingModalMessage('Starting the pressure service...');
		return tag.startPressureNotifications();
	}).then(() => {
		this.setConnectingModalMessage('Starting the optical service...');
		return tag.startOpticalNotifications();
	}).then(() => {
		this.setConnectingModalMessage('Starting the simple keys service...');
		return tag.startKeysNotifications();
	}).then(() => {
		tag.onbattrynotify = this.onBatteryNotify.bind(this);
		tag.ontemperaturenotify = this.onTemperatureNotify.bind(this);
		tag.onmovementnotify = this.onMovementNotify.bind(this);
		tag.onhumiditynotify = this.onHumidityNotify.bind(this);
		tag.onpressurenotify = this.onPressureNotify.bind(this);
		tag.onopticalnotify = this.onOpticalNotify.bind(this);
		tag.onkeysnotify = this.onKeysNotify.bind(this);
		tag.ondisconnect = this.onDisconnect.bind(this);
		this.el['btn_con'].prop('disabled', false);
		this.el['btn_con'].text('Disconnect');
		this.el['wrapper'].addClass('connected');
		this.device_connected = true;
		this.adjustSize();
		this.hideConnectingModal();
	}).catch((error) => {
		this.showMessageModal('Connection Error', error.message);
	});
}

SensorTagMonitor.prototype.showMessageModal = function(title, message) {
	this.el['mdl_msg'].find('.modal-title').text(title);
	this.el['mdl_msg'].find('.modal-message').text(message);
	this.el['mdl_msg'].modal('show');
};

SensorTagMonitor.prototype.hideMessageModal = function() {
	this.el['mdl_msg'].modal('hide');
	this.el['mdl_msg'].find('.modal-title').text('');
	this.el['mdl_msg'].find('.modal-message').text('');
};

SensorTagMonitor.prototype.showConnectingModal = function(message) {
	this.el['mdl_con'].find('.modal-message').text(message);
	this.el['mdl_con'].modal('show');
};

SensorTagMonitor.prototype.setConnectingModalMessage = function(message) {
	this.el['mdl_con'].find('.modal-message').text(message);
};

SensorTagMonitor.prototype.hideConnectingModal = function() {
	this.el['mdl_con'].modal('hide');
	this.el['mdl_con'].find('.modal-message').text('');
};


SensorTagMonitor.prototype.onBatteryNotify = function(data) {
	$('#battery-level').text(data['level']);
};

SensorTagMonitor.prototype.onTemperatureNotify = function(data) {
	var now = Date.now()/1000;
	this.charts['irtempamb'].push([
		{time: now, y: data['ambience']}
	]);
	$('#irtempamb-value').text(data['ambience'].toFixed(1));
	this.charts['irtempobj'].push([
		{time: now, y: data['object']}
	]);
	$('#irtempobj-value').text(data['object'].toFixed(1));
};

SensorTagMonitor.prototype.onMovementNotify = function(data) {
	var now = Date.now()/1000;
	this.charts['movementgyr'].push([
		{time: now, y: data['gyrx']},
		{time: now, y: data['gyry']},
		{time: now, y: data['gyrz']},
	]);
	$('#movementgyrx-value').text(data['gyrx'].toFixed(3));
	$('#movementgyry-value').text(data['gyry'].toFixed(3));
	$('#movementgyrz-value').text(data['gyrz'].toFixed(3));

	this.charts['movementacc'].push([
		{time: now, y: data['accx']},
		{time: now, y: data['accy']},
		{time: now, y: data['accz']},
	]);
	$('#movementaccx-value').text(data['accx'].toFixed(3));
	$('#movementaccy-value').text(data['accy'].toFixed(3));
	$('#movementaccz-value').text(data['accz'].toFixed(3));

	this.charts['movementmag'].push([
		{time: now, y: data['magx']},
		{time: now, y: data['magy']},
		{time: now, y: data['magz']},
	]);
	$('#movementmagx-value').text(data['magx']);
	$('#movementmagy-value').text(data['magy']);
	$('#movementmagz-value').text(data['magz']);
};

SensorTagMonitor.prototype.onHumidityNotify = function(data) {
	var now = Date.now()/1000;
	this.charts['humidityhum'].push([
		{time: now, y: data['humidity']}
	]);
	$('#humidityhum-value').text(data['humidity'].toFixed(1));
	this.charts['humiditytmp'].push([
		{time: now, y: data['temperature']}
	]);
	$('#humiditytmp-value').text(data['temperature'].toFixed(1));
};

SensorTagMonitor.prototype.onPressureNotify = function(data) {
	var now = Date.now()/1000;
	this.charts['pressurepre'].push([
		{time: now, y: data['pressure']}
	]);
	$('#pressurepre-value').text(data['pressure'].toFixed(1));
	this.charts['pressuretmp'].push([
		{time: now, y: data['temperature']}
	]);
	$('#pressuretmp-value').text(data['temperature'].toFixed(1));
};

SensorTagMonitor.prototype.onOpticalNotify = function(data) {
	var now = Date.now()/1000;
	this.charts['optical'].push([
		{time: now, y: data['light']}
	]);
	$('#optical-value').text(data['light'].toFixed(1));
};

SensorTagMonitor.prototype.onKeysNotify = function(data) {
	if(data['leftButton'] === true) {
		$('#led-box span.left-button.released').css('display', 'none');
		$('#led-box span.left-button.pressed').css('display', 'inline');
	} else {
		$('#led-box span.left-button.pressed').css('display', 'none');
		$('#led-box span.left-button.released').css('display', 'inline');
	}
	if(data['rightButton'] === true) {
		$('#led-box span.right-button.released').css('display', 'none');
		$('#led-box span.right-button.pressed').css('display', 'inline');
	} else {
		$('#led-box span.right-button.pressed').css('display', 'none');
		$('#led-box span.right-button.released').css('display', 'inline');
	}
};

SensorTagMonitor.prototype.onDisconnect = function(data) {
	this.disconnectDevice();
	this.showMessageModal('Connection Error', 'The device was disconnected.');
};

SensorTagMonitor.prototype.pressLedRedButton = function(event) {
	var status = this.el['led_red'].hasClass('on') ? false : true;
	if(status) {
		this.tag.redLedOn().then(() => {
			this.el['led_red'].addClass('on');
			this.el['led_red'].removeClass('btn-default');
			this.el['led_red'].addClass('btn-danger');
			this.updateLedImage();
		}).catch((error) => {
			this.showMessageModal('Error', error.message);
		});
	} else {
		this.tag.redLedOff().then(() => {
			this.el['led_red'].removeClass('on');
			this.el['led_red'].removeClass('btn-danger');
			this.el['led_red'].addClass('btn-default');
			this.updateLedImage();
		}).catch((error) => {
			this.showMessageModal('Error', error.message);
		});
	}
};

SensorTagMonitor.prototype.pressLedGreenButton = function(event) {
	var status = this.el['led_grn'].hasClass('on') ? false : true;
	if(status) {
		this.tag.greenLedOn().then(() => {
			this.el['led_grn'].addClass('on');
			this.el['led_grn'].removeClass('btn-default');
			this.el['led_grn'].addClass('btn-success');
			this.updateLedImage();
		}).catch((error) => {
			this.showMessageModal('Error', error.message);
		});
	} else {
		this.tag.greenLedOff().then(() => {
			this.el['led_grn'].removeClass('on');
			this.el['led_grn'].removeClass('btn-success');
			this.el['led_grn'].addClass('btn-default');
			this.updateLedImage();
		}).catch((error) => {
			this.showMessageModal('Error', error.message);
		});
	}
};

SensorTagMonitor.prototype.updateLedImage = function() {
	var g = this.el['led_grn'].hasClass('on') ? '1' : '0';
	var r = this.el['led_red'].hasClass('on') ? '1' : '0';
	$('img.led').css('display', 'none');
	$('img.led.led' + g + r).css('display', 'inline-block');
};

SensorTagMonitor.prototype.pressBuzzerButton = function(event) {
	var status = this.el['buzzer'].hasClass('on') ? false : true;
	if(status) {
		this.tag.buzzerOn().then(() => {
			this.el['buzzer'].addClass('on');
			this.el['buzzer'].find('span').removeClass('glyphicon-play');
			this.el['buzzer'].find('span').addClass('glyphicon-pause');
		}).catch((error) => {
			this.showMessageModal('Error', error.message);
		});
	} else {
		this.tag.buzzerOff().then(() => {
			this.el['buzzer'].removeClass('on');
			this.el['buzzer'].find('span').removeClass('glyphicon-pause');
			this.el['buzzer'].find('span').addClass('glyphicon-play');
		}).catch((error) => {
			this.showMessageModal('Error', error.message);
		});
	}
};


})();
