 // --- Global Variables ---
    let originalFilename = null;
    let rawOriginalFileName = null;
    let originalJson = null;
    let lottieAnim = null;
    let currentPadding = 50;
    let currentScaleFactor = 1;
    let panX = 0; // Current horizontal pan offset
    let panY = 0; // Current vertical pan offset
    let _lottieDataReceived = false;

    const PADDING_INCREASE_FACTOR = 1.20;
    const SCREEN_MARGIN = 40; // Margin (px) to keep around the preview wrapper when scaling

    // --- DOM Element References ---
    const fileInput = document.getElementById('fileInput');
    const loadBtn = document.getElementById('loadBtn');
    const increasePaddingBtn = document.getElementById('increasePaddingBtn');

    const applyBtn = document.getElementById('applyBtn');
    const applyCropBtn = document.getElementById('applyCropBtn');
    const applyAndCloseBtn = document.getElementById('applyAndCloseBtn');
    const downloadLink = document.getElementById('downloadLink');
    const topControls = document.getElementById('top-controls'); // Reference to top controls bar
    const workspace = document.getElementById('workspace'); // Pannable area
    const panZoomContainer = document.getElementById('pan-zoom-container'); // Container that moves
    const previewWrapper = document.getElementById('previewWrapper'); // Scaled container
    const lottieContainer = document.getElementById('lottieContainer');
    const cropBox = document.getElementById('cropBox');
    const centerBtn = document.getElementById('centerBtn'); // Centers cropBox on Lottie
    const ratioBtn = document.getElementById('ratioBtn');
    const ratioOverlay = document.getElementById('ratioOverlay');
    const applyRatioBtn = document.getElementById('applyRatio');
    const closeRatioBtn = document.getElementById('closeRatio');
    const ratioWInput = document.getElementById('ratioW');
    const ratioHInput = document.getElementById('ratioH');

    // --- Event Listeners Setup ---

    increasePaddingBtn.addEventListener('click', increasePadding);

    applyCropBtn.addEventListener('click', handleApplyCropToPreview);
    applyBtn.addEventListener('click', handleApplyChanges);
    applyAndCloseBtn.addEventListener('click', handleApplyAndClose);
    centerBtn.addEventListener('click', centerCropBox);
    ratioBtn.addEventListener('click', () => ratioOverlay.style.display = 'flex');
    applyRatioBtn.addEventListener('click', applyAspectRatio);
    closeRatioBtn.addEventListener('click', closeRatioOverlay);
    ratioOverlay.addEventListener('click', (e) => {
      if (e.target === ratioOverlay) closeRatioOverlay();
    });
    window.addEventListener('resize', () => {
        if (originalJson) {
            updateWrapperAndContainerSize(originalJson.w, originalJson.h);
            autoCenterView(); // Re-center view on window resize
        }
    });

    // --- Panning Setup ---
        // ← make sure this is here
  setupPanning();


    let zoomLevel = 1;
  const resetZoomBtn = document.getElementById('resetZoomBtn');

// Centralize your zoom‐applying logic into a function:
function applyZoom() {
  panZoomContainer.style.transform = `scale(${zoomLevel})`;
  // show/hide the reset button

    resetZoomBtn.classList.toggle('visible', zoomLevel !== 1);
}


// Reset button handler:
resetZoomBtn.addEventListener('click', () => {
  zoomLevel = 1;
  applyZoom();
});

