import { Annotation } from "./annotation.js"
import { SVG } from "./svg.js"
import JSONPointer from "jsonpointer"
import { Log } from "./log.js"
import { componentFilePath} from "./constants.js"

/**
 * The component class represents a visual component that will be rendered into the canvas
 */
export class Component {
    data?: SVG
    annotation: Annotation<`@component`>

    /**
     * Loads a component based on the provided annotation
     */
    static async load(projectPath: string, componentAnnotation: Annotation<`@component`>): Promise<Component> {
        return new Component(
            componentAnnotation,
            componentAnnotation.value === `clear` ? undefined : await SVG.load(componentFilePath(projectPath, componentAnnotation))
        )
    }

    constructor(componentAnnotation: Annotation<`@component`>, componentData?: SVG) {
        this.data = componentData
        this.annotation = componentAnnotation
    }

    /**
     * This function will render the component into a pixel image and place it into the provided canvas
     */
    async render(renderTarget: SVG) {
        if(this.data === undefined) {
            Log.info(`  - Skipping clear component`)
            JSONPointer.set(renderTarget.data, this.annotation.pathPointerToParent, undefined)
            return
        }
        Log.info(`  - Rendering component ${this.annotation.value}`)
        const parent = this.annotation.parentNode
        const dstWidth = Number.parseFloat(parent.attributes.width)
        const dstHeight = Number.parseFloat(parent.attributes.height)
        const dstX = Number.parseFloat(parent.attributes.x)
        const dstY = Number.parseFloat(parent.attributes.y)

        const renderedComponent = await this.data.render(dstWidth, dstHeight)

        const renderedNode = SVG.createImageNode(renderedComponent, dstWidth, dstHeight, dstX, dstY)

        //making sure namespace is set
        renderTarget.data.attributes[`xmlns:xlink`]=`http://www.w3.org/1999/xlink`

        JSONPointer.set(renderTarget.data, this.annotation.pathPointerToParent, renderedNode)
        Log.debug(`Replaced component node with rendered node at ${dstX} / ${dstY}`)
    }

    toString(): string {
        return this.annotation.value
    }
}