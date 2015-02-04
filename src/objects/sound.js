module.exports = (function () {
	'use strict';

	var materials = require('../materials'),
		THREE = require('three');

	THREE.Audio.prototype.load = function ( file ) {

		var scope = this;

		var request = new XMLHttpRequest();
		request.open( 'GET', file, true );
		request.responseType = 'arraybuffer';
		request.onload = function ( e ) {
			console.log('audio buffer loaded. decoding...', e );
			scope.context.decodeAudioData( this.response, function ( buffer ) {

				scope.source.buffer = buffer;
				scope.source.connect( scope.panner );
				scope.source.start( 0 );

			}, function onFailure(e) {
				console.log('Decoding the audio buffer failed', e);
			} );

		};
		request.onerror = function ( e ) {
			console.log('error', e);
		};
		request.send();

		return this;

	};


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
			scene = parent;
		}

		listener = scene.getObjectByName('audio-listener');
		obj = new THREE.Audio(listener);
		obj.setLoop(true);
		obj.load(src);

		parent.add(obj);

		return obj;
	};
}());