// finally, initialize
applyZoom();



    // Initialize panning listener
    workspace.addEventListener('wheel', function(e) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    // change zoom sensitivity here if you like
    const zoomDelta = -e.deltaY * 0.002;
    zoomLevel = Math.min(Math.max(zoomLevel + zoomDelta, 0.2), 8);
    // apply the scale
    panZoomContainer.style.transform = `scale(${zoomLevel})`;

    resetZoomBtn.classList.toggle('visible', zoomLevel !== 1);
    clampPanPosition();
  }
});
    // --- Core Functions ---

    function handleLoadLottie() {
      const file = fileInput.files[0];
      if (!file) { alert('Please select a Lottie JSON file.'); return; }
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const fileContent = e.target.result;
          if (typeof fileContent !== 'string' || fileContent.trim() === '') {
              alert('Error: File is empty or could not be read as text.'); originalJson = null; resetUI(); return;
          }
          const jsonData = JSON.parse(fileContent);
          if (!jsonData || typeof jsonData.w !== 'number' || typeof jsonData.h !== 'number' || !Array.isArray(jsonData.layers)) {
              alert('Invalid Lottie JSON: Missing essential properties.'); originalJson = null; resetUI(); return;
          }
          originalJson = jsonData;
          currentPadding = 50;
          currentScaleFactor = 1;
          panX = 0; // Reset pan on load
          panY = 0;
          initPreview(originalJson);
          autoCenterView(); // Center initially
        } catch (err) {
          console.error("JSON Parsing Error Details:", err);
          let alertMessage = `Error parsing JSON file. ${err.message ? `(${err.message})` : ''}`;
          if (err instanceof SyntaxError) alertMessage += ' Check syntax.';
          alert(alertMessage); originalJson = null; resetUI();
        }
      };
      reader.onerror = () => { alert('Error reading file.'); originalJson = null; resetUI(); };
      reader.readAsText(file);
    }

    function initPreview(data) {
        if (!data) return;
        if (lottieAnim) { lottieAnim.destroy(); lottieAnim = null; }
        lottieContainer.innerHTML = '';

        previewWrapper.style.display = 'block';

        applyCropBtn.style.display = 'inline-block';       // Show Apply Crop button
  applyCropBtn.disabled = false;
        applyBtn.style.display = 'inline-block';
        applyBtn.disabled = false;
        downloadLink.style.display = 'none';
        downloadLink.href = '#';

        updateWrapperAndContainerSize(data.w, data.h);
        const animData = JSON.parse(JSON.stringify(data));
        try {
            lottieAnim = lottie.loadAnimation({ container: lottieContainer, renderer: 'svg', loop: true, autoplay: true, animationData: animData });
        } catch (error) {
            console.error("Lottie Loading Error:", error); alert("Failed to load Lottie animation."); resetUI(); return;
        }
        cropBox.style.width = data.w + 'px';
        cropBox.style.height = data.h + 'px';
        cropBox.style.left = currentPadding + 'px';
        cropBox.style.top = currentPadding + 'px';
        cropBox.dataset.x = currentPadding;
        cropBox.dataset.y = currentPadding;

        // Update pan container position based on current panX/panY
        updatePanContainerPosition();

        setupInteract(); // Setup interact for cropbox
    }

    /**
     * Updates wrapper size, calculates scale, and applies transform.
     * Does NOT change pan position.
     */
    function updateWrapperAndContainerSize(lottieW, lottieH) {
        const targetWrapperWidth = lottieW + currentPadding * 2;
        const targetWrapperHeight = lottieH + currentPadding * 2;
        const availableWidth = window.innerWidth - SCREEN_MARGIN;
        const controlsHeight = topControls ? topControls.offsetHeight : 50; // Default height if not found
        const availableHeight = window.innerHeight - controlsHeight - SCREEN_MARGIN;

        let scaleW = 1;
        let scaleH = 1;
        if (targetWrapperWidth > availableWidth && availableWidth > 0) {
            scaleW = availableWidth / targetWrapperWidth;
        }
         if (targetWrapperHeight > availableHeight && availableHeight > 0) {
             scaleH = availableHeight / targetWrapperHeight;
         }
        const oldScaleFactor = currentScaleFactor; // Store old scale before updating
        currentScaleFactor = Math.min(scaleW, scaleH, 1); // Use the smaller scale factor, max 1

        // Set unscaled dimensions
        previewWrapper.style.width = targetWrapperWidth + 'px';
        previewWrapper.style.height = targetWrapperHeight + 'px';
        previewWrapper.style.padding = currentPadding + 'px';

        // Apply scaling transform
        previewWrapper.style.transformOrigin = 'top left'; // Keep origin top-left for coordinate consistency
        previewWrapper.style.transform = `scale(${currentScaleFactor})`;

        // Lottie container uses unscaled dimensions relative to wrapper
        lottieContainer.style.width = lottieW + 'px';
        lottieContainer.style.height = lottieH + 'px';
        lottieContainer.style.left = currentPadding + 'px';
        lottieContainer.style.top = currentPadding + 'px';

        // Return the change in scale factor if needed for pan adjustment
        return currentScaleFactor / oldScaleFactor;
    }

    /**
     * Applies the current panX and panY to the pan-zoom container.
     */
    function updatePanContainerPosition() {
        panZoomContainer.style.left = `${panX}px`;
        panZoomContainer.style.top = `${panY}px`;
    }

    /**
     * Increases padding and updates layout, keeping visual center.
     */
    function increasePadding() {
        if (!originalJson) return;

        // --- Store old state ---
        const oldPadding = currentPadding;
        const oldScaleFactor = currentScaleFactor;
        // Get dimensions BEFORE padding/scale change
        const oldUnscaledWidth = previewWrapper.offsetWidth;
        const oldUnscaledHeight = previewWrapper.offsetHeight;
        const oldScaledWidth = oldUnscaledWidth * oldScaleFactor;
        const oldScaledHeight = oldUnscaledHeight * oldScaleFactor;
        const oldPanX = panX;
        const oldPanY = panY;

        // --- Apply padding increase ---
        currentPadding = Math.round(currentPadding * PADDING_INCREASE_FACTOR);
        const deltaPadding = currentPadding - oldPadding;

        // --- Update wrapper size and get NEW scale factor ---
        updateWrapperAndContainerSize(originalJson.w, originalJson.h); // This updates currentScaleFactor

        // --- Adjust cropBox position relative to unscaled wrapper ---
        const currentCropX = parseFloat(cropBox.dataset.x || 0);
        const currentCropY = parseFloat(cropBox.dataset.y || 0);
        const newCropX = currentCropX + deltaPadding;
        const newCropY = currentCropY + deltaPadding;
        cropBox.style.left = newCropX + 'px';
        cropBox.style.top = newCropY + 'px';
        cropBox.dataset.x = newCropX;
        cropBox.dataset.y = newCropY;

        // --- Recalculate pan to keep visual center stationary ---
        // Get the NEW scaled dimensions
        const newScaledWidth = previewWrapper.offsetWidth * currentScaleFactor;
        const newScaledHeight = previewWrapper.offsetHeight * currentScaleFactor;

        // Calculate the required pan shift to compensate for size/scale change
        // This keeps the center point in the same visual position relative to the workspace
        const panShiftX = (oldScaledWidth - newScaledWidth) / 2;
        const panShiftY = (oldScaledHeight - newScaledHeight) / 2;

        // Apply the shift to the old pan position
        panX = oldPanX + panShiftX;
        panY = oldPanY + panShiftY;


        // --- Clamp and apply pan ---
        clampPanPosition();
        updatePanContainerPosition(); // Apply the corrected pan
    }


    /**
     * Centers the cropBox over the Lottie container (within previewWrapper).
     */
    function centerCropBox() {
        if (!originalJson) return;
        const boxW = cropBox.offsetWidth;
        const boxH = cropBox.offsetHeight;
        const containerOffsetX = currentPadding;
        const containerOffsetY = currentPadding;
        const centerX = containerOffsetX + (originalJson.w - boxW) / 2;
        const centerY = containerOffsetY + (originalJson.h - boxH) / 2;
        cropBox.style.left = centerX + 'px';
        cropBox.style.top = centerY + 'px';
        cropBox.dataset.x = centerX;
        cropBox.dataset.y = centerY;
    }

    /**
     * Centers the previewWrapper within the workspace view.
     */
    function autoCenterView() {
        if (!previewWrapper.style.display || previewWrapper.style.display === 'none') return;

        const workspaceWidth = workspace.clientWidth;
        const workspaceHeight = workspace.clientHeight;

        // Get the scaled dimensions of the preview wrapper
        const scaledWrapperWidth = previewWrapper.offsetWidth * currentScaleFactor;
        const scaledWrapperHeight = previewWrapper.offsetHeight * currentScaleFactor;

        // Calculate desired top-left corner for centering
        panX = (workspaceWidth - scaledWrapperWidth) / 2;
        panY = (workspaceHeight - scaledWrapperHeight) / 2;

        // Apply the new pan position
        updatePanContainerPosition();
    }

    /**
     * Prevents panning too far away from the content.
     * Corrected logic for clamping.
     */
    function clampPanPosition() {
         const workspaceWidth = workspace.clientWidth;
         const workspaceHeight = workspace.clientHeight;
         const scaledWrapperWidth = previewWrapper.offsetWidth * currentScaleFactor;
         const scaledWrapperHeight = previewWrapper.offsetHeight * currentScaleFactor;

         let minX, maxX, minY, maxY;

         if (scaledWrapperWidth <= workspaceWidth) {
             // Content is narrower than workspace: Clamp between 0 and the right edge space
             minX = 0;
             maxX = workspaceWidth - scaledWrapperWidth;
         } else {
             // Content is wider than workspace: Clamp between the left edge space and 0
             minX = workspaceWidth - scaledWrapperWidth;
             maxX = 0;
         }

         if (scaledWrapperHeight <= workspaceHeight) {
             // Content is shorter than workspace: Clamp between 0 and the bottom edge space
             minY = 0;
             maxY = workspaceHeight - scaledWrapperHeight;
         } else {
             // Content is taller than workspace: Clamp between the top edge space and 0
             minY = workspaceHeight - scaledWrapperHeight;
             maxY = 0;
         }

         // Apply clamps
         panX = Math.max(minX, Math.min(panX, maxX));
         panY = Math.max(minY, Math.min(panY, maxY));
    }


     function applyAspectRatio() {
         const w = parseFloat(ratioWInput.value);
         const h = parseFloat(ratioHInput.value);
         if (!w || !h || w <= 0 || h <= 0) { alert('Invalid ratio.'); return; }
         const targetRatio = w / h;
         const currentWidth = cropBox.offsetWidth;
         const currentHeight = cropBox.offsetHeight;
         const currentX = parseFloat(cropBox.dataset.x || 0);
         const currentY = parseFloat(cropBox.dataset.y || 0);
         let newWidth, newHeight;
         if (currentWidth / currentHeight > targetRatio) {
             newWidth = currentHeight * targetRatio; newHeight = currentHeight;
         } else {
             newHeight = currentWidth / targetRatio; newWidth = currentWidth;
         }
         const wrapperWidth = parseFloat(previewWrapper.style.width) || previewWrapper.offsetWidth;
         const wrapperHeight = parseFloat(previewWrapper.style.height) || previewWrapper.offsetHeight;
         if (newWidth > wrapperWidth) { newWidth = wrapperWidth; newHeight = newWidth / targetRatio; }
         if (newHeight > wrapperHeight) { newHeight = wrapperHeight; newWidth = newHeight * targetRatio; }
         const deltaW = currentWidth - newWidth;
         const deltaH = currentHeight - newHeight;
         let newX = currentX + deltaW / 2;
         let newY = currentY + deltaH / 2;
         newX = Math.max(0, Math.min(newX, wrapperWidth - newWidth));
         newY = Math.max(0, Math.min(newY, wrapperHeight - newHeight));
         cropBox.style.width = Math.round(newWidth) + 'px';
         cropBox.style.height = Math.round(newHeight) + 'px';
         cropBox.style.left = Math.round(newX) + 'px';
         cropBox.style.top = Math.round(newY) + 'px';
         cropBox.dataset.x = newX;
         cropBox.dataset.y = newY;
         closeRatioOverlay();
     }

     function closeRatioOverlay() {
        ratioOverlay.style.display = 'none';
        ratioWInput.value = ''; ratioHInput.value = '';
     }

     function resetUI() {
        previewWrapper.style.display = 'none';
        previewWrapper.style.transform = 'none';
        autoCenterBtn.style.display = 'none';
        increasePaddingBtn.style.display = 'none';
        applyCropBtn.style.display = 'none';       // Hide Apply Crop button
   applyCropBtn.disabled = true;
        applyBtn.style.display = 'none';
        applyBtn.disabled = true;
        downloadLink.style.display = 'none';
        downloadLink.href = '#';
        if (lottieAnim) { lottieAnim.destroy(); lottieAnim = null; }
        lottieContainer.innerHTML = '';
        originalJson = null;
        currentPadding = 50;
        currentScaleFactor = 1;
        panX = 0;
        panY = 0;
        updatePanContainerPosition(); // Reset pan visually
     }

     /**
      * Sets up Interact.js listener for panning the workspace.
      */
     function setupPanning() {
         interact(workspace).draggable({
             listeners: {
                 start(event) {
                     // Only start panning if the drag didn't start on the cropBox or its handles
                     if (event.target === workspace || event.target === panZoomContainer || event.target === previewWrapper || event.target === lottieContainer) {
                         workspace.style.cursor = 'grabbing';
                     } else {
                         return false; // Prevents this draggable from taking over
                     }
                 },
                 move(event) {
                    // Check again if panning should proceed
                     if (event.target !== workspace && event.target !== panZoomContainer && event.target !== previewWrapper && event.target !== lottieContainer) {
                         return;
                     }
                     panX += event.dx;
                     panY += event.dy;
                     updatePanContainerPosition();
                 },
                 end(event) {
                     workspace.style.cursor = 'grab';
                     clampPanPosition(); // Clamp after panning stops
                     updatePanContainerPosition();
                 }
             },
             allowFrom: ':not(#cropBox, #cropBox *)' // Prevent starting pan on cropBox/handles
         });
     }


    /**
     * Sets up Interact.js for cropBox dragging/resizing.
     */
    function setupInteract() {
        let startX, startY, startWidth, startHeight, startRatio;
        let wasSymmetricalCornerResize = false;

        interact(cropBox)
          .draggable({
            listeners: {
              move(event) {
                const target = event.target;
                const scaleZoom = currentScaleFactor * zoomLevel;
                const dx = event.dx / scaleZoom;
                const dy = event.dy / scaleZoom;
                const x = (parseFloat(target.dataset.x) || 0) + dx;
                const y = (parseFloat(target.dataset.y) || 0) + dy;
                target.style.left = x + 'px';
                target.style.top  = y + 'px';
                target.dataset.x = x;
                target.dataset.y = y;
              }
            },
            modifiers: [
              interact.modifiers.restrictRect({ restriction: 'parent', endOnly: false })
            ]
          })
          .resizable({
            edges: { left: true, right: true, top: true, bottom: true },
            listeners: {
              start(event) {
                  const target = event.target;
                  startX = parseFloat(target.dataset.x) || 0;
                  startY = parseFloat(target.dataset.y) || 0;
                  startWidth = target.offsetWidth;
                  startHeight = target.offsetHeight;
                  startRatio = startHeight !== 0 ? startWidth / startHeight : 1;
                  wasSymmetricalCornerResize = false;
              },
              move(event) {
                const target = event.target;
                let x = startX;
                let y = startY;
                const scaleZoom = currentScaleFactor * zoomLevel;
                let width = event.rect.width / scaleZoom;
                let height = event.rect.height / scaleZoom;
                const dw = width - startWidth;
                const dh = height - startHeight;
                const isCorner = event.edges.left && event.edges.top || event.edges.right && event.edges.top || event.edges.left && event.edges.bottom || event.edges.right && event.edges.bottom;

                if (event.ctrlKey || event.metaKey) {
                    wasSymmetricalCornerResize = false;
                    if (event.edges.left) { x = startX - dw; }
                    if (event.edges.top) { y = startY - dh; }
                } else {
                    if (isCorner) {
                        wasSymmetricalCornerResize = true;
                        if (Math.abs(dw) > Math.abs(dh * startRatio)) { height = width / startRatio; } else { width = height * startRatio; }
                    } else { wasSymmetricalCornerResize = false; }
                    const finalDw = width - startWidth; const finalDh = height - startHeight;
                    x = startX - finalDw / 2; y = startY - finalDh / 2;
                }
                target.style.width = width + 'px'; target.style.height = height + 'px';
                target.style.left = x + 'px'; target.style.top = y + 'px';
                target.dataset.x = x; target.dataset.y = y;
              },
              end(event) {
                const target = event.target;
                let finalX = parseFloat(target.dataset.x); let finalY = parseFloat(target.dataset.y);
                let finalWidth = target.offsetWidth; let finalHeight = target.offsetHeight;
                const wrapperWidth = parseFloat(previewWrapper.style.width) || previewWrapper.offsetWidth;
                const wrapperHeight = parseFloat(previewWrapper.style.height) || previewWrapper.offsetHeight;
                let needsCorrection = false; const minSize = 20;

                if (finalX < 0) { finalX = 0; needsCorrection = true; }
                if (finalY < 0) { finalY = 0; needsCorrection = true; }
                if (finalWidth < minSize) { finalWidth = minSize; needsCorrection = true; }
                if (finalHeight < minSize) { finalHeight = minSize; needsCorrection = true; }
                if (finalX + finalWidth > wrapperWidth) { finalWidth = wrapperWidth - finalX; if (finalWidth < minSize) { finalWidth = minSize; finalX = wrapperWidth - minSize; } needsCorrection = true; }
                if (finalY + finalHeight > wrapperHeight) { finalHeight = wrapperHeight - finalY; if (finalHeight < minSize) { finalHeight = minSize; finalY = wrapperHeight - minSize; } needsCorrection = true; }
                if (finalX < 0) { finalX = 0; needsCorrection = true; }
                if (finalY < 0) { finalY = 0; needsCorrection = true; }

                if (needsCorrection && wasSymmetricalCornerResize && startRatio > 0 && finalHeight > 0) { // Added finalHeight > 0 check
                    const currentRatio = finalWidth / finalHeight; const tolerance = 0.01;
                    if (Math.abs(currentRatio - startRatio) > tolerance) {
                        let potentialWidth = finalHeight * startRatio; let potentialHeight = finalWidth / startRatio;
                        if (potentialHeight >= minSize && potentialHeight <= wrapperHeight - finalY) { finalHeight = potentialHeight; }
                        else if (potentialWidth >= minSize && potentialWidth <= wrapperWidth - finalX) { finalWidth = potentialWidth; }
                    }
                }

                if (needsCorrection) {
                    finalWidth = Math.max(minSize, finalWidth); finalHeight = Math.max(minSize, finalHeight);
                    finalX = Math.max(0, Math.min(finalX, wrapperWidth - finalWidth));
                    finalY = Math.max(0, Math.min(finalY, wrapperHeight - finalHeight));
                    target.style.width = finalWidth + 'px'; target.style.height = finalHeight + 'px';
                    target.style.left = finalX + 'px'; target.style.top = finalY + 'px';
                    target.dataset.x = finalX; target.dataset.y = finalY;
                }
                wasSymmetricalCornerResize = false;
              }
            },
          });
    }


    /**
 * Applies the current crop box to the Lottie, updates originalJson, and refreshes the preview.
 */
