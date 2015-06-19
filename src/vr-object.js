module.exports = (function () {
	'use strict';

	var	NEAR_DISTANCE = 3,
		materials = require('./materials'),
		THREE = require('three'),
		eventEmitter = require('event-emitter'),

		xAxis = new THREE.Vector3(1, 0, 0),
		yAxis = new THREE.Vector3(0, 1, 0),
		zAxis = new THREE.Vector3(0, 0, 1),

		scratchVector1 = new THREE.Vector3(),
		scratchVector2 = new THREE.Vector3(),

		allObjects = window.WeakMap ? new window.WeakMap() : {};

	function distance(object, origin) {
		var geometry;

		geometry = object.geometry;

		//assumes object world matrix has been updated
		scratchVector1.setFromMatrixPosition(origin.matrixWorld);

		if (!geometry) {
			//first convert to world coordinate
			scratchVector2.setFromMatrixPosition(object.matrixWorld);
			return scratchVector2.distanceTo(scratchVector1);
		}

		geometry.computeBoundingBox();
		object.worldToLocal(scratchVector1);
		return object.geometry.boundingBox.distanceToPoint(scratchVector1);
	}

	function VRObject(parent, creator, camera, options) {
		var material,
			object,
			self = this,

			isNear = false,
			isTarget = false,
			raycaster;

		options = options || {};

		eventEmitter(this);

		if (camera) {
			// raycaster = new THREE.Raycaster();

			this.update = function () {
				var wasNear = isNear,
					wasTarget = isTarget,

					intersects, intersect, i;

				isNear = self.distance < NEAR_DISTANCE;
				if (isNear !== wasNear) {
					if (isNear) {
						self.emit('near', self);
					} else {
						self.emit('far', self);
					}
				}

				/*
				raycaster.ray.origin.copy(origin);
				raycaster.ray.direction.set(0, 0, 0.5).unproject(camera).sub(origin).normalize();

				//todo: consider whether this needs to be recursive. maybe a different event
				intersects = raycaster.intersectObject(object);
				if (intersects.length) {
					isTarget = true;
					if (!wasTarget) {
						self.emit('target-on', intersects[0]);
					}
				} else if (wasTarget) {
					self.emit('target-off');
				}
				*/
			};
		}

		//todo: get material from options
		this.object = object = creator.call(this, parent, options);
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
		self.name = object.name;

		if (allObjects.set) {
			allObjects.set(object, this);
			// allObjects.set(object.id, this);
		} else {
			allObjects[object.id] = this;
		}

		object.position.set(
			parseFloat(options.x) || 0,
			parseFloat(options.y) || 0,
			parseFloat(options.z) || 0
		);

		this.setMaterial(options.material);

		if (options.color) {
			material = object.material;
			material.color = new THREE.Color(options.color);
			material.ambient = material.color;
		}

		['position', 'scale', 'rotation', 'quaternion', 'material'].forEach(function (prop) {
			if (prop in object && !self[prop]) {
				self[prop] = object[prop];
			}
		});

		Object.defineProperty(this, 'visible', {
			set: function (val) {
				self.object.visible = !!val;
			},
			get: function () {
				return self.object.visible;
			}
		});

		Object.defineProperty(this, 'distance', {
			get: function () {
				return distance(self.object, camera || parent);
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

	VRObject.prototype.moveX = function (distance) {
		this.object.translateX(distance);
		return this;
	};

	VRObject.prototype.moveY = function (distance) {
		this.object.translateY(distance);
		return this;
	};
	VRObject.prototype.moveUp = VRObject.prototype.moveY;
	VRObject.prototype.moveDown = function (distance) {
		this.moveY(-distance);
		return this;
	};

	VRObject.prototype.moveZ = function (distance) {
		this.object.translateZ(distance);
		return this;
	};

	VRObject.prototype.rotateX = function (angle) {
		this.object.rotateOnAxis(xAxis, angle);
		return this;
	};

	VRObject.prototype.rotateY = function (angle) {
		this.object.rotateOnAxis(yAxis, angle);
		return this;
	};

	VRObject.prototype.rotateZ = function (angle) {
		this.object.rotateOnAxis(zAxis, angle);
		return this;
	};

	VRObject.prototype.setScale = function (x, y, z) {
		var scale = this.object.scale;

		if (x !== undefined && !isNaN(x)) {
			if (y === undefined && z === undefined) {
				y = z = x;
			}
		}

		x = !isNaN(x) ? x : scale.x;
		y = !isNaN(y) ? y : scale.y;
		z = !isNaN(z) ? z : scale.z;

		scale.set(x, y, z);

		return this;
	};

	VRObject.prototype.setMaterial = function (material, options) {
		if (material && this.object instanceof THREE.Mesh) {
			if (typeof material === 'function') {
				material = material();
			} else if (typeof material === 'string' && materials[material]) {
				material = materials[material](options);
			} else if (material && !(material instanceof THREE.Material) && typeof material !== 'number') {
				try {
					material = materials.material(material);
				} catch (e) {}
			}

			if (material instanceof THREE.Material) {
				this.object.material = material;
			}
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

	VRObject.findObject = function (object) {
		if (object instanceof VRObject) {
			return object;
		}

		if (object && object instanceof THREE.Object3D) {
			if (allObjects.get) {
				return allObjects.get(object);
			}

			return allObjects[object.id];
		}

		// if (typeof object === 'number') {
		// 	return allObjects[object];
		// }
	};

	return VRObject;

}());