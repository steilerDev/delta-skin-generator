# Skin Maker for delta-skins

This tool defines a component based framework for creating emulator Skins in the `.deltaskins` format (supported by [Delta](https://github.com/rileytestut/Delta) and [Ignited](https://github.com/LitRitt/Ignited)). These skins can be designed in a standard vector editor and by providing annotations to the source can be transformed into skins.

Development is still ongoing - this tool is not working yet!

## Approach

- Create config file specifying general properties (see [available options](https://noah978.gitbook.io/delta-docs/skins#the-info.json))
```
{
    "name" : "PokeMaxDS",
    "identifier" : "dev.steiler.skins.PokeMaxDS",
    "gameTypeIdentifier" : "com.rileytestut.delta.game.ds",
    "debug" : false
}
```

- Create file structure
```
"representations"
- "iphone"
  - "standard"
    - "portrait.svg"
    - "portrait-alt.svg"
    - "landscape.svg"
    - "landscape-alt.svg"
  - "edgeToEdge"
    - "portrait.svg"
    - "portrait-alt.svg"
    - "landscape.svg"
    - "landscape-alt.svg"
- "ipad"
  - "standard"
    - "portrait.svg"
    - "portrait-alt.svg"
    - "landscape.svg"
    - "landscape-alt.svg"
  - "splitView"
    - "portrait.svg"
    - "portrait-alt.svg"
    - "landscape.svg"
    - "landscape-alt.svg"
"components"
- "componentA.svg"
- ...
"elementConfig"
- "elementConfig.json"
```

## Representations
Each representation is a viewport that the skin will be displayed in. Each representation has a platform (iPhone or iPad) and a size class (`standard` for iPhone with Home Button or regular iPads, `edgeToEdge` for iPhones without Home Button and `splitView` for iPad) and can have multiple orientations (portrait and landscape) as well as alt skins. Each representation should be an SVG file in the correct resolution, containing embedded graphics that will be rendered on the screen

### Class Names
Each rectangle within a representation can have a description field to enable manipulation by this tool. The following layout is possible:
```
"/(@component\/<componentName>)?(@element\/<elementName>/elementConfig)+/"
```

These invisible annotations will be used to generate the skin map for the emulator. The class name can be broken down into the following parts:

### Example
```
dth="2688"
   height="1242"
   version="1.1"
   id="svg1"
   sodipodi:docname="canvas.svg"
   inkscape:version="1.3.2 (091e20e, 2023-11-25)"
   xml:space="preserve"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
    <rect
      style="fill:#241c1c"
      id="rect5"
      width="517.42798"
      height="826.62744"
      x="726.06934"
      y="207.68631" />
    <rect
      style="fill:#241c1c"
      id="rect4"
      width="267.07935"
      height="245.05215"
      x="1805.4492"
      y="343.07556" />
    <rect
      style="fill:#0000ff;stroke-width:4.33201"
      id="rect1"
      width="267.07935"
      height="245.05217"
      x="1756.0115"
      y="375.94781">
      <desc id="desc5">
        @component/component2
        @element/dpad
      </desc>
    </rect>
</svg>
```

In this example the last rectangle would be replaced by `component2` and become a dpad element in the emulator.

## Components
Components are reusable parts of the skin that can be used in multiple representations. They are SVG files that can be placed in the `components` folder. Components can be used in the representations by setting the class name of a rectangle in the SVG file of the representation, prefixed by `@component/`. The component will be placed at the center of the rectangle that has the class name of the component. The dimensions of the component will be used, no rescaling will be done.

## Emulator Elements
Emulator elements are the buttons and screens that are part of the emulators skin, interacting with the underlying emulator. They can be placed in the representations by setting the class name of a rectangle in the SVG file of the representation, prefixed by `@element/`. The element will use the dimensions of the rectangle. If a rectangle defines a component and an element, the dimensions of the component are used.

The following elements are available:
- dpad
- thumbstick?? reqiring overwrite?
- menu
- a
- b
- c
- x
- y
- z
- select
- start
- mode
- l
- r
- cUp / cDown / cLeft / cRight
- screen
- touchScreen
- touchScreenControls
- quickSave
- quickLoad
- fastForward
- toggleFastForward
- toggleAltRepresentations

Each element will create an entry in the auto generated [`info.json`](https://noah978.gitbook.io/delta-docs/skins#the-info.json) file bundled with the graphics under it's respective representation and orientation. These elements are either [items](https://noah978.gitbook.io/delta-docs/skins#items) or [screens](https://noah978.gitbook.io/delta-docs/skins#game-screens). To overwrite or extend the generated objects, place an elementConfig config file in the `elementConfig` folder. The file should be named after the element config name, with the extension `.json`. The config is selected, by appending its name to the `@element/` class name entry.

- Run the tool to generate the skin