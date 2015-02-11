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

Spherical photos can be taken with the [Android Camera](https://www.youtube.com/watch?v=NPs3eIiWRaw) or a [similar app](https://itunes.apple.com/us/app/photo-sphere-camera/id904418768?mt=8) on an iPhone.

##### Options:

- `src` - A url pointing to the image file

#### VR.empty()

An empty object, not displayed. Can be used to group other objects.

##### Options: none

### Utility Methods

#### VR.animate()

This method can be passed a callback function, which is run every time a new frame is rendered. Objects in the scene can be animated by changing their position, scale or rotation according to how much time has passed since the last update.

##### Options:

- `callback` - A function to be run on every frame

##### Examples:

#### VR.end()
#### VR.render()
#### VR.requestFullScreen()
#### VR.resize()
#### VR.vibrate()
#### VR.zeroSensor()

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
