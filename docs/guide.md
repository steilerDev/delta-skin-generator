# Skin Creation Guide

This guide will help you create a deltaskin file that can be used with the Delta and Ignited Emulator, from scratch using all features of this tool.

## Installation and Initialization

Please make sure you have a recent (and supported) version of node and npm installed. From your empty project directory, run the following command to initialize a new project:
    
```bash
npx delta-skin-generator init
```

You can reduce the scope of your skin by supplying the filter arguments [`--representations`, `--orientations` and/or `--altSkin`](api.md#cli).

The `init` command will ask for some properties of your skin to populate the [`skin.json` file](api.md#skinjson) and create three folders (`components`, `representations`, `elementConfig`) in your project directory. 

 - `skin.json` file is where you will define the general properties of your skin. This is defining top level properties in the [`info.json`](https://noah978.gitbook.io/delta-docs/skins#the-info.json) file.
 - `components` folder is where you will store all your SVG components that will be used in your skin. The components should be named using only alphanumeric characters.
 - `elementConfig` folder is where you will store your element configuration files. The element configuration files are in JSON format and should be named using only alphanumeric characters.
 - The `representations` folder is where you will store all your viewport SVG files. Within the `representations` folder, you will find subfolders for each device type (`iphone-standard`, `iphone-e2e`, `ipad-standard`, `ipad-splitview`). Each of these subfolders will contain the viewport SVG files for the respective orientation and alternative representation. The viewport SVG files should be named `portrait.svg`, `portrait-alt.svg`, `landscape.svg`, and `landscape-alt.svg`.

## Creating a representation

1. Open any of the created template representations form the `representations` folder in your vector editor of choice. For this tutorial I'll be using [Inkscape](https://inkscape.org/), as it is free and the annotations are based on its capabilities. However if you have better ideas on how to annotate, I'd be happy to consider alternative approaches.
2. The template already contains a rectangle. Go into the "Object Properties" and see the annotations:

3. We can now add additional elements that will represent the skin. For that add rectangles and add annotations in the description field - don't forget to "Set" the properties in the bottom right corner.
4. To compile the skin into a `.deltaskins` file, run the following command:
```bash
npx delta-skin-generator
```
5. Transfer the generated file onto your device and [load your skin](https://docs.ignitedemulator.com/using-ignited/settings/controller-skins).
6. In the emulator's pause screen, you can enable keyboard debugging to see the active areas.

## Creating a component

In order to have variations of the skin for various orientations and devices, we can create components that can be reused in multiple representations.

1. Create a new SVG file in the `components` folder and create any component, e.g. an 'A' button, within a file called `a.svg`.
2. Add a rectangle to the SVG file and add annotations in the description field:
```
@component/a
```
3. This will fully replace the rectangle and all child components to render the component using the rectangles original dimensions.

## Element Configuration

Elements can be further configured (e.g. in order to allow `extendedEdges` for certain components). Each annotation either creates an `item` or `screen` object in the `info.json` file. The contents of a configuration file will be merged with the generated object and allows for full flexibility. To specify the use of a configuration file, add the name of the file (without the `.json` extension) to the annotation:
``` 
@element/dpad/dpadConfig"
```

# Examples

The following is a simple SVG example, with a skin that contains a dpad element:
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

## Projects

Below is a list of open source skins utilizing this framework:
- [PokeMaxDS by steilerDev](https://github.com/steilerDev/delta-skin-PokeMaxDS)