# Web VR Starter Kit

Web VR Starter Kit is a Javascript library for easily creating virtual reality content and making it available in web browsers on a range of devices. The library includes a simplified API for creating an manipulating 3D objects.

## Examples

- [Panorama](examples/panorama.html) - Loading a spherical panoramic photo
- [Sky](examples/sky.html) - A realistic daytime sky with movable sun and lighting
- [Sound](examples/sound.html) - Audio sources in 3D space, triggered by looking at objects
- [Near and Far](examples/near.html) - Fire events when an object moves close to or far away from the viewer

## Getting Started

### Set up

```html
<script src="//povdocs.github.io/webvr-starter-kit/build/vr.js"></script>
```

### Creating Objects

### Loading media

## API Reference

### Objects

todo: describe common options and methods for all objects

##### Options
- `name`
- `material`
- `color`

#### VR.box()

Create a cube.

##### Options

No options.

#### VR.cylinder()

Create a cylinder. You can also create a cone by change the radius at one end to zero.

##### Options
- `radiusTop` — Radius of the cylinder at the top. Default: 0.5
- `radiusBottom` — Radius of the cylinder at the bottom. Default: 0.5
- `height` — Height of the cylinder. Default: 1
- `radiusSegments` — Number of segmented faces around the circumference of the cylinder. Default: 16
- `heightSegments` — Number of rows of faces along the height of the cylinder. Default: 1
- `openEnded` — A Boolean indicating whether the ends of the cylinder are open or capped. Default: false (capped)

#### VR.sphere()

Create a sphere. Parts of spheres or slices can be created by specifying different values for `phiStart`, `phiLength`, `thetaStart` or `thetaLength`.

##### Options

- `radius` — sphere radius. Default: 0.5
- `widthSegments` — number of horizontal segments. (Minimum value is 3). Default: 16
- `heightSegments` — number of vertical segments. (Minimum value is 2). Default: 12
- `phiStart` — specify horizontal starting angle. Default: 0
- `phiLength` — specify horizontal sweep angle size. Default: PI * 2
- `thetaStart` — specify vertical starting angle. Default: 0
- `thetaLength` — specify vertical sweep angle size. Default: PI

#### VR.torus()

Create a torus (like a donut).

##### Options

- `radius` — Default: 0.5
- `tube` — Diameter of the tube. Default: 0.125 (i.e. 1/8th)
- `radialSegments` — Default: 12
- `tubularSegments` — Default: 16
- `arc` — Central angle, or how much around the center point the torus is filled in. Default: PI * 2

#### VR.floor()

##### Options

- `radius` — Radius of the circle. Default: 100
- `segments` — Number of segments. Default: 16

#### VR.image()

A plane displaying an image.

##### Options

- `src` - A url pointing to the image file

#### VR.panorama()

A very large sphere with an image displayed on the inside. This is useful for loading an image to be used as a sky or a landscape. It works best if most objects in the photo are far away.

