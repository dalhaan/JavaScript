/* eslint-disable */
const { readFile, writeFile, readdir, stat: _stat } = require('fs');
const { resolve, dirname, join } = require('path');
const { exit, argv } = require('process');

// Regex Patterns
const fileTypePattern = /^.+\.(js|jsx|test\.js)$/; // Match *.js, *.jsx, or *.test.js filenames, e.g. 'index.js'.
const importStatementPattern = /(import(?:[\s\S]+?)? ')((?:\.\.\/).+)(';)/g; // Match import statements.

/**
 * Converts a file's relative path import statements to absolute paths (relative to the root directory).
 * @param {string} rootDir - The root directory that imports will be relative to.
 * @param {string} filePath - The target file path.
 */
function convertImportsToAbsolute(rootDir, filePath) {
  const absolutePathPattern = new RegExp(resolve(rootDir) + '/(.+)'); // Captures the section of an absolute path that is descended from the root directory.
  const directory = dirname(filePath);

  readFile(filePath, 'utf-8', (error, data) => {
    if (error) {
      console.error(error);
      return;
    }

    // 1. Find all relative import statements and replace them with absolute paths
    const result = data.replace(importStatementPattern, (match, p1, p2, p3) => {
      const absolutePath = resolve(directory, p2);
      const absolutePathOfImport = absolutePath.match(absolutePathPattern)
      
      // If import location is a descendant of the root directory, convert it to an absolute path
      if (absolutePathOfImport) {
        const newImportStatement = p1 + absolutePathOfImport[1] + p3; // "import[ component from] '<newAbsolutePath>';"

        // Replace the existing import statement with the absolute one.
        return newImportStatement;
      }

      // Otherwise, ignore it by returning the original import statement.
      return match;
    });

    // 2. Update the file with the updated import statments.
    if (result) {
      writeFile(filePath, result, 'utf8', (error) => {
        if (error) {
          console.error(error);
          return;
        }
      });
    }
  });
}

/**
 * Recursively converts relative path import statments to absolute paths for all descending files
 * of a target directory (relative to the root directory).
 * @param {string} rootDir - The root directory that imports will be relative to.
 * @param {string} targetDir - The target directory.
 */
function pathsToAbsolute(rootDir, targetDir) {
  readdir(targetDir, (error, files) => {
    if (error) {
      console.error(error);
      exit(1);
    }

    files.forEach((file) => {
      const filePath = join(targetDir, file);

      _stat(filePath, (error, stat) => {
        if (error) {
          console.error(error);
          return;
        }

        if (stat.isFile() && file.match(fileTypePattern)) {
          convertImportsToAbsolute(rootDir, filePath);
        } else if (stat.isDirectory()) {
          pathsToAbsolute(rootDir, filePath);
        }
      });
    });
  });
}

/**
 * Prints the usage for pathsToAbsolute.js
 */
function printUsage() {
  console.log("Recursively converts relative path import statments to absolute paths for all descending files of a target directory (relative to the root directory).");
  console.log("\nusage:");
  console.log("\tpathsToAbsolute <root directory> <target directory>");
  console.log("parameters:");
  console.log("\troot directory - The root directory that imports will be relative to.");
  console.log("\ttarget directory - The target directory.");
}

// Get arguments from the command-line
const rootDir = argv[2]
const targetDir = argv[3];

// Run
if (rootDir && targetDir) {
  pathsToAbsolute(rootDir, targetDir);
} else {
  printUsage();
}
