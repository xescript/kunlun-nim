#!/usr/bin/env node

// Build oniguruma static library

"use strict";

const fs = require("fs");
const { execSync } = require("child_process");

function main() {
  try {
    autoreconf();

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

function autoreconf() {
  process.chdir(__dirname);
  process.chdir("source");
  execAndLog("autoreconf -vfi");
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

function configure(...extOpts) {
  const opts = Array.prototype.concat(
    ["--disable-dependency-tracking", "--enable-static", "--disable-shared"],
    extOpts
  );
  const command = `../source/configure ${opts.join(" ")}`;
  execAndLog(command);
}

/**
 * Build libsqlite.a for macOS & iOS
 */
function buildForApple() {
  function build(os, arch) {
    console.log(`> Building for ${os}-${arch} ...`);
    let host, sdkName, sdkRoot, cc, cflags;
    if (os === "macos") {
      sdkName = "macosx";
      host = `${arch}-apple-darwin`;
      cflags = "-mmacosx-version-min=10.6";
    }
    if (os === "ios") {
      host = `${arch}-apple-darwin`;
      cflags = "-miphoneos-version-min=9.0";
      switch (arch) {
        case "x86_64":
        case "i386":
          sdkName = "iphonesimulator";
          break;
        default:
          sdkName = "iphoneos";
          break;
      }
    }

    cc = execSync(`xcrun -sdk ${sdkName} --find clang`).toString().trimEnd();
    sdkRoot = execSync(`xcrun -sdk ${sdkName} -show-sdk-path`)
      .toString()
      .trimEnd();
    cflags = `-arch ${arch} ${cflags} -isysroot ${sdkRoot} -O2 -Os`;

    enterCleanBuildDir();
    configure(`CC="${cc}"`, `CFLAGS="${cflags}"`, `--host=${host}`);
    execAndLog("make");

    process.chdir(__dirname);
    if (!fs.existsSync("dist")) fs.mkdirSync("dist");
    fs.renameSync(".build/src/.libs/libonig.a", `dist/libonig-${os}-${arch}.a`);
  }

  function combine(os, arches) {
    const libs = arches.map((arch) => `dist/libonig-${os}-${arch}.a`);
    const output = `libonig-${os}-universe.a`;
    process.chdir(__dirname);
    execAndLog(`xcrun lipo -create -output ${output} ${libs.join(" ")}`);
  }

  build("macos", "x86_64");
  build("macos", "arm64");
  combine("macos", ["x86_64", "arm64"]);

  build("ios", "x86_64");
  build("ios", "i386");
  build("ios", "arm64");
  build("ios", "armv7s");
  build("ios", "armv7");
  combine("ios", ["x86_64", "i386", "arm64", "armv7s", "armv7"]);
}

main();
