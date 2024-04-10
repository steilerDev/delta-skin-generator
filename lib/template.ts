import { DIR_REPRESENTATIONS, Representation, REPRESENTATION_FILES } from "./constants.js";
import fs from 'fs/promises';
import path from 'path';
import {INode, stringify} from 'svgson';
import { Log } from "./log.js";

export class Template {
    projectDir: string;
    representation: Representation;

    static async create(projectDir: string, representations: Representation[]) {
        for(const representation of representations) {
            const template = new Template(projectDir, representation);
            await template.writeTemplate();
        }
    }

    constructor(projectDir: string, representation: Representation) {
        this.projectDir = projectDir;
        this.representation = representation;
    }

    async writeTemplate() {
        Log.info(`Creating template for ${this.representation.id}...`);
        const dirName = path.join(this.projectDir, DIR_REPRESENTATIONS, this.representation.id);
        await fs.mkdir(dirName, {recursive: true});
        for(const file of REPRESENTATION_FILES) {
            const filePath = path.join(dirName, file);
            try {
                await fs.stat(filePath);
                Log.info(` - Not creating ${file} template for representation ${this.representation.id}, file already exists`);
            } catch {
                const fileWidth = file.match(/portrait/) 
                    ? this.representation.large.width
                    : this.representation.large.height;
                const fileHeight = file.match(/portrait/) 
                    ? this.representation.large.height
                    : this.representation.large.width;
                Log.debug(` - Creating template file with ${fileWidth}x${fileHeight}...`);

                const data = stringify(
                    this.createTemplateFile(fileWidth, fileHeight)
                );
                await fs.writeFile(filePath, data);
            }
        }
        Log.info(`Created template for ${this.representation.id} at ${dirName}`);
    }

    createTemplateFile(width: number, height: number): INode {
        return {
            name: `svg`,
            type: `element`,
            value: ``,
            attributes: {
                width: width.toString(),
                height: height.toString(),
                viewBox: `0 0 ${width.toString()} ${height.toString()}`,
                version: `1.1`,
                id: `svg1`,
                xmlns: `http://www.w3.org/2000/svg`,
                "xmlns:svg": `http://www.w3.org/2000/svg`,
            },
            children: [
                {
                    name: `defs`,
                    type: `element`,
                    value: ``,
                    attributes: {
                        id: `defs1`,
                    },
                    children: [
                    ],
                },
                {
                    name: `g`,
                    type: `element`,
                    value: ``,
                    attributes: {
                        id: `layer1`,
                    },
                    children: [
                        {
                            name: `rect`,
                            type: `element`,
                            value: ``,
                            attributes: {
                                id: `screen`,
                                width: (width/2).toString(),
                                height: (height/2).toString(),
                                x: (width/4).toString(),
                                y: (height/4).toString(),
                                style: `fill:none;stroke:none`
                            },
                            children: [
                                {
                                    name: `desc`,
                                    type: `element`,
                                    value: ``,
                                    attributes: {
                                        id: `desc1`,
                                    },
                                    children: [
                                        {
                                            name: ``,
                                            type: `text`,
                                            value: `@element/screen`,
                                            attributes: {
                                            },
                                            children: [
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };
    }
}