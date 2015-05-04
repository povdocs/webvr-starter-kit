(function () {
	'use strict';

	//constants
	var NEAR = 0.1,
		FAR = 1000000,

	//global-ish declarations
		THREE,
		eventEmitter,
		materials = require('./materials'),
		nop = function () {},
		requestFullscreen = nop,
		exitFullscreen = (
			document.exitFullscreen ||
			document.mozCancelFullScreen ||
			document.webkitExitFullscreen ||
			document.msExitFullscreen ||
			nop
		).bind(document),

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
		vrMode = false,
		orientationEnabled,
		orientationPossible = false,

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
			'sky',
			'panorama',
			'image',
			'video',
			'text'
		],

		//todo: use a weak map or set instead
		vrObjects = [],

		lastTick = 0,
		animationCallbacks = [];

	function isFullscreen() {
		return !!(document.fullscreenElement ||
			document.mozFullScreenElement ||
			document.webkitFullscreenElement ||
			document.msFullscreenElement);
	}

	function fullScreenError() {
		vrMode = false;
		if (vrEffect) {
			vrEffect.exit();
		}
	}

	function raycast() {
		var i,
			intersect,
			object,
			intersects,
			vrObject;

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

		if (target !== object) {
			if (target) {
				vrObject = VRObject.findObject(target);
				vrObject.emit('lookaway');
				VR.emit('lookaway', vrObject);
			}
			target = object;
			if (target) {
				vrObject = VRObject.findObject(target);
				vrObject.emit('lookat', intersect);
				VR.emit('lookat', vrObject, intersect);
			}
		}
	}

	function render() {
		var now = Date.now() / 1000,
			delta = Math.min(1, now - lastTick);

		vrControls.update();

		animationCallbacks.forEach(function (cb) {
			cb(delta, now);
		});

		scene.updateMatrixWorld();

		vrObjects.forEach(function (object) {
			object.update(now);
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
		width = typeof width === 'number' && width || window.innerWidth;
		height = typeof height === 'number' && height || window.innerHeight;

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

			orientationPossible = true;
		}, false);
	}

	function initScene() {
		function attachCanvas() {
			document.body.insertBefore(renderer.domElement, document.body.firstChild || null);
			resize();
		}

		if (renderer) {
			return;
		}

		//create renderer and place in document
		renderer = new THREE.WebGLRenderer();
		renderer.domElement.addEventListener('webglcontextlost', function contextLost(event) {
			console.log('lost context', event);
		});
		// renderer.shadowMapEnabled = true;
		// renderer.shadowMapSoft = true;

		//need a scene to put all our objects in
		scene = new THREE.Scene();

		bodyWrapper = new VRObject(scene, require('./objects/empty'), null, {
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
		vrControls.freeze = !orientationEnabled;

		//render left and right eye
		vrEffect = new THREE.VRStereoEffect(renderer);
		vrEffect.near = NEAR;
		vrEffect.far = FAR;
		vrEffect.addEventListener('fullscreenchange', function (evt) {
			var screen;
			if (isFullscreen()) {
				if (vrMode) {
					//no mouse control
					mouseControls.enabled = false;

					vrControls.freeze = false;
					vrControls.reset();

					screen = window.screen;
					if (screen.lockOrientation) {
						screen.lockOrientation('landscape-primary');
					} else if (screen.mozLockOrientation) {
						screen.mozLockOrientation('landscape-primary');
					} else if (screen.orientation && screen.orientation.lock) {
						screen.orientation.lock('landscape-primary');
					}
				}
			} else {
				VR.exitVR();
			}

			camera.position.set(0, 0.0001, 0.0001);
			camera.rotation.set(0, 0, 0);

			VR.emit('fullscreenchange', evt);
		});

		//report on HMD
		vrControls.addEventListener('devicechange', function () {
			orientationPossible = true;
			if (orientationEnabled === undefined) {
				orientationEnabled = vrControls.mode() === 'deviceorientation';
			}

			vrControls.freeze = !orientationEnabled && !vrMode;

			VR.emit('devicechange', vrControls.mode(), vrEffect.hmd());
		});

		//mouse control in case got no orientation device
		mouseControls = new THREE.OrbitControls(camera);
		mouseControls.target0.set(0, 0.0001, 0.000);
		mouseControls.target.copy(mouseControls.target0);
		mouseControls.update();

		//todo: remove any default lights once other lights are added
		var dLight = new THREE.DirectionalLight(0xffffff, 0.8);
		dLight.name = 'directional-light';
		dLight.position.set(20, 100, 100);

		dLight.castShadow = true;
		dLight.shadowCameraVisible = true;

		dLight.shadowMapWidth = 2048;
		dLight.shadowMapHeight = 2048;

		dLight.shadowCameraLeft = -10;
		dLight.shadowCameraRight = 10;
		dLight.shadowCameraTop = 10;
		dLight.shadowCameraBottom = -10;

		dLight.shadowCameraFar = 150;
		dLight.shadowCameraNear = 100;
		dLight.shadowDarkness = 1;

		scene.add(dLight);

		scene.add(new THREE.AmbientLight(0x444444));

		if (VR) {
			VR.camera = cameraWrapper;
			VR.body = bodyWrapper;
			VR.scene = scene;
			VR.canvas = renderer.domElement;
			VR.zeroSensor = vrControls.zeroSensor;
		}

		raycaster = new THREE.Raycaster();

		if (document.body) {
			attachCanvas();
		} else {
			window.addEventListener('load', attachCanvas, false);
		}

		VR.canvas.addEventListener('mozfullscreenerror', fullScreenError, false);
		VR.canvas.addEventListener('webkitfullscreenerror', fullScreenError, false);
		VR.canvas.addEventListener('fullscreenerror', fullScreenError, false);
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

		requestVR: function () {
			//todo: check if it's possible
			if (vrMode || !vrEffect) {
				return;
			}

			vrMode = true;

			//full screen and render two eyes
			//always full screen
			vrEffect.requestFullScreen();
		},

		exitVR: function () {
			vrMode = false;
			if (isFullscreen()) {
				exitFullscreen();
				return;
			}

			mouseControls.enabled = true;
			vrControls.freeze = !orientationEnabled;
			camera.rotation.set(0, 0, 0);
		},

		vrMode: function () {
			return vrMode && isFullscreen();
		},

		orientationEnabled: function () {
			return !!orientationEnabled;
		},
		enableOrientation: function () {
			orientationEnabled = true;
			if (!vrMode) {
				vrControls.freeze = false;
			}
		},
		disableOrientation: function () {
			orientationEnabled = false;
			camera.rotation.set(0, 0, 0);
			vrControls.freeze = !vrMode;
		},

		isFullscreen: isFullscreen,
		requestFullscreen: requestFullscreen,
		exitFullscreen: function () {
			if (isFullscreen()) {
				exitFullscreen();
			}
		},

		controlMode: function () {
			return vrControls && vrControls.mode();
		},

		zeroSensor: nop,

		vibrate: navigator.vibrate ? navigator.vibrate.bind(navigator) : nop,

		// Utility
		times: function (n, callback) {
			var i;

			for (i = 0; i < n; i++) {
				callback(i);
			}
		},

		camera: cameraWrapper,
		body: bodyWrapper,
		scene: scene,
		canvas: renderer && renderer.domElement || null
	};

	objectMethods.forEach(function (method) {
		var creator = require('./objects/' + method),
			key;

		VR[method] = function (options) {
			var obj = new VRObject(scene, creator, body, options);
			vrObjects.push(obj);
			return obj;
		};

		VRObject.prototype[method] = function (options) {
			var obj = new VRObject(this.object, creator, body, options);
			vrObjects.push(obj);
			return obj;
		};

		for (key in creator) {
			if (creator.hasOwnProperty(key) && typeof creator[key] === 'function') {
				VR[method][key] = creator[key];
				VRObject.prototype[method][key] = creator[key];
			}
		}
	});

	eventEmitter(VR);

	Object.defineProperty(VR, 'target', {
		get: function () {
			return target;
		}
	});
}());
