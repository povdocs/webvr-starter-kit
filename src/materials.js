module.exports = (function () {
	'use strict';

	var THREE = require('three'),
		forEach = require('lodash.foreach'),
		assign = require('lodash.assign'),

		iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g),

		// https://gist.github.com/dperini/729294
		//urlRegex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i,
		urlRegex = new RegExp(
			'^' +

			// protocol identifier
			'(?:(?:https?)://)' +

			// user:pass authentication
			'(?:\\S+(?::\\S*)?@)?' +
			'(?:' +

			// IP address exclusion
			// private & local networks
			'(' +
			'(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
			'(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
			'(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +

			// IP address dotted notation octets
			// excludes loopback network 0.0.0.0
			// excludes reserved space >= 224.0.0.0
			// excludes network & broacast addresses
			// (first & last IP address of each class)
			'(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
			'(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
			'(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
			'|' +

			// host name
			'(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +

			// domain name
			'(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +

			// TLD identifier
			'(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))?' +
			')' +

			')' +

			// port number
			'(?::(\\d{2,5}))?' +

			// resource path
			'(?:/\\S*)?' +
			'$', 'i'
		),

		dataUri = /^data:image\/(?:png|jpe?g|gif);/,
		scriptIsRelative = false,

		images = {},

		materialTypes = {
			lambert: THREE.MeshLambertMaterial,
			basic: THREE.MeshBasicMaterial,
			phong: THREE.MeshPhongMaterial,
			normal: THREE.MeshNormalMaterial,
			depth: THREE.MeshDepthMaterial
		},
		textureFiles = {
			'asphalt': {
				repeat: 12
			},
			'brick-tiles': {
				repeat: 2
			},
			'bricks': {
				type: 'phong',
				repeat: 4,
				normalMap: 'bricks-normal.jpg',
				specularMap: 'bricks-specular.jpg'
			},
			'checkerboard': {
				repeat: 10,
				map: 'checkerboard.png'
			},
			'grass': {
				repeat: 12
			},
			'metal-floor': {
				type: 'phong',
				shininess: 100,
				metal: true,

				repeat: 2
			},
			'metal': {
				type: 'phong',
				shininess: 100,
				metal: true,
				shading: THREE.SmoothShading,

				repeat: 2
			},
			'stone': {
				repeat: 8
			},
			'tiles': {
				repeat: 4
			},
			'weathered-wood': {
				repeat: 8
			},
			'wood': {
				repeat: 4
			}
		},
		textures = {},
		materials;

	function imageTexture(src, mapping, callback) {
		var image,
			parse,
			texture,
			isDataUri;

		function imageLoaded() {
			var scale,
				canvas,
				ctx,
				smallImage;

			/*
			iOS doesn't know how to handle large images. Even though the MAX_TEXTURE_SIZE
			may be 4096, it still breaks on images that large. So we scale them down.
			*/
			if (iOS && (image.naturalWidth > 2048 || image.naturalHeight > 2048)) {
				scale = 2048 / Math.max( image.naturalWidth, image.naturalHeight );

				canvas = document.createElement('canvas');
				canvas.width = Math.floor(image.naturalWidth * scale);
				canvas.height = Math.floor(image.naturalHeight * scale);

				ctx = canvas.getContext('2d');
				ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas.width, canvas.height);

				image = canvas;
			}

			texture.image = image;
			texture.needsUpdate = true;
			if (typeof callback === 'function') {
				setTimeout(callback.bind(null, texture, image), 1);
			}
		}

		parse = dataUri.exec(src);
		isDataUri = !!parse;
		if (!parse) {
			parse = urlRegex.exec(src);
		}

		// if (!parse) {
		// 	console.error('Invalid image URL: ' + src);
		// 	return;
		// }

		if (images[src]) {
			image = images[src];
		} else {
			image = document.createElement('img');
			if (parse && (parse[1] && parse[1] !== window.location.host || parse[2] && parse[2] !== window.location.port)) {
				image.crossOrigin = 'anonymous';
			}
			image.src = src;
			images[src] = image;
		}

		texture = new THREE.Texture(undefined, mapping);

		if (image.naturalWidth || isDataUri) {
			imageLoaded();
		} else {
			image.addEventListener('load', imageLoaded);
		}

		return texture;
	}

	function material(options) {
		var opts,
			Material = materialTypes[options.type] || THREE.MeshLambertMaterial;

		function threeTexture(fn) {
			if (typeof fn === 'string') {
				if (urlRegex.test(fn) || dataUri.test(fn)) {
					return imageTexture(fn);
				}

				fn = textures[fn];
			}
			if (typeof fn === 'function') {
				return fn(options);
			}

			return fn;
		}

		opts = assign({}, options);
		forEach({
			ambient: options.ambient || options.color,
			emissive: options.emissive || options.color,
			map: threeTexture(options.map),
			specularMap: threeTexture(options.specularMap),
			normalMap: threeTexture(options.normalMap),
			alphaMap: threeTexture(options.alphaMap),
			envMap: threeTexture(options.envMap),
			lightMap: threeTexture(options.lightMap)
		}, function (val, key) {
			if (val !== undefined) {
				opts[key] = val;
			}
		});

		delete opts.type;

		return new Material(opts);
	}

	//figure out if script is loaded relative so we know where to find the images
	scriptIsRelative = (function () {
		var url,
			scripts;

		if (document.currentScript) {
			url = document.currentScript.getAttribute('src');
		} else {
			scripts = document.getElementsByTagName('script');
			url = scripts[scripts.length - 1].getAttribute('src');
		}

		return !urlRegex.test(url);
	}());

	materials = {
		standard: function () {
			return new THREE.MeshLambertMaterial();
		},
		textures: textures,
		imageTexture: imageTexture,
		material: material,
		library: ['standard']
	};

	forEach(textureFiles, function (props, key) {
		function textureFactory(file, options) {
			function imagePath(url) {
				if ((/^[a-z0-9\/\-]+\.(png|jpg)$/i).test(url)) {
					return (scriptIsRelative ? '/build/' : __ASSET_PATH__) + url;
				}

				return url;
			}

			options = options || {};

			return function (opts) {
				var texture = imageTexture(imagePath(require('./images/' + file)));

				opts = assign({}, options, opts);

				if (opts.repeat) {
					if (opts.repeat > 0) {
						texture.repeat.set(opts.repeat, opts.repeat);
					} else if (opts.repeat instanceof THREE.Vector2) {
						texture.repeat.copy(opts.repeat);
					}
					texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				}
				return texture;
			};
		}

		var map = textureFactory(props.map || key + '.jpg', props),
			materialDef;

		materialDef = assign({}, props, {
			map: map
		});
		textures[key] = map;

		if (props.normalMap) {
			materialDef.normalMap = textures[key + '-normal'] = textureFactory(props.normalMap, props);
		}

		if (props.specularMap) {
			materialDef.specularMap = textures[key + '-specular'] = textureFactory(props.specularMap, props);
		}

		materials.library.push(key);
		materials[key] = function (options) {
			var opts = assign({}, materialDef, options);

			return material(opts);
		};
	});

	return materials;

	//var parse = urlRegex.exec('https://lh5.googleusercontent.com:80/-SNO8rWDqbUM/U085rfOBRuI/AAAAAAAAEdM/nWEWCtNceZ0/w955-h382-no/PANO_20130225_131211.jpg');
}());