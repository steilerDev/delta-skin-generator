import { Annotation } from "./annotation.js"
import { Log } from "./log.js"
import { elementConfigFilePath, RepresentationResolution, SCREEN_RESOLUTIONS} from "./constants.js"
import fs from 'fs/promises'
import { GameTypeIdentifier, SkinConfigurationInputs, SkinConfigurationItem, SkinConfigurationScreen } from "./skin.js"

type ElementKind = `item` | `screen`

const elementTypes = [
    `dpad`,
    `thumbstick`,
    `menu`,
    `a`,
    `b`,
    `c`,
    `x`,
    `y`,
    `z`,
    `select`,
    `start`,
    `mode`,
    `l`,
    `r`,
    `cUp`,
    `cDown`,
    `cLeft`,
    `cRight`,
    `quickSave`,
    `quickLoad`,
    `fastForward`,
    `toggleFastForward`,
    `toggleAltRepresentations`,
    `screen`,
    `touchScreen`,
    `touchScreenControls`
] as const

export type ElementType = typeof elementTypes[number];

/**
 * The Element class
 */
export class Element {
    config?: unknown
    annotation: Annotation<`@element`>
    system: GameTypeIdentifier

    static async load(projectPath: string, elementAnnotation: Annotation<`@element`>, system: GameTypeIdentifier): Promise<Element | undefined> {
        if(!elementTypes.includes(elementAnnotation.value as ElementType)) {
            Log.warn(`Not loading annotation ${elementAnnotation}: Unknown element`)
            return undefined
        }
        let elementConfiguration = undefined
        if(elementAnnotation.subValue) {
            try {
                elementConfiguration = await fs.readFile(elementConfigFilePath(projectPath, elementAnnotation))
            } catch(err) {
                Log.warn(`Ignoring element configuration for annotation ${elementAnnotation}: ${err.message}`)
            }
        }
        return new Element(
            system,
            elementAnnotation,
            elementConfiguration,
        )
    }

    /**
     * Produces a warning if width and height don't match expected aspect ratio of system. Constants from https://noah978.gitbook.io/delta-docs/skins#inputframe
     * @returns True if aspect ratio match
     */
    static checkAspectRatio(system: GameTypeIdentifier, width: number, height: number): boolean {
        const expectedResolution = SCREEN_RESOLUTIONS[system] as RepresentationResolution
        if(expectedResolution) {
            return Math.abs(
                (expectedResolution.height / expectedResolution.width) - 
                (height / width)
            ) === 0
        }
        return false
    }

    /**
     * @returns True if the element is compatible with the system, false otherwise
     */
    static checkCompatibility(system: GameTypeIdentifier, element: ElementType) {
        if(
            element === `a` || 
            element === `b` ||
            element === `start` ||
            element === `dpad` ||
            element === `thumbstick` ||
            element === `quickSave` ||
            element === `quickLoad` ||
            element === `fastForward` ||
            element === `toggleFastForward` ||
            element === `toggleAltRepresentations`
        ) {
            return true
        }
        switch(system) {
        case `com.rileytestut.delta.game.gbc`:
            return element === `select`
        case `com.rileytestut.delta.game.gba`:
            return element === `select` || element === `l` || element === `r`
        case `com.rileytestut.delta.game.ds`:
            return element === `select` || element === `x` || element === `y` || element === `l` || element === `r` || element === `touchScreenControls`
        case `com.rileytestut.delta.game.nes`:
            return element === `select`
        case `com.rileytestut.delta.game.snes`:
            return element === `select` || element === `x` || element === `y` || element === `l` || element === `r`
        case `com.rileytestut.delta.game.n64`:
            return element === `cUp` || element === `cDown` || element === `cLeft` || element === `cRight` || element === `l` || element === `r` || element === `z`
        case `com.rileytestut.delta.game.genesis`:
            return element === `c` || element === `x` || element === `y` || element === `z` || element === `mode`
        }
    }

