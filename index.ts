#!/usr/bin/env node
import meow from 'meow'
import path from 'path'
import { Canvas } from "./lib/canvas.js"
import fs from 'fs/promises'
import { DIR_COMPONENTS, DIR_ELEMENTS, DIR_REPRESENTATIONS, RepresentationString, representationStringsToRepresentations } from './lib/constants.js'
import { Template } from './lib/template.js'
import { Log } from './lib/log.js'

const cli = meow(`
	Usage
	  $ skin-maker

	Options
	  --skin-dir, -d  Specifies the directory, where the skin is located, optional - defaults to '.'
      --init, -i Specifies if the directory should initialized using the correct directory layout
	  --representations, -r Specifies the representation that should be initialized / rendered.

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
        init: {
            type: `boolean`,
            shortFlag: `i`,
            default: false
        },
        representations: {
            type: `string`,
            shortFlag: `r`,
            isMultiple: true,
            choices: [`all`, `iphone`, `iphone-standard`, `iphone-e2e`, `ipad`, `ipad-standard`, `ipad-splitview`],
            default: [`all`]
        }
    }
})

const projectDir = path.isAbsolute(cli.flags.skinDir) 
    ? cli.flags.skinDir
    : path.join(
        process.cwd(),
        cli.flags.skinDir
    )

const relevantRepresentations = representationStringsToRepresentations(cli.flags.representations as RepresentationString[])

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