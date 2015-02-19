module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three');

	// require('imports?THREE=three!../lib/Snow');

	return function snow(parent, options) {
		var snowObj,
			empty,
			update;

		snowObj = new THREE.Snow();
		empty = new THREE.Object3D();
		empty.name = 'snow';

		empty.add(snowObj.particles);

		parent.add(empty);

		update = this.update;
		this.update = function (time) {
			snowObj.time(time * 0.04);
			update();
		};

		return empty;
	};
}());