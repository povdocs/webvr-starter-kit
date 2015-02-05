/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Audio = function ( listener ) {

	THREE.Object3D.call( this );

	this.type = 'Audio';

	this.context = listener.context;
	this.source = this.context.createBufferSource();

	this.gain = this.context.createGain();
	this.gain.connect( listener.input );

	this.panner = this.context.createPanner();
	this.panner.connect( this.gain );

};

THREE.Audio.prototype = Object.create( THREE.Object3D.prototype );

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

THREE.Audio.prototype.setLoop = function ( value ) {

	this.source.loop = value;

};

THREE.Audio.prototype.setRefDistance = function ( value ) {

	this.panner.refDistance = value;

};

THREE.Audio.prototype.setRolloffFactor = function ( value ) {

	this.panner.rolloffFactor = value;

};

THREE.Audio.prototype.updateMatrixWorld = ( function () {

	var position = new THREE.Vector3();

	return function ( force ) {

		THREE.Object3D.prototype.updateMatrixWorld.call( this, force );

		position.setFromMatrixPosition( this.matrixWorld );

		this.panner.setPosition( position.x, position.y, position.z );

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

	this.context = new AudioContext();
	this.input = this.context.createGain();

	this.input.connect( this.context.destination );
};

THREE.AudioListener.prototype = Object.create( THREE.Object3D.prototype );

THREE.AudioListener.prototype.volume = function (val) {
	val = val !== undefined && parseFloat(val);
	if (!isNaN(val)) {
		this.input.gain.value = val;
	}

	return this.input.gain.value;
};

THREE.AudioListener.prototype.updateMatrixWorld = ( function () {

	var position = new THREE.Vector3();
	var quaternion = new THREE.Quaternion();
	var scale = new THREE.Vector3();

	var orientation = new THREE.Vector3();

	return function ( force ) {

		THREE.Object3D.prototype.updateMatrixWorld.call( this, force );

		var listener = this.context.listener;

		this.matrixWorld.decompose( position, quaternion, scale );

		orientation.set( 0, 0, -1 ).applyQuaternion( quaternion );

		listener.setPosition( position.x, position.y, position.z );
		listener.setOrientation( orientation.x, orientation.y, orientation.z, this.up.x, this.up.y, this.up.z );

	};

} ());

