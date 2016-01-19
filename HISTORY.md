History
=======

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

[@ryan-roemer]: https://github.com/ryan-roemer
[@zachhale]: https://github.com/zachhale
