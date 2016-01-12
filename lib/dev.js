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

  // Validation of source package.
  ["name", "description"].forEach(function (name) {
    if (!pkg[name]) {
      throw new Error("Source object missing field: " + name);
    }
  });

  // Update with "development" names
  pkg.name += "-dev";
  pkg.description += " (Development)";

  // Copy back in `dependencies` from dev package
  pkg.dependencies = (target || {}).dependencies || {};

  // Remove scripts, dev deps, etc.
  pkg.scripts = {};
  pkg.devDependencies = {};

  return pkg;
};

// Run the dev script.
module.exports = function (callback) {
  var prodPkg = tryRequire("package.json");
  var devPath = path.resolve("dev/package.json");

  async.auto({
    ensureDevDirectory: fs.ensureDir.bind(fs, path.resolve("dev")),

    readDevPackage: function (cb) {
      var devPkg = {};
      try {
        devPkg = tryRequire(devPath);
      } catch (err) {
        // Ignore error and use default values.
      }

      cb(null, devPkg);
    },

    writeDevPackage: ["ensureDevDirectory", "readDevPackage", function (cb, results) {
      var updatedDevPkg = updatePkg(prodPkg, results.readDevPackage);
      fs.writeFile(devPath, JSON.stringify(updatedDevPkg, null, 2), cb);
    }],

    writeGitignore: ["ensureDevDirectory", function (cb) {
      fs.copy(
        path.resolve(".gitignore"),
        path.resolve("dev/.gitignore"),
        cb
      );
    }],

    writeReadme: ["ensureDevDirectory", function (cb) {
      fs.copy(
        path.resolve("README.md"),
        path.resolve("dev/README.md"),
        cb
      );
    }]
  }, callback);
};
