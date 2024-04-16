# API and CLI Reference

## CLI

## `skin.json`
Holds general information about your skin

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

### Element Annotations

(With the exception for the thumbstick), all elements defined in [the button chart](https://noah978.gitbook.io/delta-docs/skins#button-charts) are supported on their respective system.

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
- `cUp / cDown / cLeft / cRight`
- `touchScreenControls`
- `quickSave`
- `quickLoad`
- `fastForward`
- `toggleFastForward`
- `toggleAltRepresentations`

The following elements will generate a screen. See [the specification of your relevant system](https://noah978.gitbook.io/delta-docs/skins#game-screens) to understand the expected aspect ratio. 

The touchScreen element is only available for the NintendoDS - on this system `screen` will only show the upper screen portion and `touchScreen` will show the bottom screen portion.

- `screen`
- `touchScreen`

### Component Annotations