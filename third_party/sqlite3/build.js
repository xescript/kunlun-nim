#!/usr/bin/env node

// Build sqlite3 static library

"use strict";

const fs = require("fs");
const { execSync } = require("child_process");

function main() {
  try {
    enterCleanBuildDir();
    configure();
    execAndLog(`make sqlite3.c`);

    switch (process.platform) {
      case "darwin":
        buildForApple();
        break;
      default:
        throw new Error(`Unknown platform: ${process.platform}`);
    }
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
}

function execAndLog(...commands) {
  for (const cmd of commands) {
    console.log(`+ ${cmd}`);
    execSync(cmd);
  }
}

function enterCleanBuildDir() {
  process.chdir(__dirname);

  const buildDir = ".build";

  if (fs.existsSync(buildDir)) {
    console.log("Removing old build folder ...");
    fs.rmSync(buildDir, { recursive: true });
  }

  fs.mkdirSync(buildDir);

  process.chdir(buildDir);
}

function configure() {
  const opts = ["--enable-all", "--disable-tcl", "--disable-readline"];
  const command = `../source/configure ${opts.join(" ")}`;
  execAndLog(command);
}

/**
 * Build libsqlite.a for macOS & iOS
 */
function buildForApple() {
  const ar = "xcrun ar";
  const lipo = "xcrun lipo";
  let cc;

  // build for macOS
  console.log("Building for macOS ...");
  cc = "xcrun -sdk macosx clang -mmacosx-version-min=10.6 -O2 -Os";
  execAndLog(`${cc} -arch x86_64 -c sqlite3.c -o sqlite3.o`);
  execAndLog(`${ar} rcs libsqlite3-macos-x86_64.a sqlite3.o`);
  execAndLog(`${cc} -arch i386 -c sqlite3.c -o sqlite3.o`);
  execAndLog(`${ar} rcs libsqlite3-macos-i386.a sqlite3.o`);
  execAndLog(`${cc} -arch arm64 -c sqlite3.c -o sqlite3.o`);
  execAndLog(`${ar} rcs libsqlite3-macos-arm64.a sqlite3.o`);
  execAndLog(
    `${lipo} -create ` +
      "-output ../libsqlite3-macos-universe.a " +
      "libsqlite3-macos-x86_64.a " +
      "libsqlite3-macos-i386.a " +
      "libsqlite3-macos-arm64.a "
  );

  // build for iOS
  console.log("Building for iOS ...");
  // `-DHAVE_GETHOSTUUID=0`: Disable `gethostuuid()` warning.
  cc =
    "xcrun -sdk iphonesimulator clang -mios-version-min=9.0 -O2 -Os -DHAVE_GETHOSTUUID=0";
  execAndLog(`${cc} -arch x86_64 -c sqlite3.c -o sqlite3.o`);
  execAndLog(`${ar} rcs libsqlite3-ios-x86_64.a sqlite3.o`);
  execAndLog(`${cc} -arch i386 -c sqlite3.c -o sqlite3.o`);
  execAndLog(`${ar} rcs libsqlite3-ios-i386.a sqlite3.o`);
  cc =
    "xcrun -sdk iphoneos clang -mios-version-min=9.0 -O2 -Os -DHAVE_GETHOSTUUID=0";
  execAndLog(`${cc} -arch arm64 -c sqlite3.c -o sqlite3.o`);
  execAndLog(`${ar} rcs libsqlite3-ios-arm64.a sqlite3.o`);
  execAndLog(`${cc} -arch armv7 -c sqlite3.c -o sqlite3.o`);
  execAndLog(`${ar} rcs libsqlite3-ios-armv7.a sqlite3.o`);
  execAndLog(
    `${lipo} -create ` +
      "-output ../libsqlite3-ios-universe.a " +
      "libsqlite3-ios-x86_64.a " +
      "libsqlite3-ios-i386.a " +
      "libsqlite3-ios-arm64.a " +
      "libsqlite3-ios-armv7.a "
  );
}

main();
