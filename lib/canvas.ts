import { Annotation } from "./annotation.js";
import { Component } from "./component.js";
import { REPRESENTATIONS } from "./constants.js";
import { Log } from "./log.js";
import { SVG } from "./svg.js";
import fs from "fs/promises";

export class Canvas {
    projectPath: string;
    canvas: SVG;
    components: Component[] = [];

    /**
     * 
     * @param filePath 
     * @param projectPath 
     * @returns 
     */
    static async create(filePath: string, projectPath: string): Promise<Canvas> {
        const canvasData = await SVG.load(filePath);
        const canvas = new Canvas(canvasData, projectPath);

        const componentAnnotations = canvasData.findAnnotations(`@component`);
        Log.info(`Found ${componentAnnotations.length} component annotations`);
        // Making sure we are not replacing same parent more than once
        const uniqueComponentParents: string [] = [];
        for(const componentAnnotation of componentAnnotations) {
            if(uniqueComponentParents.indexOf(componentAnnotation.pathStringToParent) >= 0) {
                Log.warn(`Duplicate component for parent ${componentAnnotation.pathStringToParent}, ignoring ${componentAnnotation}`);
                continue;
            }
            await canvas.loadComponent(componentAnnotation);
            uniqueComponentParents.push(componentAnnotation.pathStringToParent);
        }

        const elementAnnotations = canvasData.findAnnotations(`@element`);
        Log.info(`Found ${elementAnnotations.length} element annotations`);
        for(const elementAnnotation of elementAnnotations) {
            await canvas.loadElement(elementAnnotation);
        }
        return canvas;
    }

    constructor(canvas: SVG, projectPath: string) {
        this.canvas = canvas;
        this.projectPath = projectPath;
    }


    async loadComponent(component: Annotation<`@component`>) {
        Log.info(`Loading component ${component}...`);
        this.components.push(await Component.load(this.projectPath, component));
    }

    async loadElement(element: Annotation<`@element`>) {
        Log.info(`Loading element ${element} with config ${element.subValue}...`);
    }

    async render() {
        for(const component of this.components) {
            Log.info(`Rendering component ${component}`);
            await component.render(this.canvas);
        }
        const renderedCanvas = await this.canvas.render(REPRESENTATIONS.iPhone.edgeToEdge.large.height, REPRESENTATIONS.iPhone.edgeToEdge.large.width);
        fs.writeFile(`./renderedCanvas.png`, renderedCanvas);
    }
}