    constructor(system: GameTypeIdentifier, elementAnnotation: Annotation<`@element`>, elementConfig?: unknown) {
        this.system = system
        this.config = elementConfig
        this.annotation = elementAnnotation
    }

    get kind(): ElementKind {
        switch(this.type) {
        case `screen`:
        case `touchScreen`:
            return `screen`
        default:
            return `item`
        }
    }

    get type(): ElementType {
        return this.annotation.value as ElementType
    }

    validate() {
        if(this.kind === `screen`) {
            const dstWidth = Number.parseFloat(this.annotation.parentNode.attributes.width)
            const dstHeight = Number.parseFloat(this.annotation.parentNode.attributes.height)
            if(!Element.checkAspectRatio(this.system, dstWidth, dstHeight)) {
                throw new Error(`Aspect ratio of screen ${this.annotation} does not match system ${this.system}`)
            }
        }
        if(!Element.checkCompatibility(this.system, this.type)) {
            throw new Error(`Element ${this.annotation} is not compatible with system ${this.system}`)
        }
    }

    /**
     * This function will generate it's own generation and dimension, and insert itself accordingly
     * @param canvas 
     */
    generate(): SkinConfigurationItem | SkinConfigurationScreen | undefined {
        try {
            this.validate()
        } catch(err) {
            Log.warn(`Problem found with element ${this.annotation}: ${err.message}`)
        }

        const boundsWidth = Math.round(Number.parseFloat(this.annotation.parentNode.attributes.width)/3)
        const boundsHeight = Math.round(Number.parseFloat(this.annotation.parentNode.attributes.height)/3)
        const boundsX = Math.round(Number.parseFloat(this.annotation.parentNode.attributes.x)/3)
        const boundsY = Math.round(Number.parseFloat(this.annotation.parentNode.attributes.y)/3)

        if(this.kind === `screen`) {
            switch(this.system) {
            case `com.rileytestut.delta.game.gbc`:
            case `com.rileytestut.delta.game.gba`:
            case `com.rileytestut.delta.game.nes`:
            case `com.rileytestut.delta.game.snes`:
            case `com.rileytestut.delta.game.n64`:
            case `com.rileytestut.delta.game.genesis`:
                return {
                    outputFrame: {
                        x: boundsX,
                        y: boundsY,
                        width: boundsWidth,
                        height: boundsHeight
                    }
                }
            case `com.rileytestut.delta.game.ds`:
                // Select the right input frame
                return {
                    inputFrame: this.type === `touchScreen`
                        ? {
                            "x": 0,
                            "y": 192,
                            "width": 256,
                            "height": 192
                        }
                        : {
                            "x": 0,
                            "y": 0,
                            "width": 256,
                            "height": 192
                        },
                    outputFrame: {
                        x: boundsX,
                        y: boundsY,
                        width: boundsWidth,
                        height: boundsHeight
                    }
                }
            }
        }

        if(this.kind === `item`) {
            let inputs: SkinConfigurationInputs
            switch(this.type) {
            case `touchScreenControls`:
                inputs = {
                    up: `analogStickUp`,
                    down: `analogStickDown`,
                    left: `analogStickLeft`,
                    right: `analogStickRight`
                }
                break
            case `dpad`:
                inputs = {
                    up: `up`,
                    down: `down`,
                    left: `left`,
                    right: `right`
                }
                break
            case `thumbstick`:
                inputs = {
                    up: `analogStickUp`,
                    down: `analogStickDown`,
                    left: `analogStickLeft`,
                    right: `analogStickRight`
                }
                break
            default:
                inputs = [this.type]
                break
            }

            return {
                inputs,
                frame: {
                    x: boundsX,
                    y: boundsY,
                    width: boundsWidth,
                    height: boundsHeight
                },
                ...(this.config as object ?? {})
            }
        }
        return undefined
    }

    toString(): string {
        return this.annotation.value
    }
}