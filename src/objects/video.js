module.exports = (function () {
	'use strict';

	var THREE = require('three'),
		urlRegex = require('../utils/urlregex'),
		video;

	video = function (parent, options) {
		var geometry,
			material,
			mesh,
			vid,
			tex,
			playing = false,
			self = this;

		function loadedMetadata() {
			//todo: don't do any of this if object has been deleted

			geometry.applyMatrix(new THREE.Matrix4().makeScale(1, vid.videoHeight / vid.videoWidth, 1));
			material.map = tex;
			material.visible = true;
			mesh.visible = true;
			if (playing) {
				vid.play();
			}
		}

		function setSource(sources) {
			sources.forEach(function (src) {
				var parse,
					source;

				parse = urlRegex.exec(src);
				if (!parse) {
					return;
				}

				if (parse[1] && parse[1] !== window.location.hostname ||
						parse[2] && parse[2] !== window.location.port) {

					if (vid.crossOrigin !== undefined) {
						vid.crossOrigin = 'anonymous';
					} else {
						console.warn('Browser does not support cross-origin video');
						return;
					}
				}
				source = document.createElement('source');
				source.src = src;
				vid.appendChild(source);
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

		tex = new THREE.VideoTexture(vid);
		tex.minFilter = THREE.LinearFilter;
		tex.format = THREE.RGBFormat;
		tex.generateMipmaps = false;

		geometry = new THREE.PlaneBufferGeometry(1, 1, 8);

		material = new THREE.MeshBasicMaterial({
			side: THREE.DoubleSide,
			map: tex
		});

		mesh = new THREE.Mesh( geometry, material );

		mesh.visible = false;
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
			'loaded',
			'error'
		].forEach(function registerMediaEvent(event) {
			vid.addEventListener(event, self.emit.bind(self, event));
		});

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

		parent.add(mesh);

		return mesh;
	};

	video.canPlayType = function canPlayType(type) {
		var element = document.createElement('video');
		return element.canPlayType(type);
	};

	return video;
}());