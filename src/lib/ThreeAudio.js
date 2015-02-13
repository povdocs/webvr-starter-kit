/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Audio = function ( listener ) {

	THREE.Object3D.call( this );

	this.type = 'Audio';
	this.started = false;

	if (listener.context) {

		this.context = listener.context;
		// this.source = this.context.createBufferSource();

		this.gain = this.context.createGain();
		this.gain.connect( listener.input );

		this.panner = this.context.createPanner();
		this.panner.connect( this.gain );

	} else {

		this.source = new Audio();

	}
};

THREE.Audio.prototype = Object.create( THREE.Object3D.prototype );

THREE.Audio.prototype.load = function ( sources ) {
	//todo: support multiple sources for different audio formats

	var scope = this;
	var file;
	var i;
	var match;
	var element = this.source instanceof window.HTMLAudioElement ? this.source : new Audio();

	if (typeof sources === 'string') {
		sources = [sources];
	}

	for (i = 0; i < sources.length; i++) {
		file = sources[i];
		match = /\.([a-z0-9]+)$/i.exec(file);
		if (match && element.canPlayType('audio/' + match[1])) {
			break;
		}
	}

	if (this.context) {
		var request = new XMLHttpRequest();
		request.open( 'GET', file, true );
		request.responseType = 'arraybuffer';
		request.onload = function ( e ) {
			console.log('audio buffer loaded. decoding...', e );
			scope.context.decodeAudioData( this.response, function ( buffer ) {

				scope.buffer = buffer;
				if (scope.started) {
					scope.start();
				}

			}, function onFailure(e) {
				console.log('Decoding the audio buffer failed', e);
			} );

		};

		request.onerror = function ( e ) {
			console.log('error', e);
		};

		request.send();

	} else {

		this.source.src = file;
		this.source.play();

	}

	return this;
};

THREE.Audio.prototype.stop = function ( value ) {

	if (this.context) {
		this.source.stop();
		this.source.disconnect( this.panner );
		this.source = null;
	} else {
		this.source.pause();
		this.source.currentTime = 0;
	}
	this.started = false;
};

THREE.Audio.prototype.start = function ( value ) {

	this.started = true;
	if (this.context) {
		if (this.source) {
			this.source.disconnect( this.panner );
		}

		if (this.buffer) {
			this.source = this.context.createBufferSource();
			this.source.buffer = this.buffer;
			this.source.connect( this.panner );
			this.source.start( 0 );
		}
	} else {
		this.source.currentTime = 0;
		this.source.play();
	}

};

THREE.Audio.prototype.setLoop = function ( value ) {

	this.source.loop = value;

};

THREE.Audio.prototype.setRefDistance = function ( value ) {

	if ( this.panner ) {

		this.panner.refDistance = value;

	}

};

THREE.Audio.prototype.setRolloffFactor = function ( value ) {

	if ( this.panner ) {

		this.panner.rolloffFactor = value;

	}

};

THREE.Audio.prototype.volume = function ( volume, time ) {

	if ( this.gain ) {

		if ( volume !== undefined ) {
			this.gain.gain.linearRampToValueAtTime( volume, this.context.currentTime + (time || 0));
		}

		return this.gain.gain.value;
	}

	if ( volume !== undefined ) {
		this.source.volume = volume;
	}

	return this.source.volume;
};

THREE.Audio.prototype.updateMatrixWorld = ( function () {

	var position = new THREE.Vector3();

	return function ( force ) {

		THREE.Object3D.prototype.updateMatrixWorld.call( this, force );

		position.setFromMatrixPosition( this.matrixWorld );

		if (this.panner) {

			this.panner.setPosition( position.x, position.y, position.z );

		}

	};

} )();

// File:src/extras/audio/AudioListener.js

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.AudioListener = function () {
	var AudioContext = window.AudioContext || window.webkitAudioContext;

	THREE.Object3D.call( this );

	this.type = 'AudioListener';

	if (AudioContext) {
		this.context = new AudioContext();
		this.input = this.context.createGain();

		this.input.connect( this.context.destination );
	}
};

THREE.AudioListener.prototype = Object.create( THREE.Object3D.prototype );

THREE.AudioListener.prototype.volume = function (val) {
	if (this.input) {
		val = val !== undefined && parseFloat(val);
		if (!isNaN(val)) {
			this.input.gain.value = val;
		}

		return this.input.gain.value;
	}
};

THREE.AudioListener.prototype.updateMatrixWorld = ( function () {

	var position = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();
	var scale = new THREE.Vector3();

	var orientation = new THREE.Vector3();

	return function ( force ) {

		THREE.Object3D.prototype.updateMatrixWorld.call( this, force );

		var listener;

		if (this.context) {
			listener = this.context.listener;

			this.matrixWorld.decompose( position, quaternion, scale );

			orientation.set( 0, 0, -1 ).applyQuaternion( quaternion );

			listener.setPosition( position.x, position.y, position.z );
			listener.setOrientation( orientation.x, orientation.y, orientation.z, this.up.x, this.up.y, this.up.z );

		}
	};

} ());

