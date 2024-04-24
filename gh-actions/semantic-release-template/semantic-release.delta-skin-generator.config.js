/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
    branches: [`main`],
    plugins: [
        [
            `@semantic-release/commit-analyzer`,
            {
                preset: `angular`,
                releaseRules: [
                    { message: `**`, release: `patch` },
                ]
            }
        ],
        `@semantic-release/release-notes-generator`,
        [
            `@semantic-release/exec`,
            {
                prepareCmd: `jq '.version = "\${nextRelease.version}"' skin.json | sponge skin.json && delta-skin-generator render`
            }
        ],
        [
            `@semantic-release/github`,
            {
                assets: [ `dist/*.deltaskin`]
            }
        ]
    ]
}