function handleApplyCropToPreview() {
    if (!originalJson) {
        alert('No Lottie loaded to apply crop.');
        return;
    }

    // Create a deep copy of originalJson to modify
    const dataToModify = JSON.parse(JSON.stringify(originalJson));

    // --- Start of cropping logic (adapted from your handleApplyChanges) ---
    const containerWidth = parseFloat(lottieContainer.style.width) || lottieContainer.offsetWidth;
    const containerHeight = parseFloat(lottieContainer.style.height) || lottieContainer.offsetHeight;

    if (containerWidth <= 0 || containerHeight <= 0) {
        console.error("Lottie container has zero or invalid dimensions during crop logic.");
        alert("Error applying changes: Lottie container dimensions are invalid.");
        return;
    }

    const cropBoxX = parseFloat(cropBox.dataset.x || 0);
    const cropBoxY = parseFloat(cropBox.dataset.y || 0);
    const cropBoxWidth = cropBox.offsetWidth;
    const cropBoxHeight = cropBox.offsetHeight;

    // Use originalJson.w and originalJson.h for scale calculation consistency
    const scaleX = originalJson.w / containerWidth;
    const scaleY = originalJson.h / containerHeight;

    const offsetX = (cropBoxX - currentPadding) * scaleX;
    const offsetY = (cropBoxY - currentPadding) * scaleY;
    const newWidth = cropBoxWidth * scaleX;
    const newHeight = cropBoxHeight * scaleY;


          addNullParent(dataToModify); // Ensures dataToModify.layers[0] is the CROPPER_ROOT_NULL

          if (dataToModify.layers[0]?.ty === 3 && dataToModify.layers[0]?.ks?.p) {
              // Get the current position of the null layer (from previous crops, if any).
              // addNullParent ensures the null exists; if newly added, its position k: [0,0,0].
              // If it existed, its previous transform is preserved in dataToModify.
              let currentNullPosX = dataToModify.layers[0].ks.p.k[0] || 0;
              let currentNullPosY = dataToModify.layers[0].ks.p.k[1] || 0;

              // The calculated offsetX and offsetY are the amounts we want to shift *from the current view*.
              // The null parent moves in the opposite direction of the crop.
              // So, we subtract the new calculated crop offset from the existing null's offset.
              dataToModify.layers[0].ks.p.k = [
                  currentNullPosX - offsetX,
                  currentNullPosY - offsetY,
                  0
              ];
          } else {
              console.error("Cropper null parent layer is missing or not configured correctly after addNullParent.");
              alert("Error applying changes: Could not set crop transformations.");
              return; // Or handle error appropriately
          }

          dataToModify.w = Math.round(newWidth);
          dataToModify.h = Math.round(newHeight);
    // --- End of cropping logic ---

    // Update the global originalJson to the newly cropped version
    originalJson = dataToModify;

    // Update filename, e.g., "animation.json" -> "animation_cropped.json"
    if (rawOriginalFileName) {
        const dotIndex = rawOriginalFileName.lastIndexOf('.');
        if (dotIndex > -1) { // Ensure dot exists
          const base = rawOriginalFileName.substring(0, dotIndex);
          const ext = rawOriginalFileName.substring(dotIndex);
            originalFilename = `${base}_cropped${ext}`;
        } else {
            originalFilename += "_cropped";
        }
    } else {
        originalFilename = "cropped_lottie.json"; // Fallback filename
    }

    // Re-initialize the preview with the new (cropped) originalJson
    // This will also reset the cropBox visually to the new Lottie's dimensions.
    initPreview(originalJson);
    autoCenterView(); // Re-center the view
}


    /**
     * Applies changes and prepares download.
     */
    function handleApplyChanges() {
      if (!originalJson) { alert('No Lottie loaded.'); return; }
      applyCropBtn.click();
      const data = JSON.parse(JSON.stringify(originalJson));
      const containerWidth = parseFloat(lottieContainer.style.width) || lottieContainer.offsetWidth;
      const containerHeight = parseFloat(lottieContainer.style.height) || lottieContainer.offsetHeight;
      if (containerWidth <= 0 || containerHeight <= 0) { console.error("Lottie container zero dimensions."); alert("Error applying changes."); return; }
      const cropBoxX = parseFloat(cropBox.dataset.x || 0);
      const cropBoxY = parseFloat(cropBox.dataset.y || 0);
      const cropBoxWidth = cropBox.offsetWidth;
      const cropBoxHeight = cropBox.offsetHeight;
      const scaleX = originalJson.w / containerWidth;
      const scaleY = originalJson.h / containerHeight;
      const offsetX = (cropBoxX - currentPadding) * scaleX;
      const offsetY = (cropBoxY - currentPadding) * scaleY;
      const newWidth = cropBoxWidth * scaleX;
      const newHeight = cropBoxHeight * scaleY;
      addNullParent(data); // data.layers[0] will be the CROPPER_ROOT_NULL

     if (data.layers[0]?.ty === 3 && data.layers[0]?.ks?.p) {
         // Get the current position of the null layer.
         let currentNullPosX = data.layers[0].ks.p.k[0] || 0;
         let currentNullPosY = data.layers[0].ks.p.k[1] || 0;

         // Accumulate the transform.
         data.layers[0].ks.p.k = [
             currentNullPosX - offsetX,
             currentNullPosY - offsetY,
             0
         ];
     } else {
         console.error("Null parent missing or improperly configured in handleApplyChanges.");
         alert("Error applying changes for download.");
         return;
     }
     data.w = Math.round(newWidth); data.h = Math.round(newHeight);
      const modifiedJsonString = JSON.stringify(data);
      const blob = new Blob([modifiedJsonString], { type: 'application/json' });
      if (downloadLink.href && downloadLink.href.startsWith('blob:')) { URL.revokeObjectURL(downloadLink.href); }
      downloadLink.href = URL.createObjectURL(blob);
      /*const originalFileName = fileInput.files[0]?.name.replace(/\.json$/i, '') || 'lottie';*/
      downloadLink.download = originalFileName;

      downloadLink.textContent = `Download ${downloadLink.download}`;
      downloadLink.click();
    }

    /**
     * Adds or verifies the null parent layer.
     */
    function addNullParent(data) {
      if (!data || !Array.isArray(data.layers)) { console.error("Invalid data."); return; }
      if (data.layers.length === 0) return;
      const nullName = 'CROPPER_ROOT_NULL';
      if (data.layers[0].ty === 3 && data.layers[0].nm === nullName) {
         const parentIndex = data.layers[0].ind;
         for (let i = 1; i < data.layers.length; i++) { if (typeof data.layers[i].parent === 'undefined') { data.layers[i].parent = parentIndex; } }
         return;
      }
      let maxIndex = 0;
      data.layers.forEach(l => { if (typeof l.ind === 'number' && l.ind > maxIndex) maxIndex = l.ind; });
      const nullIndex = maxIndex + 1;
      const nullLayer = {
        ddd: 0, ind: nullIndex, ty: 3, nm: nullName, sr: 1,
        ks: { a: { a: 0, k: [0, 0, 0] }, p: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
        ao: 0, ip: data.ip ?? 0, op: data.op ?? 9999, st: data.st ?? 0, bm: 0
      };
      data.layers.unshift(nullLayer);
      for (let i = 1; i < data.layers.length; i++) { if (typeof data.layers[i].parent === 'undefined') { data.layers[i].parent = nullIndex; } }
    }


function loadReceivedLottie(jsonData, filename) {

    try {

      // --- Keep the rest of the logic from here ---
      if (!jsonData || typeof jsonData.w !== 'number' || typeof jsonData.h !== 'number' || !Array.isArray(jsonData.layers)) {
          alert('Invalid Lottie JSON received: Missing essential properties.'); originalJson = null; resetUI(); return;
      }
      console.log('recieved' + filename);
      originalFileName = filename;
      rawOriginalFileName = filename;
      originalJson = jsonData;
      currentPadding = 50;
      currentScaleFactor = 1;
      panX = 0; // Reset pan on load
      panY = 0;
      initPreview(originalJson);
      autoCenterView(); // Center initially
      // --- End of kept logic ---

    } catch (err) {
      console.error("JSON Processing Error Details:", err);
      let alertMessage = `Error processing received Lottie data. ${err.message ? `(${err.message})` : ''}`;
      alert(alertMessage); originalJson = null; resetUI();
    }

}




    window.addEventListener('message', (event) => {
    // Optional: Add origin check for security in production
    // if (event.origin !== 'expected_origin_of_index.html') {
    //     console.warn('Message received from unexpected origin:', event.origin);
    //     return;
    // }

    if (event.data && event.data.type === 'lottieData') {
        console.log('Lottie data received from parent:', event.data.data);
        console.log(event.data.filename);
        // Call the modified function to load the received data
         _lottieDataReceived = true;
        loadReceivedLottie(event.data.data, event.data.filename);
    }
    else if (event.data.type === 'triggerSaveAndCloseCrop') {
        console.log('Received request from parent to save and close crop tool.');
      handleApplyAndClose(); // Call the function that applies crop and sends data back
    }
    else {
        console.log('Received non-Lottie message or invalid data:', event.data);
    }
});

setTimeout(() => {
   if (!_lottieDataReceived) {
     fetch('default.json')
       .then(res => res.json())
       .then(json => loadReceivedLottie(json, 'default.json'))
       .catch(err => console.warn('Couldn’t load default.json:', err));
   }
 }, 300);


 // Add this new function to crop.js
function handleApplyAndClose() {
    if (!originalJson) {
        alert('No Lottie loaded.');
        return;
    }
       handleApplyCropToPreview();
    // This logic is the same as your old handleApplyChanges function
    // It calculates the final cropped JSON data.
    const data = JSON.parse(JSON.stringify(originalJson));
    const containerWidth = parseFloat(lottieContainer.style.width) || lottieContainer.offsetWidth;
    const containerHeight = parseFloat(lottieContainer.style.height) || lottieContainer.offsetHeight;
    if (containerWidth <= 0 || containerHeight <= 0) {
        console.error("Lottie container zero dimensions.");
        alert("Error applying changes.");
        return;
    }
    const cropBoxX = parseFloat(cropBox.dataset.x || 0);
    const cropBoxY = parseFloat(cropBox.dataset.y || 0);
    const cropBoxWidth = cropBox.offsetWidth;
    const cropBoxHeight = cropBox.offsetHeight;
    const scaleX = originalJson.w / containerWidth;
    const scaleY = originalJson.h / containerHeight;
    const offsetX = (cropBoxX - currentPadding) * scaleX;
    const offsetY = (cropBoxY - currentPadding) * scaleY;
    const newWidth = cropBoxWidth * scaleX;
    const newHeight = cropBoxHeight * scaleY;
    addNullParent(data);

    if (data.layers[0]?.ty === 3 && data.layers[0]?.ks?.p) {
        let currentNullPosX = data.layers[0].ks.p.k[0] || 0;
        let currentNullPosY = data.layers[0].ks.p.k[1] || 0;
        data.layers[0].ks.p.k = [currentNullPosX - offsetX, currentNullPosY - offsetY, 0];
    } else {
        console.error("Null parent missing or improperly configured.");
        alert("Error applying changes.");
        return;
    }
    data.w = Math.round(newWidth);
    data.h = Math.round(newHeight);

    // This is the key part: send the modified data back to the parent window

    window.parent.postMessage({
        type: 'dataFromCropTool',
        lottieData: data,
        originalFilename: rawOriginalFileName // Send the filename back for identification
    }, '*'); // Use a specific origin in production for security!
}
