module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three');

	function cylinder(parent, options) {
		var geometry,
			mesh;

		geometry = new THREE.CylinderGeometry(
			options.radiusTop === undefined ? 0.5 : options.radiusTop,
			options.radiusBottom === undefined ? 0.5 : options.radiusBottom,
			options.height === undefined ? 0.5 : options.height,
			options.radiusSegments === undefined ? 16 : options.radiusSegments,
			options.heightSegments,
			options.openEnded
		);
		mesh = new THREE.Mesh(geometry, materials.standard);
		mesh.name = 'cylinder';

		parent.add(mesh);

		return mesh;
	}

	return cylinder;
}());