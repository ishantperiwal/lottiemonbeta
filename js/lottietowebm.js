// In: js/lottieToWebm.js

import { convertLottieToPngSequence } from './lottietopng.js';

/**
 * Converts a Lottie JSON object directly into a WebM video Blob.
 * This function runs entirely in the browser.
 *
 * REQUIRES:
 * 1. lottie.min.js (loaded globally)
 * 2. lottietopng.js (imported)
 */
export async function convertLottieToWebm(lottieJson, options = {}) {
    // --- 1. Check for dependencies ---
    if (typeof lottie === 'undefined') {
        throw new Error('`lottie` is not loaded. Please include lottie.min.js.');
    }
    // No need to check for convertLottieToPngSequence, import handles it.
    if (typeof MediaRecorder === 'undefined') {
        throw new Error('MediaRecorder API is not supported in this browser.');
    }

    // --- 2. Set up options and defaults ---
    const {
        scale = 1,
        fps = 30,
        transparentBg = true,
        bgColor = '#ffffff',
        onProgress = (percent, message) => console.log(`[${percent.toFixed(0)}%] ${message}`),
    } = options;

    const finalWidth = lottieJson.w * scale;
    const finalHeight = lottieJson.h * scale;

    if (!finalWidth || !finalHeight) {
        throw new Error('Invalid Lottie dimensions or scale factor.');
    }

    // --- 3. Step 1: Convert Lottie to PNG Blobs ---
    onProgress(0, 'Generating PNG sequence...');
    const pngBlobs = await convertLottieToPngSequence(lottieJson, {
        scale: scale,
        outputFps: fps,
        transparentBg: transparentBg,
        bgColor: bgColor,
        onProgress: (percent, msg) => onProgress(percent * 0.5, msg) // 0-50% progress
    });

    if (pngBlobs.length === 0) {
        throw new Error('No PNG frames were generated from the Lottie animation.');
    }

    onProgress(50, 'Loading generated PNGs into memory...');
    
    // --- 4. Load PNG Blobs into Image Objects ---
    const imageObjects = [];
    for (const blob of pngBlobs) {
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        await new Promise((resolve, reject) => {
            img.onload = () => {
                imageObjects.push(img);
                resolve();
            };
            img.onerror = (err) => reject(new Error('Failed to load generated PNG blob.'));
        });
    }

    onProgress(60, 'All images loaded. Starting video encoding...');

    // --- 5. Step 2: Convert Image Objects to WebM Video ---
    return new Promise((resolve, reject) => {
        // Create an in-memory canvas
        const canvas = document.createElement('canvas');
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        const ctx = canvas.getContext('2d');

        const stream = canvas.captureStream(fps);
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8' });
        const chunks = [];
        const frameInterval = 1000 / fps;
        let currentImageIndex = 0;

        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        recorder.onstop = () => {
            const videoBlob = new Blob(chunks, { type: 'video/webm' });
            // Clean up all the temporary Object URLs
            imageObjects.forEach(img => URL.revokeObjectURL(img.src));
            onProgress(100, 'Video conversion complete.');
            resolve(videoBlob);
        };

        recorder.onerror = (e) => {
            imageObjects.forEach(img => URL.revokeObjectURL(img.src)); // Clean up
            reject(e);
        };

        // Start recording
        recorder.start();

        // The drawing loop
        const intervalId = setInterval(() => {
            if (currentImageIndex < imageObjects.length) {
                const img = imageObjects[currentImageIndex];
                ctx.clearRect(0, 0, finalWidth, finalHeight);
                ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
                
                const encodeProgress = 60 + (currentImageIndex / imageObjects.length) * 40;
                onProgress(encodeProgress, `Encoding frame ${currentImageIndex + 1}/${imageObjects.length}`);
                
                currentImageIndex++;
            } else {
                clearInterval(intervalId);
                recorder.stop();
            }
        }, frameInterval);
    });
}