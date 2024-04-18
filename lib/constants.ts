import path from "path"
import { Annotation } from "./annotation.js"
import { Representation, RepresentationString } from "./representation.js"

/**
 * Types defined within library
 */

/**
 * Possible representations and their sizes
 * https://iosref.com/res
 * From: https://noah978.gitbook.io/delta-docs/skins#changing-the-images
 */
export const REPRESENTATIONS = {
    "iphone-standard": {
        id: `iphone-standard` as RepresentationString,
        resolution: { // largest non-notch resolution (iPhone 8+)
            width: 1242,
            height: 2208
        },
        mappingSize: {
            width: 414,
            height: 736
        }
    },
    "iphone-e2e": {
        id: `iphone-e2e` as RepresentationString,
        resolution: { // largest notch resolution (iPhone 15 Plus)
            width: 1290,
            height: 2796
        },
        mappingSize: { // Logical resolution (iPhone 15 Plus)
            width: 430,
            height: 932
        }
    },
    "ipad-standard": {
        id: `ipad-standard` as RepresentationString,
        resolution: { // largest iPad resolution (iPad Pro 12.9")
            width: 2048,
            height: 2732
        },
        mappingSize: {
            width: 1024,
            height: 1366
        }
    },
    "ipad-splitview": {
        id: `ipad-splitview` as RepresentationString,
        resolution: { // based on recommendation here https://noah978.gitbook.io/delta-docs/skins#mapping-size, equivalent to iPad (gen 6, 5)
            width: 1536,
            height: 2048
        },
        mappingSize: {
            width: 768,
            height: 1024
        }
    }
}

/**
 * Expected screen resolutions by system - based on https://noah978.gitbook.io/delta-docs/skins#inputframe
 */
export const SCREEN_RESOLUTIONS = {
    [`com.rileytestut.delta.game.gbc`]: {
        width: 160,
        height: 144
    },
    [`com.rileytestut.delta.game.gba`]: {
        width: 240,
        height: 160
    },
    [`com.rileytestut.delta.game.ds`]: {
        width: 256,
        height: 192
    },
    [`com.rileytestut.delta.game.nes`]: {
        width: 256,
        height: 240
    },
    [`com.rileytestut.delta.game.snes`]: {
        width: 256,
        height: 224
    },
    [`com.rileytestut.delta.game.n64`]: {
        width: 256,
        height: 224
    }
}

export const DIR_REPRESENTATIONS = `representations`
export const DIR_COMPONENTS = `components`
const FILE_COMPONENTS_EXT = `.svg`
const FILE_CANVAS_EXT = `.svg`
export const DIR_ELEMENTS = `element-configs`
const FILE_ELEMENTS_EXT = `.json`
export const FILE_PROJECT = `skin.json`
const FILE_REPRESENTATION_OUTPUT_EXT = `.png`
export const FILE_PROJECT_OUTPUT = `info.json`
export const FILE_SKIN_EXT = `.deltaskin`

/**
 * @returns The path on the filesystem for representation SVG
 */
export const canvasFilePath = (projectDir: string, representation: Representation) => {
    return path.join(projectDir, DIR_REPRESENTATIONS, representation.id, representation.orientation + (representation.altSkin ? `-alt` : ``) + FILE_CANVAS_EXT)
}

/**
 * @returns  The filepath within the SkinPack for the specified asset
 */
export const skinPackFilePath = (representation: Representation) => {
    return `${representation.id}_${representation.orientation}${representation.altSkin ? `_alt` : ``}${FILE_REPRESENTATION_OUTPUT_EXT}`
}

/**
 * @returns The path on the filesystem for the component svg
 */
export const componentFilePath = (projectDir: string, componentAnnotation: Annotation<`@component`>) => {
    return path.join(projectDir, DIR_COMPONENTS, componentAnnotation.value + FILE_COMPONENTS_EXT)
}

/**
 * @returns The path on the filesystem for the configuration of the provided annotation, or undefined if none is defined
 */
export const elementConfigFilePath = (projectDir: string, elementAnnotation: Annotation<`@element`>) => {
    if(!elementAnnotation.subValue) {
        return undefined
    }
    return path.join(projectDir, DIR_ELEMENTS, elementAnnotation.subValue + FILE_ELEMENTS_EXT)
}