[![Travis Status][trav_img]][trav_site]

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
  `description`, `dependencies` fields.
* `dev/package.json` - Dependencies for development tasks only.
  Must have a `dependencies` field.

Assuming those exist, then the tool:

* Modifies `dev/package.json` as follows:
    * Copies the root `package.json`
    * Removes `package.json:devDependencies`
    * Replaces `package.json:dependencies` with `dev/package.json:dependencies`
    * Updates things like the `name` field to represent `dev`

* Copies `README.md` to `dev/README.md`
* Copies `.gitignore` to `dev/.gitignore`

This supports a workflow as follows:

```sh
$ vim HISTORY.md              # Version notes
$ vim package.json            # Bump version
$ builder-support gen-dev     # Generate `dev/package.json|README.md|.gitignore`
$ npm run builder:check       # Last check!
$ git add .
$ git commit -m "Version bump"
$ git tag -a "vNUMBER" -m "Version NUMBER"
$ git push && git push --tags
$ npm publish                 # Publish main project
$ cd dev && npm publish       # Publish dev project
```

If you are _bootstrapping_ a new archetype, this should get you going:

```sh
$ mkdir dev
$ touch dev/package.json
$ vim dev/package.json
{
  "dependencies: {}
}
```

And you should be good to run `builder-support gen-dev` in the project root.

[builder]: https://github.com/FormidableLabs/builder
[trav_img]: https://api.travis-ci.org/FormidableLabs/builder-support.svg
[trav_site]: https://travis-ci.org/FormidableLabs/builder-support
