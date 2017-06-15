History
=======

## 0.4.1

* Display errors to console. ( [@InsidersByte][] )

## 0.4.0

* Add support for `../ARCHETYPE-dev` fallback directory if `./dev` directory
  does not exists.
* **Breaking Change**: Do not generate `./dev` directory on a new project if it
  does not exist. Either a `../ARCHETYPE-dev` or `./dev` directory must already
  exist before running `builder-support gen-dev`.

## 0.3.0

* Persist `peerDependencies` in `dev/package.json`.

## 0.2.0

* Add `.npmrc` to list of files copied. All files besides `package.json` are
  now optional to exist in archetype root.
* All file i/o is now asynchronous.
* Add unit tests.

## 0.1.0

* Allow empty `dev/*` directory and no `dependencies` field in
  `dev/package.json`. ( [@zachhale][] )

## 0.0.1

* Add `gen-dev` action.
* Initial release.

[@InsidersByte]: https://github.com/InsidersByte
[@ryan-roemer]: https://github.com/ryan-roemer
[@zachhale]: https://github.com/zachhale
