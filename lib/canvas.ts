import AdmZip from "adm-zip"
import { Annotation } from "./annotation.js"
import { Component } from "./component.js"
import { canvasFilePath, skinPackFilePath } from "./constants.js"
import { Log } from "./log.js"
import { SVG } from "./svg.js"
import { Element } from "./elements.js"
import { GameTypeIdentifier, SkinConfiguration } from "./skin.js"
import JSONPointer from "jsonpointer"
import { JSONPath } from "jsonpath-plus"
import { Representation } from "./representation.js"

/**
 * The Canvas class contains one representation, with all assets and configurations
 */
export class Canvas {
    projectPath: string
    representation: Representation
    system: GameTypeIdentifier
    canvas: SVG
    components: Component[] = []
    elements: Element[] = []

    /**
     * Creates a new Canvas and loads elements and components
     * @param filePath 
     * @param projectPath 
     * @returns 
     */
    static async create(projectPath: string, representation: Representation, system: GameTypeIdentifier): Promise<Canvas> {
        Log.debug(`Creating canvas for ${representation}`)
        const canvasData = await SVG.load(
            canvasFilePath(projectPath, representation)
        )
        const canvas = new Canvas(canvasData, projectPath, representation, system)

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

    constructor(canvas: SVG, projectPath: string, representation: Representation, system: GameTypeIdentifier) {
        this.canvas = canvas
        this.projectPath = projectPath
        this.system = system
        this.representation = representation
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
        this.elements.push(await Element.load(this.projectPath, element, this.system))
    }

    /**
     * Renders the canvas and adds it to the provided skinPack
     */
    public async packRenderedCanvas(skinPack: AdmZip) {
        skinPack.addFile(
            skinPackFilePath(this.representation), 
            await this.render()
        )
    }

    /**
     * Inserts this canvas' configuration as a representation or alt representation into the provided skin configuration
     */
    addCanvasConfig(config: SkinConfiguration) {
        // create JSON path for representation.id and orientation
        const representationConfig = {
            assets: {
                small: skinPackFilePath(this.representation),
                medium: skinPackFilePath(this.representation),
                large: skinPackFilePath(this.representation)
            },
            items: this.elements.filter(element => element.kind === `item`).map(element => element.generate(this.representation)).filter(item => item !== undefined),
            screens: this.elements.filter(element => element.kind === `screen`).map(element => element.generate(this.representation)).filter(screen => screen !== undefined),
            mappingSize: this.representation.mappingSize,
            //"extendedEdges" : {...},
            // translucent: boolean
        }

        // Path to representation in config file
        const representationPath: string[] = [`$`]
        this.representation.altSkin ? representationPath.push(`altRepresentations`) : representationPath.push(`representations`)
        switch(this.representation.id) {
        case `iphone-standard`:
            representationPath.push(`iphone`)
            representationPath.push(`standard`)
            break
        case `iphone-e2e`:
            representationPath.push(`iphone`)
            representationPath.push(`edgeToEdge`)
            break
        case `ipad-standard`:
            representationPath.push(`ipad`)
            representationPath.push(`standard`)
            break
        case `ipad-splitview`:
            representationPath.push(`ipad`)
            representationPath.push(`splitView`)
            break
        }

        representationPath.push(this.representation.orientation)

        Log.debug(`Setting ${JSONPath.toPointer(representationPath)} to ${JSON.stringify(representationConfig)}`)
        JSONPointer.set(config, JSONPath.toPointer(representationPath), representationConfig)
    }

    /**
     * Renders all components into the canvas and outputs a PNG file buffer
     */
    private async render(): Promise<Buffer> {
        const canvasCopy = await SVG.copy(this.canvas)
        const renderWidth = this.representation.resolution.width
        const renderHeight = this.representation.resolution.height

        if(renderWidth > canvasCopy.width || renderHeight > canvasCopy.height) {
            Log.warn(`Up-scaling picture during render: ${this.representation}`)
        }

        Log.debug(` - Rendering ${this.representation} in resolution ${renderWidth} x ${renderHeight}`)

        for(const component of this.components) {
            await component.render(canvasCopy)
        }

        return canvasCopy.render(renderWidth, renderHeight)
    }

    toString(): string {
        return `Canvas[${this.representation}]`
    }
}