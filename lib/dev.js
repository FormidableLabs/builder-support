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

var INDENT = 2;

var LOCAL_DEV_PATH = path.resolve("dev");

// Allow "not found", otherwise pass through errors.
var allowNotFound = function (callback) {
  return function (err, data) {
    if (err && err.code === "ENOENT") {
      return void callback(null, null);
    }

    callback(err, data);
  };
};

/**
 * Update `target` JSON structure with fields from `source`.
 *
 * @param {Object}  source      Source JSON object
 * @param {Object}  target      Target JSON object
 * @param {Boolean} isExternal  Is external (`../NAME-dev`) dev package.
 * @returns {Object}            Updated JSON object
 */
var updatePkg = function (source, target, isExternal) {
  // Clone source
  var pkg = JSON.parse(JSON.stringify(source));

  // Validation of source package.
  ["name", "description"].forEach(function (name) {
    if (!pkg[name]) {
      throw new Error("Source object missing field: " + name);
    }
  });

  var nameRe = new RegExp("(^|.*\/)(" + source.name + ")(\/.*|$)");

  // Update with internal "development" names
  pkg.name += "-dev";
  pkg.description += " (Development)";

  // Update external fields to add `-dev` if applicable and present.
  if (isExternal) {
    [
      "repository.url",
      "bugs.url",
      "homepage"
    ].forEach(function (paths) {
      // Traverse the package structure.
      var parts = paths.split(".");
      var pkgPart = pkg;
      parts.forEach(function (part, i) {
        if (pkgPart && pkgPart[part]) {
          if (i + 1 === parts.length) {
            // Done! Update part if present.
            if (nameRe.test(pkgPart[part])) {
              pkgPart[part] = pkgPart[part].replace(nameRe, "$1" + pkg.name + "$3");
            }
            return;
          }

          // Increment
          pkgPart = pkgPart[part];
          return;
        }

        // Failed.
        pkgPart = null;
      });
    });
  }

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

    findDevPath: ["readProdPackage", function (results, cb) {
      var pkg = results.readProdPackage;
      var externalDevPath = path.resolve("../" + pkg.name + "-dev");

      fs.stat(LOCAL_DEV_PATH, function (localErr) {
        if (localErr && localErr.code === "ENOENT") {
          return void fs.stat(externalDevPath, function (externalErr) {
            if (externalErr) {
              return void cb(new Error("Could not find dev directories in: " + [
                LOCAL_DEV_PATH,
                externalDevPath
              ].join(", ")));
            }
            cb(null, externalDevPath);
          });
        }
        cb(localErr, LOCAL_DEV_PATH);
      });
    }],

    readDevPackage: ["findDevPath", function (results, cb) {
      var pkgPath = path.join(results.findDevPath, "package.json");
      fs.readJson(pkgPath, allowNotFound(cb));
    }],

    updateDevPackage: [
      "findDevPath",
      "readDevPackage",
      "readProdPackage",
      function (results, cb) {
        var isExternal = results.findDevPath !== LOCAL_DEV_PATH;
        try {
          return cb(null, updatePkg(
            results.readProdPackage,
            results.readDevPackage,
            isExternal
          ));
        } catch (err) {
          return cb(err);
        }
      }
    ],

    writeDevPackage: ["findDevPath", "updateDevPackage", function (results, cb) {
      var pkgPath = path.join(results.findDevPath, "package.json");
      fs.writeFile(pkgPath, JSON.stringify(results.updateDevPackage, null, INDENT) + "\n", cb);
    }],

    // Copy all remaining files straight up.
    copyFiles: ["findDevPath", function (results, cb) {
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
