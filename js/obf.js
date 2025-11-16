// Import necessary Node.js modules
const fs = require('fs');
const path = require('path');

// Import the JavaScript Obfuscator library.
// You need to install this first: npm install javascript-obfuscator
const JavaScriptObfuscator = require('javascript-obfuscator');

// Import the Terser library for minification.
// You need to install this first: npm install terser
const Terser = require('terser');

// Define the input directory (where your JS files are)
// '.' refers to the current directory where this script is run.
const inputDir = '.';

// Define the output directory for obfuscated files
const outputDir = 'obf';

/**
 * Ensures a directory exists. If not, it creates it.
 * @param {string} directoryPath - The path to the directory.
 */
function ensureDirectoryExistence(directoryPath) {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
        console.log(`Created directory: ${directoryPath}`);
    }
}

/**
 * Obfuscates and minifies a single JavaScript file.
 * @param {string} filePath - The full path to the JavaScript file.
 * @param {string} outputDirPath - The path to the directory where the obfuscated file should be saved.
 */
async function obfuscateFile(filePath, outputDirPath) {
    const fileName = path.basename(filePath); // Get just the file name (e.g., 'myFile.js')
    const outputPath = path.join(outputDirPath, fileName); // Construct the output path

    try {
        let fileContent = fs.readFileSync(filePath, 'utf8'); // Read the file content

        // Step 1: Minify the code using Terser
        console.log(`Minifying ${fileName}...`);
        const minifyResult = await Terser.minify(fileContent, {
            // Terser options (can be customized)
            compress: {
                dead_code: true,
                drop_console: false, // Set to true to remove console.log statements
            },
            mangle: true, // Mangle variable names
        });

        if (minifyResult.error) {
            throw new Error(`Terser minification error: ${minifyResult.error.message}`);
        }
        fileContent = minifyResult.code; // Use the minified code for obfuscation

        // Step 2: Obfuscate the minified code
        console.log(`Obfuscating ${fileName}...`);
        const obfuscationResult = JavaScriptObfuscator.obfuscate(
            fileContent,
            {
                compact: true, // Makes the code as compact as possible
                controlFlowFlattening: false, // Can make debugging harder, but increases obfuscation
                deadCodeInjection: false, // Injects dead code
                debugProtection: false, // Prevents debugging tools
                disableConsoleOutput: false, // Disables console.log, etc.
                identifierNamesGenerator: 'hexadecimal', // Generates hexadecimal names for identifiers
                log: false, // Don't log obfuscation process
                renameGlobals: false, // Renames global variables
                rotateStringArray: true, // Rotates the string array
                selfDefending: false, // Makes the code harder to de-obfuscate
                stringArray: true, // Puts all strings into an array
                stringArrayEncoding: ['base64'], // Encodes strings in the array
                stringArrayIndexShift: true, // Shifts string array indices
                stringArrayWrappersCount: 1, // Number of wrappers for string array
                stringArrayWrappersType: 'variable', // Type of string array wrappers
                transformObjectKeys: false, // Transforms object keys
                unicodeEscapeSequence: false // Escapes unicode characters
            }
        );

        const obfuscatedCode = obfuscationResult.getObfuscatedCode(); // Get the obfuscated code

        fs.writeFileSync(outputPath, obfuscatedCode, 'utf8'); // Write the obfuscated code to the output file
        console.log(`Successfully minified and obfuscated: ${fileName} -> ${outputPath}`);
    } catch (error) {
        console.error(`Error processing ${fileName}:`, error.message);
    }
}

/**
 * Main function to process all JavaScript files.
 */
function processJsFiles() {
    ensureDirectoryExistence(outputDir); // Ensure the output directory exists

    fs.readdir(inputDir, async (err, files) => { // Added 'async' here
        if (err) {
            console.error('Error reading input directory:', err);
            return;
        }

        // Filter for files ending with '.js'
        const jsFiles = files.filter(file => path.extname(file).toLowerCase() === '.js');

        if (jsFiles.length === 0) {
            console.log(`No .js files found in ${inputDir}.`);
            return;
        }

        // Use Promise.all to wait for all obfuscation/minification operations to complete
        await Promise.all(jsFiles.map(file => {
            const filePath = path.join(inputDir, file);
            return obfuscateFile(filePath, outputDir); // Return the promise from obfuscateFile
        }));

        console.log('\nMinification and Obfuscation process completed.');
    });
}

// Run the main process
processJsFiles();
