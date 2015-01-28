module.exports = (function () {
	'use strict';

	var THREE = require('three'),

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

		images = {};

	function imageTexture(src, mapping) {
		var image,
			parse,
			texture,
			isDataUri;

		parse = dataUri.exec(src);
		isDataUri = !!parse;
		if (!parse) {
			parse = urlRegex.exec(src);
		}

		if (!parse) {
			console.error('Invalid image URL: ' + src);
			return;
		}

		if (images[src]) {
			image = images[src];
		} else {
			image = document.createElement('img');
			if (parse[1] && parse[1] !== window.host || parse[2] && parse[2] !== window.port) {
				image.crossOrigin = 'anonymous';
			}
			image.src = src;
			images[src] = image;
		}

		texture = new THREE.Texture(undefined, mapping);

		if (image.naturalWidth || isDataUri) {
			texture.image = image;
			texture.needsUpdate = true;
		} else {
			image.addEventListener('load', function () {
				texture.image = image;
				texture.needsUpdate = true;
			});
		}

		return texture;
	}

	return {
		imageTexture: imageTexture
	};

	//var parse = urlRegex.exec('https://lh5.googleusercontent.com:80/-SNO8rWDqbUM/U085rfOBRuI/AAAAAAAAEdM/nWEWCtNceZ0/w955-h382-no/PANO_20130225_131211.jpg');
}());