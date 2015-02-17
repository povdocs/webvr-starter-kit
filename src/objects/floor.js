module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three');

	function floor(parent, options) {
		var obj,
			geometry;

		geometry = new THREE.CircleGeometry( options.radius || 100, options.segments || 16 );
		geometry.applyMatrix( new THREE.Matrix4().makeRotationX(-Math.PI / 2));

		obj = new THREE.Mesh(
			geometry,
			materials.checkerboard({
				repeat: 100
			})
		);
		obj.name = 'floor';

		obj.receiveShadow = true;

		parent.add(obj);

		return obj;
	}

	return floor;
}());