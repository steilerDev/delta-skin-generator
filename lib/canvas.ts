import AdmZip from "adm-zip"
import { Annotation } from "./annotation.js"
import { Component } from "./component.js"
import { OrientationString, canvasFilePath, Representation, skinPackFilePath } from "./constants.js"
import { Log } from "./log.js"
import { SVG } from "./svg.js"
import { Element } from "./elements.js"

/**
 * The Canvas class contains one representation, with all assets and configurations
 */
export class Canvas {
    projectPath: string
    representation: Representation
    orientation: OrientationString
    altSkin: boolean
    canvas: SVG
    components: Component[] = []
    elements: Element[] = []

    /**
     * Creates a new Canvas and loads elements and components
     * @param filePath 
     * @param projectPath 
     * @returns 
     */
    static async create(projectPath: string, representation: Representation, orientation: OrientationString, altSkin: boolean): Promise<Canvas> {
        Log.debug(`Creating canvas for ${representation} (${orientation})${altSkin ? `as AltSkin` : ``}`)
        const canvasData = await SVG.load(
            canvasFilePath(projectPath, representation.id, orientation, altSkin)
        )
        const canvas = new Canvas(canvasData, projectPath, representation, orientation, altSkin)

        const componentAnnotations = canvasData.findAnnotations(`@component`)
        Log.info(`Found ${componentAnnotations.length} component annotations`)
        // Making sure we are not replacing same parent more than once
        const uniqueComponentParents: string [] = []
        for(const componentAnnotation of componentAnnotations) {
            if(uniqueComponentParents.indexOf(componentAnnotation.pathStringToParent) >= 0) {
                Log.warn(`Duplicate component for parent ${componentAnnotation.pathStringToParent}, ignoring ${componentAnnotation}`)
                continue
            }
            await canvas.loadComponent(componentAnnotation)
            uniqueComponentParents.push(componentAnnotation.pathStringToParent)
        }

        const elementAnnotations = canvasData.findAnnotations(`@element`)
        Log.info(`Found ${elementAnnotations.length} element annotations`)
        for(const elementAnnotation of elementAnnotations) {
            await canvas.loadElement(elementAnnotation)
        }
        return canvas
    }

    constructor(canvas: SVG, projectPath: string, representation: Representation, orientation: OrientationString, altSkin: boolean) {
        this.canvas = canvas
        this.projectPath = projectPath
        this.representation = representation
        this.orientation = orientation
        this.altSkin = altSkin
    }

    /**
     * Creates a component from the provided annotation
     */
    async loadComponent(component: Annotation<`@component`>) {
        Log.info(`Loading component ${component}...`)
        this.components.push(await Component.load(this.projectPath, component))
    }

    /**
     * Creates an element from the provided annotation
     */
    async loadElement(element: Annotation<`@element`>) {
        Log.info(`Loading element ${element} with config ${element.subValue}...`)
        this.elements.push(await Element.load(this.projectPath, element))
    }

    /**
     * Renders the canvas and adds it to the provided skinPack
     */
    async pack(skinPack: AdmZip) {
        skinPack.addFile(
            skinPackFilePath(this.representation.id, this.orientation, this.altSkin), 
            await this.render()
        )
    }

    // addConfig(config: SkinConfiguration) {

    // }

    // generateSkinConfigurationRepresentation(): SkinConfigurationRepresentation {
    //     return {}
    // }

    /**
     * Renders all components into the canvas and outputs a PNG file buffer
     */
    async render(): Promise<Buffer> {
        const canvasCopy = await SVG.copy(this.canvas)

        const renderWidth = this.orientation === `portrait`
            ? this.representation.resolution.width
            : this.representation.resolution.height

        const renderHeight = this.orientation === `portrait`
            ? this.representation.resolution.height
            : this.representation.resolution.width

        if(renderWidth > canvasCopy.width || renderHeight > canvasCopy.height) {
            Log.warn(`Up-scaling picture during render: ${JSON.stringify(this.representation)} (${this.orientation})`)
        }

        Log.info(` - Rendering ${this.representation.id} in resolution ${renderWidth} x ${renderHeight}`)

        for(const component of this.components) {
            await component.render(canvasCopy)
        }

        return canvasCopy.render(renderWidth, renderHeight)
    }
}