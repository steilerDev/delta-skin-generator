#!/usr/bin/env node
import { Template } from './lib/template.js'
import { Log } from './lib/log.js'
import { Skin } from './lib/skin.js'
import { parseCLI } from './lib/cli.js'

Log.log(`Welcome to delta-skin-generator`)
Log.log(`made with <3 by steilerDev`)

const opts = parseCLI()

if(opts.command === `init`) {
    Log.info(`Initializing directory ${opts.projectDir}...`)
    await Template.create(opts)
    process.exit(0)
}

if(opts.command === `docs`) {
    Log.info(`Creating documentation for ${opts.projectDir}...`)
    Log.error(`Documentation creation is not yet implemented`)
    process.exit(1)
}

if(opts.command === `render`) {
    const skin = await Skin.loadProject(opts)
    if(!(await skin.create(opts.outputDir))) {
        Log.info(`Writing skin to ${opts.outputDir} failed`)
        process.exit(1)
    }
    Log.info(`Successfully wrote skin to ${opts.outputDir}`)
    process.exit(0)
}

Log.error(`Unknown command: ${opts.command}`)
process.exit(99)