// lottieConverter.js

// IMPORTANT: This module assumes JSZip is available in the global scope (e.g., loaded via a <script> tag before this module)

/**
 * Reads a File object as an ArrayBuffer.
 * @param {File} file - The file to read.
 * @returns {Promise<ArrayBuffer>} A promise that resolves with the ArrayBuffer.
 */
 function readFileAsArrayBuffer(file) {
     return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = () => resolve(reader.result);
         reader.onerror = error => reject(error);
         reader.readAsArrayBuffer(file);
     });
 }

/**
 * Reads a File object as text.
 * @param {File} file - The file to read.
 * @returns {Promise<string>} A promise that resolves with the text content.
 */
 function readFileAsText(file) {
     return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = () => resolve(reader.result);
         reader.onerror = error => reject(error);
         reader.readAsText(file);
     });
 }


/**
 * Guesses the MIME type based on the file extension.
 * @param {string} filename - The name of the file.
 * @returns {string} The guessed MIME type.
 */
 function getMimeType(filename) {
     const ext = filename.split('.').pop().toLowerCase();
     switch (ext) {
         case 'png': return 'image/png';
         case 'jpg':
         case 'jpeg': return 'image/jpeg';
         case 'gif': return 'image/gif';
         case 'webp': return 'image/webp';
         case 'svg': return 'image/svg+xml';
         default: return 'application/octet-stream'; // Fallback for unknown types
     }
 }

/**
 * Embeds assets from the assetsMap into a given Lottie animation JSON data object.
 * @param {object} animationJsonData - The Lottie animation JSON data (as an object) to modify.
 * @param {Map<string, string>} assetsMap - A map of asset filenames to their base64 data.
 */
 function embedAssetsInAnimation(animationJsonData, assetsMap) {
     if (animationJsonData.assets && Array.isArray(animationJsonData.assets)) {
         for (const asset of animationJsonData.assets) {
             if (asset.e === 1) { // Already embedded or an external link intended to be kept
                 continue;
             }
             const assetFilename = asset.p; // asset.p is typically the filename like "image_0.png"
             const embeddedData = assetsMap.get(assetFilename);

             if (embeddedData) {
                 asset.u = ""; // Clear folder path as it's now embedded
                 asset.p = embeddedData; // Replace filename with base64 data URI
                 asset.e = 1; // Mark as embedded
             } else {
                 console.warn(`Asset "${assetFilename}" referenced in animation JSON not found in the archive's assets. It might be an external URL or missing.`);
             }
         }
     }
 }


