THREE.VRControls = function ( object, options ) {

	var self = this;

	//HMD sensor stuff
	var sensorDevice;
	var vrState;

	//device orientation stuff
	var deviceControls;
	var zeroAngle = 0;

	var mode = '';

	var vrBrowser = navigator.getVRDevices || navigator.mozGetVRDevices;

	var poll = options && options.poll || 1000;
	var pollTimeout;

	function gotVRDevices( devices ) {
		var i,
			device;

		for ( i = 0; i < devices.length; ++i ) {
			device = devices[i];
			if ( devices[i] instanceof PositionSensorVRDevice ) {

				if ( sensorDevice && devices[i].hardwareUnitId === sensorDevice.hardwareUnitId ) {
					break;
				}

				sensorDevice = device;
				console.log('Using Sensor Device:', sensorDevice.deviceName);

				if ( sensorDevice.zeroSensor ) {
					self.zeroSensor = sensorDevice.zeroSensor.bind(sensorDevice);
				} else if ( sensorDevice.resetSensor ) {
					self.zeroSensor = sensorDevice.resetSensor.bind(sensorDevice);
				}
				self.zeroSensor();

				mode = 'hmd';

				self.dispatchEvent( {
					type: "devicechange"
				} );

				break; // We keep the first we encounter
			}
		}

		if (poll) {
			clearTimeout(pollTimeout);
			setTimeout(self.scan, poll);
		}
	}

	function deviceOrientationChange( event ) {
		if ( typeof event.gamma === 'number' ) {
			mode = 'deviceorientation';
			window.removeEventListener( 'deviceorientation', deviceOrientationChange, false );
			deviceControls = new THREE.DeviceOrientationControls( object );
			deviceControls.connect();
			if (!this.freeze) {
				deviceControls.update();
			}

			self.dispatchEvent( {
				type: "devicechange"
			} );
		}
	}

	this.update = function() {
		// Applies head rotation from sensor data.
		if (self.freeze) {
			return;
		}

		if ( sensorDevice ) {
			vrState = sensorDevice.getState();
			if ( vrState ) {
				if ( vrState.orientation && vrState.hasOrientation !== false ) {
					object.quaternion.copy( vrState.orientation );
				}

				if ( vrState.position && vrState.hasPosition !== false ) {
					// vrState.position is null if using DK1 or if DK2 camera is not plugged in
					object.position.copy( vrState.position );
				}

				object.updateMatrixWorld();
			}
		} else if (deviceControls && deviceControls.deviceOrientation.gamma !== undefined) {
			deviceControls.update();
			object.rotateY(-zeroAngle);
			object.updateMatrixWorld();
		}
	};

	//only useful when frozen
	this.reset = function () {
		if ( object ) {
			object.quaternion.set( 0, 0, 0, 1 );
			object.position.set( 0, 0, 0 );
		}
	};

	//zeros only rotation on Y axis
	//todo: find out if it zeros out position. need a DK2 to test
	this.zeroSensor = function () {
		if (sensorDevice && sensorDevice.zeroSensor) {
			sensorDevice.zeroSensor();
		}
		zeroAngle = object.rotation.y;
		self.update();
	};

	this.freeze = false;

	//method to query which tech we're using
	this.mode = function () {
		return mode;
	};

	this.scan = function () {
		if ( navigator.getVRDevices ) {
			navigator.getVRDevices().then( gotVRDevices );
		} else if ( navigator.mozGetVRDevices ) {
			navigator.mozGetVRDevices( gotVRDevices );
		}
	};

	//todo: connect/disconnect methods
	//todo: method to query orientation/position without changing object
	//todo: work without an object

	if ( vrBrowser ) {
		this.scan();
	} else if ( "DeviceOrientationEvent" in window && THREE.DeviceOrientationControls) {
		//device orientation
		window.addEventListener( "deviceorientation", deviceOrientationChange, false );
	}
};

THREE.VRControls.prototype = Object.create( THREE.EventDispatcher.prototype );
