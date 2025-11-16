/**
 * @file lottieConverterLib.js
 * @brief Library for converting Lottie JSON animations to PNG image sequences.
 *
 * This library provides a single asynchronous function, `convertLottieToPngSequence`,
 * which takes Lottie animation data and conversion options to produce an array
 * of PNG Blob objects, each representing a frame of the animation.
 *
 * Dependencies:
 * - lottie-web: Must be loaded globally (e.g., via a <script> tag in HTML) or imported
 * before using this library. This library expects `lottie` to be available.
 */

/**
 * Converts a hex color string to an array of RGB components [R, G, B].
 * @param {string} hex - The hex color string (e.g., "#FF0000" or "FF0000").
 * @returns {Array<number>} - An array [R, G, B] with values between 0 and 255.
 * @private
 */
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [
        ((bigint >> 16) & 255),
        ((bigint >> 8) & 255),
        (bigint & 255)
    ];
}

/**
 * Converts Lottie animation JSON data into a sequence of PNG image Blobs.
 *
 * @param {object} lottieJson - The Lottie animation JSON object.
 * @param {object} [options={}] - Configuration options for the conversion.
 * @param {number} [options.scale=1] - The scaling factor for the output images (e.g., 2 for 2x size).
 * @param {number} [options.outputFps=30] - The desired frames per second for the output sequence.
 * @param {boolean} [options.transparentBg=true] - Whether the output images should have a transparent background.
 * @param {string} [options.bgColor='#ffffff'] - The background color in hex format (e.g., "#RRGGBB") if `transparentBg` is false.
 * @param {function} [options.onProgress] - An optional callback function `(percent, message)` to report conversion progress.
 * @returns {Promise<Array<Blob>>} A promise that resolves with an array of PNG Blob objects, one for each frame.
 * @throws {Error} If `lottieJson` is invalid, `lottie-web` is not loaded, or rendering fails.
 */
