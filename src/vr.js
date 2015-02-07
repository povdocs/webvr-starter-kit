(function () {
	'use strict';

	//constants
	var NEAR = 1,
		FAR = 10000,

	//global-ish declarations
		THREE,
		eventEmitter,
		materials = require('./materials'),

	//scene assets
		camera,
		scene,
		body,
		renderer,
		audioListener,
		vrControls,
		vrEffect,
		mouseControls,
		raycaster,
		target,

		bodyWrapper,
		cameraWrapper,

		floor,

	//state
		going = false,

	//exported object
		VR,
		VRObject = require('./vr-object'),
		objectMethods = [
			'box',
			'cylinder',
			'torus',
			'sphere',
			'empty',
			'sound',
			'floor',
			'panorama',
			'image'
		],

		lastTick = 0,
		animationCallbacks = [];

	function raycast() {
		var i,
			intersect,
			object,
			intersects;

		raycaster.ray.origin.copy( camera.position );
		raycaster.ray.direction.set(0, 0, 0.5).unproject(camera).sub(camera.position).normalize();

		intersects = raycaster.intersectObjects( scene.children );
		for (i = 0; i < intersects.length; i++) {
			intersect = intersects[i];
			if (intersect.object instanceof THREE.Mesh) {
				object = intersect.object;
				break;
			}
		}

		//todo: emit VRObject?
		if (target !== object) {
			if (target) {
				VR.emit('lookoff', target);
			}
			target = object;
			if (target) {
				VR.emit('lookat', target);
			}
		}
	}

	function render() {
		var now = Date.now() / 1000,
			delta = Math.max(1, now - lastTick);

		vrControls.update();

		animationCallbacks.forEach(function (cb) {
			cb(delta, now);
		});

		raycast();

		vrEffect.render(scene, camera);

		lastTick = now;
	}

	function renderLoop() {
		if (going) {
			render();
			requestAnimationFrame(renderLoop);
		}
	}

	function stop() {
		going = false;
	}

	function start() {
		if (!going) {
			going = true;
			renderLoop();
		}
	}

	/*
	Mute any sounds when this browser tab is in the background or minimized.
	*/
	function visibilityChange() {
		if (document.hidden || document.mozHidden || document.msHidden || document.webkitHidden) {
			audioListener.volume(0);
		} else {
			audioListener.volume(1);
		}
	}

	function resize(width, height) {
		width = width || window.innerWidth;
		height = height || window.innerHeight;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
	}

	function initShake() {
		var lastTime = 0,
			lastX,
			lastY,
			lastZ,
			threshold = 15;

		window.addEventListener('devicemotion', function (evt) {
			var current = evt.accelerationIncludingGravity,
				time,
				diff,
				deltaX = 0,
				deltaY = 0,
				deltaZ = 0,
				dist;

			if (lastX !== undefined) {
				deltaX = Math.abs(lastX - current.x);
				deltaY = Math.abs(lastY - current.y);
				deltaZ = Math.abs(lastZ - current.z);

				// if (deltaX > threshold &&
				// 		(deltaY > threshold || deltaZ > threshold)
				// 	) {
				dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
				if (dist > threshold) {

					time = Date.now();
					diff = time - lastTime;
					if (diff > 1000) {
						if (navigator.vibrate) {
							navigator.vibrate(100);
						}

						lastTime = Date.now();

						VR.emit('shake');
					}
				}
			}

			lastX = current.x;
			lastY = current.y;
			lastZ = current.z;
		}, false);
	}

	function initScene() {
		if (renderer) {
			return;
		}

		//create renderer and place in document
		renderer = new THREE.WebGLRenderer();
		// renderer.shadowMapEnabled = true;
		// renderer.shadowMapSoft = true;
		document.body.insertBefore(renderer.domElement, document.body.firstChild || null);

		//need a scene to put all our objects in
		scene = new THREE.Scene();

		bodyWrapper = new VRObject(scene, require('./objects/empty'), {
			name: 'body'
		}).moveTo(0, 1.5, 4);
		body = bodyWrapper.object;

		cameraWrapper = new VRObject(body, function (parent) {
			//need a camera with which to look at stuff
			camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, NEAR, FAR);
			parent.add(camera);

			return camera;
		})
		// set camera position so that OrbitControls works properly.
			.moveTo(0, 0.0001, 0.0001);

		audioListener = new THREE.AudioListener();
		audioListener.name = 'audio-listener';
		camera.add(audioListener);

		//VRControls point the camera wherever we're looking
		vrControls = new THREE.VRControls(camera);
		vrControls.freeze = true;

		//render left and right eye
		vrEffect = new THREE.VRStereoEffect(renderer);
		vrEffect.near = NEAR;
		vrEffect.far = FAR;
		vrEffect.addEventListener('fullscreenchange', function () {
			var fs = document.fullscreenElement ||
				document.mozFullScreenElement ||
				document.webkitFullscreenElement;

			vrControls.freeze = !(vrEffect.isFullscreen() || vrEffect.vrPreview() || fs && vrControls.mode() === 'deviceorientation');
			if (vrControls.freeze) {
				vrControls.reset();
				camera.position.z = 0.0001;
			}
		});

		//report on HMD
		vrControls.addEventListener('devicechange', function () {
			VR.emit('devicechange', vrControls.mode, vrEffect.hmd());
		});

		//mouse control in case got no orientation device
		mouseControls = new THREE.OrbitControls(camera);
		mouseControls.target0.set(0, 0.0001, 0.000);
		mouseControls.target.copy(mouseControls.target0);
		mouseControls.update();

		//todo: remove any default lights once other lights are added
		var dLight = new THREE.DirectionalLight(0xffffff, 0.8);
		dLight.position.set(2, 10, 10);

		dLight.castShadow = true;
		dLight.shadowCameraVisible = true;

		dLight.shadowMapWidth = 2048;
		dLight.shadowMapHeight = 2048;

		dLight.shadowCameraLeft = -10;
		dLight.shadowCameraRight = 10;
		dLight.shadowCameraTop = 10;
		dLight.shadowCameraBottom = -10;

		dLight.shadowCameraFar = 50;
		dLight.shadowCameraNear = 3;
		dLight.shadowDarkness = 1;

		scene.add(dLight);

		scene.add(new THREE.AmbientLight(0x444444));

		if (VR) {
			VR.camera = cameraWrapper;
			VR.body = bodyWrapper;
			VR.canvas = renderer.domElement;
			VR.requestFullScreen = vrEffect.requestFullScreen;
			VR.zeroSensor = vrControls.zeroSensor;
		}

		raycaster = new THREE.Raycaster();
	}

	function initRequirements() {
		//load external requirements
		THREE = require('three');
		require('imports?THREE=three!DeviceOrientationControls');
		require('imports?THREE=three!OrbitControls');

		//if (typeof __DEV__ !== 'undefined' && __DEV__) {
			require('imports?THREE=three!AugmentedConsole');
		//}

		THREE.ImageUtils.crossOrigin = '';

		eventEmitter = require('event-emitter');

		//my VR stuff. todo: move these to a separate repo or two for easy packaging
		require('imports?THREE=three!./lib/VRStereoEffect');
		require('imports?THREE=three!./lib/VRControls');
	}

	function initialize() {
		//todo: set up button/info elements

		initScene();

		initShake();

		resize();

		document.addEventListener('visibilitychange', visibilityChange);
		document.addEventListener('mozvisibilitychange', visibilityChange);
		document.addEventListener('msvisibilitychange', visibilityChange);
		document.addEventListener('webkitvisibilitychange', visibilityChange);
	}

	initRequirements();

	module.exports = VR = {
		init: initialize,
		render: render,
		start: start,
		stop: stop,
		resize: resize,

		THREE: THREE,

		materials: materials,

		animate: function (callback) {
			var i;
			if (typeof callback === 'function') {
				i = animationCallbacks.indexOf(callback);
				if (i < 0) {
					animationCallbacks.push(callback);
				}
			}
		},

		end: function (callback) {
			var i;

			if (!callback) {
				animationCallbacks.length = 0;
				return;
			}

			if (typeof callback === 'function') {
				i = animationCallbacks.indexOf(callback);
				if (i >= 0) {
					animationCallbacks.splice(i, 1);
				}
			}
		},

		requestFullScreen: function () {},
		zeroSensor: function () {},
		preview: function () {
			var fs;
			if (vrEffect && !vrEffect.isFullscreen()) {
				vrEffect.vrPreview(!vrEffect.vrPreview());

				fs = document.fullscreenElement ||
					document.mozFullScreenElement ||
					document.webkitFullscreenElement;

				vrControls.freeze = !(vrEffect.isFullscreen() || vrEffect.vrPreview() || vrControls.mode() === 'deviceorientation');
				if (vrControls.freeze) {
					vrControls.reset();
					camera.position.z = 0.0001;
				}
			}
		},

		vibrate: navigator.vibrate ? navigator.vibrate.bind(navigator) : function () {},

		camera: cameraWrapper,
		body: bodyWrapper,
		scene: scene,
		canvas: renderer && renderer.domElement || null
	};

	objectMethods.forEach(function (method) {
		var creator = require('./objects/' + method);

		VR[method] = function (options) {
			var obj = new VRObject(scene, creator, options);
			return obj;
		};

		VRObject.prototype[method] = function (options) {
			var obj = new VRObject(this.object, creator, options);
			return obj;
		};
	});

	eventEmitter(VR);

	Object.defineProperty(VR, 'target', {
		get: function () {
			return target;
		}
	});
}());
