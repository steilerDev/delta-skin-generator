import { Annotation } from "./annotation.js"
import { Log } from "./log.js"
import { elementConfigFilePath} from "./constants.js"
import fs from 'fs/promises'
import { SkinConfiguration } from "./skin.js"

type ElementKind = `item` | `screen`

const elementTypes = [
    `dpad`,
    //thumb-stick?? requiring overwrite?
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

    static async load(projectPath: string, elementAnnotation: Annotation<`@element`>): Promise<Element | undefined> {
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
            elementAnnotation,
            elementConfiguration
        )
    }

    constructor(elementAnnotation: Annotation<`@element`>, elementConfig?: unknown) {
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

    /**
     * This function will generate it's own generation and dimension, and insert itself accordingly
     * @param canvas 
     */
    async generate(configTarget: SkinConfiguration) {
        Log.log(JSON.stringify(configTarget))
        
        // Todo: - Get JSONPath to relevant place in skin configuration - make sure everything exists

        // //making sure namespace is set
        // renderTarget.data.attributes[`xmlns:xlink`]=`http://www.w3.org/1999/xlink`

        // JSONPointer.set(renderTarget.data, this.annotation.pathPointerToParent, renderedNode)
        // Log.debug(`Replaced component node with rendered node at ${dstX} / ${dstY}`)
    }

    toString(): string {
        return this.annotation.value
    }
}