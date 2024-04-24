import meow from "meow"
import meowHelp from "cli-meow-help"
import path from 'path'
import { OrientationString, Representation, RepresentationString } from "./representation.js"

/**
 * Types required for running CLI app
 */
type CLICommands = `render` | `init` | `docs`
type CLIRepresentationString = `all` | `iphone` | `iphone-standard` | `iphone-e2e` | `ipad` | `ipad-standard` | `ipad-splitview`
type CLIOrientationString = `all` | `portrait` | `landscape`

type ParsedCLIArgs = {
    projectDir: string,
    outputDir: string,
    representations: string[],
    orientations: string[],
    disableAltSkin: boolean,
}

export type CLIArgs = {
    command: CLICommands,
    projectDir: string,
    outputDir: string
    representations: Representation[],
}

/**
 * @returns The parsed CLI arguments for this execution
 */
export const parseCLI = () => {
    const parsedArgs = {} as CLIArgs

    const commands = {
        render: {desc: `Instructs the program to render the available / specified assets and creates a '.deltaskin' file. This is the default command, if no command is specified.`},
        init: {desc: `Instructs the program to initialize the specified templates within the project structure (this will not overwrite existing files).`},
        docs: {desc: `Creates documentation assets based on the available / specified assets.`},
    }

    const flags = {
        outputDir: {
            desc: `Specifies the directory, were rendered skins should be written to`,
            type: `string`,
            shortFlag: `O`
        },
        projectDir: {
            desc: `Specifies the directory, where the skin is located`,
            type: `string`,
            shortFlag: `d`,
            default: `.`
        },
        representations: {
            desc: `Limit the generated representations`,
            type: `string`,
            shortFlag: `r`,
            isMultiple: true,
            choices: [`all`, `iphone`, `iphone-standard`, `iphone-e2e`, `ipad`, `ipad-standard`, `ipad-splitview`],
            default: [`all`]
        },
        orientations: {
            desc: `Limit the generated orientations`,
            type: `string`,
            shortFlag: `o`,
            isMultiple: true,
            choices: [`all`, `portrait`, `landscape`],
            default: [`all`]
        },
        disableAltSkin: {
            desc: `Disables AltSkin support`,
            type: `boolean`,
            shortFlag: `a`,
            default: false
        }
    }

    const helpText = meowHelp({
        name: `delta-skin-generator`,
        footer: `Made with <3 by steilerDev\nSee https://dsg.steiler.dev/#/guide for a detailed guide.`,
        flags,
        commands
    })

    const cli = meow(helpText, {
        importMeta: import.meta,
        allowUnknownFlags: false,
        autoHelp: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        flags: (flags as any)
    })

    if(cli.input.length > 1 || !Object.keys(commands).includes(cli.input[0])) {
        const err = new Error(`Unknown command: ${cli.input.join(` `)}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any).helpText = helpText
        throw err
    }

    parsedArgs.command = cli.input.length === 1
        ? cli.input[0] as CLICommands
        : `render`

    const parsedCLIFlags = cli.flags as ParsedCLIArgs

    parsedArgs.projectDir = getAbsolutePath(parsedCLIFlags.projectDir)
    parsedArgs.outputDir = parsedCLIFlags.outputDir
        ? getAbsolutePath(parsedCLIFlags.outputDir)
        : path.join(parsedArgs.projectDir, `dist`)

    parsedArgs.representations = cliToRepresentations(parsedCLIFlags.representations as CLIRepresentationString[], parsedCLIFlags.orientations as CLIOrientationString[], parsedCLIFlags.disableAltSkin)

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
const cliOrientationStringsToOrientationStrings = (strings: CLIOrientationString[]) => {
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
 * Helper function to convert CLI options (representation) into library types
 */
const cliRepresentationStringsToRepresentationStrings = (strings: CLIRepresentationString[]) => {
    const relevantRepresentations = new Set<RepresentationString>()
    for(const representation of strings) {
        switch(representation) {
        case `all`:
            relevantRepresentations.add(`ipad-splitview`)
            relevantRepresentations.add(`ipad-standard`)
            relevantRepresentations.add(`iphone-standard`)
            relevantRepresentations.add(`iphone-e2e`)
            break
        case `iphone`:
            relevantRepresentations.add(`iphone-standard`)
            relevantRepresentations.add(`iphone-e2e`)
            break
        case `ipad`:
            relevantRepresentations.add(`ipad-splitview`)
            relevantRepresentations.add(`ipad-standard`)
            break
        default:
        case `iphone-standard`:
        case `iphone-e2e`:
        case `ipad-standard`:
        case `ipad-splitview`:
            relevantRepresentations.add(representation)
            break
        }
    }
    return Array.from(relevantRepresentations)
}

/**
 * Helper function to convert CLI options into library type
 */
const cliToRepresentations = (representationStrings: CLIRepresentationString[], orientationStrings: CLIOrientationString[], disableAltSkin: boolean) => {
    const relevantRepresentationStrings = cliRepresentationStringsToRepresentationStrings(representationStrings)
    const relevantOrientationStrings = cliOrientationStringsToOrientationStrings(orientationStrings)

    const representations: Representation[] = []

    for(const relevantRepresentationString of relevantRepresentationStrings) {
        for(const relevantOrientationString of relevantOrientationStrings) {
            representations.push(new Representation(relevantRepresentationString, relevantOrientationString, false))
            if(!disableAltSkin) {
                representations.push(new Representation(relevantRepresentationString, relevantOrientationString, true))
            }
        }
    }
    return representations
}