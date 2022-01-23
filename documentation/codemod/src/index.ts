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
export const transformerDirectory = path.join(__dirname, "../", "transforms");

export function checkGitStatus(force) {
    let clean = false;
    let errorMessage = "Unable to determine if git directory is clean";
    try {
        clean = isGitClean.sync(process.cwd());
        errorMessage = "Git directory is not clean";
    } catch (err) {
        if (
            err &&
            err.stderr &&
            err.stderr.indexOf("Not a git repository") >= 0
        ) {
            clean = true;
        }
    }

    if (!clean) {
        if (force) {
            console.log(`WARNING: ${errorMessage}. Forcibly continuing.`);
        } else {
            console.log("Thank you for using react-codemods!");
            console.log(
                chalk.yellow(
                    "\nBut before we continue, please stash or commit your git changes.",
                ),
            );
            console.log(
                "\nYou may use the --force flag to override this safety check.",
            );
            process.exit(1);
        }
    }
}

export function runTransform({ files, flags, transformer }) {
    const transformerPath = path.join(
        transformerDirectory,
        `${transformer}.js`,
    );

    let args = [];

    const { dry, print, explicitRequire } = flags;

    if (dry) {
        args.push("--dry");
    }
    if (print) {
        args.push("--print");
    }

    if (explicitRequire === "false") {
        args.push("--explicit-require=false");
    }

    args.push("--verbose=2");

    args.push("--ignore-pattern=**/node_modules/**");

    args.push("--parser", parser);

    if (parser === "tsx") {
        args.push("--extensions=tsx,ts,jsx,js");
    } else {
        args.push("--extensions=jsx,js");
    }

    args = args.concat(["--transform", transformerPath]);

    if (transformer === "class") {
        args.push("--flow=" + answers.classFlow);
        args.push(
            "--remove-runtime-props=" + answers.classRemoveRuntimePropTypes,
        );
        args.push("--pure-component=" + answers.classPureComponent);
        args.push("--mixin-module-name=" + answers.classMixinModuleName);
    }
    if (transformer === "pure-render-mixin") {
        args.push("--mixin-name=" + answers.pureRenderMixinMixinName);
    }
    if (transformer === "pure-component") {
        if (answers.pureComponentUseArrows) {
            args.push("--useArrows=true");
        }
        if (answers.pureComponentDestructuring) {
            args.push("--destructuring=true");
        }
    }

    if (flags.jscodeshift) {
        args = args.concat(flags.jscodeshift);
    }

    args = args.concat(files);

    console.log(`Executing command: jscodeshift ${args.join(" ")}`);

    const result = execa.sync(jscodeshiftExecutable, args, {
        stdio: "inherit",
        stripEof: false,
    });

    if (result.error) {
        throw result.error;
    }
}

export async function run(): Promise<void> {
    const cli = meow({
        description: "Codemods for updating React APIs.",
        help: `
        Usage
          $ npx react-codemod <transform> <path> <...options>
            transform    One of the choices from https://github.com/reactjs/react-codemod 
            path         Files or directory to transform. Can be a glob like src/**.test.js
        Options
          --force            Bypass Git safety checks and forcibly run codemods
          --dry              Dry run (no changes are made to files)
          --print            Print transformed files to your terminal
          --explicit-require Transform only if React is imported in the file (default: true)
          --jscodeshift  (Advanced) Pass options directly to jscodeshift
        `,
        flags: {
            boolean: ["force", "dry", "print", "explicit-require", "help"],
            string: ["_"],
            alias: {
                h: "help",
            },
        },
    } as meow.Options<meow.AnyFlags>);

    if (!cli.flags.dry) {
        checkGitStatus(cli.flags.force);
    }

    if (!filesExpanded.length) {
        console.log(
            `No files found matching ${filesBeforeExpansion.join(" ")}`,
        );
        return null;
    }

    await runTransform({
        files: filesExpanded,
        flags: cli.flags,
        parser: selectedParser,
        transformer: selectedTransformer,
        answers: answers,
    });
}

run();
