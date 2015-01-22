(function () {
	'use strict';

	//constants
	var NEAR = 1,
		FAR = 10000,

	//global-ish declarations
		THREE,
		eventEmitter,

	//scene assets
		camera,
		scene,
		body,
		renderer,
		vrControls,
		vrEffect,
		mouseControls,

		floor,

	//state
		going = false,

	//exported object
		VR;

	function render() {
		vrControls.update();

		vrEffect.render(scene, camera);
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

	function resize(width, height) {
		width = width || window.innerWidth;
		height = height || window.innerHeight;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
	}


	function initScene() {
		if (renderer) {
			return;
		}

		//create renderer and place in document
		renderer = new THREE.WebGLRenderer();
		document.body.insertBefore(renderer.domElement, document.body.firstChild || null);

		//need a scene to put all our objects in
		scene = new THREE.Scene();

		//need a camera with which to look at stuff
		camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, NEAR, FAR);

		// set camera position so that OrbitControls works properly.
		camera.position.z = 0.0001;

		body = new THREE.Object3D();
		body.name = 'body';
		body.position.y = 2;
		scene.add(body);
		body.add(camera);

		//VRControls point the camera wherever we're looking
		vrControls = new THREE.VRControls( camera );
		vrControls.freeze = true;

		//render left and right eye
		vrEffect = new THREE.VRStereoEffect(renderer);
		vrEffect.near = NEAR;
		vrEffect.far = FAR;
		vrEffect.addEventListener('fullscreenchange', function () {
			var fs = document.fullscreenElement ||
				document.mozFullScreenElement ||
				document.webkitFullscreenElement;

			vrControls.freeze = !(vrEffect.isFullscreen() || vrEffect.vrPreview() || fs && vrControls.mode);
			if (vrControls.freeze) {
				vrControls.reset();
			}
		});

		//report on HMD
		vrControls.addEventListener('devicechange', function () {
			VR.emit('devicechange', vrControls.mode, vrEffect.hmd());
		});

		//mouse control in case got no orientation device
		mouseControls = new THREE.OrbitControls(camera);

		//todo: remove any default lights once other lights are added
		var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.475 );
		directionalLight.position.set( 100, 100, -100 );
		scene.add( directionalLight );

		if (VR) {
			VR.camera = camera;
			VR.camera = camera;
			VR.canvas = renderer.domElement;
			VR.requestFullScreen = vrEffect.requestFullScreen;
			VR.zeroSensor = vrControls.zeroSensor;
		}
	}

	function initRequirements() {
		//load external requirements
		THREE = require('three');
		require('imports?THREE=three!DeviceOrientationControls');
		require('imports?THREE=three!OrbitControls');

		eventEmitter = require('event-emitter');

		//my VR stuff. todo: move these to a separate repo or two for easy packaging
		require('imports?THREE=three!./lib/VRStereoEffect');
		require('imports?THREE=three!./lib/VRControls');
	}

	function initialize() {
		//todo: set up button/info elements

		initScene();

		resize();
	}

	module.exports = VR = {
		init: initialize,
		render: render,
		start: start,
		stop: stop,
		resize: resize,

		requestFullScreen: function () {},
		zeroSensor: function () {},
		preview: function () {
			if (vrEffect && !vrEffect.isFullscreen()) {
				vrEffect.vrPreview(!vrEffect.vrPreview());
				vrControls.freeze = !vrEffect.vrPreview();
				if (vrControls.freeze) {
					vrControls.reset();
				}
			}
		},

		floor: function () {
			//todo: take options
			if (!floor) {
				THREE.ImageUtils.crossOrigin = '';
				floor = new THREE.Mesh(
					new THREE.PlaneBufferGeometry(10, 10, 32),
					new THREE.MeshPhongMaterial({
						color: 0x999999,
						specular: 0x111111,
						map: THREE.ImageUtils.loadTexture(require('url-loader!./images/checkerboard.png')),

						shininess: 100,
						shading: THREE.SmoothShading
					})
				);
				floor.position.y = 0;
				floor.name = 'floor';

				// floor.material.map.wrapS = THREE.RepeatWrapping;
				// floor.material.map.wrapT = THREE.RepeatWrapping;
				// floor.material.map.repeat.set(10, 10);
				floor.receiveShadow = true;
				floor.rotateX(-Math.PI / 2);
				// scene.add(floor);
				// return;

				var bottom = new THREE.GridHelper(10, 1);
				bottom.setColors( new THREE.Color(0x666600), new THREE.Color(0x666600) );
				bottom.position.set(0, 0, 0);
				scene.add(bottom);

				var top = new THREE.GridHelper(10, 1);
				top.setColors( new THREE.Color(0x666600), new THREE.Color(0x666600) );
				top.position.set(0, 20, 0);
				scene.add(top);

				var front = new THREE.GridHelper(10, 1);
				front.setColors( new THREE.Color(0x666600), new THREE.Color(0x666600) );
				front.position.set(10, 10, 0);
				front.rotation.z = Math.PI / 2;
				scene.add(front);

				var back = new THREE.GridHelper(10, 1);
				back.setColors( new THREE.Color(0x666600), new THREE.Color(0x666600) );
				back.position.set(-10, 10, 0);
				back.rotation.z = Math.PI / 2;
				scene.add(back);

				var left = new THREE.GridHelper(10, 1);
				left.setColors( new THREE.Color(0x666600), new THREE.Color(0x666600) );
				left.position.set(0, 10, -10);
				left.rotation.x = Math.PI / 2;
				scene.add(left);

				var right = new THREE.GridHelper(10, 1);
				right.setColors( new THREE.Color(0x666600), new THREE.Color(0x666600) );
				right.position.set(0, 10, 10);
				right.rotation.x = Math.PI / 2;
				scene.add(right);			}
		},

		//todo: wrap these?
		camera: camera,
		scene: scene,
		canvas: renderer && renderer.domElement || null
	};

	initRequirements();

	eventEmitter(VR);
}());
