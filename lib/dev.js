"use strict";

/**
 * Update devDependencies module to archetype base script.
 */
var path = require("path");
var async = require("async");
var fs = require("fs-extra");

var tryRequire = function (filePath) {
  var resolved = path.resolve(filePath);
  try {
    /*eslint-disable global-require*/
    return require(resolved);
  } catch (err) {
    throw new Error("Unable to import: " + resolved + " with error:\n" + err.message);
  }
};

/**
 * Update `target` JSON structure with fields from `source`.
 *
 * @param {Object} source Source JSON object
 * @param {Object} target Target JSON object
 * @returns {Object}      Updated JSON object
 */
var updatePkg = function (source, target) {
  // Clone source
  var pkg = JSON.parse(JSON.stringify(source));

  // Validation
  ["name", "description", "dependencies"].forEach(function (name) {
    if (!pkg[name]) {
      throw new Error("Source object missing field: " + name);
    }
  });

  if (!target.dependencies) {
    throw new Error("Target object missing field: dependencies");
  }

  // Update with "development" names
  pkg.name += "-dev";
  pkg.description += " (Development)";

  // Patch `devDependencies` into `dependencies`
  pkg.dependencies = target.dependencies;

  // Remove scripts, dev deps, etc.
  pkg.scripts = {};
  pkg.devDependencies = {};

  return pkg;
};

// Run the dev script.
module.exports = function (callback) {
  var prodPkg = tryRequire("package.json");
  var devPath = path.resolve("dev/package.json");
  var devPkg = tryRequire(devPath);
  var updatedDevPkg = updatePkg(prodPkg, devPkg);

  async.parallel({
    package: function (cb) {
      fs.writeFile(devPath, JSON.stringify(updatedDevPkg, null, 2), cb);
    },
    gitignore: function (cb) {
      fs.copy(
        path.resolve(".gitignore"),
        path.resolve("dev/.gitignore"),
        cb
      );
    },
    readme: function (cb) {
      fs.copy(
        path.resolve("README.md"),
        path.resolve("dev/README.md"),
        cb
      );
    }
  }, callback);
};
