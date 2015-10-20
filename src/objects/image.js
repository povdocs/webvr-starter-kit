module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three');

	return function image(parent, options) {
		var geometry,
			material,
			mesh,
			src,
			tex,
			self = this;

		if (typeof options === 'string') {
			src = options;
		} else if (options) {
			src = options.src;
		}

		if (src) {
			tex = materials.imageTexture(src, THREE.UVMapping, function (t, image) {
				//todo: don't do any of this if object has been deleted
				geometry.applyMatrix(new THREE.Matrix4().makeScale(1, image.naturalHeight / image.naturalWidth, 1));
				material.map = tex;
				material.visible = true;
				mesh.visible = true;
				parent.add(mesh);

				self.emit('loaded');
			});
		}

		geometry = new THREE.PlaneBufferGeometry(1, 1, 8);

		material = new THREE.MeshBasicMaterial({
			side: THREE.DoubleSide,
			transparent: true,
			map: tex
		});

		mesh = new THREE.Mesh( geometry, material );

		mesh.visible = false;

		parent.add(mesh);

		return mesh;
	};
}());