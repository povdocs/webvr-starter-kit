module.exports = (function () {
	'use strict';

	var materials = require('./materials'),
		THREE = require('three');

	function VRObject(parent, creator, options) {
		var material,
			object,
			self = this;

		options = options || {};

		//todo: get material from options
		this.object = object = creator(parent, options);
		this.parent = this.object.parent || parent;

		if (object instanceof THREE.Mesh) {
			if (options.castShadow !== false) {
				object.castShadow = true;
			}
			if (options.receiveShadow !== false) {
				object.receiveShadow = true;
			}
		}

		if (options.name !== undefined) {
			object.name = options.name;
		}

		object.position.set(
			parseFloat(options.x) || 0,
			parseFloat(options.y) || 0,
			parseFloat(options.z) || 0
		);

		this.setMaterial(options.material);

		if (options.color) {
			material = object.material;
			if (material === materials.standard) {
				material = this.object.material = material.clone();
			}
			material.color = new THREE.Color(options.color);
			material.ambient = material.color;
		}

		['position', 'scale', 'rotation', 'quaternion', 'material'].forEach(function (prop) {
			if (prop in object) {
				self[prop] = object[prop];
			}
		});
	}

	VRObject.prototype.hide = function () {
		this.object.visible = false;
		return this;
	};

	VRObject.prototype.show = function () {
		this.object.visible = true;
		return this;
	};

	VRObject.prototype.moveTo = function (x, y, z) {
		var position = this.object.position;

		x = !isNaN(x) ? x : position.x;
		y = !isNaN(y) ? y : position.y;
		z = !isNaN(z) ? z : position.z;

		position.set(x, y, z);

		return this;
	};

	VRObject.prototype.setScale = function (x, y, z) {
		var scale = this.object.scale;

		if (x !== undefined && !isNaN(x)) {
			if (y === undefined && z === undefined) {
				y = z = x;
			} else {
				x = scale.x;
			}
		}

		x = !isNaN(x) ? x : scale.x;
		y = !isNaN(y) ? y : scale.y;
		z = !isNaN(z) ? z : scale.z;

		scale.set(x, y, z);

		return this;
	};

	VRObject.prototype.setMaterial = function (material) {
		if (material && this.object instanceof THREE.Mesh) {
			if (typeof material === 'function') {
				material = material();
			} else if (typeof material === 'string' && materials[material]) {
				material = materials[material]();
			} else if (material && !material instanceof THREE.Material && typeof material !== 'number') {
				try {
					material = materials(material);
				} catch (e) {}
			}
			this.object.material = material || this.object.material;
		}

		return this;
	};

	VRObject.prototype.update = function () {};

	VRObject.repeat = function (count, options) {
		var i,
			change = false,
			lastObject = this,
			currentPosition = new THREE.Vector3(),
			deltaPosition = new THREE.Vector3(),
			currentQuaternion = new THREE.Quaternion(),
			deltaQuaternion = new THREE.Quaternion();

		if (!options) {
			return;
		}

		if (options.offset) {}

		for (i = 0; i < count; i++) {

		}
	};

	return VRObject;

}());