module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three'),

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
			self = this;

		function update(altitude, azimuth) {
			var sinTheta = Math.sin(altitude),
				cosTheta = Math.sqrt(1 - sinTheta * sinTheta),
				sinPhi = Math.sin(-Math.PI / 2 - azimuth),
				cosPhi = Math.sqrt(1 - sinPhi * sinPhi);

			self.sunPosition.set(
				distance * cosPhi * cosTheta,
				distance * sinTheta,
				distance * sinPhi * cosTheta
			);
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

		return obj.mesh;
	};
}());