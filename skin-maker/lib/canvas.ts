import { Annotation } from "./annotation.js"
import { Component } from "./component.js"
import { SIZES } from "./size.js"
import { SVG } from "./svg.js"
import fs from "fs/promises"

export const CANVAS = "canvas.svg"


export class Canvas {
    projectPath: string
    canvas: SVG
    components: Component[] = []

    /**
     * 
     * @param filePath 
     * @param projectPath 
     * @returns 
     */
    static async create(filePath: string, projectPath: string): Promise<Canvas> {
        let canvasData = await SVG.load(filePath)
        const canvas = new Canvas(canvasData, projectPath)

        const componentAnnotations = canvasData.findAnnotations("@component")
        console.log(`Found ${componentAnnotations.length} component annotations`)
        // Making sure we are not replacing same parent more than once
        const uniqueComponentParents: string [] = []
        for(let componentAnnotation of componentAnnotations) {
            if(uniqueComponentParents.indexOf(componentAnnotation.pathStringToParent) >= 0) {
                console.error(`Duplicate component for parent ${componentAnnotation.pathStringToParent}, ignoring ${componentAnnotation}`)
                continue
            }
            await canvas.loadComponent(componentAnnotation)
            uniqueComponentParents.push(componentAnnotation.pathStringToParent)
        }

        const elementAnnotations = canvasData.findAnnotations("@element")
        console.log(`Found ${elementAnnotations.length} element annotations`)
        for(let elementAnnotation of elementAnnotations) {
            await canvas.loadElement(elementAnnotation)
        }
        return canvas
    }

    constructor(canvas: SVG, projectPath: string) {
        this.canvas = canvas
        this.projectPath = projectPath
    }


    async loadComponent(component: Annotation<"@component">) {
        console.log(`Loading component ${component}...`)
        this.components.push(await Component.load(this.projectPath, component))
    }

    async loadElement(element: Annotation<"@element">) {
        console.log(`Loading element ${element} with config ${element.subValue}...`)
    }

    async render() {
        for(let component of this.components) {
            console.log(`Rendering component ${component}`)
            await component.render(this.canvas)
        }
        fs.writeFile('./renderedCanvas.svg', this.canvas.buffer)
        const renderedCanvas = await this.canvas.render(SIZES.iPhone.edgeToEdge.large.height, SIZES.iPhone.edgeToEdge.large.width)
        fs.writeFile('./renderedCanvas.png', renderedCanvas)
        
    }
}