module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three');

	return function image(parent, options) {
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
			tex = materials.imageTexture(src, THREE.UVMapping, function (t, image) {
				geometry.applyMatrix(new THREE.Matrix4().makeScale(1, image.naturalHeight / image.naturalWidth, 1));
				material.map = tex;
				material.visible = true;
				mesh.visible = true;
				parent.add(mesh);
			});
		}

		geometry = new THREE.PlaneBufferGeometry(1, 1, 8);
		geometry.applyMatrix( new THREE.Matrix4().makeRotationY(Math.PI / 2));

		material = new THREE.MeshBasicMaterial({
			side: THREE.DoubleSide,
			transparent: true,
			map: tex
		});

		mesh = new THREE.Mesh( geometry, material );
		mesh.rotation.set( 0, -90 * Math.PI / 180, 0 );

		//mesh.visible = false;

		parent.add(mesh);

		return mesh;
	};
}());