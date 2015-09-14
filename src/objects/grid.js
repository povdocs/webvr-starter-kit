module.exports = (function () {
	'use strict';

	var THREE = require('three');

	return function box(parent, options) {
		var obj,
			size = options && options.size || 10,
			step = options && options.step || 1;

		obj = new THREE.GridHelper(size, step);
		obj.name = 'grid';
		if (options) {
			obj.setColors(options.colorCenterLine || obj.color1, options.colorGrid || obj.color2);
		}
		obj.geometry.computeBoundingBox();

		parent.add(obj);

		return obj;
	};
}());