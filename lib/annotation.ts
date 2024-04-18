import { JSONPath } from "jsonpath-plus"
import { INode } from "svgson"

export type AnnotationString = `@component` | `@element`

export class Annotation<T extends AnnotationString> {
    annotationString: T

    root: INode
    pathToAnnotationValue: string[]

    static RegExp(annotationString: AnnotationString) {
        return new RegExp(`${annotationString}/([A-Za-z0-9]+)(?:/([A-Za-z0-9]+))?`)
    }
    /**
     * 
     * @param root The root node of the canvas
     * @param path The XPath to the annotation value
     * @param annotationString The used annotation string
     */
    constructor(annotationString: T, root: INode, pathToAnnotationValue: string[]) {
        this.annotationString = annotationString
        this.root = root
        this.pathToAnnotationValue = pathToAnnotationValue
    }

    toString(): string {
        if(this.subValue !== undefined) {
            return this.value + `/` + this.subValue
        }
        return this.value
    }

    get value(): string {
        return this.match[1]
    }

    get subValue(): string | undefined {
        return this.match[2]
    }

    get match(): RegExpMatchArray {
        const fullNodeValue = JSONPath({path: this.pathToAnnotationValue, json: this.root})[0] as string
        return fullNodeValue.match(Annotation.RegExp(this.annotationString))
    }

    get pathToParent(): string[] {
        return this.pathToAnnotationValue.slice(0, -5)
    }

    get pathStringToParent(): string {
        return JSONPath.toPathString(this.pathToParent)
    }

    get pathPointerToParent(): string {
        return JSONPath.toPointer(this.pathToParent)
    }

    get parentNode(): INode {
        return JSONPath({path: this.pathToParent, json: this.root})[0]
    }
}