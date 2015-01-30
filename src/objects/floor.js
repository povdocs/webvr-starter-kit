module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three');

	function floor(parent, options) {
		var obj,
			geometry;

		geometry = new THREE.PlaneBufferGeometry(10, 10, 32);
		geometry.applyMatrix( new THREE.Matrix4().makeRotationX(-Math.PI / 2));

		obj = new THREE.Mesh(
			geometry,
			new THREE.MeshPhongMaterial({
				color: 0x999999,
				specular: 0x111111,
				//map: THREE.ImageUtils.loadTexture(require('url-loader!./images/checkerboard.png')),
				map: materials.imageTexture(require('../images/checkerboard.png')),

				shininess: 100,
				shading: THREE.SmoothShading
			})
		);
		obj.name = 'floor';

		obj.material.map.wrapS = THREE.RepeatWrapping;
		obj.material.map.wrapT = THREE.RepeatWrapping;
		obj.material.map.repeat.set(10, 10);
		obj.receiveShadow = true;

		parent.add(obj);

		return obj;
	}

	return floor;
}());