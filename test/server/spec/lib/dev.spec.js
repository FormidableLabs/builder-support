"use strict";

// FS Imports: `mock-fs` _must_ come before `fs-extra`
var mock = require("mock-fs");
var fs = require("fs-extra");

var genDev = require("../../../../lib/dev");

require("../base.spec");

describe("lib/dev", function () {

  after(function () {
    mock.restore();
  });

  describe("validation", function () {
    it("fails on missing package.json", function (done) {
      mock({
        ".gitignore": "",
        "README.md": ""
      });

      genDev(function (err) {
        expect(err)
          .to.be.ok.and
          .to.have.property("message").and
            .to.contain("package.json");

        done();
      });
    });

    it("fails on missing package.json:name", function (done) {
      mock({
        "package.json": JSON.stringify({
          description: "foo desc",
          dependencies: {}
        }),
        ".gitignore": "",
        "README.md": ""
      });

      genDev(function (err) {
        expect(err)
          .to.be.ok.and
          .to.have.property("message").and
            .to.contain("name");

        done();
      });
    });

    it("fails on malformed package.json", function (done) {
      mock({
        "package.json": "{ bad: {",
        ".gitignore": "",
        "README.md": ""
      });

      genDev(function (err) {
        expect(err)
          .to.be.ok.and
          .to.have.property("message").and
            .to.contain("Unexpected token");

        done();
      });
    });
  });

  describe("dev/package.json", function () {

    it("creates missing dev/package.json", function (done) {
      mock({
        "package.json": JSON.stringify({
          name: "foo",
          description: "foo desc",
          dependencies: {}
        }),
        ".gitignore": "IGNORE",
        "README.md": "READ"
      });

      genDev(function (err) {
        if (err) { return done(err); }

        // NOTE: Sync methods are OK here because mocked and in-memory.
        var devPkg = fs.readJsonSync("dev/package.json");
        expect(devPkg).to.have.property("name", "foo-dev");
        expect(devPkg).to.have.property("description", "foo desc (Development)");
        expect(devPkg).to.have.property("dependencies").to.eql({});
        expect(devPkg).to.have.property("devDependencies").to.eql({});

        expect(fs.readFileSync(".gitignore").toString()).to.equal("IGNORE");
        expect(fs.existsSync(".npmrc")).to.equal(false);
        expect(fs.readFileSync("README.md").toString()).to.equal("READ");

        done();
      });
    });

    it("updates existing dev/package.json", function (done) {
      mock({
        "package.json": JSON.stringify({
          name: "foo",
          description: "foo desc",
          dependencies: {},
          peerDependencies: {}
        }),
        ".gitignore": "IGNORE",
        ".npmrc": "NPM",
        "README.md": "READ",
        "dev/package.json": JSON.stringify({
          dependencies: {
            "foo": "^1.0.0"
          },
          "peerDependencies": {
            "bar": "^2.0.0"
          }
        })
      });

      genDev(function (err) {
        if (err) { return done(err); }

        // NOTE: Sync methods are OK here because mocked and in-memory.
        var devPkg = fs.readJsonSync("dev/package.json");
        expect(devPkg).to.have.property("name", "foo-dev");
        expect(devPkg).to.have.property("description", "foo desc (Development)");
        expect(devPkg).to.have.property("dependencies").to.eql({
          "foo": "^1.0.0"
        });
        expect(devPkg).to.have.property("peerDependencies").to.eql({
          "bar": "^2.0.0"
        });
        expect(devPkg).to.have.property("devDependencies").to.eql({});

        expect(fs.readFileSync(".gitignore").toString()).to.equal("IGNORE");
        expect(fs.readFileSync(".npmrc").toString()).to.equal("NPM");
        expect(fs.readFileSync("README.md").toString()).to.equal("READ");

        done();
      });
    });
  });

  describe("file copying", function () {
    it("allows just package.json", function (done) {
      mock({
        "package.json": JSON.stringify({
          name: "foo",
          description: "foo desc",
          dependencies: {}
        })
      });

      genDev(function (err) {
        if (err) { return done(err); }

        // NOTE: Sync methods are OK here because mocked and in-memory.
        var devPkg = fs.readJsonSync("dev/package.json");
        expect(devPkg).to.have.property("name", "foo-dev");
        expect(devPkg).to.have.property("description", "foo desc (Development)");
        expect(devPkg).to.have.property("dependencies").to.eql({});
        expect(devPkg).to.have.property("devDependencies").to.eql({});

        expect(fs.existsSync(".gitignore")).to.equal(false);
        expect(fs.existsSync(".npmrc")).to.equal(false);
        expect(fs.existsSync("README.md")).to.equal(false);

        done();
      });
    });
  });
});
