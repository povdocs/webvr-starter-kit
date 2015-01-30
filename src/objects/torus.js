module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three');

	return function torus(parent, options) {
		var geometry,
			mesh;

		geometry = new THREE.TorusGeometry(
			options.radius === undefined ? 1 : options.radius,
			options.tube === undefined ? 0.25 : options.tube,
			options.radialSegments === undefined ? 12 : options.radialSegments,
			options.tubularSegments === undefined ? 16 : options.tubularSegments,
			options.arc
		);
		mesh = new THREE.Mesh(geometry, materials.standard);

		parent.add(mesh);

		return mesh;
	};
}());