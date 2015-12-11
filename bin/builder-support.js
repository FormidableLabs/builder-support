#!/usr/bin/env node
"use strict";

/*eslint-disable global-require*/
var ACTIONS = {
  "gen-dev": require("../lib/dev")
};
/*eslint-enable global-require*/

// builder-support <action>
var actionFlag = process.argv[2];
var action = ACTIONS[actionFlag];

if (!action) {
  throw new Error("Unknown action: " + actionFlag);
}

action(function (err) {
  /*eslint-disable no-process-exit*/
  process.exit(err ? err.code || 1 : 0);
});
