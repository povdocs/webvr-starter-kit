module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three');

	return function empty(parent, options) {
		var obj = new THREE.Object3D();

		parent.add(obj);

		return obj;
	};
}());