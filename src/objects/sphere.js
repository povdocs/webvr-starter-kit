module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three');

	return function box(parent, options) {
		var geometry,
			mesh;

		geometry = new THREE.SphereGeometry(
			options.radius === undefined ? 0.5 : options.radius,
			options.widthSegments === undefined ? 16 : options.widthSegments,
			options.heightSegments === undefined ? 12 : options.heightSegments,
			options.phiStart,
			options.phiLength,
			options.thetaStart,
			options.thetaLength
		);
		mesh = new THREE.Mesh(geometry, materials.standard);
		mesh.name = 'sphere';

		parent.add(mesh);

		return mesh;
	};
}());