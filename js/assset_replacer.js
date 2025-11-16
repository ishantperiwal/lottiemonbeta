 let animationInstance = null;
        let lottieData = null;
        let lottieFileName = 'animation.json';
        let lastSelectedFiles = [];

        // DOM Elements
        const lottieFileWrapper = document.getElementById('lottieFileWrapper');
        const lottieFileInput = document.getElementById('lottieFile');
        const lottiePreview = document.getElementById('lottiePreview');
        const assetListContainer = document.getElementById('assetListContainer');
        const assetList = document.getElementById('assetList');
        const noAssetsMessage = document.getElementById('noAssetsMessage');
        const downloadLottieButton = document.getElementById('downloadLottie');
        const downloadAllAssetsButton = document.getElementById('downloadAllAssetsButton');
        const scrollUpIndicator = document.getElementById('scrollUpIndicator');
        const scrollDownIndicator = document.getElementById('scrollDownIndicator');

        // Sequence Mode Elements
        const sequenceTooltip = document.getElementById('sequenceTooltip');
        const selectionCounterPill = document.getElementById('selectionCounterPill');
        const sequenceErrorTooltip = document.getElementById('sequenceErrorTooltip');
        const sequenceErrorText = document.getElementById('sequenceErrorText');
        const replaceAnywayButton = document.getElementById('replaceAnywayButton');
        const selectAgainButton = document.getElementById('selectAgainButton'); // New button
        const replaceSequenceButton = document.getElementById('replaceSequenceButton');
        const browseSequenceFilesButton = document.getElementById('browseSequenceFilesButton');
        const browseSequenceFilesButtonText = document.getElementById('browseSequenceFilesButtonText');
        const cancelSequenceButton = document.getElementById('cancelSequenceButton');
        const multipleFilesInput = document.getElementById('multipleFilesInput');
        const closeSequenceTooltipButton = document.getElementById('closeSequenceTooltipButton');
        const applyAndCloseBtn = document.getElementById('applyAndCloseBtn');
        // State Variables
        let isSequenceModeActive = false;
        let selectedAssetIndicesForSequence = [];

        // SVG Icons for buttons
        const aspectRatioIconSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>`;
        const downloadAssetIconSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>`;
        // Updated Reset/Undo Icon
        const resetAssetIconSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>`;

        /**
         * Processes the Lottie JSON data, initializes preview and asset list.
         */
        function processLottieData(data, fileNameFromMessage) {
            try {
                lottieData = data;
                if (fileNameFromMessage) lottieFileName = fileNameFromMessage;
                else if (lottieFileInput.files[0]) lottieFileName = lottieFileInput.files[0].name;

                if (!lottieData.assets) lottieData.assets = [];

                if (lottieData.assets) {
                    lottieData.assets.forEach(asset => {
                        if (asset.w && asset.h) {
                            asset.originalLottieW = asset.w;
                            asset.originalLottieH = asset.h;
                        }
                        if (asset.p && typeof asset.p === 'string' && asset.p.startsWith('data:image/')) {
                            asset.originalAssetP = asset.p;
                            asset.originalAssetW = asset.w;
                            asset.originalAssetH = asset.h;
                            asset.originalAssetMimeType = getMimeTypeFromBase64(asset.p);
                            asset.hasChanged = false;
                        }
                    });
                }
                displayLottiePreview();
                listAssets();
                downloadLottieButton.disabled = false;
                const imageAssets = lottieData.assets.filter(asset => asset.p && typeof asset.p === 'string' && asset.p.startsWith('data:image/'));
                replaceSequenceButton.disabled = imageAssets.length === 0;
                downloadAllAssetsButton.disabled = imageAssets.length === 0;

            } catch (error) {
                console.error('Error processing Lottie data:', error);
                lottiePreview.innerHTML = '<p class="text-red-500">Error: Could not process Lottie data.</p>';
                assetList.innerHTML = '';
                noAssetsMessage.classList.remove('hidden');
                noAssetsMessage.textContent = 'Error loading assets.';
                downloadLottieButton.disabled = true;
                replaceSequenceButton.disabled = true;
                downloadAllAssetsButton.disabled = true;
                updateScrollIndicators();
            }
        }





        lottieFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file && file.type === 'application/json') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        processLottieData(JSON.parse(e.target.result), file.name);
                    } catch (parseError) {
                        console.error('Error parsing Lottie JSON from file:', parseError);
                        lottiePreview.innerHTML = '<p class="text-red-500">Error: Could not parse Lottie file. Make sure it is a valid JSON.</p>';
                        assetList.innerHTML = ''; noAssetsMessage.classList.remove('hidden');
                        noAssetsMessage.textContent = 'Error loading assets from file.';
                        downloadLottieButton.disabled = true; replaceSequenceButton.disabled = true; downloadAllAssetsButton.disabled = true;
                        updateScrollIndicators();
                    }
                };
                reader.readAsText(file);
            } else if (file) {
                lottiePreview.innerHTML = `<p class="text-orange-500">Please select a valid JSON file. You selected: ${file.name} (${file.type})</p>`;
            }
        });

        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'lottieDataAssetTool' && event.data.lottieData) {
                processLottieData(event.data.lottieData, event.data.filename);
                lottieFileWrapper.classList.add('hidden-if-data-received');
            }
            if (event.data && event.data.type === 'triggerSaveAndCloseCrop') {
     console.log('Received generic save trigger. Clicking internal save button.');
     applyAndCloseBtn.click();
 }
        });

        function displayLottiePreview() {
            const previewElement = document.getElementById('lottiePreview');
            if (animationInstance) {
                animationInstance.destroy();
                animationInstance = null;
            }
            previewElement.innerHTML = '';

            if (lottieData && lottieData.assets) {
                const animationDataForLottie = JSON.parse(JSON.stringify(lottieData));
                animationInstance = lottie.loadAnimation({
                    container: previewElement,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    animationData: animationDataForLottie
                });
            } else {
                previewElement.textContent = 'No Lottie data to display or assets missing.';
            }
        }

        function getImageTypeFromBase64(base64String) {
            const match = base64String.match(/^data:image\/([^;]+);base64,/);
            return match && match[1] ? match[1].toUpperCase() : 'UNKNOWN';
        }

        function getMimeTypeFromBase64(base64String) {
            const match = base64String.match(/^data:([^;]+);base64,/);
            return match && match[1] ? match[1].toLowerCase() : 'application/octet-stream';
        }

        function getApproximateSizeFromBase64(base64String) {
            if (!base64String || !base64String.includes(',')) return "0 KB";
            const base64Data = base64String.substring(base64String.indexOf(',') + 1);
            const padding = (base64Data.endsWith('==')) ? 2 : (base64Data.endsWith('=')) ? 1 : 0;
            const len = base64Data.length;
            if (len === 0) return "0 KB";
            const kBytes = ((len * 3 / 4) - padding) / 1024;
            return kBytes < 1 ? `${kBytes.toFixed(2)} KB` : `${Math.round(kBytes)} KB`;
        }

        function updateAssetCardDisplay(assetIndex, currentProcessedW, currentProcessedH, rawUploadedImgW, rawUploadedImgH) {
            const assetItem = document.querySelector(`.asset-item[data-asset-index='${assetIndex}']`);
            if (!assetItem) return;

            const assetData = lottieData.assets[assetIndex];
            const rawUploadedBase64ForPreview = assetItem.dataset.lastUploadedRawBase64;
            const processedBase64ForLottie = assetData.p;
            const originalLottieSlotW = assetData.originalLottieW;
            const originalLottieSlotH = assetData.originalLottieH;

            const assetImage = assetItem.querySelector('.preview-image-container img');
            const extensionPill = assetItem.querySelector('.asset-id-pill');
            const assetDetailsSpan = assetItem.querySelector('.asset-info-text .asset-details');
            const aspectRatioButton = assetItem.querySelector('.icon-button[title*="Toggle Cover/Stretch"]');
            const resetButton = assetItem.querySelector('.reset-asset-button');

            const existingWarning = assetDetailsSpan.querySelector('.size-mismatch-warning');
            if (existingWarning) existingWarning.remove();

            if (assetImage && rawUploadedBase64ForPreview) {
                assetImage.src = rawUploadedBase64ForPreview;
            }

            const finalMimeType = getMimeTypeFromBase64(processedBase64ForLottie);
            if (extensionPill) {
                extensionPill.textContent = finalMimeType.replace('image/', '').toUpperCase();
            }

            if (aspectRatioButton) {
                const isSVG = (finalMimeType === 'image/svg+xml');
                let disableButtonForRaster = false;
                if (!isSVG) {
                    if (originalLottieSlotW && originalLottieSlotH) {
                        disableButtonForRaster = rawUploadedImgW && rawUploadedImgH &&
                                                 rawUploadedImgW === originalLottieSlotW &&
                                                 rawUploadedImgH === originalLottieSlotH;
                    } else {
                        disableButtonForRaster = true;
                    }
                }
                aspectRatioButton.disabled = isSVG || disableButtonForRaster;
                aspectRatioButton.classList.toggle('opacity-50', aspectRatioButton.disabled);
                aspectRatioButton.classList.toggle('cursor-not-allowed', aspectRatioButton.disabled);
                if (aspectRatioButton.disabled) {
                    aspectRatioButton.classList.remove('active');
                }
            }

            if (resetButton && assetData) {
                resetButton.disabled = !assetData.hasChanged;
                resetButton.classList.toggle('reset-asset-button-enabled', assetData.hasChanged);
            }

            if (assetDetailsSpan && processedBase64ForLottie) {
                const imageSize = getApproximateSizeFromBase64(processedBase64ForLottie);
                let dimensionsText = (currentProcessedW && currentProcessedH) ? `${Math.round(currentProcessedW)}x${Math.round(currentProcessedH)} px` : 'Dimensions N/A';

                if (finalMimeType === 'image/svg+xml' &&
                    originalLottieSlotW && originalLottieSlotH &&
                    (Math.round(currentProcessedW) !== originalLottieSlotW || Math.round(currentProcessedH) !== originalLottieSlotH)) {
                    dimensionsText += ` <span class="size-mismatch-warning">(slot: ${originalLottieSlotW}x${originalLottieSlotH})</span>`;
                }
                assetDetailsSpan.innerHTML = `${imageSize} &bull; ${dimensionsText}`;
            }
        }

        function listAssets() {
            assetList.innerHTML = '';
            let imageAssetsFound = false;
            selectedAssetIndicesForSequence = [];
            updateSelectionCounter();

            if (lottieData && lottieData.assets) {
                lottieData.assets.forEach((asset, index) => {
                    if (asset.p && typeof asset.p === 'string' && asset.p.startsWith('data:image/')) {
                        imageAssetsFound = true;
                        const assetItem = document.createElement('div');
                        assetItem.className = 'asset-item bg-white py-3 pl-3 pr-3 rounded-xl border border-gray-200 flex items-start sm:items-center gap-3';
                        assetItem.dataset.assetIndex = index;
                        assetItem.dataset.lastUploadedRawBase64 = asset.originalAssetP || asset.p;
                        const initialMimeType = asset.originalAssetMimeType || getMimeTypeFromBase64(asset.p);
                        assetItem.dataset.originalFileType = initialMimeType;

                        const sequenceCheckboxContainer = document.createElement('div');
                        sequenceCheckboxContainer.className = 'sequence-checkbox-container hidden';
                        const sequenceCheckbox = document.createElement('input');
                        sequenceCheckbox.type = 'checkbox';
                        sequenceCheckbox.className = 'asset-sequence-checkbox';
                        sequenceCheckbox.dataset.assetIndex = index;
                        sequenceCheckbox.addEventListener('change', handleSequenceCheckboxChange);
                        sequenceCheckboxContainer.appendChild(sequenceCheckbox);
                        assetItem.appendChild(sequenceCheckboxContainer);

                        const assetContentWrapper = document.createElement('div');
                        assetContentWrapper.className = 'flex-grow flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full';

                        const assetDetailsContainer = document.createElement('div');
                        assetDetailsContainer.className = 'flex-grow w-full text-center sm:text-left';
                        const assetInfoDisplay = document.createElement('div');
                        assetInfoDisplay.className = 'asset-info-text mt-1';
                        let assetName = asset.id || `Asset ${index + 1}`;
                        if (assetName.startsWith('data:image')) assetName = `Asset ${index + 1}`;
                        if (assetName.length > 30) assetName = assetName.substring(0, 27) + '...';

                        const initialImageTypeForPill = getImageTypeFromBase64(asset.p);
                        const initialImageSize = getApproximateSizeFromBase64(asset.p);
                        let initialDimensionsText = (asset.w && asset.h) ? `${Math.round(asset.w)}x${Math.round(asset.h)} px` : 'Dimensions N/A';

                        if (initialMimeType === 'image/svg+xml' &&
                            asset.originalLottieW && asset.originalLottieH &&
                            (Math.round(asset.w) !== asset.originalLottieW || Math.round(asset.h) !== asset.originalLottieH)) {
                            initialDimensionsText += ` <span class="size-mismatch-warning">(slot: ${asset.originalLottieW}x${asset.originalLottieH})</span>`;
                        }
                        assetInfoDisplay.innerHTML = `<span class="asset-name">${assetName}</span><span class="asset-details">${initialImageSize} &bull; ${initialDimensionsText}</span>`;
                        assetDetailsContainer.appendChild(assetInfoDisplay);

                        const controlsButtonContainer = document.createElement('div');
                        controlsButtonContainer.className = 'asset-controls-container justify-center sm:justify-start';

                        const aspectRatioButton = document.createElement('button');
                        aspectRatioButton.className = 'icon-button';
                        aspectRatioButton.title = 'Toggle Cover/Stretch (Cover when active)';
                        aspectRatioButton.innerHTML = aspectRatioIconSVG;

                        const isSVGInitial = initialMimeType === 'image/svg+xml';
                        let disableButtonForRasterInitial = false;
                        if (!isSVGInitial) {
                            if (asset.originalLottieW && asset.originalLottieH) {
                                const checkW = asset.originalAssetW !== undefined ? asset.originalAssetW : asset.w;
                                const checkH = asset.originalAssetH !== undefined ? asset.originalAssetH : asset.h;
                                disableButtonForRasterInitial = checkW && checkH &&
                                                                Math.round(checkW) === asset.originalLottieW &&
                                                                Math.round(checkH) === asset.originalLottieH;
                            } else {
                                disableButtonForRasterInitial = true;
                            }
                        }
                        aspectRatioButton.disabled = isSVGInitial || disableButtonForRasterInitial;
                        aspectRatioButton.classList.toggle('active', false);
                        if (aspectRatioButton.disabled) {
                             aspectRatioButton.classList.remove('active');
                             aspectRatioButton.classList.add('opacity-50', 'cursor-not-allowed');
                        }

                        aspectRatioButton.addEventListener('click', async () => {
                            if (aspectRatioButton.disabled) return;

                            const currentAssetItem = aspectRatioButton.closest('.asset-item');
                            const assetIdx = parseInt(currentAssetItem.dataset.assetIndex);
                            const newCoverModeActiveState = aspectRatioButton.classList.toggle('active');
                            const newShouldStretchState = !newCoverModeActiveState;

                            const base64ToProcessForToggle = currentAssetItem.dataset.lastUploadedRawBase64;
                            const mimeTypeForProcessing = currentAssetItem.dataset.originalFileType || getMimeTypeFromBase64(base64ToProcessForToggle);

                            const processAndUpdate = async (idxToUpdate) => {
                                const itemToUpdate = document.querySelector(`.asset-item[data-asset-index='${idxToUpdate}']`);
                                const assetDataToUpdate = lottieData.assets[idxToUpdate];
                                const btnInItem = itemToUpdate ? itemToUpdate.querySelector('.icon-button[title*="Toggle Cover/Stretch"]') : null;

                                if (itemToUpdate && assetDataToUpdate && btnInItem && !btnInItem.disabled) {
                                    btnInItem.classList.toggle('active', newCoverModeActiveState);

                                    const rawBase64ForThisItem = itemToUpdate.dataset.lastUploadedRawBase64;
                                    const mimeTypeForThisItem = itemToUpdate.dataset.originalFileType || getMimeTypeFromBase64(rawBase64ForThisItem);
                                    const imgElementForList = itemToUpdate.querySelector('.preview-image-container img');
                                    if (rawBase64ForThisItem && imgElementForList) {
                                        await processAndApplyImage(idxToUpdate, rawBase64ForThisItem, imgElementForList, newShouldStretchState, mimeTypeForThisItem, true);
                                    }
                                }
                            };

                            if (isSequenceModeActive && selectedAssetIndicesForSequence.includes(assetIdx)) {
                                const promises = selectedAssetIndicesForSequence.map(idxInSequence => processAndUpdate(idxInSequence));
                                try { await Promise.all(promises); }
                                catch (error) { console.error(`Error applying toggle to sequence: ${error.message || error}`); }
                            } else {
                                if (base64ToProcessForToggle && lottieData.assets[assetIdx]) {
                                     try {
                                        await processAndUpdate(assetIdx);
                                     } catch (error) {
                                        console.error(`Error applying toggle to asset ${assetIdx + 1}: ${error.message || error}`);
                                     }
                                }
                            }
                            displayLottiePreview();
                        });
                        controlsButtonContainer.appendChild(aspectRatioButton);

                        const downloadAssetButton = document.createElement('button');
                        downloadAssetButton.className = 'icon-button';
                        downloadAssetButton.title = 'Download this asset';
                        downloadAssetButton.innerHTML = downloadAssetIconSVG;
                        const assetIndexOfClickedCard = index;

                        downloadAssetButton.addEventListener('click', async () => {
                            if (isSequenceModeActive && selectedAssetIndicesForSequence.length > 0) {
                                const zip = new JSZip();
                                const baseLottieName = lottieFileName.replace(/\.json$/i, '');
                                const zipFileName = `${baseLottieName}_selected_assets.zip`;
                                const allImageAssetsInOrder = lottieData.assets
                                    .map((asset, originalIdx) => ({ asset, originalAssetIndex: originalIdx }))
                                    .filter(item => item.asset.p && typeof item.asset.p === 'string' && item.asset.p.startsWith('data:image/'));

                                selectedAssetIndicesForSequence.forEach(selectedAssetOriginalIndex => {
                                    const globalAssetInfo = allImageAssetsInOrder.find(imgAsset => imgAsset.originalAssetIndex === selectedAssetOriginalIndex);
                                    if (globalAssetInfo) {
                                        const assetToZip = globalAssetInfo.asset;
                                        const globalOrderIndex = allImageAssetsInOrder.indexOf(globalAssetInfo);
                                        const prefix = globalOrderIndex + 1;
                                        const base64Data = assetToZip.p.substring(assetToZip.p.indexOf(',') + 1);
                                        const mimeType = getMimeTypeFromBase64(assetToZip.p);
                                        let extension = mimeType.split('/')[1] || 'png';
                                        if (extension === 'svg+xml') extension = 'svg';
                                        if (extension === 'jpeg') extension = 'jpg';
                                        let filenamePart = assetToZip.id || assetToZip.u || `asset_${selectedAssetOriginalIndex}`;
                                        if (filenamePart.includes('/')) filenamePart = filenamePart.substring(filenamePart.lastIndexOf('/') + 1);
                                        if (filenamePart.includes('\\')) filenamePart = filenamePart.substring(filenamePart.lastIndexOf('\\') + 1);
                                        filenamePart = filenamePart.replace(/\.[^/.]+$/, "");
                                        const prefixedFilename = `${prefix}-${filenamePart}.${extension}`;
                                        zip.file(prefixedFilename, base64Data, {base64: true});
                                    }
                                });

                                if (Object.keys(zip.files).length > 0) {
                                    try {
                                        const zipBlob = await zip.generateAsync({type:"blob"});
                                        const link = document.createElement('a');
                                        link.href = URL.createObjectURL(zipBlob);
                                        link.download = zipFileName;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        URL.revokeObjectURL(link.href);
                                    } catch (error) { console.error("Error generating selected assets ZIP file:", error); }
                                } else { console.warn("No selected assets were found to include in the ZIP."); }
                                return;
                            }

                            const processedBase64ToDownload = lottieData.assets[assetIndexOfClickedCard].p;
                            const idForName = lottieData.assets[assetIndexOfClickedCard].id || `asset_${assetIndexOfClickedCard}`;
                            let typeForName = getImageTypeFromBase64(processedBase64ToDownload).toLowerCase() || 'png';
                            if (typeForName === 'svg+xml') typeForName = 'svg';
                            if (processedBase64ToDownload) {
                                const link = document.createElement('a');
                                link.href = processedBase64ToDownload;
                                link.download = `${idForName}.${typeForName}`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                URL.revokeObjectURL(link.href);
                            }
                        });
                        controlsButtonContainer.appendChild(downloadAssetButton);

                        const resetAssetButton = document.createElement('button');
                        resetAssetButton.className = 'icon-button reset-asset-button';
                        resetAssetButton.title = 'Reset this asset to original';
                        resetAssetButton.innerHTML = resetAssetIconSVG;
                        resetAssetButton.disabled = !(asset.hasChanged === true);
                        if(asset.hasChanged) {
                            resetAssetButton.classList.add('reset-asset-button-enabled');
                        }
                        resetAssetButton.addEventListener('click', () => handleResetAssetClick(index));
                        controlsButtonContainer.appendChild(resetAssetButton);

                        assetDetailsContainer.appendChild(controlsButtonContainer);
                        assetContentWrapper.appendChild(assetDetailsContainer);

                        const imagePreviewContainer = document.createElement('div');
                        imagePreviewContainer.className = 'preview-image-container flex-shrink-0 text-center sm:text-right';
                        imagePreviewContainer.title = 'Click or Drag/Drop to replace asset';
                        const assetImage = document.createElement('img');
                        assetImage.src = asset.p;
                        assetImage.alt = `Preview for ${assetName}`;
                        assetImage.className = 'preview-image-max-height';
                        const extensionPill = document.createElement('div');
                        extensionPill.className = 'asset-id-pill';
                        extensionPill.textContent = initialImageTypeForPill;
                        imagePreviewContainer.appendChild(extensionPill);
                        imagePreviewContainer.appendChild(assetImage);
                        assetContentWrapper.appendChild(imagePreviewContainer);

                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = 'image/*';
                        fileInput.className = 'hidden-file-input';
                        fileInput.id = `fileInput-${index}`;

                        imagePreviewContainer.addEventListener('click', () => { if (!isSequenceModeActive) fileInput.click(); });
                        imagePreviewContainer.addEventListener('dragover', (e) => { if (!isSequenceModeActive) { e.preventDefault(); e.stopPropagation(); imagePreviewContainer.classList.add('drag-over'); }});
                        imagePreviewContainer.addEventListener('dragleave', (e) => { if (!isSequenceModeActive) { e.preventDefault(); e.stopPropagation(); imagePreviewContainer.classList.remove('drag-over'); }});
                        imagePreviewContainer.addEventListener('drop', (e) => {
                            if (!isSequenceModeActive) {
                                e.preventDefault(); e.stopPropagation(); imagePreviewContainer.classList.remove('drag-over');
                                const files = e.dataTransfer.files;
                                if (files.length > 0) {
                                    const btn = assetItem.querySelector('.icon-button[title*="Toggle Cover/Stretch"]');
                                    const stretchMode = btn.disabled ? true : !btn.classList.contains('active');
                                    handleAssetReplacement(index, files[0], assetImage, stretchMode);
                                }
                            }
                        });
                        fileInput.addEventListener('change', async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                              const btn = assetItem.querySelector('.icon-button[title*="Toggle Cover/Stretch"]');
                              const stretchMode = btn.disabled ? true : !btn.classList.contains('active');
                              try {
                                  // Await the promise from the updated function
                                  await handleAssetReplacement(index, file, assetImage, stretchMode);
                              } catch (error) {
                                  console.error("Asset replacement failed:", error);
                              } finally {
                                  // Clear the input value so the same file can be selected again
                                  e.target.value = null;
                              }
                          }
                      });

                        assetItem.appendChild(assetContentWrapper);
                        assetItem.appendChild(fileInput);
                        assetList.appendChild(assetItem);
                    }
                });
            }
            noAssetsMessage.classList.toggle('hidden', imageAssetsFound);
            if (!imageAssetsFound) noAssetsMessage.textContent = 'No replaceable image assets found.';
            replaceSequenceButton.disabled = !imageAssetsFound;
            downloadAllAssetsButton.disabled = !imageAssetsFound;
            if (!imageAssetsFound) setSequenceMode(false);
            updateScrollIndicators();
        }

        function updateSelectionCounter() {
            selectionCounterPill.textContent = `${selectedAssetIndicesForSequence.length} Selected`;
        }

        function handleSequenceCheckboxChange(event) {
            const changedCheckbox = event.target;
            const allCheckboxes = Array.from(assetList.querySelectorAll('.asset-sequence-checkbox'));
            let currentlyCheckedOriginalIndices = [];
            allCheckboxes.forEach(cb => { if (cb.checked) currentlyCheckedOriginalIndices.push(parseInt(cb.dataset.assetIndex)); });

            document.querySelectorAll('.asset-item.asset-item-selected').forEach(item => item.classList.remove('asset-item-selected'));
            allCheckboxes.forEach(cb => cb.checked = false);

            if (currentlyCheckedOriginalIndices.length === 0) {
                selectedAssetIndicesForSequence = [];
            } else if (currentlyCheckedOriginalIndices.length === 1) {
                selectedAssetIndicesForSequence = [...currentlyCheckedOriginalIndices];
                const singleItem = document.querySelector(`.asset-item[data-asset-index='${selectedAssetIndicesForSequence[0]}']`);
                if (singleItem) {
                    singleItem.classList.add('asset-item-selected');
                    singleItem.querySelector('.asset-sequence-checkbox').checked = true;
                }
            } else {
                const minIdx = Math.min(...currentlyCheckedOriginalIndices);
                const maxIdx = Math.max(...currentlyCheckedOriginalIndices);

                const allLottieImgAssets = lottieData.assets
                    .map((asset, originalAssetIndex) => ({ asset, originalAssetIndex }))
                    .filter(item => item.asset.p && item.asset.p.startsWith('data:image/'));

                let finalSelectedOriginalIndices = [];
                let inRange = false;
                for (const { originalAssetIndex } of allLottieImgAssets) {
                    if (originalAssetIndex === minIdx) inRange = true;
                    if (inRange) {
                        finalSelectedOriginalIndices.push(originalAssetIndex);
                        const itemCard = document.querySelector(`.asset-item[data-asset-index='${originalAssetIndex}']`);
                        if (itemCard) {
                            itemCard.classList.add('asset-item-selected');
                            const cb = itemCard.querySelector('.asset-sequence-checkbox');
                            if (cb) cb.checked = true;
                        }
                    }
                    if (originalAssetIndex === maxIdx) break;
                }
                selectedAssetIndicesForSequence = finalSelectedOriginalIndices.sort((a, b) => a - b);
            }
            updateSelectionCounter();
            browseSequenceFilesButton.disabled = selectedAssetIndicesForSequence.length === 0;
        }

        function setSequenceMode(active) {
            isSequenceModeActive = active;
            replaceSequenceButton.classList.toggle('hidden', active);
            browseSequenceFilesButton.classList.toggle('hidden', !active);
            cancelSequenceButton.classList.toggle('hidden', !active);
            cancelSequenceButton.disabled = false;

            const checkboxContainers = assetList.querySelectorAll('.sequence-checkbox-container');
            checkboxContainers.forEach(container => {
                container.classList.toggle('hidden', !active);
                container.classList.toggle('flex', active);
                if (!active) {
                    const checkbox = container.querySelector('.asset-sequence-checkbox');
                    if (checkbox) checkbox.checked = false;
                    const assetItem = container.closest('.asset-item');
                    if (assetItem) assetItem.classList.remove('asset-item-selected');
                }
            });

            sequenceTooltip.classList.toggle('visible', active);
            sequenceErrorTooltip.classList.remove('visible');

            if (!active) {
                selectedAssetIndicesForSequence = [];
                updateSelectionCounter();
                browseSequenceFilesButton.disabled = true;
            } else {
                 browseSequenceFilesButton.disabled = selectedAssetIndicesForSequence.length === 0;
            }
        }

        replaceSequenceButton.addEventListener('click', () => setSequenceMode(true));
        cancelSequenceButton.addEventListener('click', () => setSequenceMode(false));

        browseSequenceFilesButton.addEventListener('click', () => {
            if (selectedAssetIndicesForSequence.length > 0) {
                sequenceTooltip.classList.remove('visible');
                multipleFilesInput.click();
            }
        });

        async function performReplacement(filesToReplaceWith, assetsToReplaceIndices) {
            browseSequenceFilesButton.disabled = true;
            cancelSequenceButton.disabled = true;

            const numFiles = filesToReplaceWith.length;
            const numAssets = assetsToReplaceIndices.length;
            const limit = Math.min(numFiles, numAssets);

            for (let i = 0; i < limit; i++) {
                const assetIndex = assetsToReplaceIndices[i];
                const file = filesToReplaceWith[i];
                const assetItem = document.querySelector(`.asset-item[data-asset-index='${assetIndex}']`);
                const assetImageElementInList = assetItem ? assetItem.querySelector('.preview-image-container img') : null;
                const aspectRatioButton = assetItem ? assetItem.querySelector('.icon-button[title*="Toggle Cover/Stretch"]') : null;
                const shouldStretch = aspectRatioButton ? (aspectRatioButton.disabled ? true : !aspectRatioButton.classList.contains('active')) : true;

                try {
                    const newImageRawBase64 = await new Promise((resolveFileRead, rejectFileRead) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolveFileRead(e.target.result);
                        reader.onerror = (err) => rejectFileRead(err);
                        reader.readAsDataURL(file);
                    });

                    if (assetItem) {
                        assetItem.dataset.lastUploadedRawBase64 = newImageRawBase64;
                        assetItem.dataset.originalFileType = file.type;
                    }
                    await processAndApplyImage(assetIndex, newImageRawBase64, assetImageElementInList, shouldStretch, file.type, true);
                } catch (error) {
                    console.error(`Failed to process file for asset ${assetIndex + 1}. Skipping. Error: ${error.message || error}`);
                }
            }

            displayLottiePreview();
            setSequenceMode(false);
            multipleFilesInput.value = '';
            lastSelectedFiles = [];
        }

        multipleFilesInput.addEventListener('change', async (event) => {
            const files = event.target.files;
            if (!files || files.length === 0) return;

            lastSelectedFiles = Array.from(files);
            sequenceErrorTooltip.classList.remove('visible');

            if (files.length !== selectedAssetIndicesForSequence.length) {
                sequenceErrorText.textContent = `You selected ${files.length} files but have ${selectedAssetIndicesForSequence.length} assets marked for replacement.`;
                sequenceErrorTooltip.classList.add('visible');
                return;
            }
            await performReplacement(lastSelectedFiles, selectedAssetIndicesForSequence.sort((a, b) => a - b));
        });

        replaceAnywayButton.addEventListener('click', async () => {
            sequenceErrorTooltip.classList.remove('visible');
            if (lastSelectedFiles.length > 0 && selectedAssetIndicesForSequence.length > 0) {
                await performReplacement(lastSelectedFiles, selectedAssetIndicesForSequence.sort((a, b) => a - b));
            }
        });

        // Event listener for the "Select Again" button
        selectAgainButton.addEventListener('click', () => {
            sequenceErrorTooltip.classList.remove('visible');
            multipleFilesInput.value = ''; // Clear previous selection from input
            multipleFilesInput.click(); // Re-open file dialog
        });


        function handleAssetReplacement(assetIndex, newFile, assetImageElementInList, shouldStretch) {
              return new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = async (e) => {
                      const newImageRawBase64 = e.target.result;
                      const assetItemElement = document.querySelector(`.asset-item[data-asset-index='${assetIndex}']`);
                      if (assetItemElement) {
                          assetItemElement.dataset.lastUploadedRawBase64 = newImageRawBase64;
                          assetItemElement.dataset.originalFileType = newFile.type;
                      }
                      try {
                          await processAndApplyImage(assetIndex, newImageRawBase64, assetImageElementInList, shouldStretch, newFile.type);
                          resolve(); // Resolve the promise on successful processing
                      } catch (error) {
                          console.error(`Error processing image for asset ${assetIndex + 1}: ${error.message || error}`);
                          reject(error); // Reject the promise on error
                      }
                  };
                  reader.onerror = (error) => {
                      console.error('Error reading new asset file:', error);
                      reject(error); // Reject the promise on file reading error
                  };
                  reader.readAsDataURL(newFile);
              });
          }

        function processAndApplyImage(assetIndex, imageBase64ToProcess, assetImageElementInList, shouldStretch, originalUploadedMimeType, isBulkUpdate = false) {
            return new Promise((resolve, reject) => {
                const originalAsset = lottieData.assets[assetIndex];
                if (!originalAsset) {
                    reject(new Error(`Asset ${assetIndex} not found.`));
                    return;
                }

                const originalLottieW = originalAsset.originalLottieW;
                const originalLottieH = originalAsset.originalLottieH;

                const img = new Image();
                img.onload = () => {
                    let finalBase64 = imageBase64ToProcess;
                    let finalLottieAssetW = img.width;
                    let finalLottieAssetH = img.height;
                    const rawUploadedImgW = img.width;
                    const rawUploadedImgH = img.height;

                    const isUploadedSVG = originalUploadedMimeType === 'image/svg+xml';
                    const isRasterExactMatchWithSlot = !isUploadedSVG &&
                                                   originalLottieW && originalLottieH &&
                                                   rawUploadedImgW === originalLottieW &&
                                                   rawUploadedImgH === originalLottieH;

                    if (isUploadedSVG) {
                        finalBase64 = imageBase64ToProcess;
                        finalLottieAssetW = rawUploadedImgW;
                        finalLottieAssetH = rawUploadedImgH;
                    } else if (isRasterExactMatchWithSlot) {
                        finalLottieAssetW = originalLottieW;
                        finalLottieAssetH = originalLottieH;
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = finalLottieAssetW;
                        tempCanvas.height = finalLottieAssetH;
                        const tempCtx = tempCanvas.getContext('2d');
                        tempCtx.drawImage(img, 0, 0);
                        if (originalUploadedMimeType === 'image/jpeg') {
                            try { finalBase64 = tempCanvas.toDataURL('image/jpeg', 0.92); }
                            catch (e) { finalBase64 = imageBase64ToProcess; }
                        } else if (!imageBase64ToProcess.startsWith('data:image/png')) {
                            try { finalBase64 = tempCanvas.toDataURL('image/png'); }
                            catch (e) { finalBase64 = imageBase64ToProcess; }
                        } else {
                            finalBase64 = imageBase64ToProcess;
                        }
                    } else if (originalLottieW && originalLottieH) {
                        finalLottieAssetW = originalLottieW;
                        finalLottieAssetH = originalLottieH;
                        const canvas = document.createElement('canvas');
                        canvas.width = originalLottieW;
                        canvas.height = originalLottieH;
                        const ctx = canvas.getContext('2d');
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        if (!shouldStretch) { // COVER
                            const targetAspectRatio = canvas.width / canvas.height;
                            const sourceAspectRatio = rawUploadedImgW / rawUploadedImgH;
                            let sx = 0, sy = 0, sWidth = rawUploadedImgW, sHeight = rawUploadedImgH;
                            if (sourceAspectRatio > targetAspectRatio) {
                                sWidth = rawUploadedImgH * targetAspectRatio;
                                sx = (rawUploadedImgW - sWidth) / 2;
                            } else if (sourceAspectRatio < targetAspectRatio) {
                                sHeight = rawUploadedImgW / targetAspectRatio;
                                sy = (rawUploadedImgH - sHeight) / 2;
                            }
                            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
                        } else { // STRETCH
                            ctx.drawImage(img, 0, 0, originalLottieW, originalLottieH);
                        }
                        try {
                            let outputMimeType = 'image/png';
                            let quality;
                            if (originalUploadedMimeType === 'image/jpeg') {
                                outputMimeType = 'image/jpeg';
                                quality = 0.92;
                            }
                            finalBase64 = quality !== undefined ? canvas.toDataURL(outputMimeType, quality) : canvas.toDataURL(outputMimeType);
                        } catch (cvError) {
                            try { finalBase64 = canvas.toDataURL('image/png'); }
                            catch (pngError) {
                                finalBase64 = imageBase64ToProcess;
                                finalLottieAssetW = rawUploadedImgW;
                                finalLottieAssetH = rawUploadedImgH;
                            }
                        }
                    } else {
                        finalLottieAssetW = rawUploadedImgW;
                        finalLottieAssetH = rawUploadedImgH;
                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = finalLottieAssetW;
                        tempCanvas.height = finalLottieAssetH;
                        const tempCtx = tempCanvas.getContext('2d');
                        tempCtx.drawImage(img, 0, 0);
                        if (originalUploadedMimeType === 'image/jpeg') {
                            try { finalBase64 = tempCanvas.toDataURL('image/jpeg', 0.92); }
                            catch (e) { finalBase64 = imageBase64ToProcess; }
                        } else if (!imageBase64ToProcess.startsWith('data:image/png')) {
                            try { finalBase64 = tempCanvas.toDataURL('image/png'); }
                            catch (e) { finalBase64 = imageBase64ToProcess; }
                        } else {
                            finalBase64 = imageBase64ToProcess;
                        }
                    }

                    originalAsset.p = finalBase64;
                    originalAsset.w = Math.round(finalLottieAssetW);
                    originalAsset.h = Math.round(finalLottieAssetH);

                    if (originalAsset.originalAssetP && originalAsset.p !== originalAsset.originalAssetP) {
                        originalAsset.hasChanged = true;
                    } else if (!originalAsset.originalAssetP && imageBase64ToProcess) {
                        originalAsset.hasChanged = true;
                    } else if (originalAsset.originalAssetP && originalAsset.p === originalAsset.originalAssetP) {
                         originalAsset.hasChanged = false;
                    }

                    updateAssetCardDisplay(assetIndex, Math.round(finalLottieAssetW), Math.round(finalLottieAssetH), rawUploadedImgW, rawUploadedImgH);

                    if (!isBulkUpdate) {
                        displayLottiePreview();
                    }
                    resolve();
                };
                img.onerror = () => {
                     originalAsset.p = imageBase64ToProcess;
                     const tempImgErr = new Image();
                     tempImgErr.onload = () => {
                        const wError = originalLottieW || tempImgErr.width;
                        const hError = originalLottieH || tempImgErr.height;
                        originalAsset.w = wError;
                        originalAsset.h = hError;
                        originalAsset.hasChanged = (originalAsset.originalAssetP && originalAsset.p !== originalAsset.originalAssetP);
                        updateAssetCardDisplay(assetIndex, wError, hError, tempImgErr.width, tempImgErr.height);
                        if (!isBulkUpdate) displayLottiePreview();
                        resolve();
                     }
                     tempImgErr.onerror = () => {
                        const wCritical = originalLottieW || 0;
                        const hCritical = originalLottieH || 0;
                        originalAsset.w = wCritical;
                        originalAsset.h = hCritical;
                        originalAsset.hasChanged = (originalAsset.originalAssetP && originalAsset.p !== originalAsset.originalAssetP);
                        updateAssetCardDisplay(assetIndex, wCritical, hCritical, undefined, undefined);
                        if (!isBulkUpdate) displayLottiePreview();
                        reject(new Error('Image load and fallback failed for asset ' + assetIndex));
                     }
                     tempImgErr.src = imageBase64ToProcess;
                };
                img.src = imageBase64ToProcess;
            });
        }

        async function handleResetAssetClick(assetIndexOfClickedCard) {
            const clickedAsset = lottieData.assets[assetIndexOfClickedCard];

            if (isSequenceModeActive && selectedAssetIndicesForSequence.length > 0 && selectedAssetIndicesForSequence.includes(assetIndexOfClickedCard)) {
                const promises = selectedAssetIndicesForSequence.map(idxInSequence => {
                    const assetToReset = lottieData.assets[idxInSequence];
                    if (assetToReset && assetToReset.hasChanged) {
                        return resetSingleAsset(idxInSequence);
                    }
                    return Promise.resolve();
                });
                try {
                    await Promise.all(promises);
                } catch (error) {
                    console.error("Error resetting one or more selected assets:", error);
                }
            } else if (clickedAsset && clickedAsset.hasChanged) {
                try {
                    await resetSingleAsset(assetIndexOfClickedCard);
                } catch (error) {
                     console.error(`Error resetting asset ${assetIndexOfClickedCard + 1}:`, error);
                }
            }
            displayLottiePreview();
        }

        async function resetSingleAsset(idx) {
            const asset = lottieData.assets[idx];
            const assetItem = document.querySelector(`.asset-item[data-asset-index='${idx}']`);

            if (asset && asset.originalAssetP && assetItem) {
                asset.p = asset.originalAssetP;
                asset.w = asset.originalAssetW;
                asset.h = asset.originalAssetH;
                asset.hasChanged = false;

                assetItem.dataset.lastUploadedRawBase64 = asset.originalAssetP;
                assetItem.dataset.originalFileType = asset.originalAssetMimeType;

                const assetImageElementInList = assetItem.querySelector('.preview-image-container img');
                if (assetImageElementInList) {
                    assetImageElementInList.src = asset.originalAssetP;
                }
                updateAssetCardDisplay(idx, asset.w, asset.h, asset.originalAssetW, asset.originalAssetH);

                return Promise.resolve();
            }
            return Promise.reject(new Error(`Asset, original data, or item not found for index ${idx} during reset.`));
        }

        downloadLottieButton.addEventListener('click', () => {
            if (!lottieData) { return; }
            try {
                const baseName = lottieFileName.replace(/\.json$/i, '');
                const dlFilename = `${baseName}_modified.json`;
                const dataToDownload = JSON.parse(JSON.stringify(lottieData));

                if (dataToDownload.assets) {
                    dataToDownload.assets.forEach(asset => {
                        delete asset.originalLottieW;
                        delete asset.originalLottieH;
                        delete asset.originalAssetP;
                        delete asset.originalAssetW;
                        delete asset.originalAssetH;
                        delete asset.originalAssetMimeType;
                        delete asset.hasChanged;
                    });
                }

                const blob = new Blob([JSON.stringify(dataToDownload)], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = dlFilename;
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error preparing Lottie for download:', error);
            }
        });

        downloadAllAssetsButton.addEventListener('click', async () => {
            if (!lottieData || !lottieData.assets || lottieData.assets.length === 0) return;
            const zip = new JSZip();
            const imageAssets = lottieData.assets.filter(asset => asset.p && typeof asset.p === 'string' && asset.p.startsWith('data:image/'));
            if (imageAssets.length === 0) return;

            imageAssets.forEach((asset, index) => {
                const base64Data = asset.p.substring(asset.p.indexOf(',') + 1);
                const mimeType = getMimeTypeFromBase64(asset.p);
                let extension = mimeType.split('/')[1] || 'png';
                if (extension === 'svg+xml') extension = 'svg';
                if (extension === 'jpeg') extension = 'jpg';
                let filenamePart = asset.id || asset.u || `asset_${lottieData.assets.indexOf(asset)}`;
                if (filenamePart.includes('/')) filenamePart = filenamePart.substring(filenamePart.lastIndexOf('/') + 1);
                if (filenamePart.includes('\\')) filenamePart = filenamePart.substring(filenamePart.lastIndexOf('\\') + 1);
                filenamePart = filenamePart.replace(/\.[^/.]+$/, "");
                const prefixedFilename = `${index + 1}-${filenamePart}.${extension}`;
                zip.file(prefixedFilename, base64Data, {base64: true});
            });

            try {
                const zipBlob = await zip.generateAsync({type:"blob"});
                const zipFileName = lottieFileName.replace(/\.json$/i, '_assets.zip') || 'lottie_assets.zip';
                const link = document.createElement('a');
                link.href = URL.createObjectURL(zipBlob);
                link.download = zipFileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            } catch (error) { console.error("Error generating ZIP file:", error); }
        });

        function updateScrollIndicators() {
            const el = assetListContainer;
            const scrollThreshold = 10;
            if (el.scrollHeight > el.clientHeight) {
                scrollDownIndicator.classList.toggle('visible', el.scrollTop + el.clientHeight < el.scrollHeight - scrollThreshold);
                scrollUpIndicator.classList.toggle('visible', el.scrollTop > scrollThreshold);
            } else {
                scrollUpIndicator.classList.remove('visible');
                scrollDownIndicator.classList.remove('visible');
            }
        }

        assetListContainer.addEventListener('scroll', updateScrollIndicators);
        window.addEventListener('resize', updateScrollIndicators);
        scrollUpIndicator.addEventListener('click', () => assetListContainer.scrollTo({ top: 0, behavior: 'smooth' }));
        scrollDownIndicator.addEventListener('click', () => assetListContainer.scrollTo({ top: assetListContainer.scrollHeight, behavior: 'smooth' }));

        closeSequenceTooltipButton.addEventListener('click', () => {
           cancelSequenceButton.click();
        });

        selectionCounterPill.addEventListener('click', () => {
            if (!browseSequenceFilesButton.classList.contains('hidden') && !browseSequenceFilesButton.disabled) {
                browseSequenceFilesButton.click();
            }
        });

        // Initial setup
        updateScrollIndicators();
        setSequenceMode(false);
        replaceSequenceButton.disabled = true;
        downloadAllAssetsButton.disabled = true;


            applyAndCloseBtn.addEventListener('click', handleApplyAndClose);


        function handleApplyAndClose() {
    if (!lottieData) {
        alert('No Lottie data is loaded.');
        return;
    }

    try {
        // This logic is borrowed directly from your downloadLottieButton handler.
        // It creates a clean copy of the data without the internal helper properties.
        const dataToSend = JSON.parse(JSON.stringify(lottieData));

        if (dataToSend.assets) {
            dataToSend.assets.forEach(asset => {
                delete asset.originalLottieW;
                delete asset.originalLottieH;
                delete asset.originalAssetP;
                delete asset.originalAssetW;
                delete asset.originalAssetH;
                delete asset.originalAssetMimeType;
                delete asset.hasChanged;
            });
        }

        // Post the message to the parent window
        window.parent.postMessage({
            type: 'dataFromAssetReplacerTool', // A unique type for this tool
            lottieData: dataToSend,
            originalFilename: lottieFileName // Send the filename for identification
        }, '*'); // Use a specific origin in production for security!

    } catch (error) {
        console.error('Error preparing Lottie data to send back:', error);
        alert('An error occurred while applying changes.');
    }
}
