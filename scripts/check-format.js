#!/usr/bin/env node
"use strict";

const { execSync } = require("child_process");

function execAndLog(command) {
  console.log(`+ ${command}`);
  execSync(command);
}

function main() {
  try {
    execAndLog(`npx prettier --check "**/*.{md,json,yml,js,vue}"`);
  } catch (e) {
    process.exit(1);
  }
}

main();
