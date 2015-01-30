module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three');

	function box(parent, options) {
		var geometry,
			cube;

		geometry = new THREE.BoxGeometry( 1, 1, 1 );
		cube = new THREE.Mesh(geometry, materials.standard);

		parent.add(cube);

		return cube;
	}

	return box;
}());