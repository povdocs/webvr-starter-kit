/**
 * @author bchirls / http://bchirls.com/
 */

THREE.VRStereoEffect = function ( renderer, fullScreenElement, options ) {

	// internals
	var self = this;
	var width = 0, height = 0;
	var hmdWidth, hmdHeight;

	var hmdDevice;
	var vrMode;
	var vrPreview = false;
	var eyeOffsetLeft, eyeOffsetRight;

	var position = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();
	var scale = new THREE.Vector3();

	var cameraLeft = new THREE.PerspectiveCamera();
	var cameraRight = new THREE.PerspectiveCamera();

	var near = 2;
	var far = 40000;

	var requestFullscreen;
	var fullScreenParam = {
		vrDisplay: null
	};
	var fovScale;

	var RADIANS = Math.PI / 180;

	var poll = options && options.poll || 1000;
	var pollTimeout;

	function perspectiveMatrixFromVRFieldOfView(fov, zNear, zFar) {
		var outMat = new THREE.Matrix4(),
			out = outMat.elements,
			upTan = Math.tan(fov.upDegrees * RADIANS),
			downTan = Math.tan(fov.downDegrees * RADIANS),
			leftTan = Math.tan(fov.leftDegrees * RADIANS),
			rightTan = Math.tan(fov.rightDegrees * RADIANS),

			xScale = 2 / (leftTan + rightTan),
			yScale = 2 / (upTan + downTan);

		out[0] = xScale;
		out[4] = 0;
		out[8] = -((leftTan - rightTan) * xScale * 0.5);
		out[12] = 0;

		out[1] = 0;
		out[5] = yScale;
		out[9] = ((upTan - downTan) * yScale * 0.5);
		out[13] = 0;

		out[2] = 0;
		out[6] = 0;
		out[10] = zFar / (zNear - zFar);
		out[14] = (zFar * zNear) / (zNear - zFar);

		out[3] = 0;
		out[7] = 0;
		out[11] = -1;
		out[15] = 0;

		return outMat;
	}

	function resize() {
		var w, h;

		if (hmdDevice && vrMode) {
			w = hmdWidth;// / Math.pow(window.devicePixelRatio || 1, 2);
			h = hmdHeight;// / Math.pow(window.devicePixelRatio || 1, 2);
		} else {
			w = width || renderer.domElement.offsetWidth || window.innerWidth;
			h = height || renderer.domElement.offsetHeight || window.innerHeight;
		}

		renderer.setSize(w, h);
	}

	function resizeFOV(amount) {
		var fovLeft,
			fovRight,
			leftEyeViewport,
			rightEyeViewport;

		if (!hmdDevice) {
			return;
		}

		if (amount && hmdDevice.setFieldOfView) {
			fovScale += amount;
			fovScale = Math.max(0.1, fovScale);

			fovLeft = hmdDevice.getRecommendedEyeFieldOfView('left');

			fovLeft.upDegrees *= fovScale;
			fovLeft.downDegrees *= fovScale;
			fovLeft.leftDegrees *= fovScale;
			fovLeft.rightDegrees *= fovScale;

			fovRight = hmdDevice.getRecommendedEyeFieldOfView('right');
			fovRight.upDegrees *= fovScale;
			fovRight.downDegrees *= fovScale;
			fovRight.leftDegrees *= fovScale;
			fovRight.rightDegrees *= fovScale;

			hmdDevice.setFieldOfView(fovLeft, fovRight);
		}

		if (hmdDevice.getRecommendedEyeRenderRect) {
			leftEyeViewport = hmdDevice.getRecommendedEyeRenderRect('left');
			rightEyeViewport = hmdDevice.getRecommendedEyeRenderRect('right');
			hmdWidth = leftEyeViewport.width + rightEyeViewport.width;
			hmdHeight = Math.max(leftEyeViewport.height, rightEyeViewport.height);
		}

		resize();

		if (hmdDevice.getCurrentEyeFieldOfView) {
			fovLeft = hmdDevice.getCurrentEyeFieldOfView('left');
			fovRight = hmdDevice.getCurrentEyeFieldOfView('right');
		} else {
			fovLeft = hmdDevice.getRecommendedEyeFieldOfView('left');
			fovRight = hmdDevice.getRecommendedEyeFieldOfView('right');
		}

		cameraLeft.projectionMatrix = perspectiveMatrixFromVRFieldOfView(fovLeft, near, far);
		cameraRight.projectionMatrix = perspectiveMatrixFromVRFieldOfView(fovRight, near, far);
	}

	function gotVRDevices(devices) {
		var i,
			device;

		for (i = 0; i < devices.length; i++) {
			device = devices[i];
			if (device instanceof HMDVRDevice &&
					(!hmdDevice || device.hardwareUnitId !== hmdDevice.hardwareUnitId)) {

				hmdDevice = device;
				console.log('Using HMD Device:', hmdDevice.deviceName);

				if (hmdDevice.setTimewarp) {
					hmdDevice.setTimewarp(false);
				}

				eyeOffsetLeft = hmdDevice.getEyeTranslation('left');
				//cameraLeft.position.add(eyeOffsetLeft);

				eyeOffsetRight = hmdDevice.getEyeTranslation('right');
				//cameraRight.position.add(eyeOffsetRight);

				resizeFOV(0);

				fullScreenParam.vrDisplay = hmdDevice;

				self.dispatchEvent( {
					type: "devicechange"
				} );

				break;
			}
		}

		if (poll) {
			clearTimeout(pollTimeout);
			setTimeout(self.scan, poll);
		}
	}

	function onFullscreenChange() {
		if (!document.webkitFullscreenElement &&
				!document.mozFullScreenElement &&
				!document.msFullScreenElement) {
			vrMode = false;
		}

		resize();

		self.dispatchEvent( {
			type: "fullscreenchange"
		} );
	}

	// API

	this.separation = 0.01;

	// initialization

	renderer.autoClear = false;

	if (!fullScreenElement) {
		fullScreenElement = renderer.domElement;
	}
	requestFullscreen = fullScreenElement.webkitRequestFullscreen ||
		fullScreenElement.mozRequestFullScreen ||
		fullScreenElement.msRequestFullscreen;
	if (requestFullscreen) {
		requestFullscreen = requestFullscreen.bind(fullScreenElement, fullScreenParam);
	}
	document.addEventListener('webkitfullscreenchange', onFullscreenChange, false);
	document.addEventListener('mozfullscreenchange', onFullscreenChange, false);
	document.addEventListener('msfullscreenchange', onFullscreenChange, false);

	//todo: method for adjusting HMD FOV

	this.scan = function () {
		if (navigator.getVRDevices) {
			navigator.getVRDevices().then(gotVRDevices);
		} else if (navigator.mozGetVRDevices) {
			navigator.mozGetVRDevices(gotVRDevices);
		}
	};

	this.requestFullScreen = function () {
		vrMode = true;
		requestFullscreen();
	};

	this.setSize = function ( w, h ) {
		width = w;
		height = h;

		resize();
	};

	this.vrPreview = function (val) {
		if (val !== undefined) {
			vrPreview = !!val;
		}
		return vrPreview;
	};

	this.isFullscreen = function () {
		return vrMode;
	};

	this.hmd = function () {
		return hmdDevice;
	};

	this.render = function ( leftScene, rightScene, camera, renderTarget, forceClear ) {
		var w, h;

		if ( rightScene && rightScene instanceof THREE.Scene ) {
			//rightScene.updateMatrixWorld();
		} else {
			if ( (!camera || camera instanceof THREE.WebGLRenderTarget) && rightScene instanceof THREE.Camera ) {
				forceClear = renderTarget;
				renderTarget = camera;
				camera = rightScene;
			}
			rightScene = leftScene;
		}

		//leftScene.updateMatrixWorld();

		if ( camera.parent === undefined ) {
			camera.updateMatrixWorld();
		}

		w = width || renderer.domElement.width;
		h = height || renderer.domElement.height;
		// w /= window.devicePixelRatio || 1;
		// h /= window.devicePixelRatio || 1;

		/*
		todo: make this work when CSS VR Rendering is fixed
		http://blog.bitops.com/blog/2014/08/20/updated-firefox-vr-builds/
		if (renderer instanceof THREE.CSS3DRenderer) {
			renderer.render( leftScene, camera );
			return;
		}
		*/

		if (!vrMode && !vrPreview) {
			renderer.enableScissorTest( false );
			renderer.setViewport( 0, 0, w, h );
			renderer.render( leftScene, camera, renderTarget, true );
			return;
		}

		camera.matrixWorld.decompose( position, quaternion, scale );

		if (!hmdDevice) {
			// left
			cameraLeft.fov = camera.fov;
			cameraLeft.aspect = 0.5 * camera.aspect;
			cameraLeft.near = camera.near;
			cameraLeft.far = camera.far;
			cameraLeft.updateProjectionMatrix();

			// right

			cameraRight.fov = camera.fov;
			cameraRight.aspect = 0.5 * camera.aspect;
			cameraRight.near = camera.near;
			cameraRight.far = camera.far;
			cameraRight.updateProjectionMatrix();
		}

		cameraLeft.position.copy( position );
		cameraLeft.quaternion.copy( quaternion );

		cameraRight.position.copy( position );
		cameraRight.quaternion.copy( quaternion );

		if (hmdDevice) {
			cameraLeft.position.add( eyeOffsetLeft ) ;
			cameraRight.position.add( eyeOffsetRight );
		} else {
			cameraLeft.translateX( - this.separation );
			cameraRight.translateX( this.separation );
		}

		cameraLeft.updateMatrixWorld();
		cameraRight.updateMatrixWorld();

		//

		renderer.enableScissorTest(true);

		w /= 2;

		if (renderTarget) {
			renderer.setRenderTarget(renderTarget);
		}
		renderer.setScissor( 0, 0, w, h );
		renderer.setViewport( 0, 0, w, h );
		renderer.render( leftScene, cameraLeft, renderTarget, forceClear );

		renderer.setScissor( w, 0, w, h );
		renderer.setViewport( w, 0, w, h );
		renderer.render( rightScene, cameraRight, renderTarget, forceClear );

		//reset viewport, scissor
		w *= 2;
		renderer.setViewport( 0, 0, w, h );
		renderer.setScissor( 0, 0, w, h );
		renderer.enableScissorTest( false );
	};

	Object.defineProperty(this, 'near', {
		get: function () {
			return near;
		},
		set: function (val) {
			val = parseFloat(val);
			if (val && !isNaN(val)) {
				near = Math.max(0, val);
				resizeFOV(0);
			}
		}
	});

	Object.defineProperty(this, 'far', {
		get: function () {
			return far;
		},
		set: function (val) {
			val = parseFloat(val);
			if (val && !isNaN(val)) {
				far = Math.max(0, val);
				resizeFOV(0);
			}
		}
	});

	this.scan();
	resize();
};

THREE.VRStereoEffect.prototype = Object.create( THREE.EventDispatcher.prototype );
