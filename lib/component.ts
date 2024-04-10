import { Annotation } from "./annotation.js";
import path from 'path';
import { SVG } from "./svg.js";
import JSONPointer from "jsonpointer";
import { Log } from "./log.js";

const COMPONENTS_DIR = `components`;
const COMPONENTS_EXT = `.svg`;

export class Component {
    data: SVG;
    annotation: Annotation<`@component`>;

    static async load(projectPath: string, componentAnnotation: Annotation<`@component`>): Promise<Component> {
        return new Component(
            await SVG.load(path.join(projectPath, COMPONENTS_DIR, componentAnnotation.value + COMPONENTS_EXT)),
            componentAnnotation
        );
    }

    constructor(componentData: SVG, componentAnnotation: Annotation<`@component`>) {
        this.data = componentData;
        this.annotation = componentAnnotation;
    }

    /**
     * This function will render the component into the canvas
     * @param canvas 
     */
    async render(canvas: SVG) {
        const parent = this.annotation.parentNode;
        const dstWidth = Number.parseFloat(parent.attributes.width);
        const dstHeight = Number.parseFloat(parent.attributes.height);
        const dstX = Number.parseFloat(parent.attributes.x);
        const dstY = Number.parseFloat(parent.attributes.y);

        const renderedComponent = await this.data.render(dstWidth, dstHeight);

        const renderedNode = SVG.createImageNode(renderedComponent, dstWidth, dstHeight, dstX, dstY);


        //making sure namespace is set
        canvas.data.attributes[`xmlns:xlink`]=`http://www.w3.org/1999/xlink`;

        JSONPointer.set(canvas.data, this.annotation.pathPointerToParent, renderedNode);
        Log.debug(`Replaced component node with rendered node at ${dstX} / ${dstY}`);
    }

    toString(): string {
        return this.annotation.value;
    }
}