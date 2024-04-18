import { REPRESENTATIONS } from "./constants.js"

export type RepresentationString = `iphone-standard` | `iphone-e2e` | `ipad-standard` | `ipad-splitview`
export type OrientationString = `portrait` | `landscape`

export type RepresentationResolution = {
    width: number,
    height: number
}

export class Representation {
    id: RepresentationString
    orientation: OrientationString
    resolution: RepresentationResolution
    mappingSize: RepresentationResolution
    altSkin: boolean

    /**
     * Assumes resolution is given for 'portrait' mode. Will swap if orientation is landscape.
     */
    static applyOrientationToResolution(resolution: RepresentationResolution, orientation: OrientationString) {
        return orientation === `portrait`
            ? resolution
            : {
                width: resolution.height,
                height: resolution.width
            }
    }

    constructor(id: RepresentationString, orientation: OrientationString, altSkin: boolean) {
        this.id = id
        this.orientation = orientation
        this.resolution = Representation.applyOrientationToResolution(REPRESENTATIONS[id].resolution, orientation)
        this.mappingSize = Representation.applyOrientationToResolution(REPRESENTATIONS[id].mappingSize, orientation)
        this.altSkin = altSkin
    }

    toString() {
        return `${this.id} (${this.orientation})${this.altSkin ? ` as altSkin` : ``}`
    }
}