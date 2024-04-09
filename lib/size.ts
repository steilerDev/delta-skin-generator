// From: https://noah978.gitbook.io/delta-docs/skins#changing-the-images

const UNKNOWN = -1

export const SIZES = {
    iPhone: {
        standard: {
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
}