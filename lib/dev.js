"use strict";

/**
 * Update devDependencies module to archetype base script.
 */
var path = require("path");
var async = require("async");
var fs = require("fs-extra");

// Production files to copy over unmutated to development directory.
// Allowed to not exist (and not copied in that case).
//
// **Note**: Only copies files from root directory. We'll need to add something
// like `ensureFile` if we want to have nested path file copies.
var FILES = [
  ".gitignore",
  ".npmrc",
  "README.md"
];

// Allow "not found", otherwise pass through errors.
var allowNotFound = function (callback) {
  return function (err, data) {
    if (err && err.code === "ENOENT") {
      return callback(null, null);
    }

    callback(err, data);
  };
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

  // Copy back in dependencies from dev package
  pkg.dependencies = (target || {}).dependencies || {};
  pkg.peerDependencies = (target || {}).peerDependencies || {};

  // Remove scripts, dev deps, etc.
  pkg.scripts = {};
  pkg.devDependencies = {};

  return pkg;
};

// Run the dev script.
module.exports = function (callback) {
  async.auto({
    readProdPackage: function (cb) {
      fs.readJson(path.resolve("package.json"), cb);
    },

    findDevPath: ["readProdPackage", function (cb, results) {
      var pkg = results.readProdPackage;
      var localDevPath = path.resolve("dev");
      var externalDevPath = path.resolve("../" + pkg.name + "-dev");

      fs.stat(localDevPath, function (localErr) {
        if (localErr && localErr.code === "ENOENT") {
          return fs.stat(externalDevPath, function (externalErr) {
            if (externalErr) {
              return cb(new Error("Could not find dev directories in: " + [
                localDevPath,
                externalDevPath
              ].join(", ")));
            }
            cb(null, externalDevPath);
          });
        }
        cb(localErr, localDevPath);
      });
    }],

    readDevPackage: ["findDevPath", function (cb, results) {
      var pkgPath = path.join(results.findDevPath, "package.json");
      fs.readJson(pkgPath, allowNotFound(cb));
    }],

    updateDevPackage: [
      "findDevPath",
      "readDevPackage",
      "readProdPackage",
      function (cb, results) {
        try {
          return cb(null, updatePkg(results.readProdPackage, results.readDevPackage));
        } catch (err) {
          return cb(err);
        }
      }
    ],

    writeDevPackage: ["findDevPath", "updateDevPackage", function (cb, results) {
      var pkgPath = path.join(results.findDevPath, "package.json");
      fs.writeFile(pkgPath, JSON.stringify(results.updateDevPackage, null, 2) + "\n", cb);
    }],

    // Copy all remaining files straight up.
    copyFiles: ["findDevPath", function (cb, results) {
      async.map(FILES, function (fileName, mapCb) {
        fs.copy(
          path.resolve(fileName),
          path.resolve(path.join(results.findDevPath, fileName)),
          allowNotFound(mapCb)
        );
      }, cb);
    }]
  }, callback);
};
