#!/usr/bin/env node
"use strict";

/*eslint-disable global-require*/
var ACTIONS = {
  "gen-dev": require("../lib/dev")
};
/*eslint-enable global-require*/

// builder-support <action>
var actionFlag = process.argv[2]; // eslint-disable-line no-magic-numbers
var action = ACTIONS[actionFlag];

if (!action) {
  throw new Error("Unknown action: " + actionFlag);
}

action(function (err) {
  /*eslint-disable no-process-exit, no-console*/

  if (err) {
    console.error(err);
  }

  process.exit(err ? err.code || 1 : 0);
});
