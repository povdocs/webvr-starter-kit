(function () {
	'use strict';

	//global-ish declarations
	var VR;

	function initRequirements() {
		//load styles
		require('!style!css!./css/style.css');

		VR = require('./vr');
	}

	function initUI() {
		var container,
			enableFullscreen,
			disableFullscreen,
			vrButton,
			orientationButton,
			element,

			fullScreenElement = document.body,

			fullscreenEnabled = document.fullscreenEnabled ||
				document.webkitFullscreenEnabled ||
				document.mozFullScreenEnabled ||
				document.msFullscreenEnabled,

			requestFullscreen = fullScreenElement.webkitRequestFullscreen ||
				fullScreenElement.mozRequestFullScreen ||
				fullScreenElement.msRequestFullscreen;

		function svgButton(source, id) {
			var span = document.createElement('span'),
				svg;

			span.innerHTML = source;
			span.id = id;

			svg = span.firstChild;
			svg.setAttribute('width', 18);
			svg.setAttribute('height', 18);

			container.appendChild(span);

			return span;
		}

		function toggleOrientation() {
			if (VR.orientationEnabled()) {
				VR.disableOrientation();
			} else {
				VR.enableOrientation();
			}
		}

		function deviceChange() {
			if (VR.controlMode()) {
				vrButton.classList.remove('unsupported');
				orientationButton.classList.remove('unsupported');
			}

			//todo: enable this
			//info.innerHTML = hmd && hmd.deviceName ? 'HMD: ' + hmd.deviceName : '';
			//info.className = hmd && hmd.deviceId !== 'debug-0' ? 'has-hmd' : '';
		}

		//set up meta viewport tag for mobile devices
		element = document.createElement('meta');
		element.setAttribute('name', 'viewport');
		element.setAttribute('content', 'width=device-width, initial-scale=1, user-scalable=no');
		document.head.appendChild(element);

		container = document.createElement('div');
		container.id = 'buttons';
		document.body.appendChild(container);

		//todo: use icons instead of text
		if (requestFullscreen && fullscreenEnabled) {
			enableFullscreen = svgButton(require('raw!open-iconic/svg/fullscreen-enter.svg'), 'fs-enable');
			enableFullscreen.setAttribute('title', 'Enable Full Screen');
			enableFullscreen.addEventListener('click', requestFullscreen.bind(fullScreenElement), false);

			disableFullscreen = svgButton(require('raw!open-iconic/svg/fullscreen-exit.svg'), 'fs-disable');
			disableFullscreen.setAttribute('title', 'Exit Full Screen');
			disableFullscreen.addEventListener('click', VR.exitFullscreen, false);
		}

		VR.on('fullscreenchange', function () {
			if (VR.isFullscreen()) {
				disableFullscreen.style.display = 'inline-block';
				enableFullscreen.style.display = 'none';
			} else {
				disableFullscreen.style.display = '';
				enableFullscreen.style.display = '';
			}
		});

		vrButton = svgButton(require('raw!open-iconic/svg/eye.svg'), 'vr');
		vrButton.setAttribute('title', 'Toggle Virtual Reality');
		vrButton.className = 'unsupported';
		vrButton.addEventListener('click', VR.requestVR, false);

		orientationButton = svgButton(require('raw!open-iconic/svg/compass.svg'), 'orientation');
		orientationButton.setAttribute('title', 'Toggle Orientation');
		orientationButton.className = 'unsupported';
		orientationButton.addEventListener('click', toggleOrientation, false);

		//report on HMD
		VR.on('devicechange', deviceChange);
		deviceChange();

		//keyboard shortcuts for making life a little easier
		window.addEventListener('keydown', function (evt) {
			if (evt.keyCode === 'Z'.charCodeAt(0)) {
				VR.zeroSensor();
			} else if (evt.keyCode === 'O'.charCodeAt(0)) {
				VR.enableOrientation();
			} else if (evt.keyCode === 13) {
				VR.requestVR();
			}
		}, false);

		VR.resize();
	}

	function initialize() {
		initRequirements();

		//todo: set up button/info elements

		VR.init();

		if (document.body) {
			initUI();
		} else {
			window.addEventListener('load', initUI, false);
		}

		window.addEventListener('resize', VR.resize, false);

		/*
		export global things
		*/
		window.VR = VR;
		window.THREE = VR.THREE;
	}

	initialize();
	VR.start();
}());