/**
 * Converts a .lottie file (zip archive) into an array of Lottie JSON strings,
 * each with embedded assets.
 * @param {File} dotLottieFile - The .lottie file to convert.
 * @returns {Promise<{animations: Array<{originalPath: string, jsonString: string}>, hasStateMachines: boolean, stateMachines: Array<object>}>} A promise that resolves with an object containing animations, a flag, and an array of state machine JSON objects.
 */
 export async function convertDotLottieToJson(dotLottieFile) {
     if (typeof JSZip === 'undefined') {
         throw new Error("JSZip library is not loaded. Please ensure it's available in the global scope.");
     }

     const arrayBuffer = await readFileAsArrayBuffer(dotLottieFile);
     const zip = new JSZip();
     const loadedZip = await zip.loadAsync(arrayBuffer);

     const processedAnimations = []; // Array to store {originalPath, jsonString}
     const assetsMap = new Map();
     const allJsonFileContents = new Map(); // Map to store all parsed JSON file contents: Map<filePath, parsedJsonDataObject>
     let hasStateMachines = false;
     const stateMachineJsons = []; // To store the actual state machine JSON objects

     // Step 1: Extract all assets and all JSON file contents
     for (const filename in loadedZip.files) {
         const fileEntry = loadedZip.files[filename];
         if (fileEntry.dir) continue;

         if (filename.endsWith('.json')) {
             const jsonContent = await fileEntry.async('text');
             try {
                 const parsedJson = JSON.parse(jsonContent);
                 // Check if this JSON file is a state machine file
                 if (filename.startsWith('s/') || filename.startsWith('states/')) {
                     hasStateMachines = true; // Set flag if a state machine JSON is found
                     stateMachineJsons.push(parsedJson); // Add the parsed JSON object
                 }
                 allJsonFileContents.set(filename, parsedJson);
             } catch (e) {
                 console.warn(`Could not parse JSON file: ${filename}`, e);
             }
         } else if (
             filename.startsWith('assets/') || filename.startsWith('images/') ||
             filename.startsWith('i/')
         ) {
             const assetName = filename.split('/').pop(); // This line was already here
             const base64Data = await fileEntry.async('base64');
             const mimeType = getMimeType(filename);
             assetsMap.set(assetName, `data:${mimeType};base64,${base64Data}`);
         }
     }

     // Step 2: Try to process animations based on manifest.json
     let manifest = allJsonFileContents.get('manifest.json');
     if (manifest && manifest.animations && Array.isArray(manifest.animations)) {
         for (const animEntry of manifest.animations) {
             let animationJsonPath = animEntry.src; // Bodymovin-rlottie often uses 'src'
             if (!animationJsonPath && animEntry.id) {
                 // Common convention: animations/<id>.json or <id>.json if at root
                 if (allJsonFileContents.has(`animations/${animEntry.id}.json`)) {
                    animationJsonPath = `animations/${animEntry.id}.json`;
                 } else if (allJsonFileContents.has(`${animEntry.id}.json`)) {
                    animationJsonPath = `${animEntry.id}.json`;
                 } else {
                     // Try to find any JSON file that might match the ID if no explicit path is given
                     // This is a more speculative fallback
                     for (const path of allJsonFileContents.keys()) {
                         if (path.includes(animEntry.id) && path.endsWith('.json')) {
                             animationJsonPath = path;
                             break;
                         }
                     }
                 }
             }

             if (animationJsonPath && allJsonFileContents.has(animationJsonPath)) {
                 const originalAnimationJsonData = allJsonFileContents.get(animationJsonPath);
                 const animationJsonDataCopy = JSON.parse(JSON.stringify(originalAnimationJsonData)); // Deep clone
                 embedAssetsInAnimation(animationJsonDataCopy, assetsMap);
                 processedAnimations.push({
                     originalPath: animationJsonPath,
                     jsonString: JSON.stringify(animationJsonDataCopy)
                 });
             } else {
                 console.warn(`Animation with ID "${animEntry.id}" (path: ${animationJsonPath || 'unknown'}) mentioned in manifest not found or path is missing.`);
             }
         }
     }

     // Step 3: Fallback if no animations were processed via manifest
     if (processedAnimations.length === 0) {
         console.warn("No animations processed via manifest.json, or manifest not found/valid. Attempting fallback.");
         let foundFallback = false;
         const fallbackPaths = ['animation.json', 'data.json']; // Common root-level names
         allJsonFileContents.forEach((_, key) => { // Add JSONs from typical animation folders
             if (key.startsWith('animations/') || key.startsWith('a/')) {
                 if (!fallbackPaths.includes(key)) fallbackPaths.push(key);
             }
         });

         for (const path of fallbackPaths) {
             if (allJsonFileContents.has(path)) {
                 const originalAnimationJsonData = allJsonFileContents.get(path);
                 // Basic check if it looks like a Lottie file
                 if (originalAnimationJsonData && originalAnimationJsonData.v) {
                     const animationJsonDataCopy = JSON.parse(JSON.stringify(originalAnimationJsonData));
                     embedAssetsInAnimation(animationJsonDataCopy, assetsMap);
                     processedAnimations.push({
                         originalPath: path,
                         jsonString: JSON.stringify(animationJsonDataCopy)
                     });
                     foundFallback = true;
                     // If no manifest was present, and we found one of these, assume it's the only one.
                     if (!manifest) break;
                 }
             }
         }
         // Very generic fallback: if still nothing and no manifest, take the first valid Lottie JSON found
         if (!foundFallback && !manifest && allJsonFileContents.size > 0) {
             for (const [path, data] of allJsonFileContents.entries()) {
                 if (data && data.v) { // Check for Lottie version property 'v'
                     const animationJsonDataCopy = JSON.parse(JSON.stringify(data));
                     embedAssetsInAnimation(animationJsonDataCopy, assetsMap);
                     processedAnimations.push({
                         originalPath: path,
                         jsonString: JSON.stringify(animationJsonDataCopy)
                     });
                     console.warn(`Used generic fallback: processed first valid JSON found at ${path} as an animation.`);
                     break;
                 }
             }
         }
     }

     if (processedAnimations.length === 0) {
         throw new Error("Could not find any Lottie animation JSON data within the .lottie archive.");
     }

     // Add the log message here
     if (hasStateMachines) {
         console.log(`State machine JSON file(s) found in .lottie archive: ${dotLottieFile.name}`);
     } else {
         console.log(`No state machine JSON file(s) found in .lottie archive: ${dotLottieFile.name}`);
     }
     return { animations: processedAnimations, hasStateMachines: hasStateMachines, stateMachines: stateMachineJsons };
 }

/**
 * Converts a Lottie JSON file into a .lottie Blob (zip archive).
 * @param {File} lottieJsonFile - The Lottie JSON file to convert.
 * @returns {Promise<Blob>} A promise that resolves with the .lottie file as a Blob.
 */
