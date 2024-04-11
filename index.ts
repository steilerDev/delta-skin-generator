#!/usr/bin/env node
import meow from 'meow'
import path from 'path'
import { Canvas } from "./lib/canvas.js"
import fs from 'fs/promises'
import { CLICommands, DIR_COMPONENTS, DIR_ELEMENTS, DIR_REPRESENTATIONS, OrientationString, orientationStringToRepresentation, RepresentationString, representationStringsToRepresentations } from './lib/constants.js'
import { Template } from './lib/template.js'
import { Log } from './lib/log.js'

const cli = meow(`
	Usage
	  $ skin-maker <options> [render | init]

	Options
	  --skin-dir, -d  Specifies the directory, where the skin is located, optional - defaults to '.'
	  --representations, -r Limit the generated representations - defaults to "all"
	  						possible values: "all", "iphone", "iphone-standard", "iphone-e2e", "ipad", "ipad-standard", "ipad-splitview"
	  --orientations, -o Specifies the orientation of representations that should be initialized.
	  --alt-skin, -a Enables AltSkin support.

	Commands
	  render Instructs the program to render the available / specified assets and creates a '.deltaskin' file.
	  init Instructs the program to initialize the specified templates within the project structure (this will not overwrite existing files).

	Examples
	  $ foo unicorns --rainbow
	  🌈 unicorns 🌈
`, {
    importMeta: import.meta,
    allowUnknownFlags: false,
    flags: {
        skinDir: {
            type: `string`,
            shortFlag: `d`,
            default: `.`
        },
        representations: {
            type: `string`,
            shortFlag: `r`,
            isMultiple: true,
            choices: [`all`, `iphone`, `iphone-standard`, `iphone-e2e`, `ipad`, `ipad-standard`, `ipad-splitview`],
            default: [`all`]
        },
		orientations: {
			type: `string`,
			shortFlag: 'o',
			isMultiple: true,
			choices: ['all', "portrait", "landscape"],
			default: ['all']
		}
    }
})

debugger

if(cli.input.length > 1) {
	throw new Error(`Unexpected command: ${cli.input.join(' ')}`)
}

const command: CLICommands = cli.input.length === 1
	? cli.input[0] as CLICommands
	: "render"

const projectDir = path.isAbsolute(cli.flags.skinDir) 
    ? cli.flags.skinDir
    : path.join(
        process.cwd(),
        cli.flags.skinDir
    )

const relevantRepresentations = representationStringsToRepresentations(cli.flags.representations as RepresentationString[])
const relevantOrientations = orientationStringToRepresentation(cli.flags.orientations as OrientationString[])

if(cli.flags.init) {
    Log.info(`Initializing directory ${cli.flags.skinDir}...`)
	
    await fs.mkdir(path.join(projectDir, DIR_REPRESENTATIONS), {recursive: true})
    await fs.mkdir(path.join(projectDir, DIR_COMPONENTS), {recursive: true})
    await fs.mkdir(path.join(projectDir, DIR_ELEMENTS), {recursive: true})

    await Template.create(projectDir, relevantRepresentations)

    process.exit(0)
}


const canvas = await Canvas.create(`data/canvas.svg`, projectDir)
await canvas.render()