export async function convertLottieToPngSequence(lottieJson, options = {}) {
    const defaultOptions = {
        scale: 1,
        outputFps: 30,
        transparentBg: true,
        bgColor: '#ffffff',
        onProgress: null // Default no progress callback
    };
    const opts = { ...defaultOptions, ...options };

    // --- Input Validation ---
    if (!lottieJson || typeof lottieJson !== 'object') {
        throw new Error('Invalid Lottie JSON provided: must be an object.');
    }
    // Ensure lottie-web is available. It's expected to be loaded externally.
    if (typeof lottie === 'undefined' || typeof lottie.loadAnimation !== 'function') {
        throw new Error('lottie-web library is not loaded. Please ensure it is imported in your HTML (<script src="...lottie.min.js"></script>).');
    }
    if (isNaN(opts.outputFps) || opts.outputFps < 1 || opts.outputFps > 60) {
        throw new Error("Invalid outputFps: must be a number between 1 and 60.");
    }
    if (isNaN(opts.scale) || opts.scale <= 0) {
        throw new Error("Invalid scale: must be a positive number.");
    }

    const { w: originalWidth, h: originalHeight, fr: originalFrameRate, ip: startFrame, op: endFrame } = lottieJson;

    if (!originalWidth || !originalHeight || !originalFrameRate || typeof startFrame === 'undefined' || typeof endFrame === 'undefined') {
        throw new Error('Invalid Lottie JSON: Missing essential properties (w, h, fr, ip, op).');
    }

    const durationSec = (endFrame - startFrame) / originalFrameRate;
    // Calculate total frames for the output sequence, ensuring at least one frame if duration > 0
    const targetTotalFrames = Math.max(0, Math.floor(durationSec * opts.outputFps));

    if (targetTotalFrames === 0 && durationSec > 0) {
        // If duration is positive but targetTotalFrames is 0 (due to very low FPS or short duration),
        // ensure at least one frame is rendered to represent the animation.
        // This is a common edge case for very short animations or high 'step' values.
        console.warn("Calculated zero frames for output, but animation has duration. Will render at least one frame.");
        // We'll render frame 0 if targetTotalFrames is 0.
        // The loop condition `i < targetTotalFrames` handles this naturally for `targetTotalFrames > 0`.
        // If targetTotalFrames is 0, the loop won't run. We might need a special case for it if 1 frame is *always* required.
        // For now, let's assume if targetTotalFrames is 0, no output is desired or possible given options.
        // If a single frame for 0-duration cases is needed, the loop needs adjustment.
    } else if (targetTotalFrames < 0) {
        throw new Error("Animation has negative calculated duration.");
    }


    const step = originalFrameRate / opts.outputFps; // How many original Lottie frames to skip per output frame
    const pngBlobs = [];

    // Create a temporary, off-screen container for Lottie rendering
    // This element will be created, appended, used, and then removed from the DOM.
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px'; // Position off-screen
    tempContainer.style.width = `${originalWidth}px`; // Match Lottie's original size for rendering
    tempContainer.style.height = `${originalHeight}px`;
    tempContainer.style.overflow = 'hidden'; // Just in case, to prevent layout issues
    document.body.appendChild(tempContainer); // Temporarily attach to DOM

    let tempAnim = null; // Will hold the Lottie animation instance for cleanup

    try {
        // Load the Lottie animation into the temporary container
        tempAnim = lottie.loadAnimation({
            container: tempContainer,
            renderer: 'svg', // SVG renderer is generally best for fidelity before converting to canvas
            loop: false,
            autoplay: false,
            // Deep clone the Lottie data to ensure the original JSON is not modified by Lottie-web's internal processing
            animationData: JSON.parse(JSON.stringify(lottieJson))
        });

        // Wait for the Lottie animation to be fully loaded and DOM ready
        await new Promise(resolve => tempAnim.addEventListener('DOMLoaded', resolve));

        // Create a single canvas element and reuse it for all frames for efficiency
        const canvas = document.createElement('canvas');
        // Calculate the scaled dimensions for the output images
        const scaledWidth = Math.max(1, Math.round(originalWidth * opts.scale));
        const scaledHeight = Math.max(1, Math.round(originalHeight * opts.scale));

        // Loop through each target frame and render it
        for (let i = 0; i < targetTotalFrames; i++) {
            // Calculate the corresponding frame number in the original Lottie timeline
            const lottieFrame = startFrame + (i * step);

            // Go to the specific frame in the temporary Lottie animation instance
            tempAnim.goToAndStop(lottieFrame, true); // `true` indicates that `lottieFrame` is a frame number

            // Wait for the browser to repaint, ensuring the SVG has updated visually
            await new Promise(requestAnimationFrame);

            // Get the SVG element rendered by lottie-web
            const svgElement = tempContainer.querySelector('svg');
            if (!svgElement) {
                throw new Error(`SVG element not found for frame ${i}.`);
            }

            // Set canvas dimensions
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;
            const ctx = canvas.getContext('2d');

            // Handle background: transparent or solid color
            if (!opts.transparentBg) {
                const [r, g, b] = hexToRgb(opts.bgColor);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(0, 0, scaledWidth, scaledHeight);
            } else {
                // Clear canvas for transparency (important for PNG output)
                ctx.clearRect(0, 0, scaledWidth, scaledHeight);
            }

            // Serialize the current state of the SVG element to a string
            const svgString = new XMLSerializer().serializeToString(svgElement);
            // Create an Image object from the SVG string
            const img = new Image();
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob); // Create a temporary URL for the SVG blob

            // Load the SVG image onto the canvas
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    try {
                        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight); // Draw the SVG onto the canvas
                        URL.revokeObjectURL(url); // Clean up the temporary URL
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                };
                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error(`Failed to load SVG into image for frame ${i}`));
                };
                img.src = url; // Set the image source to the SVG blob URL
            });

            // Convert the canvas content to a PNG Blob
            const frameBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            pngBlobs.push(frameBlob); // Add the PNG Blob to our array

            // Report progress if a callback is provided
            if (opts.onProgress) {
                const percent = ((i + 1) / targetTotalFrames) * 100;
                const message = `Rendering frame ${i + 1} of ${targetTotalFrames}...`;
                opts.onProgress(percent, message);
            }
        }

        // If the animation has 0 total frames (e.g., ip=op), but a positive duration,
        // and we haven't rendered anything, handle the single frame case.
        // This is a pragmatic choice to ensure some output for static-like Lotties.
        if (targetTotalFrames === 0 && durationSec > 0 && pngBlobs.length === 0) {
            console.warn("Animation has duration but 0 target frames due to FPS settings. Rendering initial frame.");
            tempAnim.goToAndStop(startFrame, true);
            await new Promise(requestAnimationFrame);

            const svgElement = tempContainer.querySelector('svg');
            const scaledWidth = Math.max(1, Math.round(originalWidth * opts.scale));
            const scaledHeight = Math.max(1, Math.round(originalHeight * opts.scale));
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;
            const ctx = canvas.getContext('2d');

            if (!opts.transparentBg) {
                const [r, g, b] = hexToRgb(opts.bgColor);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(0, 0, scaledWidth, scaledHeight);
            } else {
                ctx.clearRect(0, 0, scaledWidth, scaledHeight);
            }

            const svgString = new XMLSerializer().serializeToString(svgElement);
            const img = new Image();
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);

            await new Promise((resolve, reject) => {
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
                    URL.revokeObjectURL(url);
                    resolve();
                };
                img.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error("Failed to load SVG into image for single frame."));
                };
                img.src = url;
            });

            const frameBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            pngBlobs.push(frameBlob);

            if (opts.onProgress) {
                 opts.onProgress(100, "Rendering single frame complete.");
            }
        } else if (targetTotalFrames === 0 && durationSec === 0) {
            // Truly empty animation, return empty array.
            if (opts.onProgress) {
                opts.onProgress(100, "Animation has no duration; no frames rendered.");
            }
            return [];
        }


        return pngBlobs;

    } finally {
        // --- Cleanup ---
        // Always destroy the Lottie instance to free up resources
        if (tempAnim) {
            tempAnim.destroy();
        }
        // Always remove the temporary container from the DOM
        if (document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
        }
    }
}
