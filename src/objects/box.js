module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three'),
		geometry = new THREE.BoxGeometry( 1, 1, 1 );

	return function box(parent, options) {
		var mesh;

		mesh = new THREE.Mesh(geometry, materials.standard());
		mesh.name = 'box';

		parent.add(mesh);

		return mesh;
	};
}());