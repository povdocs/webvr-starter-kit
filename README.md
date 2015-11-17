# Web VR Starter Kit

Web VR Starter Kit is a Javascript library for easily creating virtual reality content and making it available in web browsers on a range of devices. The library includes a simplified API for creating an manipulating 3D objects.

## Examples

- [Panorama](https://povdocs.github.io/webvr-starter-kit/examples/panorama.html) - Loading a spherical panoramic photo
- [Animation](https://povdocs.github.io/webvr-starter-kit/examples/animation.html) - Simple animation, moving and rotating objects
- [Sky](https://povdocs.github.io/webvr-starter-kit/examples/sky.html) - A realistic daytime sky with movable sun and lighting
- [Sound](https://povdocs.github.io/webvr-starter-kit/examples/sound.html) - Audio sources in 3D space, triggered by looking at objects
- [Video](https://povdocs.github.io/webvr-starter-kit/examples/video.html) - A video playing on a flat surface.
- [Near and Far](https://povdocs.github.io/webvr-starter-kit/examples/near.html) - Fire events when an object moves close to or far away from the viewer
- [3D Panorama](https://povdocs.github.io/webvr-starter-kit/examples/panorama3d.html) - Loading a stereoscopic spherical panoramic photo
- [3D Spherical Video](https://povdocs.github.io/webvr-starter-kit/examples/video-sphere.html) - A stereoscopic spherical video
- [Text](https://povdocs.github.io/webvr-starter-kit/examples/text.html) - 2D text in 3D space

## Getting Started

To create a virtual reality scene, include the WebVR Starter Kit JavaScript file as a script tag in a webpage. The script will bootstrap an empty scene with controls for display and view-tracking options, depending on the hardware available.

WebVR requires a browser with WebGL support. The following device configurations are supported for display and head/view tracking:
- Oculus Rift - requires [Firefox Nightly](http://mozvr.com) or [WebVR build of Chromium](http://blog.bitops.com/blog/2014/06/26/first-steps-for-vr-on-the-web/)
- Google Cardboard - Device orientation tracking; split-screen rendering a view for each eye.
- Mobile phone/tablet - single view, control view with device orientation tracking or touch/drag
- Desktop browser - single view, control view by dragging with mouse

### Set up

The quickest way to get started is to load the [empty JS Bin template](https://jsbin.com/wemipo/1/edit?js,output) and start writing commands in the JavaScript panel. As you type, the output panel will automatically reload every time you make a change. You can pop the output panel out into its own window to view in full screen or on an Oculus Rift (if available), or you can load the output page on a mobile device.

Alternatively, you can start with a blank web page hosted on your own server. Include the following script element anywhere in the page.

```html
<script src="//povdocs.github.io/webvr-starter-kit/build/vr.js"></script>
```

Create another script element containing the JavaScript commands that describe your scene. You can either include the script "inline" right in the same web page, or you can refer to an external JavaScript file. Just make sure this script element is placed *after* the one loading "vr.js".

```html
<script>
	VR.floor(); //make a floor
</script>
```

### Creating Objects

### Loading Media

There are a few different ways that you can load media as part of your VR scene. The `panorama` and `image` objects take the URL of an image file. The `sound` object takes an array of URLs of audio files, and the `video` object takes an array of URLs of video files. There is a library of pre-defined materials (e.g. grass, stone, metal, wood), and you can also specify your own images to use as texture maps.

Texture maps for pre-defined materials are hosted as part of the WebVR Starter Kit, but your own media files need to be hosted elsewhere. You can use your own web server if you have one, but it needs to be configured to use Cross-Origin Resource Sharing headers, which can be tricky to set up.

There are some free services you can use to host your media with the correct server settings.

#### imgur.com

If you have an image you want to use, you can upload it to [imgur.com](https://imgur.com). Once the image is uploaded, follow the link to share it and look for the "direct" image URL. That will link directly to the png or jpg file, and it's the URL to use in your code.

You can also use any image that's already hosted on imgur, but check the copyright terms on the site and on the particular image.

#### Dropbox

If you have a Dropbox account, you can copy your media files into your "Public" folder. Log into Dropbox through their website and browse to the Public folder. Click on the file you want to use for a prompt to view the public URL of that file. Unlike imgur, Dropbox can host audio and video files.

#### Internet Archive

todo: archive.org

### Using three.js

The simplified API is a wrapper for [three.js](https://github.com/mrdoob/three.js), a JavaScript library for creating 3D scenes using WebGL. three.js is more powerful than the WebVR Starter Kit API, but more difficult to use. If you prefer, you can use three.js directly to build your scene, but you will not be able to use the wrapper objects on any objects you create with three.js.

If you prefer to use the simplified API for part of your code and use three.js for a limited set of advanced operations, each object created has a `.object` property that points to its three.js object.

```javascript
var box = VR.box();
console.log(box.object instanceof THREE.Mesh); // true
```

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

#### VR.video()

A plane displaying a video.

##### Options

- `src` - A url or array of urls pointing to the video file(s). Provide multiple sources for different formats to support all browsers.

##### Methods and Properties

Video objects have some unique methods and properties for inspecting and controlling the state of the video.

###### play()

Play the video.

###### pause()

Pause the video.

###### canPlayType(type)

Pass a mime type (e.g. `"video/webm"`) to determine whether the video can play a given format.

###### currentTime

The current time within the video (in seconds) of the play head. (Read only)

###### duration

The total duration of the video in seconds. This value is not known until the video starts loading. (Read only)

###### volume

The volume level of the video. It can be set to any value between 0 and 1.

###### height

The height in pixels of the video source. This value is not known until the video starts loading. (Read only)

###### width

The width in pixels of the video source. This value is not known until the video starts loading. (Read only)

###### paused

A boolean value that reports whether the video is paused (true) or playing (false). (Read only)

##### Notes on compatibility

Safari and Internet Explorer cannot display cross-origin videos, i.e. files served from a different web server than the web page. So you must host the web page on your own server if you want to use video on all browsers. JSBin will not work.

Mobile Safari is only capable of playing one video at a time, and only on iPad.

#### VR.panorama()

A very large sphere with an image displayed on the inside. This is useful for loading an image to be used as a sky or a landscape. It works best if most objects in the photo are far away.

Spherical photos can be taken with the [Android Camera](https://www.youtube.com/watch?v=NPs3eIiWRaw) or a [similar app](https://itunes.apple.com/us/app/photo-sphere-camera/id904418768?mt=8) on an iPhone. They can also be made [manually](https://photographylife.com/panoramic-photography-howto).

Stereoscopic (3D) panoramas can be displayed by setting the `stereo` option, if the left and right eye views are included side-by-side or vertically in the same image file.

##### Options

- `src` - A url pointing to the image file
- `stereo` - a string, either "horizontal" or "vertical" (optional).

#### VR.text()

Creates two-dimensional text. Observes new-line characters.

##### Options

- `text` - a string representing the text to render
- `font` - a string, the font style, size and family
- `textAlign` - 'left', 'right', 'center', 'justify', 'start' or 'end'
- `textBaseline` - 'top', 'hanging', 'middle', 'alphabetic', 'ideographic' or 'bottom'
- `direction` - 'ltr' (left to right) or 'rtl' (right to left)
- `fillStyle` - same as the [2d canvas property](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle)
- `wrap` - the maximum width of the text object in meters. Any text longer than this will wrap to the next line.
- `resolution` - the number of "pixels" equivalent to 1 meter in 3D space. Making this number higher will increase the fidelity of the text but will also require making the font size proportionally larger. (default is 256)

##### Properties

###### width

The width of the object containing the text. This will depend on the length of the text, the font size and the `wrap` setting.

###### height

The height of the object containing the text. This will depend on the length of the text, the number of lines and the font size.

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
- inView
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

## License
- Original code is made avalable under [MIT License](http://www.opensource.org/licenses/mit-license.php), Copyright (c) 2015 American Documentary Inc.
- Texture images are made available under their respective [licenses](LICENSE.md).

## Author
Code, concept and design by [Brian Chirls](https://github.com/brianchirls), [POV](http://www.pbs.org/pov/) Digital Technology Fellow
