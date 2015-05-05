module.exports = (function () {
	'use strict';

	var THREE = require('three'),
		fontSizeRegex = /(\d+)px/i,
		newLineRegex = /[\n\r]/,
		spaceRegex = /[\t ]/,
		log2 = Math.log(2);

	return function text(parent, options) {
		var self = this,
			geometry,
			material,
			canvas,
			ctx,
			mesh,
			container,
			src,
			textWidth = 0,
			textHeight = 0,
			props = {
				text: '',
				font: '80px sans-serif',
				textAlign: 'center',
				textBaseline: '',
				direction: '',
				fillStyle: 'white',
				resolution: 256, //pixels per meter
				wrap: 5 //in meters
			},
			tex;

		function nextPowerOfTwo(n) {
			return Math.pow(2, Math.ceil(Math.log(n) / log2));
		}

		function Line(word) {
			this.spaceWidth = ctx.measureText(' ').width;
			this.totalWidth = 0;
			this.wordsWidth = 0;
			this.words = [];
			this.wrap = false;
			if (word) {
				this.add(word);
			}
		}

		Line.prototype.text = function () {
			return this.words.join(' ');
		};

		Line.prototype.add = function(word) {
			var wordWidth;
			if (this.words.length) {
				this.totalWidth += this.spaceWidth;
			}
			this.words.push(word);
			wordWidth = Line.measure(word);
			this.totalWidth += wordWidth;
			this.wordsWidth += wordWidth;
		};

		Line.prototype.measure = function(word) {
			var width = this.totalWidth;
			if (word) {
				width += Line.measure(word);
				if (this.words.length) {
					width += this.spaceWidth;
				}
			}
			return width;
		};

		Line.measure = function(word) {
			return ctx.measureText(word).width;
		};

		function update() {
			//text stuffs
			var text,
				word = '',
				letter,
				isSpace,
				line,
				lines = [],
				parse,

				//layout
				direction = getComputedStyle(document.body).direction,
				inherit,
				resolution = parseFloat(props.resolution) || 256,
				wrap,
				fontSize,
				padding,

				//measurements
				lineHeight,
				i, start, y, measure,
				width,
				height = 0;

			wrap = parseFloat(props.wrap);
			if (isNaN(wrap) || wrap < 0) {
				wrap = 5;
			}
			width = resolution * wrap;

			ctx.font = props.font;
			parse = fontSizeRegex.exec(ctx.font);
			fontSize = parseFloat(parse && parse[1]) || 50;

			lineHeight = fontSize * 1.5;

			line = new Line();

			text = props.text === 0 ? '0' : String(props.text || '');
			if (wrap) {
				text = text.trim() + ' ';
				for (i = 0; i < text.length; i++) {
					letter = text.charAt(i);
					if (newLineRegex.test(letter)) {
						line.add(word);
						word = '';
						line = new Line();
					} else if (spaceRegex.test(letter)) {
						measure = line.measure(word);
						if (measure < width) {
							if (line) {
								line.add(word);
							} else {
								line = new Line(word);
							}
						} else if (!line && Line.measure(word) >= width) {
							//one very long word
							lines.push(new Line(word));
							word = '';
							line = new Line();
						} else {
							line.wrap = true;
							lines.push(line);
							line = new Line(word);
						}
						word = '';
					} else {
						word += letter;
					}
				}
				if (line) {
					lines.push(line);
				}
			} else {
				lines.push(new Line(text));
			}

			width = lines.reduce(function (previous, line) {
				return Math.max(previous, line.totalWidth);
			}, 0);
			width = Math.min(width, 2048);

			height = lines.length * lineHeight;
			canvas.width = nextPowerOfTwo(width);
			canvas.height = nextPowerOfTwo(height);
			mesh.scale.set(canvas.width / resolution, canvas.height / resolution, 1);

			//debug
			// ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
			// ctx.fillRect(0, 0, canvas.width, canvas.height);
			// document.body.appendChild(canvas);
			// canvas.style.cssText = 'position: absolute; width: auto !important; height: auto !important; max-width: 80%';

			/*
			set all these properties again because they get reset
			when you resize the canvas
			*/
			ctx.font = props.font;
			ctx.textAlign = props.textAlign;
			ctx.textBaseline = props.textBaseline;
			ctx.direction = props.direction;
			ctx.fillStyle = props.fillStyle;
			//todo: add maxWidth?

			padding = (canvas.width - width) / 2;
			y = (canvas.height - height) / 2 + lineHeight / 2;

			inherit = (ctx.direction === '' || ctx.direction === 'inherit');
			if (ctx.textAlign === 'center') {
				start = canvas.width / 2;
			} else if (ctx.textAlign === 'right' ||
				ctx.textAlign === 'end' && (ctx.direction === 'ltr' || inherit && direction === 'ltr') ||
				ctx.textAlign === 'start' && (ctx.direction === 'rtl' || inherit && direction === 'rtl')) {

				start = canvas.width - padding;
			} else {
				start = padding;
			}

			lines.forEach(function (line) {
				var x,
					space;
				if (props.textAlign === 'justify' && line.wrap && line.words.length > 1) {
					x = start;
					space = (width - line.wordsWidth) / (line.words.length - 1);
					line.words.forEach(function (word) {
						ctx.fillText(word, x, y);
						x += space + Line.measure(word);
					});
				} else {
					ctx.fillText(line.text(), start, y);
				}
				y += lineHeight;
			});

			textWidth = width / resolution;
			textHeight = lines.length * lineHeight / resolution;

			tex.needsUpdate = true;

			mesh.name = text.trim();
		}

		canvas = document.createElement('canvas');
		ctx = canvas.getContext('2d');
		tex = new THREE.Texture(canvas);
		tex.minFilter = THREE.LinearMipMapLinearFilter;
		tex.generateMipmaps = true;

		geometry = new THREE.PlaneBufferGeometry(1, 1);

		material = new THREE.MeshBasicMaterial({
			side: THREE.DoubleSide,
			transparent: true,
			map: tex
		});

		mesh = new THREE.Mesh(geometry, material);

		container = new THREE.Object3D();
		container.name = 'text';
		container.add(mesh);
		parent.add(container);

		if (typeof options === 'string') {
			props.text = options;
		} else if (options) {
			Object.keys(props).forEach(function (key) {
				props[key] = options[key] || props[key];
			});
		}
		update();

		Object.keys(props).forEach(function (key) {
			Object.defineProperty(self, key, {
				get: function () {
					return props[key];
				},
				set: function (val) {
					props[key] = val;
					update();
				}
			});
		});

		Object.defineProperty(self, 'width', {
			get: function () {
				return textWidth;
			}
		});

		Object.defineProperty(self, 'height', {
			get: function () {
				return textHeight;
			}
		});

		return container;
	};
}());