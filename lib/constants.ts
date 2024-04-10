// From: https://noah978.gitbook.io/delta-docs/skins#changing-the-images

const UNKNOWN = -1;

export type RepresentationString = `all` | `iphone` | `iphone-standard` | `iphone-e2e` | `ipad` | `ipad-standard` | `ipad-splitview`

type RepresentationResolution = {
    width: number,
    height: number
}
export type Representation = {
    id: RepresentationString,
    small: RepresentationResolution,
    medium: RepresentationResolution
    large: RepresentationResolution
}

export const REPRESENTATIONS = {
    iPhone: {
        standard: {
            id: `iphone-standard` as RepresentationString,
            small: {
                width: 640,
                height: 1136
            },
            medium: {
                width: 750,
                height: 1334
            },
            large: {
                width: 1080,
                height: 1920
            }
        },
        edgeToEdge: {
            id: `iphone-e2e` as RepresentationString,
            small: {
                width: 828,
                height: 1792
            },
            medium: {
                width: 1125,
                height: 2436
            },
            large: {
                width: 1242,
                height: 2688
            }
        }
    },
    iPad: {
        standard: {
            id: `ipad-standard` as RepresentationString,
            small: {
                width: UNKNOWN,
                height: UNKNOWN
            },
            medium: {
                width: UNKNOWN,
                height: UNKNOWN
            },
            large: {
                width: 2048,
                height: 2732
            }
        },
        splitView: {
            id: `ipad-splitview` as RepresentationString,
            small: {
                width: UNKNOWN,
                height: UNKNOWN
            },
            medium: {
                width: UNKNOWN,
                height: UNKNOWN
            },
            large: {
                width: UNKNOWN,
                height: UNKNOWN
            }
        }
    }
};

export const representationStringsToRepresentations = (strings: RepresentationString[]) => {
    const relevantRepresentations = new Set<Representation>();
    for(const representation of strings) {
        switch(representation) {
        default:
        case `all`:
            relevantRepresentations.add(REPRESENTATIONS.iPhone.standard);
            relevantRepresentations.add(REPRESENTATIONS.iPhone.edgeToEdge);
            relevantRepresentations.add(REPRESENTATIONS.iPad.splitView);
            relevantRepresentations.add(REPRESENTATIONS.iPad.standard);
            break;
        case `iphone`:
            relevantRepresentations.add(REPRESENTATIONS.iPhone.standard);
            relevantRepresentations.add(REPRESENTATIONS.iPhone.edgeToEdge);
            break;
        case `iphone-standard`:
            relevantRepresentations.add(REPRESENTATIONS.iPhone.standard);
            break;
        case `iphone-e2e`:
            relevantRepresentations.add(REPRESENTATIONS.iPhone.edgeToEdge);
            break;
        case `ipad`:
            relevantRepresentations.add(REPRESENTATIONS.iPad.splitView);
            relevantRepresentations.add(REPRESENTATIONS.iPad.standard);
            break;
        case `ipad-standard`:
            relevantRepresentations.add(REPRESENTATIONS.iPad.standard);
            break;
        case `ipad-splitview`:
            relevantRepresentations.add(REPRESENTATIONS.iPad.splitView);
            break;
        }
    }
    return Array.from(relevantRepresentations);
};

export const REPRESENTATION_FILES = [
    `portrait.svg`,
    `portrait-alt.svg`,
    `landscape.svg`,
    `landscape-alt.svg`
];

export const DIR_REPRESENTATIONS = `representations`;
export const DIR_COMPONENTS = `components`;
export const DIR_ELEMENTS = `elements`;