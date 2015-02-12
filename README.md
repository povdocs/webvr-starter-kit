# Web VR Starter Kit

## Commands

### Objects

todo: describe common options and methods for all objects

#### VR.box()

Create a cube.

##### Options: none

#### VR.cylinder()

Create a cylinder. You can also create a cone by change the radius at one end to zero.

##### Options:
- `radiusTop` — Radius of the cylinder at the top. Default: 0.5
- `radiusBottom` — Radius of the cylinder at the bottom. Default: 0.5
- `height` — Height of the cylinder. Default: 0.5
- `radiusSegments` — Number of segmented faces around the circumference of the cylinder. Default: 16
- `heightSegments` — Number of rows of faces along the height of the cylinder. Default: 1
- `openEnded` — A Boolean indicating whether the ends of the cylinder are open or capped. Default: false (capped)

#### VR.sphere()

Create a sphere. Parts of spheres or slices can be created by specifying different values for `phiStart`, `phiLength`, `thetaStart` or `thetaLength`.

##### Options:

- `radius` — sphere radius. Default: 0.5
- `widthSegments` — number of horizontal segments. (Minimum value is 3). Default: 16
- `heightSegments` — number of vertical segments. (Minimum value is 2). Default: 12
- `phiStart` — specify horizontal starting angle. Default: 0
- `phiLength` — specify horizontal sweep angle size. Default: PI * 2
- `thetaStart` — specify vertical starting angle. Default: 0
- `thetaLength` — specify vertical sweep angle size. Default: PI

#### VR.torus()

Create a torus (like a donut).

##### Options:

- `radius` — Default: 0.5
- `tube` — Diameter of the tube. Default: 0.125 (i.e. 1/8th)
- `radialSegments` — Default: 12
- `tubularSegments` — Default: 16
- `arc` — Central angle, or how much around the center point the torus is filled in. Default: PI * 2

#### VR.floor()

##### Options:

- `widthSegments` — Default: 1
- `heightSegments` — Default: 1

#### VR.image()

A plane displaying an image.

##### Options:

- `src` - A url pointing to the image file

#### VR.panorama()

A very large sphere with an image displayed on the inside. This is useful for loading an image to be used as a sky or a landscape. It works best if most objects in the photo are far away.

Spherical photos can be taken with the [Android Camera](https://www.youtube.com/watch?v=NPs3eIiWRaw) or a [similar app](https://itunes.apple.com/us/app/photo-sphere-camera/id904418768?mt=8) on an iPhone. They can also be made [manually](https://photographylife.com/panoramic-photography-howto).

##### Options:

- `src` - A url pointing to the image file

#### VR.empty()

An empty object, not displayed. Can be used to group other objects.

##### Options: none

### Object Methods

The following methods are available on all object types for manipulating the shape, size, material, orientation, position and any other aspects of that object.

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

#### Examples

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

##### Examples

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

##### Parameters:

- `event` - A string representing the name of the event type.
- `callback` - A callback function previously registered with `VR.on()` with the same callback type. This callback will no longer be run for this method.

#### VR.animate()

This method can be passed a callback function, which is run every time a new frame is rendered. Objects in the scene can be animated by changing their position, scale or rotation according to how much time has passed since the last update.

##### Parameters:

- `callback` - A function to be run on every frame. Receives two arguments: `delta`, the number of seconds since the last frame, and `time`, the current time in seconds

##### Examples:

Create a box and make it rotate, one full rotation per second.

``` Javascript
var box = VR.box();
VR.animate(function (delta) {
    box.rotateY(delta * Math.PI 2);
});
```

#### VR.end()

Stop any or all animation callbacks from running.

##### Parameters:

- `callback` - The same function passed to `VR.animate` that you want to stop from running. This parameter is optional. If no function is passed, all animations will be stopped.

#### VR.vibrate()

Cause the device to vibrate, if the browser and hardware support it. This is most likely to be available on mobile devices running Android with Chrome or Firefox. If vibration is not supported, nothing will happen.

##### Parameters:
- `pattern` - A pattern of [vibration and pause intervals](https://developer.mozilla.org/en-US/docs/Web/API/Navigator.vibrate). This can either be a number, representing the duration of a single vibration in milliseconds, or an array of numbers representing alternating vibrations and pauses in milliseconds.

##### Examples:

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

- VR.body
- VR.camera
- VR.canvas
- VR.materials
- VR.scene
- VR.target

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
