#!/usr/bin/env node

/**
 * Copyright 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
// Based on https://github.com/reactjs/react-codemod/blob/dd8671c9a470a2c342b221ec903c574cf31e9f57/bin/cli.js
// @next/codemod optional-name-of-transform optional/path/to/src [...options]

// import globby from "globby";
// import inquirer from "inquirer";
// import meow from "meow";
import path from "path";
// import execa from "execa";
// import chalk from "chalk";
// import isGitClean from "is-git-clean";

export const jscodeshiftExecutable = require.resolve(".bin/jscodeshift");
export const transformerDirectory = path.join(
    __dirname,
    "../",
    "transforms"
);

