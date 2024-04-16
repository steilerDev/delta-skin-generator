import meow from "meow"
import { Log } from "./log.js"
import path from 'path'
import { OrientationString, Representation, REPRESENTATIONS } from "./constants.js"

/**
 * Types required for running CLI app
 */
type CLICommands = `render` | `init`
type CLIRepresentationString = `all` | `iphone` | `iphone-standard` | `iphone-e2e` | `ipad` | `ipad-standard` | `ipad-splitview`
type CLIOrientationString = `all` | `portrait` | `landscape`

export type CLIArgs = {
    command: CLICommands,
    projectDir: string,
    outputDir: string
    relevantOrientations: OrientationString[],
    relevantRepresentations: Representation[],
    altSkin: boolean
}

/**
 * @returns The parsed CLI arguments for this execution
 */
export const parseCLI = () => {
    const parsedArgs = {} as CLIArgs
    const cli = meow(`
        Usage
        $ skin-maker <options> [render | init]

        Options
        --project-dir, -d       Specifies the directory, where the skin is located.
                                Optional - defaults to '.'
        --output-dir, -o        Specifies the directory, were rendered skins should be written to.
                                Optional - defaults to '--project-dir'
        --representations, -r   Limit the generated representations
                                Optional - defaults to 'all'
                                Possible values: 'all', 'iphone', 'iphone-standard', 'iphone-e2e', 'ipad', 'ipad-standard', 'ipad-splitview'
        --orientations, -o      Limit the generated orientations
                                Optional - defaults to 'all'
                                Possible values: 'all', 'landscape', 'portrait'
        --disable-alt-skin, -a  Disables AltSkin support.
                                Optional - defaults to 'false'

        Commands
        render      Instructs the program to render the available / specified assets and creates a '.deltaskin' file.
        init        Instructs the program to initialize the specified templates within the project structure (this will not overwrite existing files).

        Examples
        $ skin-maker --o 'iphone' render

        See https://dsg.steiler.dev/#/guide for a detailed guide.
    `, {
        importMeta: import.meta,
        allowUnknownFlags: false,
        flags: {
            outputDir: {
                type: `string`,
                shortFlag: `o`,
                default: `.`
            },
            projectDir: {
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
                shortFlag: `o`,
                isMultiple: true,
                choices: [`all`, `portrait`, `landscape`],
                default: [`all`]
            },
            disableAltSkin: {
                type: `boolean`,
                shortFlag: `a`,
                default: false
            }
        }
    })

    if(cli.input.length > 1) {
        Log.error(`Unexpected command: ${cli.input.join(` `)}`)
        return undefined
    }

    parsedArgs.command = cli.input.length === 1
        ? cli.input[0] as CLICommands
        : `render`

    parsedArgs.projectDir = getAbsolutePath(cli.flags.projectDir)
    parsedArgs.outputDir = cli.flags.outputDir
        ? getAbsolutePath(cli.flags.outputDir)
        : parsedArgs.projectDir

    
    parsedArgs.relevantRepresentations = representationStringsToRepresentations(cli.flags.representations as CLIRepresentationString[])
    parsedArgs.relevantOrientations = orientationStringToRepresentation(cli.flags.orientations as CLIOrientationString[])

    parsedArgs.altSkin = !cli.flags.disableAltSkin

    return parsedArgs
}

/**
 * @returns The absolute path, if path is relative to pwd.
 */
const getAbsolutePath = (pathString: string) => {
    return path.isAbsolute(pathString) 
        ? pathString
        : path.join(
            process.cwd(),
            pathString
        )
}

/**
 * Helper function to convert CLI options (orientation) into library types
 */
const orientationStringToRepresentation = (strings: CLIOrientationString[]) => {
    const relevantOrientations = new Set<OrientationString>()
    for(const orientation of strings) {
        switch(orientation) {
        case `all`:
            relevantOrientations.add(`portrait`)
            relevantOrientations.add(`landscape`)
            break
        case `landscape`:
        case `portrait`:
        default:
            relevantOrientations.add(orientation)
            break
        }
    }
    return Array.from(relevantOrientations)
}

/**
 * Helper function to convert CLI options (representations) into library types
 */
const representationStringsToRepresentations = (strings: CLIRepresentationString[]) => {
    const relevantRepresentations = new Set<Representation>()
    for(const representation of strings) {
        switch(representation) {
        case `all`:
            relevantRepresentations.add(REPRESENTATIONS[`iphone-standard`])
            relevantRepresentations.add(REPRESENTATIONS[`iphone-e2e`])
            relevantRepresentations.add(REPRESENTATIONS[`ipad-standard`])
            relevantRepresentations.add(REPRESENTATIONS[`ipad-splitview`])
            break
        case `iphone`:
            relevantRepresentations.add(REPRESENTATIONS[`iphone-standard`])
            relevantRepresentations.add(REPRESENTATIONS[`iphone-e2e`])
            break
        case `ipad`:
            relevantRepresentations.add(REPRESENTATIONS[`ipad-standard`])
            relevantRepresentations.add(REPRESENTATIONS[`ipad-splitview`])
            break
        case `iphone-standard`:
        case `iphone-e2e`:
        case `ipad-standard`:
        case `ipad-splitview`:
        default:
            relevantRepresentations.add(REPRESENTATIONS[representation])
            break
        }
    }
    return Array.from(relevantRepresentations)
}