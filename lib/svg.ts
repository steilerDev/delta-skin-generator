import {INode, parse, stringify} from 'svgson'
import fs from 'fs/promises'
import { JSONPath } from 'jsonpath-plus'
import { Annotation, AnnotationString } from './annotation.js'
import sharp from 'sharp'


export class SVG {
    data: INode

    static async load(path: string): Promise<SVG> {
        return fs.readFile(path)
            .then((data) => parse(data.toString()))
            .then((parsedData) => new SVG(parsedData))
    }

    static createImageNode(image: Buffer, width: number, height: number, x: number, y: number) {
        return {
            name: `image`,
            type: `element`,
            value: ``,
            attributes: {
                width: width.toString(),
                height: height.toString(),
                preserveAspectRatio: `none`,
                "xlink:href": `data:image/png;base64,${image.toString(`base64`)}`,
                x: x.toString(),
                y: y.toString(),
            },
            children: [],
        } as INode
    }

    
    constructor(data: INode) {
        this.data = data
    }

    /**
     * Finds annotation in the node or any of its children
     * @param annotation 
     * @param jsonPath To keep track of location
     * @param node 
     * @returns 
     */
    findAnnotations<T extends AnnotationString>(annotation: T): Annotation<T>[] {
        // Searching for all children nodes that contain a description child, whose content matches the annotation RegEx
        const queryResults = JSONPath({ 
            path: `$..children[?(@.name=='desc')].children[?(@.type=='text' && @.value.match(${Annotation.RegExp(annotation).toString()}))].value`, 
            json: this.data,
            resultType: `path`
        }) as string[]

        if(queryResults.length == 0) {
            // No annotations in the document
            return []
        }

        // Creating annotation class
        return queryResults
            .map((queryResult) => new Annotation(annotation, this.data, JSONPath.toPathArray(queryResult)))
    }

    get width(): number {
        return Number.parseFloat(this.data.attributes.width)
    }

    get height(): number {
        return Number.parseFloat(this.data.attributes.height)
    }

    get buffer(): Buffer {
        return Buffer.from(
            stringify(this.data)
        )
    }
    
    async render(dstWidth: number, dstHeight: number): Promise<Buffer> {
        return await sharp(this.buffer)
            .png()
            .resize({
                width: Math.round(dstWidth),
                height: Math.round(dstHeight),
                fit: `fill`
            })
            .toBuffer()
    }
}