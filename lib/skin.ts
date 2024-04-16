import fs from 'fs/promises'
import path from 'path'
import { FILE_PROJECT, FILE_PROJECT_OUTPUT} from './constants.js'
import { Canvas } from './canvas.js'
import { Log } from './log.js'
import { ElementType } from './elements.js'
import AdmZip from 'adm-zip'
import { CLIArgs } from './cli.js'

type SkinGeneratorConfigurationFile = {
    author: string,
    version: string,
    skinName: string,
    skinId: string,
    system: GameTypeIdentifier
}

export type SkinConfiguration = {
    name: string,
    identifier: string,
    gameTypeIdentifier: GameTypeIdentifier,
    debug: boolean,
    translucent: boolean,
    representations: {
        iphone?: {
            standard?: SkinConfigurationRepresentations
            edgeToEdge?: SkinConfigurationRepresentations
        },
        ipad?: {
            standard?: SkinConfigurationRepresentations,
            splitView?: SkinConfigurationRepresentations
        }
    }
}

type GameTypeIdentifier = 
    `com.rileytestut.delta.game.gbc` |
    `com.rileytestut.delta.game.gba` |
    `com.rileytestut.delta.game.ds` |
    `com.rileytestut.delta.game.nes` |
    `com.rileytestut.delta.game.snes` |
    `com.rileytestut.delta.game.n64` |
    `com.rileytestut.delta.game.genesis`

type SkinConfigurationRepresentations = {
    landscape?: SkinConfigurationRepresentation,
    portrait?: SkinConfigurationRepresentation
}

type SkinConfigurationRepresentation = {
    assets: SkinConfigurationAssets,
    items: SkinConfigurationItem[],
    screens: SkinConfigurationScreen[],
    mappingSize: SkinConfigurationMappingSize,
    //"extendedEdges" : {...},
    translucent: boolean
}

type SkinConfigurationAssets = {
    small: string,
    medium: string,
    large: string
}

// See https://noah978.gitbook.io/delta-docs/skins#mapping-size
type SkinConfigurationMappingSize = {
    width: number,
    height: number
}

type SkinConfigurationDimensions = {
    x: number,
    y: number,
    width: number,
    height: number
}

type SkinConfigurationDirections = {
    top?: number,
    bottom?: number,
    left?: number,
    right?: number
}

type SkinConfigurationItem = {
    inputs: ElementType[],
    frame: SkinConfigurationDimensions,
    extendedEdges?: SkinConfigurationDirections
}

type SkinConfigurationScreen = {
    inputFrame: SkinConfigurationDimensions,
    outputFrame: SkinConfigurationDimensions,
    filters?: SkinConfigurationFilter
}

type SkinConfigurationFilter = {
    name: string,
    parameters: unknown
}

/**
 * The Skin class represents the whole project, containing (at least) one canvas
 */
export class Skin {
    configuration: SkinGeneratorConfigurationFile
    canvas: Canvas[]

    static async loadProject(args: CLIArgs): Promise<Skin> {
        const config = JSON.parse((await fs.readFile(path.join(args.projectDir, FILE_PROJECT))).toString()) as SkinGeneratorConfigurationFile
        const canvas: Canvas[] = []
        for(const representation of args.relevantRepresentations) {
            for(const orientation of args.relevantOrientations) {
                try {
                    canvas.push(await Canvas.create(
                        args.projectDir,
                        representation,
                        orientation,
                        false
                    ))
                } catch (err) {
                    Log.warn(`Unable to create representation ${representation.id} with orientation ${orientation}: ${err.message}`)
                }
                if(args.altSkin) {
                    try {
                        canvas.push(await Canvas.create(
                            args.projectDir,
                            representation,
                            orientation,
                            true
                        ))
                    } catch (err) {
                        Log.warn(`Unable to create representation alt ${representation.id} with orientation ${orientation}: ${err.message}`)
                    }
                }
            }
        }
        return new Skin(config, canvas)
    }

    constructor(configuration: SkinGeneratorConfigurationFile, canvas: Canvas[]) {
        this.configuration = configuration
        this.canvas = canvas
    }

    async create(outputDir: string): Promise<boolean> {
        const fileName = this.configuration.skinName + `-` + this.configuration.version + `.deltaskin`
        Log.info(`Creating skin ${this.configuration.skinName} by ${this.configuration.author} - writing file to ${fileName}`)

        const zip = new AdmZip()

        Log.info(`Rendering canvas...`)
        const skinConfig = {} as SkinConfiguration
        skinConfig.name = this.configuration.skinName
        skinConfig.identifier = this.configuration.skinId
        skinConfig.gameTypeIdentifier = this.configuration.system
        skinConfig.representations = {}

        for(const canvas of this.canvas) {
            await canvas.pack(zip)
            //canvas.addConfig(skinConfig)
        }

        zip.addFile(FILE_PROJECT_OUTPUT, Buffer.from(JSON.stringify(skinConfig)))
        return await zip.writeZipPromise(path.join(outputDir, fileName))
    }
}