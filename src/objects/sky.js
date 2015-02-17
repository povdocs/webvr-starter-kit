module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three'),
		TAU = Math.PI * 2,
		HALF_PI = Math.PI / 2,

		distance = 400000,
		scratchVector = new THREE.Vector3(),

		params = [
			'luminance',
			'turbidity',
			'reileigh',
			'mieCoefficient',
			'mieDirectionalG'
		];

	require('imports?THREE=three!SkyShader');

	return function sky(parent, options) {
		var obj = new THREE.Sky(),
			self = this,
			scene = parent,
			light;

		function update(altitude, azimuth) {
			var sinTheta,
				cosTheta,
				phi,
				sinPhi,
				cosPhi;

			altitude = altitude - TAU * Math.floor(altitude / TAU);
			azimuth = azimuth - TAU * Math.floor(azimuth / TAU);

			sinTheta = Math.sin(altitude);
			cosTheta = Math.cos(altitude);
			phi = -HALF_PI - azimuth;
			sinPhi = Math.sin(phi);
			cosPhi = Math.cos(phi);

			self.sunPosition.set(
				distance * cosPhi * cosTheta,
				distance * sinTheta,
				distance * sinPhi * cosTheta
			);

			if (light) {

				light.intensity = 1.5 * Math.max(0.0, 1.0 - Math.exp(-((Math.PI / 1.95 - Math.abs(HALF_PI - altitude)) / 1.5)));
				light.position.copy(self.sunPosition).normalize().multiplyScalar(100);
			}
		}

		function getAzimuth() {
			var x = self.sunPosition.x,
				y = self.sunPosition.z,
				angle = Math.atan2(y, x);

			return Math.PI / 2 + angle;
		}

		function getAltitude() {
			scratchVector.copy(self.sunPosition).normalize();
			return Math.asin(scratchVector.y);
		}

		obj.mesh.name = 'sky';

		parent.add(obj.mesh);

		while (!(scene instanceof THREE.Scene) && scene.parent) {
			scene = scene.parent;
		}
		light = scene.getObjectByName('directional-light');

		this.setOptions = function (options) {
			var needUpdate = false,
				altitude,
				azimuth;

			if (options) {
				params.forEach(function (param) {
					var val;
					if (param !== undefined) {
						val = parseFloat(param);
						if (!isNaN(val)) {
							obj.uniforms[param].value = val;
						}
					}
				});

				if (options.sunPosition instanceof THREE.Vector3) {
					obj.uniforms.sunPosition.value.copy(options.sunPosition);
				} else if (Array.isArray(options.sunPosition)) {
					obj.uniforms.sunPosition.value.set(obj.uniforms.sunPosition.value, options.sunPosition);
				} else {
					altitude = parseFloat(options.altitude);
					if (isNaN(altitude)) {
						altitude = getAltitude();
					} else {
						needUpdate = true;
					}

					azimuth = parseFloat(options.azimuth);
					if (!isNaN(azimuth)) {
						needUpdate = true;
					} else if (needUpdate) {
						azimuth = getAzimuth();
					}

					if (needUpdate) {
						update(altitude, azimuth);
					}
				}
			}
		};

		this.sunPosition = obj.uniforms.sunPosition.value;
		update(Math.PI / 6, Math.PI / 6);

		this.setOptions(options);

		Object.defineProperty(this, 'azimuth', {
			set: function (val) {
				update(getAltitude(), val);
			},
			get: getAzimuth
		});

		Object.defineProperty(this, 'altitude', {
			set: function (val) {
				update(val, getAzimuth());
			},
			get: getAltitude
		});

		this.setAltitude = function (val) {
			update(val, getAzimuth());
			return this;
		};

		this.setAzimuth = function (val) {
			update(getAltitude(), val);
			return this;
		};

		return obj.mesh;
	};
}());