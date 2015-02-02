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

		geometry = new THREE.SphereGeometry( 1000, 60, 60 );
		geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );

		material = new THREE.MeshBasicMaterial({
			side: THREE.DoubleSide,
			transparent: true,
			map: tex
		});

		mesh = new THREE.Mesh( geometry, material );
		mesh.rotation.set( 0, -90 * Math.PI / 180, 0 );

		mesh.name = 'panorama';

		parent.add(mesh);

		return mesh;
	};
}());