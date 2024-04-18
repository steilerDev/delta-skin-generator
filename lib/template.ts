import { DIR_REPRESENTATIONS, FILE_PROJECT, OrientationString, canvasFilePath, Representation, DIR_COMPONENTS, DIR_ELEMENTS } from "./constants.js"
import fs from 'fs/promises'
import path from 'path'
import {INode, stringify} from 'svgson'
import { Log } from "./log.js"
import inquirer from "inquirer"
import { CLIArgs } from "./cli.js"
import { fileExists } from "./helper.js"

export class Template {
    projectDir: string
    representation: Representation
    orientations: OrientationString[]
    enableAltSkin: boolean

    static async create(args: CLIArgs) {
        try {
            await fs.mkdir(path.join(args.projectDir, DIR_REPRESENTATIONS), {recursive: true})
            await fs.mkdir(path.join(args.projectDir, DIR_COMPONENTS), {recursive: true})
            await fs.mkdir(path.join(args.projectDir, DIR_ELEMENTS), {recursive: true})

            const projectFilePath = path.join(args.projectDir, FILE_PROJECT)

            if(await fileExists(projectFilePath)) {
                throw new Error(`Skin configuration file already exists at ${projectFilePath}`)
            }

            const generalInformation = await inquirer.prompt([{
                type: `input`,
                name: `skinName`,
                message: `Please enter the name of your skin`
            },{
                type: `input`,
                name: `skinId`,
                message: `Please enter an identifier for your skin (e.g.: 'com.you.yourSkin')`
            },{
                type: `input`,
                name: `author`,
                message: `Please enter the author's name`
            },{
                type: `list`,
                name: `system`,
                message: `Please select the target system for your skin`,
                choices: [
                    {
                        name: `GameBoy (Color)`,
                        value: `com.rileytestut.delta.game.gbc`
                    },{
                        name: `GameBoy Advance`,
                        value: `com.rileytestut.delta.game.gba`
                    },{
                        name: `Nintendo DS`,
                        value: `com.rileytestut.delta.game.ds`
                    },{
                        name: `Nintendo Entertainment System`,
                        value: `com.rileytestut.delta.game.nes`
                    },{
                        name: `Super Nintendo Entertainment System`,
                        value: `com.rileytestut.delta.game.snes`
                    },{
                        name: `Nintendo 64`,
                        value: `com.rileytestut.delta.game.n64`
                    }, {
                        name: `Sega Genesis (Beta)`,
                        value: `com.rileytestut.delta.game.genesis`
                    }
                ]
            },{
                type: `input`,
                name: `version`,
                message: `Please enter the version of your skin`,
                default: `1.0.0`
            }])

            await fs.writeFile(projectFilePath, JSON.stringify(generalInformation, null, 2), {flag: `wx`})
        } catch (err) {
            Log.warn(`Not generating '${FILE_PROJECT}': ${err.message}`)
        }
        for(const representation of args.relevantRepresentations) {
            const template = new Template(args.projectDir, representation, args.relevantOrientations, args.altSkin)
            await template.writeTemplate()
        }
    }

    constructor(projectDir: string, representation: Representation, orientations: OrientationString[], enableAltSkin: boolean) {
        this.projectDir = projectDir
        this.representation = representation
        this.orientations = orientations
        this.enableAltSkin = enableAltSkin
    }

    async writeTemplate() {
        Log.info(`Creating template for ${this.representation.id}...`)
        const dirName = path.join(this.projectDir, DIR_REPRESENTATIONS, this.representation.id)
        await fs.mkdir(dirName, {recursive: true})
        for(const orientation of this.orientations) {
            const filePath = canvasFilePath(this.projectDir, this.representation.id, orientation, false)
            const altFilePath = this.enableAltSkin ? canvasFilePath(this.projectDir, this.representation.id, orientation, true) : undefined

            
            if(await fileExists(filePath) || (altFilePath && await fileExists(altFilePath))) {
                Log.warn(` - Not creating ${this.representation} (${this.orientations}) template, file already exists`)
                continue
            }

            const fileWidth = orientation === `portrait`
                ? this.representation.resolution.width
                : this.representation.resolution.height
            const fileHeight = orientation === `portrait`
                ? this.representation.resolution.height
                : this.representation.resolution.width
            Log.debug(` - Creating template file with ${fileWidth}x${fileHeight}...`)

            const data = stringify(
                this.createTemplateFile(fileWidth, fileHeight)
            )
            await fs.writeFile(filePath, data)
            if(altFilePath) {
                await fs.writeFile(altFilePath, data)
            }
        }
        Log.info(`Created template for ${this.representation.id} at ${dirName}`)
    }

    /**
     * @returns A template SVG file using the provided bounds
     */
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
                                style: `fill:#000000;stroke:none`
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
        }
    }
}