module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three');

	return function panorama(parent, options) {
		var geometry,
			material,
			mesh,
			src,
			tex;

		if (typeof options === 'string') {
			src = options;
		} else if (options) {
			src = options.src;
		}

		if (src) {
			tex = materials.imageTexture(src, THREE.UVMapping);
		}

		geometry = new THREE.SphereGeometry(1000, 60, 60);
		geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
		geometry.applyMatrix(new THREE.Matrix4().makeRotationY(- Math.PI / 2));

		material = new THREE.MeshBasicMaterial({
			transparent: true,
			map: tex
		});

		mesh = new THREE.Mesh( geometry, material );

		if (options && options.stereo) {
			if (options.stereo === 'vertical') {
				tex.repeat.y = 0.5;
			} else {
				tex.repeat.x = 0.5;
			}
			mesh.userData.stereo = options.stereo;
		}

		mesh.name = 'panorama';

		parent.add(mesh);

		return mesh;
	};
}());