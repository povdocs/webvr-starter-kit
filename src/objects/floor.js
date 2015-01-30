module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three');

	function floor(parent, options) {
		var obj;

		obj = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(10, 10, 32),
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
		obj.rotateX(-Math.PI / 2);

		parent.add(obj);

		return obj;
	}

	return floor;
}());