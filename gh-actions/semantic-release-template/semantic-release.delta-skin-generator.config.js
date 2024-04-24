/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
    branches: ["master", "next"],
    plugins: [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        [
            "@semantic-release/exec",
            {
                prepareCmd: "jq '.version = \"${nextRelease.version}\" skin.json | sponge skin.json"
            }
        ],
        [
            "@semantic-release/github",
            {
                assets: [ "dist/*.deltaskin"]
            }
        ]
    ]
  };