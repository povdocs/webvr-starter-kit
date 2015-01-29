(function () {
	'use strict';

	//global-ish declarations
	var VR,

	//ui elements
		vrButton;

	function initRequirements() {
		//load styles
		require('!style!css!./css/style.css');

		VR = require('./vr');
	}

	function initUI() {
		var container,
			fsButton,
			element;

		//set up meta viewport tag for mobile devices
		element = document.createElement('meta');
		element.setAttribute('name', 'viewport');
		element.setAttribute('content', 'width=device-width, initial-scale=1, user-scalable=no');
		document.head.appendChild(element);

		container = document.createElement('div');
		container.id = 'buttons';
		document.body.appendChild(container);

		//todo: use icons instead of text
		fsButton = document.createElement('button');
		fsButton.id = 'fs';
		fsButton.innerHTML = 'FS';
		fsButton.addEventListener('click', function () {
			var fullScreenElement = VR.canvas,
				requestFullscreen = fullScreenElement.webkitRequestFullscreen ||
					fullScreenElement.mozRequestFullScreen ||
					fullScreenElement.msRequestFullscreen;

			if (requestFullscreen) {
				requestFullscreen.call(fullScreenElement);
			}
		}, false);
		container.appendChild(fsButton);

		//report on HMD
		VR.on('devicechange', function (mode) {
			if (mode) {
				vrButton.style.display = 'inline-block';
			}

			//todo: enable this
			//info.innerHTML = hmd && hmd.deviceName ? 'HMD: ' + hmd.deviceName : '';
			//info.className = hmd && hmd.deviceId !== 'debug-0' ? 'has-hmd' : '';
		});

		vrButton = document.createElement('button');
		vrButton.id = 'vr';
		vrButton.innerHTML = 'VR';
		vrButton.addEventListener('click', VR.requestFullScreen, false);
		container.appendChild(vrButton);

		//keyboard shortcuts for making life a little easier
		window.addEventListener('keydown', function (evt) {
			if (evt.keyCode === 'Z'.charCodeAt(0)) {
				VR.zeroSensor();
			} else if (evt.keyCode === 'P'.charCodeAt(0)) {
				VR.preview();
			} else if (evt.keyCode === 13) {
				VR.requestFullScreen();
			}
		}, false);
	}

	function initialize() {
		initRequirements();

		//todo: set up button/info elements

		VR.init();

		initUI();

		VR.resize();
		window.addEventListener('resize', function () {
			VR.resize();
		}, false);

		/*
		export global things
		*/
		window.VR = VR;
		window.THREE = VR.THREE;
	}

	initialize();
	VR.start();
}());
