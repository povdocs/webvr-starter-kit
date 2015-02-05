module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three');

	require('imports?THREE=three!../lib/ThreeAudio');

	return function sound(parent, options) {
		var obj,
			src,
			listener,
			scene = parent;

		if (typeof options === 'string') {
			src = options;
		} else if (options) {
			src = options.src;
		}

		while (!(scene instanceof THREE.Scene) && scene.parent) {
			scene = scene.parent;
		}

		listener = scene.getObjectByName('audio-listener');
		obj = new THREE.Audio(listener);
		obj.setLoop(true);
		obj.load(src);

		parent.add(obj);

		return obj;
	};
}());