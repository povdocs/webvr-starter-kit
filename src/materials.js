module.exports = (function () {
	'use strict';

	var THREE = require('three'),
		forEach = require('lodash.foreach'),
		assign = require('lodash.assign'),

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
			'(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' +
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
				color: 0x999999,
				specular: 0x111111,

				shininess: 100,
				shading: THREE.SmoothShading,

				repeat: 10,
				map: 'checkerboard.png'
			},
			'grass': {
				repeat: 12
			},
			'metal-floor': {
				repeat: 2
			},
			'metal': {
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
		materials = {
			standard: new THREE.MeshLambertMaterial(),
			textures: textures
		};

	function imageTexture(src, mapping, callback) {
		var image,
			parse,
			texture,
			isDataUri;

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
			texture.image = image;
			texture.needsUpdate = true;
			if (typeof callback === 'function') {
				setTimeout(callback.bind(null, texture, image), 1);
			}
		} else {
			image.addEventListener('load', function () {
				texture.image = image;
				texture.needsUpdate = true;
				if (typeof callback === 'function') {
					callback(texture, image);
				}
			});
		}

		return texture;
	}

	function material(options) {
		var opts,
			Material = materialTypes[options.type] || THREE.MeshLambertMaterial;

		function tex(fn) {
			if (typeof fn === 'string') {
				if (urlRegex.test(fn) || dataUri.test(fn)) {
					return imageTexture(fn);
				}

				fn = textures[fn];
			}
			if (typeof fn === 'function') {
				return fn();
			}

			return fn;
		}

		opts = assign({}, options);
		forEach({
			ambient: options.ambient || options.color,
			emissive: options.emissive || options.color,
			map: tex(options.map),
			specularMap: tex(options.specularMap),
			normalMap: tex(options.normalMap),
			alphaMap: tex(options.alphaMap),
			envMap: tex(options.envMap),
			lightMap: tex(options.lightMap)
		}, function (val, key) {
			if (val !== undefined) {
				opts[key] = val;
			}
		});

		return new Material(opts);
	}

	//figure out if script is loaded relative so we know where to find the images
	scriptIsRelative = (function () {
		var url,
			scripts;

		if (document.currentScript) {
			url = document.currentScript.src;
		} else {
			scripts = document.getElementsByTagName('script');
			url = scripts[scripts.length - 1].src;
		}

		return !urlRegex.test(url);
	}());

	materials.imageTexture = imageTexture;

	forEach(textureFiles, function (props, key) {
		function tex(file, options) {
			function imagePath(url) {
				if ((/^[a-z0-9\/\-]+\.(png|jpg)$/i).test(url)) {
					return (scriptIsRelative ? 'build/' : __PATH__) + url;
				}

				return url;
			}

			options = options || {};

			return function () {
				var texture = imageTexture(imagePath(require('./images/' + file)));
				if (options.repeat > 0) {
					texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
					texture.repeat.set(options.repeat, options.repeat);
				}
				return texture;
			};
		}

		var map = tex(props.map || key + '.jpg', props),
			materialDef;

		materialDef = {
			map: map,
			type: props.type
		};
		textures[key] = map;

		if (props.normalMap) {
			materialDef.normalMap = textures[key + '-normal'] = tex(props.normalMap, props);
		}

		if (props.specularMap) {
			materialDef.specularMap = textures[key + '-specular'] = tex(props.specularMap, props);
		}

		materials[key] = function (options) {
			var opts = assign({}, materialDef);
			assign(opts, options);

			return material(opts);
		};
	});

	return materials;

	//var parse = urlRegex.exec('https://lh5.googleusercontent.com:80/-SNO8rWDqbUM/U085rfOBRuI/AAAAAAAAEdM/nWEWCtNceZ0/w955-h382-no/PANO_20130225_131211.jpg');
}());