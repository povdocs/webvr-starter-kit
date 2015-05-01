module.exports = (function () {
	'use strict';

	var THREE = require('three'),
		urlRegex = require('../utils/urlregex'),
		extRegex = /\.(webm|ogg|ogv|m4v|mp4|mov)/i,
		video;

	video = function (parent, options) {
		var geometry,
			material,
			mesh,
			vid,
			tex,
			aspectRatio = 1,
			playing = false,
			self = this;

		function isPowerOfTwo(num) {
			return num > 0 && (num & (num-1)) === 0; // jshint ignore:line
		}

		function loadedMetadata() {
			//todo: don't do any of this if object has been deleted

			var newAspectRatio = vid.videoWidth / vid.videoHeight;
			if (!options || !options.sphere) {
				geometry.applyMatrix(new THREE.Matrix4().makeScale(1, aspectRatio / newAspectRatio, 1));
			}
			aspectRatio = newAspectRatio;

			if (vid.videoWidth === vid.videoHeight &&
					isPowerOfTwo(vid.videoWidth) && isPowerOfTwo(vid.videoHeight)) {

				tex.minFilter = THREE.LinearMipMapLinearFilter;
				tex.generateMipmaps = true;
			} else {
				tex.minFilter = THREE.LinearFilter;
				tex.generateMipmaps = false;
			}

			material.map = tex;
			material.visible = true;

			if (playing) {
				vid.play();
			}
		}

		function setSource(sources) {
			sources.forEach(function (src) {
				var parse,
					ext,
					source;

				if (!src) {
					return;
				}

				parse = urlRegex.exec(src);
				if (parse &&
						(parse[1] && parse[1] !== window.location.hostΩ ||
							parse[2] && parse[2] !== window.location.port)) {

					if (vid.crossOrigin !== undefined) {
						vid.crossOrigin = 'anonymous';
					} else {
						console.warn('Browser does not support cross-origin video');
						return;
					}
				}
				source = document.createElement('source');
				source.src = src;

				ext = extRegex.exec(src);
				if (!ext || vid.canPlayType('video/' + ext[1])) {
					vid.appendChild(source);
				}
			});
		}

		/*
		Pause the video when this browser tab is in the background or minimized.
		Resume when it comes back in focus, but only if the user didn't pause manually.
		*/
		function visibilityChange() {
			if (document.hidden || document.mozHidden || document.msHidden || document.webkitHidden) {
				vid.pause();
			} else if (playing) {
				vid.play();
			}
		}

		vid = document.createElement('video');
		vid.loop = true;
		vid.addEventListener('loadedmetadata', loadedMetadata, false);

		if (Array.isArray(options)) {
			setSource(options);
		} if (typeof options === 'string') {
			setSource([options]);
		} else if (typeof options.src === 'string') {
			setSource([options.src]);
		} else if (Array.isArray(options.src)) {
			setSource(options.src);
		}

		vid.load();

		tex = new THREE.VideoTexture(vid, THREE.UVMapping);
		tex.format = THREE.RGBFormat;

		if (options && options.sphere) {
			geometry = new THREE.SphereGeometry(
				994, //radius
				60, //widthSegments
				60, //heightSegments
				(parseFloat(options.phiStart) || 0) * Math.PI * 2,
				(parseFloat(options.phiLength) || 1) * Math.PI * 2,
				(parseFloat(options.thetaStart) || 0) * Math.PI,
				(parseFloat(options.thetaLength) || 1) * Math.PI
			);
			geometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
			geometry.applyMatrix(new THREE.Matrix4().makeRotationY(- Math.PI / 2));
		} else {
			geometry = new THREE.PlaneBufferGeometry(1, 1, 8);
		}

		material = new THREE.MeshBasicMaterial({
			side: THREE.DoubleSide,
			map: tex,
			visible: false
		});

		mesh = new THREE.Mesh(geometry, material);

		if (options && options.stereo) {
			if (options.stereo === 'vertical') {
				tex.repeat.y = 0.5;
			} else {
				tex.repeat.x = 0.5;
			}
			mesh.userData.stereo = options.stereo;
		}

		if (vid.readyState) {
			loadedMetadata();
		}

		this.play = function play() {
			playing = true;
			vid.play();
			return this;
		};

		this.pause = function pause() {
			playing = false;
			vid.pause();
			return this;
		};

		this.canPlayType = video.canPlayType;

		Object.defineProperty(this, 'width', {
			get: function () {
				return vid.videoWidth;
			}
		});

		Object.defineProperty(this, 'height', {
			get: function () {
				return vid.videoHeight;
			}
		});

		Object.defineProperty(this, 'paused', {
			get: function () {
				return !playing;
			}
		});

		Object.defineProperty(this, 'volume', {
			get: function () {
				return vid.volume;
			},
			set: function (vol) {
				vid.volume = vol;
			}
		});

		Object.defineProperty(this, 'muted', {
			get: function () {
				return vid.muted;
			},
			set: function (muted) {
				vid.muted = muted;
			}
		});

		Object.defineProperty(this, 'duration', {
			get: function () {
				return vid.duration || 0;
			}
		});

		Object.defineProperty(this, 'currentTime', {
			get: function () {
				return vid.currentTime;
			},
			set: function (currentTime) {
				if (vid.readyState && currentTime < vid.duration && currentTime >= 0) {
					vid.currentTime = currentTime;
				}
			}
		});

		[
			'loadedmetadata',
			'play',
			'pause',
			'playing',
			'progress'
		].forEach(function registerMediaEvent(event) {
			vid.addEventListener(event, self.emit.bind(self, event));
		});

		//sometimes video fails to play because it's too big. remove it and try again
		vid.addEventListener('error', function (evt) {
			if (vid.error.code === window.MediaError.MEDIA_ERR_DECODE && vid.childNodes.length > 1) {
				material.visible = false;
				vid.removeChild(vid.firstChild);
				vid.load();
			}

			self.emit(event, evt);
		}, true);

		this.element = vid;

		window.addEventListener('touchstart', function touchStart() {
			if (playing) {
				vid.play();
			} else {
				vid.load();
			}
			window.removeEventListener('touchstart', touchStart, true);
		}, true);

		//pause when window is hidden
		document.addEventListener('visibilitychange', visibilityChange);
		document.addEventListener('mozvisibilitychange', visibilityChange);
		document.addEventListener('msvisibilitychange', visibilityChange);
		document.addEventListener('webkitvisibilitychange', visibilityChange);

		mesh.name = 'video';
		parent.add(mesh);

		return mesh;
	};

	video.canPlayType = function canPlayType(type) {
		var element = document.createElement('video');
		return element.canPlayType(type);
	};

	return video;
}());