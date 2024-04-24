# API and CLI Reference

## CLI

This script is distributed through npm - either you can install it globally (`npm i -g delta-skin-generator`) or you can run it through npx (`npx delta-skin-generator@latest`).

### Usage

```bash  
$ delta-skin-generator <command> [option]
```
### Commands

- `render`  
  Instructs the program to render the available / specified assets and creates a '.deltaskin' file. This is the default command, if no command is specified.    
- `init`  
  Instructs the program to initialize the specified templates within the project structure (this will not overwrite existing files).                            
- `docs`  
  Creates documentation assets based on the available / specified assets.                                                                                       

### Options

- `--outputDir`  
  Specifies the directory, were rendered skins should be written to                       
- `--projectDir`  
  Specifies the directory, where the skin is located Default: .                           
- `--representations`  
  Limit the generated representations Default: all                                        
  Choices: all, iphone, iphone-standard, iphone-e2e, ipad, ipad-standard, ipad-splitview  
- `--orientations`  
  Limit the generated orientations Default: all                                           
  Choices: all, portrait, landscape                                                       
- `--disableAltSkin`  
  Disables AltSkin support Default: false     

## Filesystem
This tool expects the following folder structure:

``` 
|-- components
|   `-- <componentName>.svg
|-- dist
|   `-- <yourSkinName>.deltaskin
|-- elements
|   `-- <elementConfiguration>.json
|-- representations
|   |-- ipad-splitview
|   |   |-- landscape-alt.svg
|   |   |-- landscape.svg
|   |   |-- portrait-alt.svg
|   |   `-- portrait.svg
|   |-- ipad-standard
|   |   |-- landscape-alt.svg
|   |   |-- landscape.svg
|   |   |-- portrait-alt.svg
|   |   `-- portrait.svg
|   |-- iphone-e2e
|   |   |-- landscape-alt.svg
|   |   |-- landscape.svg
|   |   |-- portrait-alt.svg
|   |   `-- portrait.svg
|   `-- iphone-standard
|       |-- landscape-alt.svg
|       |-- landscape.svg
|       |-- portrait-alt.svg
|       `-- portrait.svg
`-- skin.json
```

Each representation folder contains the viewport SVG files for the respective orientation and alternative representation. If certain representations are not relevant for your skin, simply remove/omit the folder or file. Every available representation will be rendered into your skin and dictate the look and functionality of your skin. This is achieved by using [annotations](#annotations).

## `skin.json`
This configuration at the root of your project holds meta-information about your skin. The following properties are supported:

```json
{
    "skinName": string,
    "skinId": string,
    "system": GameTypeIdentifier,
    "version": string,
    "author": string,
}
```

## Annotations

This tool uses annotations to define the elements of your skin. These annotations need to be part of a `desc` element within a `rect` element. There are two types of annotations.

### Element Annotations

Element annotations define location, size and type of emulator elements within your skin and will generate an entry in the final [`info.json` file](https://noah978.gitbook.io/delta-docs/skins#the-info.json). The format of an element annotation is as follows:

```
@element/<elementName>[/<elementConfig>]
```

More information on element configurations can be found [here](#element-configuration).

All elements defined in [the button chart](https://noah978.gitbook.io/delta-docs/skins#button-charts) are supported on their respective system. Elements that are not supported by the system of your skin will be ignored.

- `dpad`
- `menu`
- `a`
- `b`
- `c`
- `x`
- `y`
- `z`
- `select`
- `start`
- `mode`
- `l`
- `r`
- `cUp`
- `cDown`
- `cLeft`
- `cRight`
- `touchScreenControls`

The following elements will generate the respective custom emulator buttons - support for these is emulator app dependent.

- `quickSave`
- `quickLoad`
- `fastForward`
- `toggleFastForward`
- `toggleAltRepresentations`

The following elements will generate a screen. See [the specification of your relevant system](https://noah978.gitbook.io/delta-docs/skins#game-screens) to understand the expected aspect ratio. The tool will warn, in case the aspect ratio of the screen does not match the expected aspect ratio.

- `screen`
- `touchScreen` (only available for the NintendoDS - on this system `screen` will only show the upper screen portion and `touchScreen` will show the bottom screen portion)

Make sure to have the screen area as defined as transparent, otherwise your skin's elements will overlap with the screen.

#### Element Configuration

Element configurations within the `info.json` can be overridden / extended by specifying providing a configuration file in the annotation:

```
@@element/<elementName>[/<elementConfig>]
```

For each specified element configuration, a JSON file with the same name must exist in the `elementConfig` folder. The configuration file should contain the properties that should be overridden or extended. See the [advanced mapping configuration](https://noah978.gitbook.io/delta-docs/skins#advanced-mapping) for more details.

### Component Annotations
Component annotations replace the rectangle with the component defined in the `components` folder. The component will be rendered into the size and location of the `rect` container. The format of a component annotation is as follows:

```
@component/<componentName>
```

For each specified component, a SVG file with the same name must exist in the `components` folder. The component SVG file should fill the full canvas.

Additionally, the component `@component/clear` is available - this will clear the rectangle and all child components. This is useful, in case the control should not be visible in the skin while being visible during development (e.g. the screen areas)