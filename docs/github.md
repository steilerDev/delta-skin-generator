# Building and distributing skin through Github Actions and Github Releases

This CLI also provides a Github action that utilizes semantic-release to automatically build and release your skins on Github. In order for you to use this, you will first need to [create a Github repository and push your skin project to it](https://docs.github.com/en/get-started/start-your-journey/about-github-and-git). In order to use [Github Actions](https://docs.github.com/en/actions/quickstart) in your project, you will need to create a `.github/workflows` folder in your project and add the following file:

```yaml
name: Build & Publish

on:
    push:
      branches:
        - main

jobs:
  build-publish-skin:
    name: Build & Publish 
    runs-on: ubuntu-latest
    permissions:
        contents: write
    steps:
    - name: checkout
      uses: actions/checkout@v4
    - name: build_publish/skin
      uses: steilerDev/delta-skin-generator/gh-actions/build-publish@main
      with:
        gh-token: ${{ secrets.GITHUB_TOKEN }}
```

This action will automatically build and release your skin on Github. The automatic release is based on [semantic versioning](https://semver.org), and uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) to determine the version bump. Conventional commit messages are not necessarily required, since the configuration will always release (at least) a new patch version, however conventional commits will make the release notes more informative and version bumps more meaningful.

## Github Pages
In the future, the implementation of `delta-skin-generator docs` is expected to generate a static site that can be hosted on Github Pages. This will allow you to host your skin documentation and provide a preview of your skin.