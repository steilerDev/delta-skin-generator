import meow from 'meow'
import path from 'path'
import { Canvas } from "./lib/canvas.js"

const cli = meow(`
	Usage
	  $ skin-maker

	Options
	  --skin-dir, -d  Specifies the directory, where the skin is located, optional - defaults to '.'
      --init, -i Specifies if the directory should initialized using the correct directory layout

	Examples
	  $ foo unicorns --rainbow
	  🌈 unicorns 🌈
`, {
	importMeta: import.meta,
    allowUnknownFlags: false,
	flags: {
		skinDir: {
			type: 'string',
			shortFlag: 'd',
            default: '.'
		},
        init: {
            type: 'boolean',
            shortFlag: 'i',
            default: false
        }
	}
});

if(!path.isAbsolute(cli.flags.skinDir)) {
    cli.flags.skinDir = path.join(
        process.cwd(),
        cli.flags.skinDir
    )
}

if(cli.flags.init) {
    console.log(`Initializing directory ${cli.flags.skinDir}...`)
}

const canvas = await Canvas.create("data/canvas.svg", cli.flags.skinDir)
await canvas.render()
debugger