export async function convertJsonToDotLottie(lottieJsonFile) {
    if (typeof JSZip === 'undefined') {
        throw new Error("JSZip library is not loaded. Please ensure it's available in the global scope.");
    }

    const jsonString = await readFileAsText(lottieJsonFile);
    const animationJsonData = JSON.parse(jsonString);

    const zip = new JSZip();

    const animationPathInZip = 'animations/data.json';
    zip.file(animationPathInZip, JSON.stringify(animationJsonData));

    if (animationJsonData.assets && Array.isArray(animationJsonData.assets)) {
        const assetsFolder = '/images/';

        for (const asset of animationJsonData.assets) {
            if (asset.e === 1 && asset.p && asset.p.startsWith('data:')) {
                const base64Content = asset.p.split(',')[1];
                const mimeType = asset.p.split(',')[0].split(':')[1].split(';')[0];
                const ext = mimeType.split('/')[1];

                const baseName = asset.id || 'asset';
                const cleanBaseName = baseName.replace(/[^\w.-]/g, '_');
                const assetFilename = `${cleanBaseName}.${ext.replace('+xml', '')}`;

                zip.file(assetsFolder.substring(1) + assetFilename, base64Content, { base64: true });

                asset.u = assetsFolder;
                asset.p = assetFilename;
                asset.e = 0;
            }
        }
        zip.file(animationPathInZip, JSON.stringify(animationJsonData));
    }

    // Generate Manifest.json strictly as requested, removing 'src' and 'activeAnimationId'
    const manifestString = '{"version":"1","generator":"@lottiemon/hardgenerated","author":"lottiemon","animations":[{"id":"data"}]}';
    const manifest = JSON.parse(manifestString);

    if (manifest.animations && Array.isArray(manifest.animations) && manifest.animations.length > 0) {
        delete manifest.animations[0].src;
    } else {
        console.warn("Provided manifest string does not contain an animations array or it's empty. Adding default animation entry without 'src'.");
        manifest.animations = [{
            id: "data",
            autoplay: true,
            loop: true,
            speed: 1.0,
            direction: 1,
            playMode: "normal"
        }];
    }
    delete manifest.activeAnimationId;

    zip.file('manifest.json', JSON.stringify(manifest));

    return await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}


/**
 * Converts an array of active Lottie JSON data objects into a single .lottie Blob (zip archive).
 * Each animation will have its assets extracted, prefixed, and stored in an 'images' folder.
 * A manifest.json will be created to list all animations.
 * @param {Array<{animationName: string, jsonData: object}>} activeAnimations
 * - animationName: A name for the animation (e.g., "cry", "animation1") used for ID and asset prefixing.
 * - jsonData: The parsed Lottie JSON object.
 * @returns {Promise<Blob>} A promise that resolves with the .lottie file as a Blob.
 */
