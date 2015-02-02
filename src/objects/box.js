module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three');

	return function box(parent, options) {
		var geometry,
			mesh;

		geometry = new THREE.BoxGeometry( 1, 1, 1 );
		mesh = new THREE.Mesh(geometry, materials.standard);
		mesh.name = 'box';

		parent.add(mesh);

		return mesh;
	};
}());