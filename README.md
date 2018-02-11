[![Travis Status][trav_img]][trav_site]
[![Coverage Status][cov_img]][cov_site]

Builder Support Tools
=====================

Support tools for authoring [builder][] archetypes.

## Installation

To use the production and development workflows, install both this package
and the development module:

```sh
$ npm install --save-dev builder-support
```

## Usage

### builder-support gen-dev

Use this tool to create an `ARCHETYPE-dev` module for publishing alongside
`ARCHETYPE` with the same version numbers, details, etc.

This tools assumes an archetype structure of:

* `package.json` - Dependencies needed for production tasks and `scripts` entry
  that has tasks for both production and development. Must have `name`,
  `description` fields.
* A development sub-directory or independent repository containing dependencies
  for development tasks only. One of the following should exist:
    * `./dev`
    * `../ARCHETYPE-dev`

Assuming those exist, then the tool:

* Modifies `ARCHETYPE-dev/package.json` as follows:
    * Copies the root `package.json`
    * Removes `package.json:devDependencies`
    * Replaces `package.json:dependencies` that were copied from root with
      `ARCHTYPE-dev/package.json:dependencies`
    * Updates things like the `name` field to represent `ARCHETYPE-dev`

* Copies `README.md` to `ARCHETYPE-dev/README.md`
* Copies `.gitignore` to `ARCHETYPE-dev/.gitignore`

This supports a workflow as follows:

```sh
$ vim HISTORY.md              # Version notes
$ vim package.json            # Bump version
$ builder-support gen-dev     # Generate `ARCHETYPE-dev` files
$ npm run builder:check       # Last check!
$ git add .
$ git commit -m "Version bump"
$ git tag -a "vNUMBER" -m "Version NUMBER"
$ git push && git push --tags
$ npm publish                 # Publish main project

# Publish dev project in same repo
$ cd dev && npm publish

# (OR) Publish dev project in different, parallel repo
$ cd ../ARCHETYPE-dev
$ git commit -m "Version bump"
$ git tag -a "vNUMBER" -m "Version NUMBER"
$ git push && git push --tags
$ npm publish                 # Publish dev project
```

If you are _bootstrapping_ a new archetype you will need to ensure either that
a `ARCHETYPE/dev` or `../ARCHETYPE-dev` directory exists. The rest of the files
when then be properly generated into the dev project.

And you should be good to run `builder-support gen-dev` in the project root.

[builder]: https://github.com/FormidableLabs/builder
[trav_img]: https://api.travis-ci.org/FormidableLabs/builder-support.svg
[trav_site]: https://travis-ci.org/FormidableLabs/builder-support
[cov]: https://coveralls.io
[cov_img]: https://img.shields.io/coveralls/FormidableLabs/builder-support.svg
[cov_site]: https://coveralls.io/r/FormidableLabs/builder-support
