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
			light,
			sunPosition,
			azimuth = Math.PI / 6,
			altitude = Math.PI / 6;

		function mod(x, y) {
			return x - y * Math.floor(x / y);
		}

		function update() {
			var sinTheta,
				cosTheta,
				phi,
				sinPhi,
				cosPhi;

			sinTheta = Math.sin(altitude);
			cosTheta = Math.cos(altitude);
			phi = -HALF_PI - azimuth;
			sinPhi = Math.sin(phi);
			cosPhi = Math.cos(phi);

			sunPosition.set(
				distance * cosPhi * cosTheta,
				distance * sinTheta,
				distance * sinPhi * cosTheta
			);

			if (light) {
				light.intensity = 1.5 * Math.max(0.0, 1.0 - Math.exp(-((Math.PI / 1.95 - Math.abs(HALF_PI - altitude)) / 1.5)));
				light.position.copy(sunPosition).normalize().multiplyScalar(100);
			}
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
					var val = options[param];
					if (val !== undefined) {
						val = parseFloat(val);
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
					self.altitude = options.altitude;
					self.azimuth = options.azimuth;
				}
			}
		};

		Object.defineProperty(this, 'azimuth', {
			set: function (val) {
				val = mod(parseFloat(val), TAU);
				if (!isNaN(val) && val !== azimuth) {
					azimuth = val;
					update();
				}
			},
			get: function () {
				return azimuth;
			}
		});

		Object.defineProperty(this, 'altitude', {
			set: function (val) {
				val = mod(parseFloat(val), TAU);
				if (!isNaN(val) && val !== altitude) {
					altitude = val;
					update();
				}
			},
			get: function() {
				return altitude;
			}
		});

		this.setAltitude = function (val) {
			self.altitude = val;
			return this;
		};

		this.setAzimuth = function (val) {
			self.azimuth = val;
			return this;
		};

		sunPosition = obj.uniforms.sunPosition.value;
		update();

		this.setOptions(options);

		this.raycastable = false;

		return obj.mesh;
	};
}());