Spherical photos can be taken with the [Android Camera](https://www.youtube.com/watch?v=NPs3eIiWRaw) or a [similar app](https://itunes.apple.com/us/app/photo-sphere-camera/id904418768?mt=8) on an iPhone. They can also be made [manually](https://photographylife.com/panoramic-photography-howto).

##### Options

- `src` - A url pointing to the image file

#### VR.empty()

An empty object, not displayed. Can be used to group other objects.

##### Options

No options.

### Object Methods

The following methods are available on all object types for manipulating the shape, size, material, orientation, position and any other aspects of that object.

All methods (except for ones that create child objects), return the object itself, so methods can be chained:

``` Javascript
// create a box, move it up 2 meters, and set the material to "wood"
VR.box().moveUp(2).setMaterial('wood');
```

#### hide()

Make the object invisible. All objects are visible by default.

#### show()

Make the object visible, if it was previously made invisible.

#### moveTo(x, y, z)
#### moveX(distance)
#### moveY(distance)
#### moveZ(distance)
#### moveUp(distance)
#### rotateX(radians)
#### rotateY(radians)
#### rotateZ(radians)
#### setMaterial(material)
#### setScale(x, y, z)

### Child Objects

Objects can be created as "child" of a parent object. This is useful for creating more complex objects out of the simple primitives or for moving groups of objects together. All the object creation methods listed above on the main `VR` object are available on every other object created.

The position, rotation and size of child objects will be re

#### Example

The "empty" object type is useful as an invisible parent object below which other objects can be grouped.

### Object Properties
- parent
- distance
- visible
- object
- position
- scale
- rotation
- quaternion
- material

### Utility Methods

#### VR.on(event, callback)

Certain types of "events" are available to notify your code when interesting things happen, such as the user looking at an object or shaking the phone. This method provides a way to specify the event type and a "callback function" to be run when the event occurs.

Events are listed below. Not all events are available on all devices.

##### Parameters

- `event` - A string representing the name of the event type to listen for
- `callback` - A function to be run when the event is triggered. The callback function may be given certain parameters, depending on the type of event

##### Events

- `lookat` - The viewer looked directly at an object. There is one parameter, `target`: the THREE.js object in question
- `lookaway` - The viewer looked away from an object. There is one parameter, `target`: the THREE.js object in question
- `shake` - The user shook the device. Mostly only works on mobile devices. Does not work on head-mounted displays.
- `fullscreenchange` - The view has either entered or exited full screen mode.
- `devicechange` - The device used to display and track orientation has been detected. There is one parameter, `mode`: a string representing the type of device. "devicemotion" for a mobile phone/tablet, "hmd" for a head-mounted display like the Oculus Rift. If there is no orientation device detected, like on a desktop computer without a head-mounted display, this event will not fire.

##### Example

When the user shakes the device, make the box invisible. Shake it again to bring it back.

``` Javascript
var box = VR.box();
VR.on('shake', function () {
    if (box.visble) {
        box.hide();
    } else {
        box.show();
    }
});
```

#### VR.off()

Prevent any previously registered event callbacks from running in the future.

##### Parameters

- `event` - A string representing the name of the event type.
- `callback` - A callback function previously registered with `VR.on()` with the same callback type. This callback will no longer be run for this method.

#### VR.animate()

This method can be passed a callback function, which is run every time a new frame is rendered. Objects in the scene can be animated by changing their position, scale or rotation according to how much time has passed since the last update.

##### Parameters

- `callback` - A function to be run on every frame. Receives two arguments: `delta`, the number of seconds since the last frame, and `time`, the current time in seconds

##### Example

Create a box and make it rotate, one full rotation per second.

``` Javascript
var box = VR.box();
VR.animate(function (delta) {
    box.rotateY(delta * Math.PI 2);
});
```

#### VR.end()

Stop any or all animation callbacks from running.

##### Parameters

- `callback` - The same function passed to `VR.animate` that you want to stop from running. This parameter is optional. If no function is passed, all animations will be stopped.

#### VR.vibrate()

Cause the device to vibrate, if the browser and hardware support it. This is most likely to be available on mobile devices running Android with Chrome or Firefox. If vibration is not supported, nothing will happen.

##### Parameters
- `pattern` - A pattern of [vibration and pause intervals](https://developer.mozilla.org/en-US/docs/Web/API/Navigator.vibrate). This can either be a number, representing the duration of a single vibration in milliseconds, or an array of numbers representing alternating vibrations and pauses in milliseconds.

##### Example

When the user looks at the box, vibrate once for one quarter of a second. When the user looks at the sphere, vibrate 'SOS' in Morse code.

``` Javascript
var box = VR.box().moveX(-2);
var sphere = VR.sphere().moveX(2);
VR.on('lookat', function (target) {
    if (target === box.object) {
        // 1/4 of 1000 milliseconds = 250 milliseconds
        VR.vibrate(250);
    } else if (target === sphere.object) {
        VR.vibrate([100, 30, 100, 30, 100, 200, 200, 30, 200, 30, 200, 200, 100, 30, 100, 30, 100]);
    }
});
```

#### VR.zeroSensor()

Reset the rotation of the viewer so that whichever direction they are looking at the time `VR.zeroSensor()` is called gets set back to the original "zero" direction they were facing when the web page loaded.

### Properties

The following properties are available on the global `VR` object.

#### VR.body

A `VRObject` representing the viewer. This object can be manipulated like any other object, and child objects can be attached to it, like a vehicle or tools. The body object can be moved around the scene to give the viewer different perspectives.

The body starts out 1.5 meters high and 4 meters back from the center point (0, 0, 0) of the scene.

**Warning**: Be careful about animating movement of the body, as it may cause motion sickness. It's best to constrain movement to the direction the viewer is looking. Any movement backwards or to the side should be slow. Starting and stopping of movement should be abrupt and the speed should remain constant, as acceleration in any direction is known to cause motion sickness.

#### VR.camera

A `VRObject` representing the camera. The camera is a child object of the body. It's best not to move, rotate or scale the camera. Instead, move the body.

Images or objects can be scaled down and attached to the front of the camera to act as a "heads up display."

#### VR.canvas

The HTML `canvas` element to which the scene is being rendered.

#### VR.materials

An object on which all material-related functions and properties are attached:

- `VR.materials.library` - an array of strings representing the names of built-in material presets
- `VR.materials.textures` - an array of `THREE.Texture` objects used by built-in materials

#### VR.scene

The `THREE.Scene` object that is the parent of all other three.js objects.

### Materials

- asphalt
- brick-tiles
- bricks
- checkerboard
- grass
- metal-floor
- metal
- stone
- tiles
- weathered-wood
- wood