export async function convertAllActiveJsonsToDotLottie(activeAnimations) {
    if (typeof JSZip === 'undefined') {
        throw new Error("JSZip library is not loaded.");
    }
    if (!Array.isArray(activeAnimations) || activeAnimations.length === 0) {
        throw new Error("No active animations provided to package.");
    }

    const zip = new JSZip();
    const manifest = {
        manifestVersion: "1.0", // Or just "version" based on .lottie spec preference
        generator: "@lottiemon/tool", // You can customize this
        author: "lottiemon", // You can customize this
        animations: []
    };

    const usedAnimationIds = new Set();

    const animationsFolderInZip = zip.folder("animations");
    const imagesFolderInZip = zip.folder("images"); // All assets go into a single top-level images folder

    for (const [index, animEntry] of activeAnimations.entries()) {
        if (!animEntry.jsonData || !animEntry.animationName) {
            console.warn(`Skipping animation at index ${index} due to missing data or name.`);
            continue;
        }

        // Sanitize animationName to create a valid ID and filename base
        // Replace slashes from originalPath if animationName is derived from that
        const sanitizedBaseName = animEntry.animationName
                                    .replace(/\.json$/i, '') // Remove .json extension if present
                                    .replace(/[^\w.-]/g, '_'); // Replace non-alphanumeric (except . - _) with _

        let animationId = sanitizedBaseName;
        if (activeAnimations.length > 1) {
            let counter = 1;
            // If the base name is already used, append a counter to make it unique
            while (usedAnimationIds.has(animationId)) {
                animationId = `${sanitizedBaseName}_${counter}`;
                counter++;
            }
        }
        usedAnimationIds.add(animationId);
        const animationJsonFileName = `${animationId}.json`;

        // Deep clone the JSON data to avoid modifying the original objects in lottieDataArray
        const animationDataCopy = JSON.parse(JSON.stringify(animEntry.jsonData));

        // Process assets for this specific animation
        if (animationDataCopy.assets && Array.isArray(animationDataCopy.assets)) {
            for (const [assetIndex, asset] of animationDataCopy.assets.entries()) {
                // Check if asset is embedded (e === 1 and p starts with "data:")
                if (asset.e === 1 && asset.p && typeof asset.p === 'string' && asset.p.startsWith('data:')) {
                    try {
                        const parts = asset.p.split(',');
                        const meta = parts[0].split(';')[0].split(':')[1]; // e.g., "image/png"
                        const base64Content = parts[1];
                        const extension = meta.split('/')[1] || 'png'; // "png" or "jpeg" etc.

                        // Original asset ID (like "image_0") or fallback
                        const originalAssetId = asset.id || `asset_${assetIndex}`;

                        // Create the new prefixed asset filename
                        const newPrefixedAssetFilename = `${animationId}_${originalAssetId}.${extension}`;

                        // Add the asset to the top-level "images" folder in the zip
                        imagesFolderInZip.file(newPrefixedAssetFilename, base64Content, { base64: true });

                        // Update the asset object in this animation's JSON copy
                        asset.u = "images/"; // Path to the common images folder
                        asset.p = newPrefixedAssetFilename; // The new prefixed filename
                        asset.e = 0; // Mark as linked, not embedded
                    } catch (e) {
                        console.error(`Error processing asset ${asset.id || assetIndex} for animation ${animationId}:`, e);
                    }
                } else if (asset.p && asset.u) {
                    // Asset is already external (e.g. asset.p = "image_0.png", asset.u = "images/")
                    // We might need to ensure its filename is unique if multiple JSONs reference an "image_0.png"
                    // For now, this example assumes that if asset.e !== 1, it's an external URL or already correctly pathed
                    // For robust handling, you'd check if `assetsMap` (from convertDotLottieToJson)
                    // already processed this asset and reuse its path, or copy it with a unique name.
                    // This simplified version assumes assets are either embedded or pre-pathed correctly for non-embedding.
                    console.warn(`Asset ${asset.p} for animation ${animationId} is not embedded. Ensuring path is relative.`);
                    if (asset.u && !asset.u.endsWith('/')) {
                        asset.u += "/";
                    }
                     if (asset.u !== "images/") { // Standardize to top-level images folder
                        // This part is complex: if assets are in subfolders like "images_anim1/",
                        // you'd need to move them to the top "images/" and rename to avoid collision.
                        // For simplicity, we'll assume assets are either embedded or expected to be found in "images/".
                        // A truly robust solution would involve tracking all assets from all JSONs,
                        // de-duplicating, and ensuring unique names in a common "images/" folder.
                        // The current prefixing handles embedded asset collisions.
                     }
                }
            }
        }

        // Add the (potentially modified) animation JSON to the "animations" folder in the zip
        animationsFolderInZip.file(animationJsonFileName, JSON.stringify(animationDataCopy,));

        // Add entry to the manifest
        manifest.animations.push({
            id: animationId, // This ID should match the filename in animations/ folder (without .json)
            // Add other desirable default metadata for each animation
            loop: true,
            autoplay: index === 0, // Autoplay only the first one, for example
            speed: 1,
            direction: 1,
            playMode: "normal" // LottieFiles web player specific
        });
    }

    // Set active animation ID in manifest (optional, often the first one)
    if (manifest.animations.length > 0) {
        manifest.activeAnimationId = manifest.animations[0].id;
    }

    // Add manifest.json to the root of the zip
    zip.file("manifest.json", JSON.stringify(manifest, null, 2));

    return await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}


export async function extractStateMachineJson(dotLottieFile) {
    if (typeof JSZip === 'undefined') {
        console.error("JSZip library is not loaded. Please ensure it's available in the global scope.");
        return [];
    }

    const arrayBuffer = await readFileAsArrayBuffer(dotLottieFile);
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(arrayBuffer);

    const stateMachineJsons = [];

    // Iterate over all files in the loaded zip archive
    for (const filename in loadedZip.files) {
        const fileEntry = loadedZip.files[filename];

        // Check if the file is not a directory and is located within the 'states/' folder
        // and ends with '.json'
        if (!fileEntry.dir && filename.startsWith('states/') && filename.endsWith('.json')) {
            try {
                const jsonContent = await fileEntry.async('text');
                stateMachineJsons.push(JSON.parse(jsonContent));
            } catch (e) {
                console.warn(`Could not parse JSON file from states/: ${filename}`, e);
            }
        }
    }

    return stateMachineJsons;
}
