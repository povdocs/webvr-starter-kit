module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three');

	function floor(parent, options) {
		var obj,
			geometry;

		geometry = new THREE.PlaneBufferGeometry(10, 10, options.widthSegments, options.heightSegments);
		geometry.applyMatrix( new THREE.Matrix4().makeRotationX(-Math.PI / 2));

		obj = new THREE.Mesh(
			geometry,
			materials.checkerboard()
		);
		obj.name = 'floor';

		obj.receiveShadow = true;

		parent.add(obj);

		return obj;
	}

	return floor;
}());