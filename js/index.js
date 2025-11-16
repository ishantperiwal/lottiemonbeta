// At the top of your index.js
import { convertDotLottieToJson, convertJsonToDotLottie, convertAllActiveJsonsToDotLottie } from './lottieConverter.js';
import { convertLottieToWebm } from './lottietowebm.js';



    function setupSegmentedControls(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove 'active' from all siblings
      buttons.forEach(btn => btn.classList.remove('active'));
      // Add 'active' to the clicked button
      button.classList.add('active');
    });
  });
}


    function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


    let animationInstanceMaximized = null;

    function openMaximizePreview() {
    if (!lottieData || !animationInstance) {
        alert("Please load an animation first.");
        return;
    }

    // Destroy any previous instance
    if (animationInstanceMaximized) {
        animationInstanceMaximized.destroy();
        animationInstanceMaximized = null;
    }

    const container = document.getElementById('lottiePreviewMaximized');
    if (!container) {
        console.error("Maximize preview container not found.");
        return;
    }

    // Show overlay *before* loading
    maximizePreviewOverlay.style.display = 'flex';
    setTimeout(() => maximizePreviewOverlay.classList.add('active'), 10);

    // Get state from main player *before* loading
    const mainCurrentFrame = animationInstance.currentFrame;
    const mainIsPlaying = isPlaying; // Use your global 'isPlaying'
    const mainSpeed = currentSpeed; // Use your global 'currentSpeed'

    // Load new animation
    animationInstanceMaximized = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: false, // We control playback
        animationData: JSON.parse(JSON.stringify(lottieData)), // Use a clean copy
         rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet',
        }
    });

    animationInstanceMaximized.addEventListener('DOMLoaded', () => {
        animationInstanceMaximized.setSpeed(mainSpeed);
        if (mainIsPlaying) {
            animationInstanceMaximized.goToAndPlay(mainCurrentFrame, true);
        } else {
            animationInstanceMaximized.goToAndStop(mainCurrentFrame, true);
        }
    });
}

/**
 * Closes the Maximize Modal and destroys its Lottie instance.
 */
function closeMaximizePreview() {
    if (maximizePreviewOverlay) {
        maximizePreviewOverlay.classList.remove('active');
        setTimeout(() => {
            maximizePreviewOverlay.style.display = 'none';
        }, 300); // Match CSS transition
    }

    // Destroy Lottie instance to free up resources
    if (animationInstanceMaximized) {
        animationInstanceMaximized.destroy();
        animationInstanceMaximized = null;
    }
}

    const openShareModalBtn = document.getElementById('openShareModalBtn');
    const shareModalOverlay = document.getElementById('shareModalOverlay');
    const closeShareModalBtn = document.getElementById('closeShareModalBtn');
    const generateShareCodeBtn = document.getElementById('generateShareCodeBtn');


    function openShareModal() {
    if (!lottieData) {
        alert("Please load a Lottie animation first before sharing.");
        return;
    }

    // Reset modal to its original 3-step content
    const modalContent = document.getElementById('shareModalContent');
    const modalFooter = document.querySelector('.share-modal-footer');
    
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="share-modal-step">
                <span class="share-modal-step-number">1</span>
                <div class="share-modal-step-content">
                    <h4>Copy data</h4>
                    <p>Click the button to copy the necessary player data to your clipboard.</p>
                    <button id="copyLottieDataBtn" class="btn btn--secondary">Copy Data</button>
                </div>
            </div>
            <div class="share-modal-step">
                <span class="share-modal-step-number">2</span>
                <div class="share-modal-step-content">
                    <h4>Go to jsonkeeper.com</h4>
                    <p>Paste the data on the website to get a link, then come back.</p>
                    <a href="https://jsonkeeper.com" target="_blank" class="share-modal-link">
                        https://jsonkeeper.com
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 16px; height: 16px;">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5 0V6.375c0-.621.504-1.125 1.125-1.125h4.125c.621 0 1.125.504 1.125 1.125V10.5m-4.5 0h4.5M10.5 10.5V15" />
                        </svg>
                    </a>
                </div>
            </div>
            <div class="share-modal-step">
                <span class="share-modal-step-number">3</span>
                <div class="share-modal-step-content">
                    <h4>Paste the link here</h4>
                    <p>Paste the link from jsonkeeper.com into the field below.</p>
                    <div class="share-modal-input-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 20px; height: 20px;">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                        <input type="text" id="jsonKeeperLinkInput" placeholder="Paste your link here">
                    </div>
                </div>
            </div>
        `;
        // Re-attach listener for the "Copy Data" button inside the new content
        document.getElementById('copyLottieDataBtn').addEventListener('click', handleCopyLottieData);
    }
    
    // Show the "Generate Code" button in the footer
    if (modalFooter) {
        modalFooter.style.display = 'flex';
    }
    
    // Show the modal
    if (shareModalOverlay) {
        shareModalOverlay.style.display = 'flex';
        setTimeout(() => shareModalOverlay.classList.add('active'), 10);
    }
}

/**
 * Closes the Share Modal.
 */
function closeShareModal() {
    if (shareModalOverlay) {
        shareModalOverlay.classList.remove('active');
        setTimeout(() => {
            shareModalOverlay.style.display = 'none';
        }, 300); // Match CSS transition duration
    }
}

/**
 * Copies the current Lottie JSON data to the clipboard.
 */
async function handleCopyLottieData() {
    let dataToCopy;
    if (isDotLottieLoaded && currentLottieIndex > -1) {
        // If a .lottie collection is active, use the current animation
        dataToCopy = lottieDataArray[currentLottieIndex];
    } else if (lottieData) {
        // Otherwise, use the single loaded lottieData
        dataToCopy = lottieData;
    } else {
        alert("No Lottie data is loaded to copy.");
        return;
    }

    // Clean the data for export, just like the download function does
    const exportData = cleanForExport(JSON.parse(JSON.stringify(dataToCopy)));
    // Pretty-print for jsonkeeper
    const jsonString = JSON.stringify(exportData, null, 2); 

    try {
        await navigator.clipboard.writeText(jsonString);
        const copyBtn = document.getElementById('copyLottieDataBtn');
        if (copyBtn) {
            copyBtn.textContent = 'Copied!';
            copyBtn.disabled = true;
            setTimeout(() => { 
                copyBtn.textContent = 'Copy Data'; 
                copyBtn.disabled = false;
            }, 2000);
        }
    } catch (err) {
        console.error('Failed to copy data: ', err);
        alert('Failed to copy data to clipboard. You may need to grant permissions.');
    }
}

/**
 * Generates the final shareable link from the jsonkeeper.com URL.
 */
function handleGenerateShareCode() {
    const linkInput = document.getElementById('jsonKeeperLinkInput');
    const linkValue = linkInput ? linkInput.value.trim() : '';

    if (!linkValue) {
        alert("Please paste the link from jsonkeeper.com.");
        return;
    }

    // Extract the ID from various jsonkeeper link formats
    // This regex looks for a 'b/' prefix or just the ID at the end of the URL
    const idMatch = linkValue.match(/(?:\/b\/|\/)([A-Z0-9]{4,})$/i);
    const jsonKeeperId = idMatch ? idMatch[1] : null;

    if (!jsonKeeperId) {
        alert("Could not extract a valid ID from the link. Please make sure it's a valid jsonkeeper.com link (e.g., .../b/ABC1).");
        return;
    }

    // Construct the final URL
    const baseUrl = window.location.origin + window.location.pathname;
    const finalShareUrl = `${baseUrl}?lottie=${jsonKeeperId}`;

    // Display the final link
    const modalContent = document.getElementById('shareModalContent');
    const modalFooter = document.querySelector('.share-modal-footer');
    
    if (modalContent) {
        modalContent.innerHTML = `
            <h3>Your Shareable Link</h3>
            <p style="font-size: 0.9em; color: var(--color-text-secondary); line-height: 1.5;">
                Anyone with this link can view your animation in LottieMon.
            </p>
            <div class="share-modal-final-link-wrapper">
                <input type="text" id="finalShareLinkInput" value="${finalShareUrl}" readonly>
                <button id="copyFinalShareLinkBtn" class="btn btn--secondary" title="Copy link">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 20px; height: 20px;">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25V4.5A2.25 2.25 0 019 2.25h-3c-1.03 0-1.9.693-2.166 1.638m13.332 0M12 12.75h0m-6.75 0h0m6.75 0h0m-6.75 0h0m6.75 0h0m-6.75 0h0M12 15.75h0m-6.75 0h0m6.75 0h0m-6.75 0h0m6.75 0h0m-6.75 0h0M12 18.75h0m-6.75 0h0m6.75 0h0m-6.75 0h0m6.75 0h0m-6.75 0h0" />
                    </svg>
                </button>
            </div>
        `;
    }
    
    // Hide the "Generate Code" button in the footer
    if (modalFooter) {
        modalFooter.style.display = 'none';
    }

    // Add listener to the new "Copy" button
    document.getElementById('copyFinalShareLinkBtn').addEventListener('click', () => {
        copyToClipboard(finalShareUrl, document.getElementById('copyFinalShareLinkBtn'));
    });
}

/**
 * Helper to copy text to clipboard and show feedback on a button.
 */
async function copyToClipboard(text, buttonElement) {
    try {
        await navigator.clipboard.writeText(text);
        const originalContent = buttonElement.innerHTML;
        buttonElement.innerHTML = 'Copied!';
        buttonElement.disabled = true;
        setTimeout(() => { 
            buttonElement.innerHTML = originalContent;
            buttonElement.disabled = false;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy link.');
    }
}


      const randomTextStrings = [

        "Drop your Lottie JSON me!",
        "Let's save you some time!",
        "Ready when you are!",
        "Feed me a Lottie!",
        "Let's see your moves!",
        "Time to get animated!"
      ];

      const randomTextContainer = document.getElementById('randomTextContainer');


      function updateStateMachineButtonState(hasMachine) {
    const btn = document.getElementById('openStateMachineBuilderBtn');
    const textSpan = document.getElementById('stateMachineBtnText');
    const viewPart = document.getElementById('stateMachineBtnView');

    if (!btn || !textSpan || !viewPart) return;

    if (hasMachine) {
        textSpan.textContent = 'Edit State Machine';
        viewPart.style.display = 'flex';
        btn.classList.add('has-statemachine');
    } else {
        textSpan.textContent = 'Build State Machine';
        viewPart.style.display = 'none';
        btn.classList.remove('has-statemachine');
    }
}


      // Helper function to set a cookie
      function setCookie(name, value, days) {
          let expires = "";
          if (days) {
              const date = new Date();
              date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
              expires = "; expires=" + date.toUTCString();
          }
          document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax"; // Added SameSite
      }


function openStateMachineRunnerOverlay(rawJsonPayload = null, isPostcardMode = false) {
    // Reuse the existing overlay and iframe elements
    const stateMachineRunnerOverlay = document.getElementById('customOverlay');
    const stateMachineRunnerIframe = document.getElementById('customContent');
        const overlayContent = stateMachineRunnerOverlay ? stateMachineRunnerOverlay.querySelector('.overlay-content') : null;
    // Get references to the overlay buttons to modify them
    const saveBtn = document.getElementById('saveAndCloseBtn');
    // const cancelBtn = ... (already defined globally)
    // const cancelBtnLabel = ... (already defined globally)

    // --- MODIFIED: Store original HTML if we haven't already ---
    if (!originalCancelBtnHTML && cancelBtn) {
        originalCancelBtnHTML = cancelBtn.innerHTML;
    }
    // --- END MODIFIED ---

    if (!stateMachineRunnerOverlay || !stateMachineRunnerIframe || !saveBtn || !cancelBtn) {
        console.error("Could not find all necessary overlay elements for State Machine Runner.");
        alert("Error opening state machine runner: Overlay elements missing.");
        return;
    }

   if (isPostcardMode) {
        stateMachineRunnerOverlay.style.padding = '0';                   // 1. Remove backdrop padding
        stateMachineRunnerOverlay.style.backgroundColor = 'rgb(243 244 246)'; // NEW: Set backdrop color

        overlayContent.style.maxWidth = '100%';                          // 2. Make content full width
        overlayContent.style.height = '100%';                            // 3. Make content full height
        overlayContent.style.padding = '0';                              // 4. Remove content's internal padding
        overlayContent.style.borderRadius = '0';                         // 5. Remove rounded corners
        overlayContent.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0)'; // NEW: Remove shadow
        overlayContent.style.maxHeight = '94vh';                       // NEW: Remove max-height limit
        // Apply styles to the iframe itself
        stateMachineRunnerIframe.style.width = '100%';                   // 6. Make iframe full width
        stateMachineRunnerIframe.style.height = '100%';                  // 7. Make iframe full height
        stateMachineRunnerIframe.style.border = '0px';                   // NEW: Set border to 0px
        stateMachineRunnerIframe.style.borderRadius = '0';                         // 8. Remove rounded corners
        
        // --- MODIFIED: Style the existing cancelBtn ---
        if (cancelBtn) {
            cancelBtn.innerHTML = `<img src="editinlottiemon.svg" alt="Edit in LottieMon" style="width: 52px; height:auto; display: block;">`;
            cancelBtn.style.left = '24px';
            cancelBtn.style.top = '24px';
            cancelBtn.style.background = 'none';
            cancelBtn.style.border = 'none';
            cancelBtn.style.borderRadius = '50%';
            cancelBtn.style.width = '80px';
            cancelBtn.style.height = '40px';
            cancelBtn.style.padding = '8px';
           
            cancelBtn.style.display = 'flex'; // Use flex to center the img
            cancelBtn.style.alignItems = 'center';
            cancelBtn.style.justifyContent = 'center';
            cancelBtn.style.transition = 'transform 0.2s ease';
            
            // Add hover effect
            cancelBtn.onmouseenter = () => { cancelBtn.style.transform = 'scale(1.1)'; };
            cancelBtn.onmouseleave = () => { cancelBtn.style.transform = 'scale(1)'; };
        }
        // --- END MODIFIED ---
    }
    
    // --- Modify Overlay Buttons for "Runner" mode ---
    saveBtn.style.display = 'none'; // Hide the "Save & Close" button

    if (!isPostcardMode) {
        // --- MODIFIED: This is the "normal" runner mode (not postcard) ---
        if (cancelBtn) {
            cancelBtn.innerHTML = originalCancelBtnHTML; // Restore original content (span)
            const span = cancelBtn.querySelector('span');
            if (span) span.textContent = 'Close Runner'; // Change the text

            cancelBtn.style.display = ''; // Ensure original button is visible
            cancelBtn.style.left = 'auto'; // Center the button horizontally
            
            // Clear any lingering postcard styles
            cancelBtn.style.top = '';
            cancelBtn.style.background = '';
            cancelBtn.style.border = '';
            cancelBtn.style.borderRadius = '';
            cancelBtn.style.width = '';
            cancelBtn.style.height = '';
            cancelBtn.style.padding = '';
            cancelBtn.style.boxShadow = '';
            cancelBtn.onmouseenter = null;
            cancelBtn.onmouseleave = null;
        }
    }

    // Show the overlay
    stateMachineRunnerOverlay.style.backdropFilter = 'blur(8px)';
    stateMachineRunnerOverlay.style.webkitBackdropFilter = 'blur(8Dpx)'; // For Safari
    stateMachineRunnerOverlay.classList.add('active');

    // Set the source for the iframe
    stateMachineRunnerIframe.src = 'statemachinebuilder/runStateMachine.html';

    // Set up the onload event to send data AFTER the runner is ready
    stateMachineRunnerIframe.onload = () => {
        // ... (rest of the function is unchanged) ...
        setTimeout(() => {
        if (stateMachineRunnerIframe.contentWindow) {
            
            let finalPayload;

            if (rawJsonPayload) {
                // Case 1: We were given the raw "combinedJson" from loadDotLottieFromUrl
                finalPayload = rawJsonPayload;
                console.log("State Machine Runner: Sending raw 'combinedJson' payload.");
            
            } else {
                // Case 2: No raw payload (e.g., from gdrive), we must reconstruct it.
                // This is the fallback behavior for .lottie files from GDrive.
                console.log("State Machine Runner: Sending reconstructed payload.");
                
                if (!lottieDataArray || lottieDataArray.length === 0 || currentLottieIndex === -1 || !loadedStateMachines || loadedStateMachines.length === 0) {
                    console.error("State machine runner: Lottie data or state machine data is not ready for reconstruction.");
                    alert("Error: Data not ready for state machine runner.");
                    return;
                }
                
                // Reconstruct the object in the same format { animation: ..., stateMachine: ... }
                finalPayload = {
                    animation: lottieDataArray[currentLottieIndex],
                    stateMachine: loadedStateMachines[0],
                    layout: {} // Add an empty layout object to match the expected payload structure
                };
            }

            // --- Create the final message ---
            const dataToSend = {
                type: 'loadLayout',
                payload: finalPayload 
            };

            console.log("Sending data to State Machine Runner:", dataToSend);
            stateMachineRunnerIframe.contentWindow.postMessage(dataToSend, '*'); // Use specific origin in production

        } else {
            console.error("Could not get iframe content window for State Machine Runner.");
            stateMachineRunnerOverlay.classList.remove('active');
        }
    }, 500); // 500ms delay, similar to other tool loaders
    };

    // Handle potential errors loading the iframe itself
    stateMachineRunnerIframe.onerror = () => {
        console.error("Failed to load State Machine Runner iframe:", stateMachineRunnerIframe.src);
        alert("Error: Could not load the State Machine Runner application.");
        stateMachineRunnerOverlay.classList.remove('active');
        
        // --- MODIFIED: Reset button on failure ---
        if (cancelBtn && originalCancelBtnHTML) {
            cancelBtn.innerHTML = originalCancelBtnHTML; // Restore original
            const span = cancelBtn.querySelector('span');
            if(span) span.textContent = 'Cancel';
            
            // Clear all inline styles
            cancelBtn.style.left = '';
            cancelBtn.style.top = '';
            cancelBtn.style.background = '';
            cancelBtn.style.border = '';
            cancelBtn.style.borderRadius = '';
            cancelBtn.style.width = '';
            cancelBtn.style.height = '';
            cancelBtn.style.padding = '';
            cancelBtn.style.boxShadow = '';
            cancelBtn.onmouseenter = null;
            cancelBtn.onmouseleave = null;
        }
        saveBtn.style.display = ''; // Revert to default
        // --- END MODIFIED ---

        // --- NEW: Remove blur effect on close/error ---
        stateMachineRunnerOverlay.style.backdropFilter = '';
        stateMachineRunnerOverlay.style.webkitBackdropFilter = '';

    };
}




      // Helper function to get a cookie
      function getCookie(name) {
          const nameEQ = name + "=";
          const ca = document.cookie.split(';');
          for(let i = 0; i < ca.length; i++) {
              let c = ca[i];
              while (c.charAt(0) === ' ') c = c.substring(1, c.length);
              if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
          }
          return null;
      }


      function updateChatBubbleContextually() {
          const cookieName = "lastVisitTimestamp";
          const now = new Date().getTime(); // Current timestamp in milliseconds
          const lastVisitTimeStr = getCookie(cookieName);
          let message = "";

          // Define time thresholds in milliseconds for clarity
          const ONE_HOUR_MS = 60 * 60 * 1000;
          const ONE_DAY_MS = 24 * ONE_HOUR_MS;
          const THREE_DAYS_MS = 3 * ONE_DAY_MS; // "A few days" threshold
          const SEVEN_DAYS_MS = 7 * ONE_DAY_MS; // "Long time no see" threshold

          if (lastVisitTimeStr) {
              // User has visited before
              const lastVisitTime = parseInt(lastVisitTimeStr, 10);
              const timeDifference = now - lastVisitTime;

              if (timeDifference >= SEVEN_DAYS_MS) {
                  message = "Long time no see!! Ready to animate?";
              } else if (timeDifference >= THREE_DAYS_MS) {
                  message = "Welcome back! Glad to see you again.";
              } else if (timeDifference >= ONE_HOUR_MS) { // Visited earlier today or yesterday
                  message = "Hey there! Good to see you again.";
              } else { // Visited very recently (within the last hour)
                  message = "Hi again, drop your file!";
              }
          } else {
              // This is the first visit (or cookies were cleared)
              // Select a random message from your existing list
              if (randomTextStrings.length > 0) {
                  const randomIndex = Math.floor(Math.random() * randomTextStrings.length);
                  message = randomTextStrings[randomIndex];
              } else {
                  message = "Feed me a lottie!"; // Fallback default
              }
          }

          if (randomTextContainer) {
              randomTextContainer.textContent = message;
          }

          // Always set/update the cookie with the current visit's timestamp
          // This will be used to calculate the duration for their *next* visit.
          setCookie(cookieName, now.toString(), 365); // Cookie will expire in 365 days
      }







let dragDropLottieAnimation; // Instance for the drag-drop area animation
const dragDropSegments = { idle: [], waiting: [], catch: [] };
let dragDropCurrentSegment = 'idle'; // To keep track of the current segment
let isFileOverDropZone = false;

// Define custom speeds for each segment
const DRAG_DROP_SPEEDS = {
    idle: 0.2,    // Example: Play 'idle' at half speed
    waiting: 0.7, // Example: Play 'waiting' at 1.5x speed
    catch: 0.8    // Example: Play 'catch' at normal speed
};


    const layerIconSvg = `<img src="layers.svg" alt="Layers Icon">`;
    // --- NEW: Dedicated icons for property types ---
    const FILL_ICON_SVG = `<img src="css/fill.svg" alt="Fill Property Icon">`;
    const STROKE_ICON_SVG = `<img src="css/stroke.svg" alt="Stroke Property Icon">`;
    const GRADIENT_ICON_SVG = `<img src="css/gradient.svg" alt="Gradient Property Icon">`;
    // --- END NEW ---

  const EYE_OPEN_SVG = `<img src="visible.svg" alt="Layers Icon" class="textVisibility">`;

const EYE_CLOSED_SVG = `<img src="invisible.svg" alt="Layers Icon" class="textVisibility">`;


  // Coffee-themed variables and functions
let coffeeAnimation;
const coffeeSegments = { idle: [], hover: [], loop: [], back: [] };
let coffeeCurrentSegment = null;
let coffeeIsMouseOn = false;

const coffeeContainer = document.getElementById('headerLottie');

// Load the coffee animation
coffeeAnimation = lottie.loadAnimation({
container: coffeeContainer,
renderer: 'svg',
loop: false,
autoplay: false,
path: 'buyme.json'
});

coffeeAnimation.addEventListener('DOMLoaded', () => {
initCoffeeSegments();
attachCoffeeListeners();
playCoffeeSegment('idle', true);
});
coffeeAnimation.addEventListener('complete', onCoffeeSegmentComplete);

function initCoffeeSegments() {
const markers = coffeeAnimation.animationData.markers || [];
markers.forEach(marker => {
  coffeeSegments[marker.cm] = [marker.tm, marker.tm + marker.dr];
});
}

function playCoffeeSegment(name, loop = false) {
const range = coffeeSegments[name];
if (!range) return;
const [start, end] = range;
coffeeCurrentSegment = name;
// set speed: coffeeSlow for idle & loop
const speed = (name === 'idle' || name === 'loop') ? 0.65 : 1;
coffeeAnimation.setSpeed(speed);
coffeeAnimation.loop = !!loop;
coffeeAnimation.playSegments([start, end], true);
}

function onCoffeeMouseEnterDefault() {
coffeeIsMouseOn = true;
playCoffeeSegment('hover', false);
swapInCoffeeListeners();
}

function onCoffeeMouseLeaveDefault() {
coffeeIsMouseOn = false;
playCoffeeSegment('back', false);
swapInCoffeeListeners();
}

function onCoffeeMouseEnterSwapped() {
coffeeIsMouseOn = true;
}

function onCoffeeMouseLeaveSwapped() {
coffeeIsMouseOn = false;
}

function attachCoffeeListeners() {
coffeeContainer.addEventListener('mouseenter', onCoffeeMouseEnterDefault);
coffeeContainer.addEventListener('mouseleave', onCoffeeMouseLeaveDefault);
}

function detachCoffeeListeners() {
coffeeContainer.removeEventListener('mouseenter', onCoffeeMouseEnterDefault);
coffeeContainer.removeEventListener('mouseleave', onCoffeeMouseLeaveDefault);
}

function swapInCoffeeListeners() {
detachCoffeeListeners();
coffeeContainer.addEventListener('mouseenter', onCoffeeMouseEnterSwapped);
coffeeContainer.addEventListener('mouseleave', onCoffeeMouseLeaveSwapped);
}

function restoreCoffeeListeners() {
coffeeContainer.removeEventListener('mouseenter', onCoffeeMouseEnterSwapped);
coffeeContainer.removeEventListener('mouseleave', onCoffeeMouseLeaveSwapped);
attachCoffeeListeners();
}

function onCoffeeSegmentComplete() {
switch (coffeeCurrentSegment) {
  case 'hover':
    if (coffeeIsMouseOn) {
      restoreCoffeeListeners();
      playCoffeeSegment('loop', true);
    } else {
      playCoffeeSegment('back', false);
    }
    break;
  case 'back':
    if (coffeeIsMouseOn) {
      playCoffeeSegment('hover', false);
    } else {
      restoreCoffeeListeners();
      playCoffeeSegment('idle', true);
    }
    break;
  case 'loop':
    if (!coffeeIsMouseOn) {
      swapInCoffeeListeners();
      playCoffeeSegment('back', false);
    }
    break;
  case 'idle':
    // idle loops automatically
    break;
}
}


//multiinputs
// Add near your other global variables
let lottieDataArray = []; // To store all loaded Lottie JSON data objects
let lottieFileNames = []; // To store the names of the loaded files
let currentLottieIndex = -1; // Index of the currently active Lottie in the arrays
let originalUploadedDotLottieFile = null; // To store the original File object
let activeDotLottieOriginalName = null;
let isDotLottieLoaded  = false;

let displayOrderOfDataIndices = [];
let loadedStateMachines = []; // NEW: To store state machine JSONs from a .lottie file
const N_VISIBLE_CHIPS = 3; // (You can adjust this N)

const saveAndCloseBtn = document.getElementById('saveAndCloseBtn');
// Add near other DOM element refs
const multipleFileInput = document.getElementById('multipleFileInput');
const lottieFileChipsContainer = document.getElementById('lottieFileChipsContainer');
const lottieFileChips = document.getElementById('lottieFileChips');
let firstInitialization = 1;

const additionalFileInput = document.getElementById('additionalFileInput');

const allChipsOverlay = document.getElementById('allChipsOverlay');
const allChipsListContainer = document.getElementById('allChipsListContainer');
const closeAllChipsOverlayBtn = document.getElementById('closeAllChipsOverlayBtn');



	// Original and Current SRCs for iframe overlays
    let trimEditorSrcCurrent = 'overlay.html';
    let assetReplacerSrcCurrent = 'asset_replacer.html';
    let cropEditorSrcCurrent = 'crop.html';
    let featureUnavailablePageCurrent = 'feature-unavailable.html';



    // --- Global Variables ---
    let lottieData;         // Stores the parsed Lottie JSON
    let colorRefs = [];     // Stores references to solid color paths
    let allGradients = [];  // Stores references to gradient paths and stops
    let animationInstance;  // The main Lottie animation instance in the preview
    let currentSpeed = 1.0; // Current playback speed multiplier
    let originalFrameRate;  // Original frame rate from the Lottie JSON
    let animWidth, animHeight; // Original dimensions from the Lottie JSON
    let overlayAnimationInstance = null; // Instance for the overlay iframe
     let anyContent =null;
     let originalAnimationDuration = 0;
    // GIF rendering settings (can be overridden by overlay)
    let keyColor = '#000000';     // Color to make transparent in GIF
    let replaceColor = '#010101'; // Color to replace keyColor with before rendering


    // --- NEW: Undo/Redo Variables ---
    let originalLottieDataForReset; // To store a pristine copy for full reset
    let undoStack = [];
    let redoStack = [];
    const MAX_UNDO_STEPS = 10;
    let initialColorGroups = null;
    let initialAnimatedColorGroupsByHex = null;

    let preservedColorAccordionStates = {};
    let preservedGradientAccordionStates = {};




    let preservedAnimatedColorAccordionStates = {};    // <<< NEW
   let preservedAnimatedGradientAccordionStates = {}; // <<< NEW
    // --- END NEW ---





    let translationtoX = null;
    let translationtoY = null;



    //text properties
    let detectedTextElements = []; // To store found text layers and their keyframes
let preservedTextAccordionStates = {}; // To preserve open/closed states of text accordions



    // --- DOM Element References ---
    const fileInput = document.getElementById('fileInput');
    const uploadWrapper = document.getElementById('uploadWrapper');
    const dragDropOverlay = document.querySelector('.drag-drop-overlay');

    const mainContent = document.getElementById('mainContent');
    const editorArea = document.getElementById('editorArea');
    const colorEditor = document.getElementById('colorEditor');
    const stopEditor = document.getElementById('stopEditor');
    const previewArea = document.getElementById('previewArea');
    const lottiePreview = document.getElementById('lottiePreview');
    const windowTitle = document.querySelector('.window-title');
    const windowCloseBtn = document.querySelector('.window-close');


    const jsonWindowTitle = document.getElementById('jsonWindowTitle');
    const dotLottieWindowTitle = document.getElementById('dotLottieWindowTitle');

    const downloadJsonBtn = document.getElementById('downloadJsonBtn');
    const downloadDotLottieBtn = document.getElementById('downloadDotLottieBtn');
    const downloadGifBtn = document.getElementById('downloadGifBtn');
    const openOverlayBtn = document.getElementById('openOverlayBtn');
    const openCropBtn = document.getElementById('openCropBtn'); // *** NEW CROP BUTTON REF ***
    const transparentBgCheckbox = document.getElementById('transparentBg');
    const bgColorPicker = document.getElementById('bgColorPicker');
    const bgHexInput = document.getElementById('bgHexInput');
    const bgColorGroup = document.getElementById('bgColorGroup');
    const gifScaleSelect = document.getElementById('gifScale');
    const gifContainer = document.getElementById('gifContainer'); // Hidden container for GIF rendering
    const gifExportLabel = document.getElementById('gifExportLabel');
    const renderSettingsOverlay = document.getElementById('renderSettingsOverlay');
    const customOverlay = document.getElementById('customOverlay');
    const customOverlayIframe = document.getElementById('customContent');
    const overlayCloseButtons = document.querySelectorAll('.overlay-close');
    const openAssetReplacerBtn = document.getElementById('openAssetReplacerBtn');

    const animatedColorEditor = document.getElementById('animatedColorEditor');

	const pillPropertyGroupMap = new WeakMap();


    // --- (Place near other global variables or utility functions) ---



    // Will hold { path: [...,'c','k'], keyframePaths: [ [...,'c','k',i,'s'], … ] } for solids
    // and similar for grads
    let animatedColorRefs = [];

    let animatedGradientRefs = [];


    // --- NEW DOM Element References for Player Controls ---
    const playPauseBtn = document.getElementById('playPauseBtn');
    const lottieSeekbar = document.getElementById('lottieSeekbar');
    const speedControlPillBtn = document.getElementById('speedControlPillBtn');
    const speedValuePill = document.getElementById('speedValuePill'); // Span inside the pill
    const speedSliderPopup = document.getElementById('speedSliderPopup');
    const speedSliderMain = document.getElementById('speedSliderMain'); // The new main speed slider
    const dismissSpeedPopupBtn = document.getElementById('dismissSpeedPopupBtn');
    const durationpill= document.getElementById('animationDurationPill');
const confirmDeleteOverlay = document.getElementById('confirmDeleteOverlay');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteAnimationName = document.getElementById('confirmDeleteAnimationName');

const deleteAnimationBtn = document.getElementById('deleteAnimationBtn');
    let isPlaying = true; // To track play/pause state
    let speedPopupTimer = null; // Timer for auto-dismissing speed popup


    const PLAY_ICON_SVG = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
   const PAUSE_ICON_SVG = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';




   // Add these near your other global variables
   let isColorPickerActive = false;
   let activePickedColor = null; // Stores the hex of the currently filtered color
   let originalDisplayStates = new Map(); // To store original display states of editor items
   let elementsToManageVisibility = []; // Array to store all relevant editor items


   const openFlutterPreviewBtn = document.getElementById('openFlutterPreviewBtn');
const flutterPreviewOverlay = document.getElementById('customOverlay'); // We can reuse the same overlay
const flutterPreviewIframe = document.getElementById('customContent'); // and the same iframe

// Find the specific 'Cancel' button. We use a more detailed selector to avoid other buttons.
const cancelBtn = document.querySelector('.overlay-close[aria-label="Close Editor Overlay"]');
const cancelBtnText = cancelBtn ? cancelBtn.querySelector('span') : null; // Get the text span inside it
    let originalCancelBtnHTML = null;

   // DOM Refs for new elements
   const activateColorPickerBtn = document.getElementById('activateColorPickerBtn');
   const filterInfoPill = document.getElementById('filterInfoPill');
   const filterPillColorPicker = document.getElementById('filterPillColorPicker');
   const filterPillHexInput = document.getElementById('filterPillHexInput');
   const resetFilterBtn = document.getElementById('filterInfoPill');
   const previewBgToggleContainer = document.querySelector('.preview-bg-toggle'); // Get the container of the GIF BG toggle



   let initialFilteredAccordionIds = new Set();
let isUserInitiatedFilter = false;


  // adding lottie preview reciever
  // Add with your other global variables
let isLottiePreviewDropZoneActive = false;

   /**
    * Converts a hex color string to an array of RGB components [R, G, B].
    * @param {string} hex - The hex color string (e.g., "#FF0000" or "FF0000").
    * @returns {Array<number>} - An array [R, G, B] with values between 0 and 255.
    */
   function hexToRgbComponents(hex) {
       const h = hex.replace('#', '');
       if (h.length === 3) { // Expand 3-digit hex
           const r = parseInt(h[0] + h[0], 16);
           const g = parseInt(h[1] + h[1], 16);
           const b = parseInt(h[2] + h[2], 16);
           return [r, g, b];
       }
       if (h.length === 6) {
           const bigint = parseInt(h, 16);
           const r = (bigint >> 16) & 255;
           const g = (bigint >> 8) & 255;
           const b = bigint & 255;
           return [r, g, b];
       }
       console.warn("Invalid hex string for RGB conversion:", hex);
       return [0, 0, 0]; // Default to black for invalid hex
   }

   /**
    * Calculates the Euclidean distance between two RGB colors.
    * @param {Array<number>} rgb1 - First color as [R, G, B] (0-255).
    * @param {Array<number>} rgb2 - Second color as [R, G, B] (0-255).
    * @returns {number} - The distance between the two colors.
    */
   function colorDistance(rgb1, rgb2) {
       if (!rgb1 || !rgb2 || rgb1.length < 3 || rgb2.length < 3) {
           return Infinity; // Or handle error appropriately
       }
       const rDiff = rgb1[0] - rgb2[0];
       const gDiff = rgb1[1] - rgb2[1];
       const bDiff = rgb1[2] - rgb2[2];
       return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
   }

   // Define your tolerance for color matching. Adjust this value as needed.
   // A lower value means stricter matching, a higher value is more lenient.
   const COLOR_DISTANCE_TOLERANCE = 10; // Example tolerance

   function initializeElementsToManageVisibility() {
       elementsToManageVisibility = [
           ...document.querySelectorAll('#colorEditor .accordion'),
           ...document.querySelectorAll('#stopEditor .gradient-accordion'),
           ...document.querySelectorAll('#animatedColorEditor .gradient-accordion'),
           ...document.querySelectorAll('#animatedGradientEditor .gradient-accordion'),
           // For text, decide if you filter rows or the main text accordion
           document.getElementById('detected-text-main-accordion'), // If filtering the whole section
           // ... or document.querySelectorAll('#textEditorContainer .text-instance-row') if filtering individual rows
       ].filter(el => el); // Filter out nulls if some sections aren't populated
   }



	function pathToGroupId(pathArray) {
  if (!Array.isArray(pathArray)) return '';
  return pathArray.join('-');
}


    function getNodeByPath(root, path) {
  return path.reduce((obj, key) => obj && obj[key], root);
}




    function getValueByPath(obj, path) {
        try {
            return path.reduce((acc, key) => acc[key], obj);
        } catch (e) {
            console.warn("Invalid path:", path, "in object:", obj);
            return undefined;
        }
    }

    /**
     * Sets a value in an object using a path array.
     */
    function setValueByPath(obj, path, newValue) {
        try {
            const lastKey = path[path.length - 1];
            const target = path.slice(0, -1).reduce((acc, key) => acc[key], obj);
            if (target && typeof target === 'object') {
                target[lastKey] = newValue;
            } else {
                 console.warn("Invalid target for path:", path, "in object:", obj);
            }
        } catch (e) {
             console.warn("Error setting value for path:", path, "in object:", obj, e);
        }
    }






    /**
 * Converts a Lottie normalized RGB array (0-1 range) for text fill color to a hex color string.
 * @param {Array<number>} rgbNormalized - An array [r, g, b] with values between 0 and 1.
 * @returns {string} - The hex color string (e.g., "#FF0000").
 */
function rgbTextNormalizedToHex(rgbNormalized) {
    if (!rgbNormalized || rgbNormalized.length < 3) return "#000000"; // Default to black
    const r = Math.max(0, Math.min(255, Math.round(rgbNormalized[0] * 255)));
    const g = Math.max(0, Math.min(255, Math.round(rgbNormalized[1] * 255)));
    const b = Math.max(0, Math.min(255, Math.round(rgbNormalized[2] * 255)));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

/**
 * Converts a hex color string to a Lottie-compatible normalized RGB array (0-1 range) for text fill color.
 * @param {string} hex - The hex color string (e.g., "#FF0000").
 * @returns {Array<number>} - An array [r, g, b] with values between 0 and 1.
 */
function hexToRgbTextNormalized(hex) {
    let r = 0, g = 0, b = 0;
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }
    // Ensure values are clamped between 0 and 1 and have a fixed precision
    return [
        parseFloat((r / 255).toFixed(3)),
        parseFloat((g / 255).toFixed(3)),
        parseFloat((b / 255).toFixed(3))
    ];
}





    function findTextLayersRecursive(layers, assetIdPrefix = '', currentPath = []) {
    if (!layers || !Array.isArray(layers)) return;

    layers.forEach((layer, layerIndex) => {
        const layerPath = [...currentPath, 'layers', layerIndex];
        // Standard text layer type is 5
        if (layer.ty === 5 && layer.t && layer.t.d && layer.t.d.k) {
            // Iterate through keyframes of the text property ('k')
            layer.t.d.k.forEach((keyframe, keyframeIndex) => {
                if (keyframe.s) { // 's' (sourceText) contains the style properties including text and color
                    const textObject = keyframe.s; // This is the object holding 't' (text) and 'fc' (fillColor)
                    if (typeof textObject.t === 'string') { // 't' is the actual text string
                        detectedTextElements.push({
                            textNodeRef: textObject, // Direct reference to the 's' object in lottieData
                            originalText: textObject.t,
                            // 'fc' is fill color [r,g,b] (0-1 normalized), default to black if not present
                            originalColor: textObject.fc || [0, 0, 0], // Lottie text color is [0-1, 0-1, 0-1]
                            layerName: layer.nm || `Text Layer <span class="math-inline">\{assetIdPrefix\}</span>{layerIndex + 1}`,
                            keyframeIndex: keyframeIndex, // Index of this keyframe within layer.t.d.k
                            // Store paths for undo/redo if needed, e.g., path to textObject.t and textObject.fc
                            textPath: [...layerPath, 't', 'd', 'k', keyframeIndex, 's', 't'],
                            colorPath: [...layerPath, 't', 'd', 'k', keyframeIndex, 's', 'fc']
                        });
                    }
                }
            });
        }
        // If the layer is a pre-composition and has its own layers array, recurse.
        // Pre-compositions are often defined in `assets` and then referenced by `refId`.
        // This basic recursion handles layers directly nested. For assets, you'd call this function on asset.layers.
        if (layer.layers && Array.isArray(layer.layers)) {
            findTextLayersRecursive(layer.layers, assetIdPrefix + (layer.nm || `comp${layerIndex}`) + '_', [...layerPath]);
        }
    });
}



/**
 * Renders the accordion UI for editing detected text elements (content and color).
 */
 /**
  * Renders a single accordion UI for "Detected Text".
  * The accordion body will contain rows for each editable text instance.
  * The header will show color dots as a preview.
  */
 function renderTextEditorUI() {
     const container = document.getElementById('textEditorContainer');
     const mainLabel = document.getElementById('textEditorLabel'); // The H3 heading "Detected Text"
     const stateMachineBtn = document.getElementById('openStateMachineBuilderBtn');
     container.innerHTML = ''; // Clear previous UI

     if (detectedTextElements.length === 0) {
         if (mainLabel) mainLabel.style.display = 'none';
          if (stateMachineBtn) stateMachineBtn.style.display = 'inline-flex'; // Show button if no text
         // Optionally, display a message like "No text elements found." in the container
         return;
     }

     if (mainLabel) mainLabel.style.display = 'block';
     if (stateMachineBtn) stateMachineBtn.style.display = 'none'; // Hide button if text is present

     const mainAccordionId = 'detected-text-main-accordion';

     const accordion = document.createElement('div');
     accordion.className = 'gradient-accordion'; // Reuse existing styling
     accordion.dataset.id = mainAccordionId;
     accordion.id = mainAccordionId; // <<< ADD THIS LINE

     const header = document.createElement('div');
     header.className = 'gradient-header';

     const headerContent = document.createElement('div'); // To hold title and dots
     headerContent.className = 'accordion-header-content'; // Use existing class for layout

     const title = document.createElement('span');
     title.innerHTML = ` <span class="math-inline">${detectedTextElements.length} Instance${detectedTextElements.length === 1 ? '' : 's'}</span>`;


     const rightSide = document.createElement('div');
     rightSide.className = 'right-side-of-header';



     headerContent.appendChild(title);
     headerContent.appendChild(rightSide);


     // --- Add Color Dots to Header ---
     const MAX_DOTS_IN_HEADER = 10; // Limit number of dots for visual clarity
     detectedTextElements.slice(0, MAX_DOTS_IN_HEADER).forEach(element => {
         const dot = document.createElement('div');
         dot.className = 'color-dot'; // Reuse existing styling for dots
         const currentColorArray = Array.isArray(element.textNodeRef.fc) ? element.textNodeRef.fc : [0,0,0];
         dot.style.backgroundColor = rgbTextNormalizedToHex(currentColorArray);
         dot.title = `${element.layerName} (KF ${element.keyframeIndex + 1}): ${element.textNodeRef.t}`; // Tooltip
        rightSide.appendChild(dot); // Add dots after the title
     });
     if (detectedTextElements.length > MAX_DOTS_IN_HEADER) {
         const moreDotsIndicator = document.createElement('span');
         moreDotsIndicator.textContent = ` +${detectedTextElements.length - MAX_DOTS_IN_HEADER} more`;
         moreDotsIndicator.style.fontSize = '0.8em';
         moreDotsIndicator.style.marginLeft = 'var(--spacing-xs)';
        rightSide.appendChild(moreDotsIndicator);
     }
     // --- End Color Dots ---

     header.appendChild(headerContent); // Add content (title + dots) to header

     const body = document.createElement('div');
     body.className = 'gradient-content'; // Reuse existing styling for accordion body
     body.id = `detected-text-main-body`;

     // Apply preserved accordion state for the main accordion
     if (preservedTextAccordionStates[mainAccordionId] === true) {
         header.classList.add('active');
         body.classList.add('active');
         body.style.display = "flex"; // Or "block"
         header.setAttribute('aria-expanded', 'true');
     } else {
         body.style.display = "none";
         header.setAttribute('aria-expanded', 'false');
     }

     // Populate the body with rows for each text instance
     detectedTextElements.forEach((element, index) => {
         const textInstanceRow = document.createElement('div');
         textInstanceRow.className = 'text-instance-row stop-row'; // Reuse 'stop-row' for layout or create a new class
         textInstanceRow.style.display = 'flex';
         textInstanceRow.style.alignItems = 'center';
         textInstanceRow.style.gap = 'var(--spacing-md)';
         textInstanceRow.style.padding = 'var(--spacing-sm) 0';


         const instanceLabel = document.createElement('span');
         instanceLabel.className = 'label'; // Reuse 'label' class
         instanceLabel.textContent = `${element.layerName}`;
         instanceLabel.title = `Original: "${element.originalText}"`;

         instanceLabel.style.flexShrink = '0';

         const textInput = document.createElement('input');
         textInput.type = 'text';
         textInput.value = element.textNodeRef.t;
         textInput.className = 'text-editor-input'; // Your specific class for text inputs
         textInput.style.flexGrow = '1';
         textInput.setAttribute('aria-label', `Edit text for ${element.layerName}`);

         textInput.addEventListener('change', (e) => {
             const oldText = element.textNodeRef.t;
             const newText = e.target.value;
             element.textNodeRef.t = newText;

             recordChange({
                 type: 'TEXT_PROPERTY',
                 path: [...element.textPath],
                 oldValue: oldText,
                 newValue: newText,
                 textElementIndex: index
             });
             reloadLottiePreview();
         });

         const colorInputGroup = document.createElement('div');
         colorInputGroup.className = 'color-input-group';

         const colorPicker = document.createElement('input');
         colorPicker.type = 'color';
         const currentColorArray = Array.isArray(element.textNodeRef.fc) ? element.textNodeRef.fc : [0,0,0];
         colorPicker.value = rgbTextNormalizedToHex(currentColorArray);
         colorPicker.setAttribute('aria-label', `Edit color for ${element.layerName}`);

         const hexInput = document.createElement('input');
         hexInput.type = 'text';
         hexInput.value = colorPicker.value;
         hexInput.style.width = '70px';
         hexInput.setAttribute('aria-label', `Hex color for ${element.layerName}`);

         commitAfterIdle(colorPicker, (newHexValue) => {
             const oldColor = [...(element.textNodeRef.fc || [0,0,0])];
             const newColorArray = hexToRgbTextNormalized(newHexValue);
             element.textNodeRef.fc = newColorArray;
             hexInput.value = newHexValue;

             // Update the corresponding dot in the main accordion header
             const headerDots = header.querySelectorAll('.color-dot');
             if (index < headerDots.length) { // Check if this text instance has a dot in the header
                 headerDots[index].style.backgroundColor = newHexValue;
             }

             recordChange({
                 type: 'TEXT_PROPERTY',
                 path: [...element.colorPath],
                 oldValue: oldColor,
                 newValue: newColorArray,
                 textElementIndex: index
             });
             reloadLottiePreview();
         }, 150);

         hexInput.addEventListener('change', (e) => {
             let newHex = e.target.value.trim();
             if (!newHex.startsWith("#")) newHex = "#" + newHex;
             if (/^#[0-9A-F]{6}$/i.test(newHex)) {
                 const oldColor = [...(element.textNodeRef.fc || [0,0,0])];
                 const newColorArray = hexToRgbTextNormalized(newHex);
                 element.textNodeRef.fc = newColorArray;
                 colorPicker.value = newHex;

                 const headerDots = header.querySelectorAll('.color-dot');
                 if (index < headerDots.length) {
                     headerDots[index].style.backgroundColor = newHex;
                 }

                 recordChange({
                     type: 'TEXT_PROPERTY',
                     path: [...element.colorPath],
                     oldValue: oldColor,
                     newValue: newColorArray,
                     textElementIndex: index
                 });
                 reloadLottiePreview();
             } else {
                 alert("Invalid hex code. Please use #RRGGBB format.");
                 hexInput.value = colorPicker.value;
             }
         });

         colorInputGroup.append(hexInput, colorPicker);


         let fullPath = element.colorPath;

// 2) drop any leading junk before the first 'layers'
const firstLayersIdx = fullPath.indexOf('layers');
if (firstLayersIdx > 0) {
  fullPath = fullPath.slice(firstLayersIdx);
}

// 3) now fullPath starts exactly ['layers', layerIdx, …]
//    find where the 't' text prop begins
const firstTIndex = fullPath.indexOf('t');

// 4) slice up to that to get ['layers', layerIdx]
const layerPath = fullPath.slice(0, firstTIndex);

// 5) finally look up the layer object
const layerNode = getValueByPath(lottieData, layerPath);
   // now build your eye-toggle off layerNode exactly as before
   const eyeBtn = document.createElement('span');
   eyeBtn.className = 'visibility-toggle';
   if (layerNode) {
    // If it exists, set up the button normally.
    eyeBtn.innerHTML = layerNode.hd ? EYE_CLOSED_SVG : EYE_OPEN_SVG;
    eyeBtn.addEventListener('click', e => {
        e.stopPropagation();
        layerNode.hd = !layerNode.hd; // Toggle the property
        eyeBtn.innerHTML = layerNode.hd ? EYE_CLOSED_SVG : EYE_OPEN_SVG; // Update the icon
        reloadLottiePreview();
    });
} else {
    // If layerNode is not found, create a disabled-looking button to prevent errors.
    eyeBtn.innerHTML = EYE_OPEN_SVG; // Default to a visible icon
    eyeBtn.style.opacity = '0.3';
    eyeBtn.style.cursor = 'not-allowed';
    eyeBtn.title = 'Layer object not found';
}

           // group eye + label, then append everything
           const labelWrapper = document.createElement('div');
           labelWrapper.className = 'title-wrapper';
           labelWrapper.style.display = 'flex';
           labelWrapper.style.alignItems = 'center';
            labelWrapper.appendChild(eyeBtn);
           labelWrapper.appendChild(instanceLabel);


           textInstanceRow.append(labelWrapper, textInput, colorInputGroup);
           body.appendChild(textInstanceRow);
     });

     header.addEventListener('click', (e) => {
         if (e.target.closest('input, .color-dot')) { // Prevent toggle if click is on inputs or dots
             return;
         }
         const isActive = body.classList.toggle('active');
         header.classList.toggle('active', isActive);
         body.style.display = isActive ? 'flex' : 'none';
         header.setAttribute('aria-expanded', isActive);
     });
     header.setAttribute('role', 'button');
     header.setAttribute('aria-controls', body.id);

     accordion.appendChild(header);
     accordion.appendChild(body);
     container.appendChild(accordion);
 }







function findAnimatedGradients(lottieData) {
    const results = [];
    const visited = new WeakSet();

    function traverse(obj, path) {
        if (!obj || typeof obj !== 'object' || visited.has(obj)) {
            return;
        }
        visited.add(obj);

        // Check for animated gradient fill
        if (obj.ty === 'gf' && obj.g?.k?.a === 1 && obj.g.k.k?.length > 0) {
            const basePath = [...path, 'g', 'k', 'k'];
            const stopPaths = obj.g.k.k.map((_, i) => [...basePath, i, 's']);
            
            // Find the containing layer path for this gradient property
            const layerPath = getLayerPathFromPropertyPath(path);

            if (layerPath) {
                results.push({
                    basePath,
                    stopPaths,
                    layerPath // Store the direct path to the layer
                });
            }
        }
    if (Array.isArray(obj)) {
            obj.forEach((item, index) => traverse(item, [...path, index]));
        } else {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    traverse(obj[key], [...path, key]);
                }
            }
        }
    }

    traverse(lottieData, []);
    return results;
}



function renderAnimatedGradientEditor() {
  const container = document.getElementById('animatedGradientEditor');
  container.innerHTML = '';

  if (!animatedGradientRefs || animatedGradientRefs.length === 0) {
    const animatedGradientLabel = document.getElementById('animatedGradientLabel');
    if (animatedGradientLabel) {
        animatedGradientLabel.style.display = 'none';
    }
    return;
  } else {
    const animatedGradientLabel = document.getElementById('animatedGradientLabel');
    if (animatedGradientLabel) {
        animatedGradientLabel.style.display = 'block';
    }
  }

  animatedGradientRefs.forEach((grp, gi) => {

     const accordionId = `anim-grad-${gi}`; // <<< NEW: Define an ID

    const accordion = document.createElement('div');
    accordion.className = 'gradient-accordion';
    accordion.dataset.id = accordionId;

    const header = document.createElement('div');
    header.className = 'gradient-header';







       const rightSide = document.createElement('div');
       rightSide.className = 'right-side-of-header';

       const accordionHeaderContent = document.createElement('div');
       accordionHeaderContent.className = 'accordion-header-content';


       // Left part: Title and Pill
    const titlePillWrapper = document.createElement('div');
    titlePillWrapper.className =  'title-wrapper';


    const title = document.createElement('span');    
    const layerPathForName = grp.layerPath; // Use the direct layerPath found earlier
    const layerObjectForName = layerPathForName ? getValueByPath(lottieData, layerPathForName) : null;
    let animatedInstanceLabelText = (layerObjectForName && layerObjectForName.nm) || `Layer ${gi + 1}`;

    title.textContent = animatedInstanceLabelText;
    title.contentEditable = "true";
    title.spellcheck = false;
    title.title = "Click to edit layer name";
    title.style.cursor = "text";

    if (layerPathForName) {
        const layerNamePath = [...layerPathForName, 'nm'];
        title.addEventListener('blur', () => {
            const oldName = getValueByPath(lottieData, layerNamePath) || '';
            const newName = title.textContent.trim();
            if (newName && oldName !== newName) {
                setValueByPath(lottieData, layerNamePath, newName);
                recordChange({ type: 'NAME_CHANGE', path: layerNamePath, oldValue: oldName, newValue: newName });
                refreshUIStateAndRender();
            } else {
                title.textContent = oldName || animatedInstanceLabelText;
            }
        });
        title.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); title.blur(); } });
    } else {
        title.contentEditable = "false";
        title.title = "Layer not found";
        title.style.cursor = "default";
    }
    titlePillWrapper.appendChild(title);
    if (grp.basePath && lottieData) {
        const propertyGroupIdentifier = pathToGroupId(grp.basePath);
        const shapeItemPath = grp.basePath.slice(0, -3); // Path to the 'gf' shape item
        const shapeItem = getValueByPath(lottieData, shapeItemPath);
        if (shapeItem) {
            pillPropertyGroupMap.set(shapeItem, propertyGroupIdentifier);
        }
        const propertyPill = createLayerNamePill(null, shapeItem);
        if (propertyPill) {
            propertyPill.addEventListener('click', e => e.stopPropagation());
            titlePillWrapper.appendChild(propertyPill);
        }
    }
    titlePillWrapper.appendChild(title);
    accordionHeaderContent.appendChild(titlePillWrapper);







    accordionHeaderContent.appendChild(rightSide);
      header.appendChild(accordionHeaderContent);
    // --- Determine P (number of stops) ---
    const g_object_path = grp.basePath.slice(0, -2); // Path to the 'g' object
    const P_from_gradient_prop = getValueByPath(lottieData, g_object_path.concat('p'));

    if (typeof P_from_gradient_prop !== 'number' || P_from_gradient_prop <= 0) {
      console.warn(`Could not determine number of stops (P) for animated gradient #${gi + 1}. Skipping. Path to 'g':`, g_object_path.join('.'));
      // Add a message to UI for this specific accordion if P is invalid
      const errorMsg = document.createElement('span');
      errorMsg.textContent = ' (Error: Invalid stop data)';
      errorMsg.style.color = 'red';
      errorMsg.style.fontSize = '0.8em';
      titleElement.appendChild(errorMsg);
      accordion.appendChild(header); // Add header even if body is empty/error
      container.appendChild(accordion);
      return; // Skip rendering body for this gradient
    }
    const P = P_from_gradient_prop;

    // --- Updated Header Dots ---
    grp.stopPaths.forEach(sp_dot => { // sp_dot is path to a keyframe's 's' array
      const rawS_dot = getValueByPath(lottieData, sp_dot);
      const dot = document.createElement('div');
      dot.className = 'color-dot';

      if (Array.isArray(rawS_dot) && P > 0) {
        // Ensure there's enough data for the first color stop
        if (rawS_dot.length >= (0 * 4 + 4)) {
          const r_norm_dot = rawS_dot[0 * 4 + 1]; // R of first stop
          const g_norm_dot = rawS_dot[0 * 4 + 2]; // G of first stop
          const b_norm_dot = rawS_dot[0 * 4 + 3]; // B of first stop
          let a_norm_dot = 1.0;

          if (rawS_dot.length === P * 6 && rawS_dot.length >= (P * 4 + 0 * 2 + 2) ) { // Full P*6 structure
            a_norm_dot = rawS_dot[P * 4 + 0 * 2 + 1]; // Alpha of first stop
          } else if (rawS_dot.length === P * 4) { // P*4 structure (color only)
            a_norm_dot = 1.0;
          }
          // Add handling for P*5 if that's a case you expect, though less standard for complex gradients
          // else if (rawS_dot.length === P * 5 && rawS_dot.length >= (0 * 5 + 5)) {
          //    a_norm_dot = rawS_dot[0 * 5 + 4] ?? 1.0;
          // }

          dot.style.backgroundColor = `rgba(${Math.round(r_norm_dot * 255)}, ${Math.round(g_norm_dot * 255)}, ${Math.round(b_norm_dot * 255)}, ${a_norm_dot})`;
        } else {
            dot.style.backgroundColor = 'rgba(200,200,200,0.7)'; // Default if not enough data for first stop
        }
      } else {
        dot.style.backgroundColor = 'rgba(200,200,200,0.7)'; // Default if rawS_dot is not as expected
      }
      rightSide.appendChild(dot);
    });

    const body = document.createElement('div');
    body.className = 'gradient-content';
    body.id = `anim-grad-body-${gi}`; // Give body an ID for aria-controls


    // --- APPLY PRESERVED STATE (NEW) ---
    if (preservedAnimatedGradientAccordionStates[accordionId] === true) {
        header.classList.add('active');
        body.classList.add('active');
        body.style.display = "flex"; // Or "block", matching your active style
        header.setAttribute('aria-expanded', 'true');
    } else {
        body.style.display = "none"; // Default to closed
        header.setAttribute('aria-expanded', 'false');
    }
    // --- END APPLY PRESERVED STATE ---


    grp.stopPaths.forEach((sp, kfIndex) => { // sp is path to keyframe's 's' array
      const rawS = getValueByPath(lottieData, sp);

      if (!Array.isArray(rawS)) {
        console.warn(`Keyframe ${kfIndex} for gradient ${gi+1} has invalid 's' array. Path:`, sp.join('.'));
        const kfErrorRow = document.createElement('div');
        kfErrorRow.textContent = `Keyframe ${kfIndex + 1}: Error loading data.`;
        kfErrorRow.style.padding = 'var(--spacing-sm)';
        kfErrorRow.style.color = 'var(--color-text-secondary)';
        body.appendChild(kfErrorRow);
        return; // Skip this keyframe
      }

      // Check expected length based on P. Lottie gradients can be P*4 (colors only) or P*6 (colors + opacity)
      // Or sometimes a simplified P*5 [offset,r,g,b,a] but this is less common for complex tools.
      const expectedLengthP6 = P * 6;
      const expectedLengthP4 = P * 4;
      // const expectedLengthP5 = P * 5; // If you need to support this specific non-standard variant

      if (rawS.length !== expectedLengthP4 && rawS.length !== expectedLengthP6 /* && rawS.length !== expectedLengthP5 */) {
        console.warn(`Keyframe ${kfIndex} (Grad ${gi+1}): 's' array length ${rawS.length} is unexpected for ${P} stops. Expected ${expectedLengthP4} or ${expectedLengthP6}. Path:`, sp.join('.'));
        // Optionally add a message in the UI for this keyframe
      }

      for (let si = 0; si < P; si++) { // Loop P times for P stops
        // Ensure we don't read out of bounds for color part
        if (si * 4 + 3 >= rawS.length) {
            console.warn(`Keyframe ${kfIndex} (Grad ${gi+1}), Stop ${si+1}: Not enough data in 's' array for color. Length: ${rawS.length}`);
            continue; // Skip this stop if not enough data
        }

        const offset = rawS[si * 4 + 0]; // Color offset
        const r_norm = rawS[si * 4 + 1];
        const g_norm = rawS[si * 4 + 2];
        const b_norm = rawS[si * 4 + 3];
        let current_a_norm = 1.0; // Default alpha

        if (rawS.length === expectedLengthP6) {
            // Ensure we don't read out of bounds for opacity part
            if ((P * 4 + si * 2 + 1) < rawS.length) {
                current_a_norm = rawS[P * 4 + si * 2 + 1];
            } else {
                console.warn(`Keyframe ${kfIndex} (Grad ${gi+1}), Stop ${si+1}: Not enough data in 's' (P*6 structure) for alpha. Length: ${rawS.length}`);
            }
        } else if (rawS.length === expectedLengthP4) {
            current_a_norm = 1.0; // No separate alpha data, so it's 1
        }
        // else if (rawS.length === expectedLengthP5) { // If supporting P*5 explicitly
        //     if (si * 5 + 4 < rawS.length) {
        //        current_a_norm = rawS[si * 5 + 4] ?? 1.0;
        //     } else {
        //        console.warn(`Keyframe ${kfIndex} (Grad ${gi+1}), Stop ${si+1}: Not enough data in 's' (P*5 structure) for alpha. Length: ${rawS.length}`);
        //     }
        // }
        // For other lengths, current_a_norm remains 1.0 or could log an error.

        const hex = rgbToHex(r_norm, g_norm, b_norm); // rgbToHex expects 0-1 normalized inputs

        const row = document.createElement('div');
        row.className = 'stop-row';
        const label = document.createElement('span');
        label.className = 'label';
        label.textContent = `KF ${kfIndex + 1} • Stop ${si + 1}`; // Offset: ${Math.round(offset*100)}%

        const inputGroup = document.createElement('div');
        inputGroup.className = 'color-input-group'; // Re-using existing style

        const hexInput = document.createElement('input'); // Create hex input
        hexInput.type = 'text';
        hexInput.value = hex;
        hexInput.setAttribute('aria-label', `Hex for KF ${kfIndex + 1} Stop ${si + 1}`);
        hexInput.style.width = '70px'; // Match styling of other hex inputs

        const picker = document.createElement('input');
        picker.type = 'color';
        picker.value = hex;
        picker.setAttribute('aria-label', `Color Picker for KF ${kfIndex + 1} Stop ${si + 1}`);


        // Event listener for color picker (RGB only)
        // Using commitAfterIdle for better performance during color dragging
        commitAfterIdle(picker, (newHexValue) => {
           const oldKeyframeSArray = [...getValueByPath(lottieData, sp)]; // Capture entire 's' array BEFORE change

           const [nr, ng, nb] = hexToRgb(newHexValue); // Converts hex from picker (RGB) to normalized 0-1 r,g,b

           // Update color part in the rawS array (which is a reference into lottieData)
           rawS[si * 4 + 1] = nr;
           rawS[si * 4 + 2] = ng;
           rawS[si * 4 + 3] = nb;
           // Alpha is preserved as it's not changed by this picker

           hexInput.value = newHexValue; // Sync hex input
           reloadLottiePreview();

           const newKeyframeSArray = [...rawS]; // Capture entire 's' array AFTER change
           recordChange({
               type: 'ANIMATED_GRADIENT_KEYFRAME', // Note: Storing the whole keyframe 's' array
               path: [...sp],                     // Path to the keyframe's 's' array
               oldValue: oldKeyframeSArray,
               newValue: newKeyframeSArray
           });
       }, 150);


       hexInput.addEventListener('change', (e) => { // Handle direct hex input
                   let newHexFromText = e.target.value.trim();
                   if (!newHexFromText.startsWith("#")) newHexFromText = "#" + newHexFromText;

                   if (/^#[0-9A-F]{6}$/i.test(newHexFromText)) {
                       const oldKeyframeSArray = [...getValueByPath(lottieData, sp)]; // Capture BEFORE

                       picker.value = newHexFromText; // Sync color picker

                       const [nr, ng, nb] = hexToRgb(newHexFromText);
                       rawS[si * 4 + 1] = nr;
                       rawS[si * 4 + 2] = ng;
                       rawS[si * 4 + 3] = nb;
                       // Alpha preserved

                       reloadLottiePreview();

                       const newKeyframeSArray = [...rawS]; // Capture AFTER
                       recordChange({
                           type: 'ANIMATED_GRADIENT_KEYFRAME',
                           path: [...sp],
                           oldValue: oldKeyframeSArray,
                           newValue: newKeyframeSArray
                       });
                   } else {
                       alert("Invalid hex code. Please use format #RRGGBB.");
                       e.target.value = picker.value; // Revert to picker's value
                   }
               });

        // UI Assembly
        inputGroup.append(picker, hexInput); // Order: picker then hex, or as you prefer
        row.append(label, inputGroup);
        body.appendChild(row);
      }
    });

    header.addEventListener('click', () => {
      const open = body.classList.toggle('active');
      header.classList.toggle('active', open);
      body.style.display = open ? 'flex' : 'none'; // Or 'block' depending on your CSS for .gradient-content
      header.setAttribute('aria-expanded', open);
    });

    // Set initial aria attributes for the header
    header.setAttribute('role', 'button');
    header.setAttribute('aria-controls', body.id);


    accordion.append(header, body);
    container.appendChild(accordion);
  });


}




    // --- Utility Functions ---

    /**
     * Converts RGB color components (0-1 range) to a hex string.
     */
    function rgbToHex(r, g, b) {
      const rInt = Math.max(0, Math.min(255, Math.round(r * 255)));
      const gInt = Math.max(0, Math.min(255, Math.round(g * 255)));
      const bInt = Math.max(0, Math.min(255, Math.round(b * 255)));
      return "#" + [rInt, gInt, bInt].map(x => x.toString(16).padStart(2, "0")).join("");
    }

    /**
     * Converts a hex color string to RGB components (0-1 range).
     */
    function hexToRgb(hex) {
      const bigint = parseInt(hex.slice(1), 16);
      return [
        ((bigint >> 16) & 255) / 255,
        ((bigint >> 8) & 255) / 255,
        (bigint & 255) / 255
      ];
    }

    /**
     * Converts RGB color components (0-255 range) to a hex string (for gradients).
     */
    function rgbToHexGr(r, g, b) {
        const rInt = Math.max(0, Math.min(255, Math.round(r)));
        const gInt = Math.max(0, Math.min(255, Math.round(g)));
        const bInt = Math.max(0, Math.min(255, Math.round(b)));
        return '#' + [rInt, gInt, bInt].map(x => x.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Converts a hex color string to RGB components (0-255 range) (for gradients).
     */
    function hexToRGBGr(hex) {
      const value = hex.replace('#', '');
      return {
        r: parseInt(value.substring(0, 2), 16),
        g: parseInt(value.substring(2, 4), 16),
        b: parseInt(value.substring(4, 6), 16),
      };
    }


   function createLayerNamePill(layerName, shapeItem) { // Signature remains unchanged

    if (!shapeItem) {
        console.warn("createLayerNamePill was called with an undefined shapeItem for layer:", layerName); // Keep this useful warning
        return null; // Return null immediately if shapeItem doesn't exist
    }

  // Retrieve the propertyGroupIdentifier from the WeakMap
  const propertyGroupIdentifier = pillPropertyGroupMap.get(shapeItem);

  // --- NEW: Select icon based on shapeItem.ty ---
  let iconSvg;
  switch (shapeItem.ty) {
      case 'fl': // Fill
          iconSvg = FILL_ICON_SVG;
          break;
      case 'st': // Stroke
          iconSvg = STROKE_ICON_SVG;
          break;
      case 'gf': // Gradient Fill
      case 'gs': // Gradient Stroke
          iconSvg = GRADIENT_ICON_SVG;
          break;
      default:
          iconSvg = layerIconSvg; // Fallback to the generic layers icon
  }
  // --- END NEW ---

  const pill = document.createElement('span');
  pill.className = 'layer-name-pill';

  if (propertyGroupIdentifier) { // Store the group identifier on the pill if found
    pill.dataset.propertyGroupId = propertyGroupIdentifier;
  } else {
    // Fallback or legacy behavior: if no propertyGroupIdentifier is found,
    // you might want to use the old layerId logic or log a warning.
    // For now, we'll assume it should ideally always be found.
    // If not, the pill's toggle might not group correctly with others.
    console.warn("Pill created for shapeItem without a propertyGroupIdentifier in WeakMap. Layer:", layerName, "ShapeItem:", shapeItem);
    // Optionally, generate a less specific ID for fallback:
    // const layerId = layerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    // pill.dataset.layerId = layerId; // Old way for fallback
  }

  const iconWrapper = document.createElement('span');
  iconWrapper.className = 'pill-icon';
  iconWrapper.innerHTML = iconSvg.trim(); // Use the selected icon
  pill.appendChild(iconWrapper.firstChild);

  if (layerName) { // Only add text if a name is provided
    pill.appendChild(document.createTextNode(layerName));
  }

  pill.classList.toggle('hidden', !!(shapeItem && shapeItem.hd));
  pill.title = 'Click to toggle visibility of this property';
  pill.setAttribute('aria-label', 'Click to toggle visibility of this property');

  pill.addEventListener('click', e => {
      e.stopPropagation();
      if (!shapeItem) return;

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const newHiddenState = !shapeItem.hd;

      if (isCtrlOrCmd) {
          // --- GROUP TOGGLE LOGIC ---
          const clickedPill = e.currentTarget;
          const parentRow = clickedPill.closest('.color-row, .stop-row');
          const nameSpan = parentRow ? parentRow.querySelector('span[contenteditable="true"]') : null;

          if (nameSpan) {
              const layerNameToMatch = nameSpan.textContent;
              // Find all editable name spans with the same text content
              document.querySelectorAll('#editorArea span[contenteditable="true"]').forEach(otherNameSpan => {
                  if (otherNameSpan.textContent === layerNameToMatch) {
                      const otherParentRow = otherNameSpan.closest('.color-row, .stop-row');
                      const otherPill = otherParentRow ? otherParentRow.querySelector('.layer-name-pill') : null;
                      if (otherPill) {
                          // Find the associated shapeItem for the other pill to toggle its 'hd' property
                          const otherShapeItem = findShapeItemForPill(otherPill);
                          if (otherShapeItem) {
                              otherShapeItem.hd = newHiddenState;
                              otherPill.classList.toggle('hidden', newHiddenState);
                          }
                      }
                  }
              });
          }
      } else {
          // --- SINGLE/PROPERTY-GROUP TOGGLE LOGIC (Original Behavior) ---
          shapeItem.hd = newHiddenState;
          const groupId = e.currentTarget.dataset.propertyGroupId;
          if (groupId) {
              document.querySelectorAll(`.layer-name-pill[data-property-group-id="${groupId}"]`)
                  .forEach(el => el.classList.toggle('hidden', newHiddenState));
          } else {
              e.currentTarget.classList.toggle('hidden', newHiddenState);
          }
      }
      reloadLottiePreview();
  });

  return pill;
}

    function getLayerNameFromPath(lottieDataObject, objectPathArray) {
       let layerName = null;

       // Iterate upwards from the object's path to find its containing layer
       // We need to find a 'layers' segment in the path.
       for (let i = 0; i < objectPathArray.length -1; i++) { // Iterate up to path.length - 1 to safely access path[i+1]
           if (objectPathArray[i] === 'layers' && typeof objectPathArray[i + 1] === 'number') {
               // This segment of the path looks like '...layers[index]...'
               const pathToLayerObject = objectPathArray.slice(0, i + 2); // e.g., ['layers', 0] or ['assets', 0, 'layers', 1]
               try {
                   const layerObject = getValueByPath(lottieDataObject, pathToLayerObject);
                   if (layerObject && layerObject.nm) {
                       layerName = layerObject.nm;
                       // We take the *first* layer name encountered when going down the path.
                       // If a color is in a shape group within a layer, this will get the layer name.
                       break;
                   } else if (layerObject) {
                       // layerName = `Layer ${objectPathArray[i + 1]}`; // Fallback, but we prefer named layers
                       break; // Stop if we found a layer, even unnamed, to avoid picking up shape names later
                   }
               } catch (e) {
                   // console.warn("Could not get layer object for naming from path:", pathToLayerObject, e);
               }
           }
       }
        // If no layer name found through 'layers' array (e.g. color directly on a named root shape/group)
       if (!layerName && objectPathArray.length > 0) {
           try {
               // Path to the direct container of the property (e.g., shape item holding 'c' or 'g')
               const propertyContainerObject = getValueByPath(lottieDataObject, objectPathArray);
               if (propertyContainerObject && propertyContainerObject.nm) {
                   // This could be a shape group name. Only use if no layer name was found.
                   layerName = propertyContainerObject.nm;
               }
           } catch (e) { /* ignore */ }
       }
       return layerName;
   }

 function getLayerPathFromPropertyPath(path) {
   if (!Array.isArray(path)) return null;
 
   // Find the last 'layers' or 'assets' segment in the path.
   // This correctly handles nested pre-comps and top-level asset layers.
   for (let i = path.length - 2; i >= 0; i--) {
     const segment = path[i];
     const nextSegment = path[i + 1];
 
     // Check for standard layer paths: `...layers[index]...`
     // Or top-level pre-comp asset paths: `...assets[index]...`
     if ((segment === 'layers' || segment === 'assets') && typeof nextSegment === 'number') {
       // The path to the layer/asset is the part of the path up to and including the index.
       // e.g., for prop path ['assets', 0, 'layers', 1, 'shapes', ...], it returns ['assets', 0, 'layers', 1].
       // e.g., for prop path ['assets', 0, 'shapes', ...], it returns ['assets', 0].
       return path.slice(0, i + 2);
     }
   }
 
   return null; // If no valid layer/asset structure is found in the path.
 }

   function findShapeItemForPill(pillElement) {
       const propertyGroupId = pillElement.dataset.propertyGroupId;
       if (!propertyGroupId) return null;

       // This is an indirect way to find the shapeItem. We iterate through the WeakMap's known entries.
       // This is necessary because we can't reverse-lookup a WeakMap.
       // This assumes pillPropertyGroupMap is populated correctly.

       // The most reliable way is to find the path from the propertyGroupId and get the object.
       // The propertyGroupId is created from the property path.
       // e.g., 'layers-0-shapes-0-it-1-c-k' -> path is ['layers', 0, 'shapes', 0, 'it', 1, 'c', 'k']
       const pathArray = propertyGroupId.split('-');
       const numericPath = pathArray.map(p => isNaN(parseInt(p)) ? p : parseInt(p));

       // The shape path is the property path minus the last 2 elements (e.g., 'c', 'k')
       if (numericPath.length >= 2) {
           const shapePath = numericPath.slice(0, -2);
           try {
               const shapeItem = getValueByPath(lottieData, shapePath);
               return shapeItem;
           } catch (e) {
               console.error("Could not find shape item for pill from path:", shapePath, e);
               return null;
           }
       }

       return null;
   }

   function findPathToObject(root, target, currentPath = [], visited = new WeakSet()) {
       if (root === target) {
           return currentPath;
       }

       if (!root || typeof root !== 'object' || visited.has(root)) {
           return null;
       }
       visited.add(root);

       if (Array.isArray(root)) {
           for (let i = 0; i < root.length; i++) {
               const result = findPathToObject(root[i], target, [...currentPath, i], visited);
               if (result) return result;
           }
       } else {
           for (const key in root) {
               if (Object.prototype.hasOwnProperty.call(root, key)) {
                   // Skip purely internal/helper properties if any, though usually not needed for clean Lottie data
                   // if (key.startsWith('_') && key !== '_path') continue;
                   const result = findPathToObject(root[key], target, [...currentPath, key], visited);
                   if (result) return result;
               }
           }
       }
       return null;
   }





    /**
     * Recursively finds solid color definitions (like {c: {k: [r,g,b,a]}}) in the Lottie JSON.
     */
     function findColors(obj, path = []) {
          if (Array.isArray(obj)) {
            obj.forEach((item, i) => findColors(item, [...path, i]));
          } else if (typeof obj === 'object' && obj !== null) {
            // Check for solid color property: obj.c.k = [r,g,b,a] (and not animated: obj.c.a is 0 or not present)
            if (
              obj.hasOwnProperty('c') && typeof obj.c === 'object' && obj.c !== null &&
              obj.c.hasOwnProperty('k') && Array.isArray(obj.c.k) &&
              obj.c.k.length >= 3 && obj.c.k.length <= 4 && // [r,g,b] or [r,g,b,a]
              obj.c.k.every(val => typeof val === 'number') &&
              (!obj.c.hasOwnProperty('a') || obj.c.a === 0) // 'a':0 means static, 'a':1 means animated. No 'a' also means static.
            ) {
              // --- MODIFIED: Use getLayerNameFromPath ---
              // 'path' here is the path to the object containing the 'c' property.
              // getLayerNameFromPath expects the path to the object itself or its direct parent.
              // If 'c' is directly on a layer item, `path` is correct.
              // If 'c' is on a shape within a layer, `path` will lead to that shape.
              let layerName = getLayerNameFromPath(lottieData, path); // lottieData must be accessible

              // --- START FIX: Prioritize shape name over layer name ---
              const shapeObject = getValueByPath(lottieData, path);
              if (shapeObject && shapeObject.nm) {
                  layerName = shapeObject.nm;
              }
              // --- END FIX ---

              if (!layerName || layerName === 'Unnamed Layer' || layerName === 'Unknown Layer') {
                  layerName = 'Unnamed Element'; // A more generic fallback if no good name is found
              }
              // --- END MODIFICATION ---


              colorRefs.push({
                path: [...path, 'c', 'k'], // Path to the color array itself
                original: [...obj.c.k],    // Original [r,g,b,a] values
                layerName: layerName       // Determined layer name
              });
            }

            // Recursively search child properties
            for (let key in obj) {
              // Avoid re-processing assets from root level, only from initial call
              if (key !== 'assets' || path.length === 0) {
                findColors(obj[key], [...path, key]);
              }
            }
          }
        }
    /**
     * Retrieves a value from an object using a path array.
     */





    /**
     * Updates a specific solid color in the `lottieData` object.
     */
     function updateColor(ref, newHex) {
       const rgbNew = hexToRgb(newHex); // Calculate new RGB values
       const currentVal = getValueByPath(lottieData, ref.path); // Get current value (old value)

       // Ensure currentVal is an array and make a copy for oldValue
       const oldValueArray = Array.isArray(currentVal) ? [...currentVal] : [...rgbNew, 1]; // Fallback if path was invalid

       const currentAlpha = (Array.isArray(currentVal) && currentVal.length === 4) ? currentVal[3] : 1;
       const finalColorNew = [...rgbNew, currentAlpha]; // New color array

       // --- NEW: Record change (delta) ---
       recordChange({
         type: 'SOLID_COLOR',
         path: [...ref.path], // Store a copy of the path
         oldValue: oldValueArray,
         newValue: finalColorNew
       });
       // --- END NEW ---

       setValueByPath(lottieData, ref.path, finalColorNew);
       reloadLottiePreview();
     }

    /**
     * Extracts all gradient definitions from the Lottie JSON.
     */
     function extractGradientStops(json) {
         const gradients = [];
         const visited = new WeakSet();
         const stack = [json];

         try {
             while (stack.length > 0) {
                 const obj = stack.pop();

                 if (typeof obj !== 'object' || obj === null || visited.has(obj)) {
                     continue;
                 }
                 visited.add(obj);

                 // Check if it's a gradient fill (gf) and has gradient color data
                 if (obj.ty === 'gf' && obj.g?.k?.k && Array.isArray(obj.g.k.k) && obj.g.p) {

                     // 🚫 Ignore animated gradients:
                     if (obj.g.k.a === 1) {
                         console.log("Skipping animated gradient:", obj);
                         continue; // Skip processing this gradient since it's animated
                     }

                     const rawColorData = obj.g.k.k;
                     const numColorStops = obj.g.p;
                     const hasOpacity = rawColorData.length === numColorStops * 6;
                     const gradient = [];

                     for (let i = 0; i < numColorStops; i++) {
                         const colorBaseIndex = i * 4;
                         const offset = rawColorData[colorBaseIndex];
                         const r = rawColorData[colorBaseIndex + 1] * 255;
                         const g = rawColorData[colorBaseIndex + 2] * 255;
                         const b = rawColorData[colorBaseIndex + 3] * 255;
                         let a = 1;

                         if (hasOpacity) {
                             const opacityBaseIndex = numColorStops * 4 + i * 2;
                             a = rawColorData[opacityBaseIndex + 1];
                         }

                         gradient.push({
                             offset: Math.round(offset * 100),
                             r: Math.round(r),
                             g: Math.round(g),
                             b: Math.round(b),
                             a: parseFloat(a.toFixed(2)),
                             _path: obj // Store reference
                         });
                     }
                     gradients.push(gradient);
                 }

                 // Traverse deeper into the object tree
                 for (const value of Object.values(obj)) {
                     if (typeof value === 'object' && value !== null) {
                         if (Array.isArray(value)) {
                             for (let i = value.length - 1; i >= 0; i--) {
                                 if (typeof value[i] === 'object' && value[i] !== null) {
                                     stack.push(value[i]);
                                 }
                             }
                         } else {
                             stack.push(value);
                         }
                     }
                 }
             }
             return gradients;
         } catch (error) {
             console.error('Error extracting gradients:', error);
             return [];
         }
     }

    /**
     * Updates the Lottie JSON data based on changes made in the gradient editor UI.
     */
    function updateLottieGradient() {
        if (!lottieData || allGradients.length === 0) return;

        allGradients.forEach(gradientStops => {
            const gradientObj = gradientStops[0]?._path;
            if (!gradientObj || !gradientObj.g?.k?.k) {
                console.warn("Could not find original Lottie object for gradient:", gradientStops);
                return;
            }

            const rawColorData = gradientObj.g.k.k;
            const numColorStops = gradientObj.g.p;
            const needsOpacityUpdate = gradientStops.some(s => s.a !== 1);
            const colorDataLength = numColorStops * 4;
            const newRawData = new Array(needsOpacityUpdate ? numColorStops * 6 : numColorStops * 4);

            gradientStops.forEach((stop, i) => {
                const baseIndex = i * 4;
                newRawData[baseIndex]     = stop.offset / 100;
                newRawData[baseIndex + 1] = stop.r / 255;
                newRawData[baseIndex + 2] = stop.g / 255;
                newRawData[baseIndex + 3] = stop.b / 255;
            });

            if (needsOpacityUpdate) {
                gradientStops.forEach((stop, i) => {
                    const opacityBaseIndex = colorDataLength + i * 2;
                    newRawData[opacityBaseIndex]     = stop.offset / 100;
                    newRawData[opacityBaseIndex + 1] = stop.a;
                });
            }

            gradientObj.g.k.k = newRawData;
        });

        reloadLottiePreview();
    }


    /**
     * Reloads the Lottie animation preview with the current `lottieData`.
     */

     // Ensure 'isPlaying' is globally accessible and correctly maintained by playPauseBtn and seekbar interactions.
// For example, if you want the default to be playing (from a previous request):
// let isPlaying = true;

// No new global variable for 'lastInteractedFrame' is strictly needed with this approach,
// as currentFrame is read directly if paused.

function reloadLottiePreview() {
    let targetFrameForLoad = 0; // Default to frame 0

    if (animationInstance) {
        // If the animation was paused, we want to remember which frame it was on.
        // If it was playing, the new requirement is to restart from frame 0.
        if (!isPlaying) { // If the animation state was "paused"
            targetFrameForLoad = animationInstance.currentFrame;
        }
        // If isPlaying is true, targetFrameForLoad remains 0, as we'll play from the start.

        animationInstance.destroy();
        animationInstance = null;
    }
    // If there was no previous animationInstance, targetFrameForLoad remains 0.

    if (!lottieData || !lottiePreview) return;

    const playbackData = JSON.parse(JSON.stringify(lottieData));

    // The 'autoplay' option will reflect the 'isPlaying' state.
    // If isPlaying is true, Lottie might attempt to autoplay. We'll refine this in DOMLoaded.
    animationInstance = lottie.loadAnimation({
        container: lottiePreview,
        renderer: 'svg',
        loop: true,
        autoplay: isPlaying, // Set autoplay based on the desired state
        animationData: playbackData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet',
            fontFamily: 'Arial, Helvetica, sans-serif'
        }
    });

    animationInstance.setSpeed(currentSpeed);

    animationInstance.addEventListener('DOMLoaded', () => {
        if (animationInstance) {
            lottieSeekbar.max = animationInstance.totalFrames > 0 ? animationInstance.totalFrames - 1 : 0;

            if (isPlaying) {
                // If the desired state is "playing", start playing from the first frame.
                animationInstance.goToAndPlay(0, true);
                lottieSeekbar.value = 0;
            } else {
                // If the desired state is "paused", go to the target frame and stop.
                animationInstance.goToAndStop(targetFrameForLoad, true);
                lottieSeekbar.value = targetFrameForLoad;
            }
        }
    });

    animationInstance.addEventListener('enterFrame', () => {
        if (animationInstance && !lottieSeekbar.matches(':active')) { // Don't update if user is dragging
            lottieSeekbar.value = animationInstance.currentFrame;
        }
    });

    animationInstance.addEventListener('loopComplete', () => {
        if (isPlaying) { // if it is playing, it should continue to play after loop (from frame 0)
            animationInstance.goToAndPlay(0, true);
        }
        // If !isPlaying, it's paused, so on loopComplete, it should remain paused at the end frame.
        // The Lottie player usually stops at the last frame on loopComplete if loop is false.
        // Since loop is true here, this handler for isPlaying=true ensures it restarts.
        // If isPlaying=false, it should ideally stay at the currentFrame (which would be the end).
    });

    animationInstance.addEventListener('data_failed', () => { console.error("Lottie data failed to load in preview."); });
    animationInstance.addEventListener('error', (error) => { console.error("Lottie animation error:", error); });
}



     function renderColorPickers() {

    colorEditor.innerHTML = "";

    if (!initialColorGroups || Object.keys(initialColorGroups).length === 0) {
     updateDownloadButtonsState();
     return;
    }

    Object.entries(initialColorGroups).forEach(([originalGroupHex, refsInGroup]) => { // Renamed 'refs' to 'refsInGroup' for clarity
      let currentGroupHexDisplay; // This will be the hex shown in the accordion header
      if (refsInGroup.length > 0) {
        // Get the color from the first instance in the group as it currently exists in lottieData
        const [r, g, b] = getValueByPath(lottieData, refsInGroup[0].ref.path); // refsInGroup[0].ref is the actual colorRef object
        currentGroupHexDisplay = rgbToHex(r, g, b);
      } else {
        currentGroupHexDisplay = originalGroupHex; // Should not happen if group exists
      }

      const accordion = document.createElement("div");
      accordion.className = "accordion";
      accordion.dataset.id = originalGroupHex;

      const header = document.createElement("div");
      header.className = "accordion-header";

      const headerContent = document.createElement("div");
      headerContent.className = "accordion-header-content";

      const title = document.createElement("span");
      title.textContent = `${refsInGroup.length} Instance${refsInGroup.length > 1 ? 's' : ''}`;

      const controls = document.createElement("div");
      controls.className = "accordion-header-controls color-input-group";

      const groupHexInput = document.createElement("input");
      groupHexInput.type = "text";
      groupHexInput.value = currentGroupHexDisplay; // Use the current hex for display
      groupHexInput.setAttribute("aria-label", `Hex code for color group ${currentGroupHexDisplay}`);

      const groupColorInput = document.createElement("input");
      groupColorInput.type = "color";
      groupColorInput.value = currentGroupHexDisplay; // Use the current hex for display
      groupColorInput.setAttribute("aria-label", `Color picker for color group ${currentGroupHexDisplay}`);

      // ... (rest of header setup, event listeners for groupHexInput, groupColorInput remain the same) ...
      controls.appendChild(groupHexInput);
      controls.appendChild(groupColorInput);

      headerContent.appendChild(title);
      headerContent.appendChild(controls);
      header.appendChild(headerContent);

      const body = document.createElement("div");
      body.className = "accordion-body";
      body.id = `accordion-body-${originalGroupHex.replace('#','')}`;

      // --- Apply Preserved State ---
      if (preservedColorAccordionStates[originalGroupHex] === true) {
       header.classList.add('active');
       body.classList.add('active');
       body.style.display = "flex";
       header.setAttribute('aria-expanded', 'true');
      } else {
         body.style.display = "none";
         header.setAttribute('aria-expanded', 'false');
      }
      // --- End Apply Preserved State ---

      const handleHeaderInput = (newHex) => {
           if (!/^#[0-9A-F]{6}$/i.test(newHex)) return;

           const itemsToRecord = [];
           const newBaseRgb = hexToRgb(newHex);

           refsInGroup.forEach(({ ref }) => { // ref here is the actual colorRef object {path, original, layerName}
             const currentPath = [...ref.path];
             const currentValue = getValueByPath(lottieData, currentPath);
             const oldRgbaValue = Array.isArray(currentValue) && currentValue.length >= 3 ?
                                  [...currentValue] :
                                  [...newBaseRgb, 1];
             itemsToRecord.push({
               path: currentPath,
               oldValue: oldRgbaValue,
             });
             const existingAlpha = (Array.isArray(currentValue) && currentValue.length === 4) ? currentValue[3] : 1;
             const finalColorNewWithExistingAlpha = [...newBaseRgb, existingAlpha];
             setValueByPath(lottieData, currentPath, finalColorNewWithExistingAlpha);
           });

           if (itemsToRecord.length > 0) {
             recordChange({
               type: 'SOLID_COLOR_ACCORDION',
               items: itemsToRecord,
               newBaseRgbApplied: newBaseRgb
             });
           }
           // Update UI for accordion header and child rows
           groupColorInput.value = newHex; // Update header picker
           groupHexInput.value = newHex;   // Update header hex input

           const rows = body.querySelectorAll('.color-row');
           rows.forEach(row => {
             row.querySelector('input[type="color"]').value = newHex;
             row.querySelector('input[type="text"]').value = newHex;
           });
           reloadLottiePreview();
      };

      commitAfterIdle(groupColorInput, hex => handleHeaderInput(hex), 100);

      groupHexInput.addEventListener("change", (e) => {
          let newHex = e.target.value.trim();
          if (!newHex.startsWith("#")) newHex = "#" + newHex;
          if (/^#[0-9A-F]{6}$/i.test(newHex)) {
              handleHeaderInput(newHex);
          } else {
              alert("Invalid hex code. Please use format #RRGGBB.");
              groupHexInput.value = groupColorInput.value;
          }
      });

      // Iterate over instances within this color group
      refsInGroup.forEach((groupedItem, groupLocalIndex) => {
        const actualColorRef = groupedItem.ref; // This is { path, original, layerName }
        const globalOriginalIndex = groupedItem.index; // Original index from colorRefs array

        const colorArray = getValueByPath(lottieData, actualColorRef.path);
        if (!colorArray || colorArray.length < 3) return; // Should not happen if data is consistent

        const [r, g, b] = colorArray;
        const currentColorHex = rgbToHex(r, g, b); // Get current hex of this specific instance

        const row = document.createElement("div");
        row.className = "color-row";

        const labelWrapper = document.createElement('div');
          labelWrapper.className = 'title-wrapper';// Create a wrapper for main label and pill
         labelWrapper.style.display = 'flex';
         labelWrapper.style.alignItems = 'center';

         // --- REQ: Move pill to the left ---
         const fullPath = actualColorRef.path;
         const shapePath = fullPath.slice(0, -2);
         const shapeItem = getValueByPath(lottieData, shapePath);
         const propertyGroupIdentifier = pathToGroupId(actualColorRef.path);
         if (shapeItem) { pillPropertyGroupMap.set(shapeItem, propertyGroupIdentifier); }
         const propertyPill = createLayerNamePill(null, shapeItem); // Pass null for name
         if (propertyPill) { labelWrapper.appendChild(propertyPill); }

         const mainLabel = document.createElement("span"); // Changed from label to span for contentEditable
         // --- START REQ: Label is Layer Name, Pill is Property Name ---
         const layerPathForName = getLayerPathFromPropertyPath(actualColorRef.path);
         const layerObjectForName = layerPathForName ? getValueByPath(lottieData, layerPathForName) : null;
         const shapeObjectForPill = getValueByPath(lottieData, actualColorRef.path.slice(0, -2));

         let instanceLabelText = (layerObjectForName && layerObjectForName.nm) || `Layer ${groupLocalIndex + 1}`;
         let propertyNameForPill = (shapeObjectForPill && shapeObjectForPill.nm) || 'Unnamed Property';

         mainLabel.textContent = instanceLabelText;
         mainLabel.contentEditable = "true";
         mainLabel.spellcheck = false;
         mainLabel.title = "Click to edit layer name";
         mainLabel.style.cursor = "text";

         if (layerPathForName) {
             const layerNamePath = [...layerPathForName, 'nm'];
             mainLabel.addEventListener('blur', () => {
                 const oldName = getValueByPath(lottieData, layerNamePath) || '';
                 const newName = mainLabel.textContent.trim();
                 if (newName && oldName !== newName) {
                     setValueByPath(lottieData, layerNamePath, newName);
                     recordChange({ type: 'NAME_CHANGE', path: layerNamePath, oldValue: oldName, newValue: newName });
                     refreshUIStateAndRender();
                 } else {
                     mainLabel.textContent = oldName || instanceLabelText;
                 }
             });
             mainLabel.addEventListener('keydown', (e) => {
                 if (e.key === 'Enter') { e.preventDefault(); mainLabel.blur(); }
             });
         } else {
             mainLabel.contentEditable = "false";
             mainLabel.title = "Layer not found";
             mainLabel.style.cursor = "default";
         }

         labelWrapper.appendChild(mainLabel);

         // --- END NEW ---

        const inputGroup = document.createElement("div");
        inputGroup.className = "color-input-group";

        const hexInput = document.createElement("input");
        hexInput.type = "text";
        hexInput.value = currentColorHex; // Display current hex of this instance
        hexInput.id = `hex-input-${globalOriginalIndex}`;
        hexInput.setAttribute("aria-label", `Hex code for ${instanceLabelText}`);

        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.value = currentColorHex; // Display current hex of this instance
        colorInput.id = `color-input-${globalOriginalIndex}`;
        colorInput.setAttribute("aria-label", `Color picker for ${instanceLabelText}`);

        inputGroup.appendChild(hexInput); // Changed order to hex then picker, or keep as is
        inputGroup.appendChild(colorInput);

        const handleIndividualInput = (newHex) => {
           if (!/^#[0-9A-F]{6}$/i.test(newHex)) return;
           // Update this specific instance
           updateColor(actualColorRef, newHex); // updateColor handles recording and uses actualColorRef.path

           // Sync this row's inputs
           colorInput.value = newHex;
           hexInput.value = newHex;

           // Check if all instances in this group now match the newHex
           // If so, update the accordion header. Otherwise, header might show 'Multiple' or first item.
           // For simplicity, let's re-evaluate the header's display color based on the first item after this change.
           const firstItemInGroupPath = refsInGroup[0].ref.path;
           const [firstR, firstG, firstB] = getValueByPath(lottieData, firstItemInGroupPath);
           groupColorInput.value = rgbToHex(firstR, firstG, firstB);
           groupHexInput.value = rgbToHex(firstR, firstG, firstB);
           // A more sophisticated approach would be to check if ALL items in `refsInGroup` are `newHex`.
        };

        commitAfterIdle(colorInput, hex => handleIndividualInput(hex), 100);

        hexInput.addEventListener("change", (e) => {
              let newHex = e.target.value.trim();
              if (!newHex.startsWith("#")) newHex = "#" + newHex;
              if (/^#[0-9A-F]{6}$/i.test(newHex)) {
                  handleIndividualInput(newHex);
              } else {
                  alert("Invalid hex code. Please use format #RRGGBB.");
                  hexInput.value = colorInput.value;
              }
        });

        row.appendChild(labelWrapper);
        row.appendChild(inputGroup);
        body.appendChild(row);
      });

      header.addEventListener("click", (e) => {
        if (e.target.closest('input[type="color"], input[type="text"]')) {
          return;
        }
        const isActive = body.classList.toggle("active");
        header.classList.toggle("active", isActive);
        body.style.display = isActive ? "flex" : "none";
        header.setAttribute('aria-expanded', isActive);
      });
      header.setAttribute('aria-expanded', 'false');
      header.setAttribute('role', 'button');
      header.setAttribute('aria-controls', body.id);

      accordion.appendChild(header);
      accordion.appendChild(body);
      colorEditor.appendChild(accordion);
    });

    updateDownloadButtonsState();
  }
    /**
     * Renders the accordion UI for editing gradient stops.
     */
    function renderGradientEditor() {


      const mainLabel = document.getElementById('gradientInstancesLabel'); // The H3 heading "Detected Text"




        stopEditor.innerHTML = '';

        if (allGradients.length === 0) {
                if (mainLabel) mainLabel.style.display = 'none';
             return;
        }

          if (mainLabel) mainLabel.style.display = 'block';

        allGradients.forEach((gradientStops, index) => {
          const gradientId = String(index);
            const accordion = document.createElement('div');
            accordion.className = 'gradient-accordion';
            accordion.dataset.id = gradientId;

            const header = document.createElement('div');
            header.className = 'gradient-header';

            const headerContent = document.createElement("div");
            headerContent.className = "accordion-header-content";

            // Left part of header: Title and Pill
                      const titlePillWrapper = document.createElement('div');
                      titlePillWrapper.className = 'title-wrapper';

                      const title = document.createElement("span"); // Changed to span for contentEditable

                      const gradientObjRefForPath = gradientStops[0]?._path;
                      const pathToGradientObject = gradientObjRefForPath ? findPathToObject(lottieData, gradientObjRefForPath) : null;
                      const layerPathForName = pathToGradientObject ? getLayerPathFromPropertyPath(pathToGradientObject) : null;
                      const layerObjectForName = layerPathForName ? getValueByPath(lottieData, layerPathForName) : null;

                      let gradientLabelText = (layerObjectForName && layerObjectForName.nm) || `Layer ${index + 1}`;
                      title.textContent = gradientLabelText;

                      title.contentEditable = "true";
                      title.spellcheck = false;
                      title.title = "Click to edit name";
                      title.style.cursor = "text";

                      if (layerPathForName) {
                          const layerNamePath = [...layerPathForName, 'nm'];
                          title.addEventListener('blur', () => {
                              const oldName = getValueByPath(lottieData, layerNamePath) || '';
                              const newName = title.textContent.trim();
                              if (newName && oldName !== newName) {
                                  setValueByPath(lottieData, layerNamePath, newName);
                                  recordChange({ type: 'NAME_CHANGE', path: layerNamePath, oldValue: oldName, newValue: newName });
                                  refreshUIStateAndRender();
                              } else {
                                  title.textContent = oldName || gradientLabelText;
                              }
                          });
                          title.addEventListener('keydown', (e) => {
                              if (e.key === 'Enter') { e.preventDefault(); title.blur(); }
                          });
                      } else {
                          title.contentEditable = "false";
                          title.title = "Layer not found";
                          title.style.cursor = "default";
                      }

                      titlePillWrapper.appendChild(title);

                      const gradientObjRef = gradientStops[0]?._path;
                      if (gradientObjRef && lottieData) {
                          if (pathToGradientObject) {
                              // --- REQ: Move pill to the left ---
                              const shapeItem = getValueByPath(lottieData, pathToGradientObject);
                              const propertyGroupIdentifier = pathToGroupId(pathToGradientObject);
                              pillPropertyGroupMap.set(shapeItem, propertyGroupIdentifier);

                              const propertyPill = createLayerNamePill(null, shapeItem); // Pass null for name
                              if (propertyPill) {
                                  // Prepend the pill before the title
                                  titlePillWrapper.insertBefore(propertyPill, title);
                              }
                          }
                      }
                      headerContent.appendChild(titlePillWrapper); // Add title+pill group to left



            const gradientPreview = document.createElement('div');
            gradientPreview.className = 'gradient-preview';
            gradientPreview.setAttribute('aria-label', `Preview for Gradient ${index + 1}`);


            headerContent.appendChild(gradientPreview);
            header.appendChild(headerContent);

            const contentBody = document.createElement('div');
            contentBody.className = 'gradient-content';
             contentBody.id = `gradient-body-${index}`;


             // --- APPLY PRESERVED STATE ---
              if (preservedGradientAccordionStates[gradientId] === true) {
                  header.classList.add('active');
                  contentBody.classList.add('active'); // Your CSS might use this
                  contentBody.style.display = 'flex'; // Or "block"
                  header.setAttribute('aria-expanded', 'true');
              } else {
                  contentBody.style.display = 'none'; // Default to closed
                  header.setAttribute('aria-expanded', 'false');
              }
              // --- END APPLY PRESERVED STATE ---


            gradientStops.forEach((stop, i) => {
                const row = document.createElement('div');
                row.className = 'stop-row';

                const label = document.createElement('span');
                label.className = 'label';
                label.textContent = `Stop ${i + 1}`;

                const stopControls = document.createElement('div');
                stopControls.className = 'stop-controls';

                const dot = document.createElement('div');
                dot.className = 'color-dot';
                dot.style.backgroundColor = `rgba(${stop.r}, ${stop.g}, ${stop.b}, ${stop.a ?? 1})`;

                const alphaInput = document.createElement('input');
                alphaInput.type = 'number';
                alphaInput.min = 0;
                alphaInput.max = 100;
                alphaInput.step = 1;
                alphaInput.value = Math.round((stop.a ?? 1) * 100);
                alphaInput.setAttribute('aria-label', `Opacity for Stop ${i + 1} in Gradient ${index + 1}`);
                alphaInput.title = `Opacity (0 to 100)`;

                const inputGroup = document.createElement("div");
                inputGroup.className = "color-input-group";

                const hexInput = document.createElement('input');
                hexInput.type = 'text';
                hexInput.value = rgbToHexGr(stop.r, stop.g, stop.b);
                hexInput.setAttribute('aria-label', `Hex code for Stop ${i + 1} in Gradient ${index + 1}`);
                hexInput.title = `Hex Color Code`;

                const colorInput = document.createElement('input');
                colorInput.type = 'color';
                colorInput.value = rgbToHexGr(stop.r, stop.g, stop.b);
                colorInput.setAttribute('aria-label', `Color picker for Stop ${i + 1} in Gradient ${index + 1}`);
                colorInput.title = `Color Picker`;

                inputGroup.appendChild(hexInput);
                inputGroup.appendChild(colorInput);

                const updateStopColor = (hex) => {
                    if (!/^#([0-9A-Fa-f]{6})$/i.test(hex)) return;
                    const { r, g, b } = hexToRGBGr(hex);
                    stop.r = r;
                    stop.g = g;
                    stop.b = b;
                    dot.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${stop.a ?? 1})`;
                    colorInput.value = hex;
                    updateGradientPreviewStyle();
                    updateLottieGradient();
                };

                /*colorInput.addEventListener('change', (e) => {
                  const newHex = e.target.value;
                  const { r: oldR, g: oldG, b: oldB, a: oldA } = stop; // Capture old stop data

                  // --- NEW: Record change (delta) ---
                  const oldStopData = { r: oldR, g: oldG, b: oldB, a: oldA, offset: stop.offset }; // Include offset for completeness if needed for redo, though not changing it

                  const newRgb = hexToRGBGr(newHex);
                  const newStopData = { r: newRgb.r, g: newRgb.g, b: newRgb.b, a: oldA, offset: stop.offset };

                  recordChange({
                  type: 'GRADIENT_STOP',
                  gradientIndex: index, // Index of the current gradient in allGradients
                  stopIndex: i,         // Index of the current stop in gradientStops
                  oldStopData: oldStopData,
                  newStopData: newStopData
                  });
                  // --- END NEW ---

                  hexInput.value = newHex;
                  updateStopColor(newHex);
                });*/

                commitAfterIdle(colorInput, (newHex) => {
                 const { r: oldR, g: oldG, b: oldB, a: oldA } = stop;

                // Record change (delta) once per drag
                 const oldStopData = { r: oldR, g: oldG, b: oldB, a: oldA, offset: stop.offset };
                const { r: nr, g: ng, b: nb } = hexToRGBGr(newHex);
                 const newStopData = { r: nr, g: ng, b: nb, a: oldA, offset: stop.offset };

                 recordChange({
                  type: 'GRADIENT_STOP',
                   gradientIndex: index,
                   stopIndex: i,
                   oldStopData,
                   newStopData
                 });

                 hexInput.value = newHex;
                 updateStopColor(newHex);
               }, 150);



                hexInput.addEventListener('change', (e) => {
                  let newHexVal = e.target.value.trim();
                  if (!newHexVal.startsWith("#")) newHexVal = "#" + newHexVal;
                  if (/^#([0-9A-Fa-f]{6})$/i.test(newHexVal)) {
                    const { r: oldR, g: oldG, b: oldB, a: oldA } = stop; // Capture old stop data

                    // --- NEW: Record change (delta) ---
                    const oldStopData = { r: oldR, g: oldG, b: oldB, a: oldA, offset: stop.offset };

                    const newRgb = hexToRGBGr(newHexVal);
                    const newStopData = { r: newRgb.r, g: newRgb.g, b: newRgb.b, a: oldA, offset: stop.offset };

                    recordChange({
                      type: 'GRADIENT_STOP',
                      gradientIndex: index,
                      stopIndex: i,
                      oldStopData: oldStopData,
                      newStopData: newStopData
                    });
                    // --- END NEW ---
                    updateStopColor(newHexVal);
                  } else {
                    alert("Invalid hex code. Please use format #RRGGBB.");
                    hexInput.value = colorInput.value;
                  }
                });

                alphaInput.addEventListener('change', (e) => {
                  let value100 = parseInt(e.target.value, 10);
                  if (isNaN(value100)) value100 = 0;
                  else value100 = Math.max(0, Math.min(100, value100));
                  e.target.value = value100; // Update input field immediately

                  const newAlpha = value100 / 100;
                  const { r: oldR, g: oldG, b: oldB, a: oldA } = stop; // Capture old stop data

                  // --- NEW: Record change (delta) ---
                  const oldStopData = { r: oldR, g: oldG, b: oldB, a: oldA, offset: stop.offset };
                  const newStopData = { r: oldR, g: oldG, b: oldB, a: newAlpha, offset: stop.offset };

                  recordChange({
                    type: 'GRADIENT_STOP',
                    gradientIndex: index,
                    stopIndex: i,
                    oldStopData: oldStopData,
                    newStopData: newStopData
                  });
                  // --- END NEW ---

                  stop.a = newAlpha; // Apply the change to the stop object
                  dot.style.backgroundColor = `rgba(${stop.r}, ${stop.g}, ${stop.b}, ${stop.a})`;
                  updateGradientPreviewStyle(); // This function is local to renderGradientEditor
                  updateLottieGradient(); // This updates lottieData based on allGradients
                });;

                stopControls.appendChild(dot);
                stopControls.appendChild(alphaInput);
                stopControls.appendChild(inputGroup);
                row.appendChild(label);
                row.appendChild(stopControls);
                contentBody.appendChild(row);
            });

            function updateGradientPreviewStyle() {
                const sortedStops = [...gradientStops].sort((a, b) => a.offset - b.offset);
                const gradientStyle = `linear-gradient(to right, ${sortedStops.map(stop =>
                    `rgba(${stop.r}, ${stop.g}, ${stop.b}, ${stop.a ?? 1}) ${stop.offset}%`
                ).join(', ')})`;
                gradientPreview.style.background = gradientStyle;
            }

            updateGradientPreviewStyle();

            header.addEventListener('click', (e) => {
                 if (e.target.closest('.gradient-preview') || e.target.isContentEditable) {
                     return; // Do not toggle if clicking on preview or an editable element
                 }
                const isActive = contentBody.classList.toggle("active");
                header.classList.toggle("active", isActive);
                contentBody.style.display = isActive ? 'flex' : 'none';
                header.setAttribute('aria-expanded', isActive);
            });

            header.setAttribute('aria-expanded', 'false');
            header.setAttribute('role', 'button');
            header.setAttribute('aria-controls', `gradient-body-${index}`);
            contentBody.id = `gradient-body-${index}`;

            accordion.appendChild(header);
            accordion.appendChild(contentBody);
            stopEditor.appendChild(accordion);
        });

        updateDownloadButtonsState();
    }

    /**
     * Updates the enabled/disabled state of download and editor buttons.
     */
    function updateDownloadButtonsState() {
        const isDataLoaded = !!lottieData;

        // JSON Download Button
        downloadJsonBtn.disabled = !isDataLoaded;
        downloadJsonBtn.style.display = isDataLoaded ? 'inline-flex' : 'none';

        // GIF Download Button
        downloadGifBtn.disabled = !isDataLoaded;
        downloadGifBtn.style.display = isDataLoaded ? 'inline-flex' : 'none';

        // Trim Overlay Button
        openOverlayBtn.disabled = !isDataLoaded;
        // openOverlayBtn.style.opacity = isDataLoaded ? "1" : "0.5"; // Opacity handled by :disabled state

        // *** NEW: Crop Overlay Button ***
        openCropBtn.disabled = !isDataLoaded;
        // openCropBtn.style.opacity = isDataLoaded ? "1" : "0.5"; // Opacity handled by :disabled state

      openAssetReplacerBtn.disabled = !isDataLoaded;
        // GIF Options Card
        const gifOptionsCard = document.getElementById('gifOptionsCard');
        if (gifOptionsCard) {
            gifOptionsCard.style.display = isDataLoaded ? 'block' : 'none';
        }
        // JSON Editor Card
        const jsonEditorCard = document.getElementById('jsonEditorCard');
        if (jsonEditorCard) {
            jsonEditorCard.style.display = isDataLoaded ? 'block' : 'none';
        }
    }

    /**
     * Cleans the Lottie data object by removing internal properties before export.
     */
    function cleanForExport(obj) {
        if (Array.isArray(obj)) {
            return obj.map(cleanForExport);
        }
        if (typeof obj === 'object' && obj !== null) {
            const clean = {};
            for (const [key, value] of Object.entries(obj)) {
                if (key.startsWith('_') || key === 'completed' || key === '__complete') {
                    continue;
                }
                clean[key] = cleanForExport(value);
            }
            return clean;
        }
        return obj;
    }


    /**
     * Handles the file input change event. Reads the JSON file, parses it,
     * initializes the editors, and updates the UI.
     */


     function playDragDropSegment(name, loop = false, speed = 1) { // Added speed parameter with default 1
     if (!dragDropLottieAnimation || !dragDropLottieAnimation.isLoaded) {
         console.warn(`dragDropLottie animation not ready or segment "${name}" play requested too early.`);
         return;
     }
     if (!dragDropSegments[name] || dragDropSegments[name].length === 0) {
         console.warn(`Segment "${name}" not found or defined in dragDropSegments for dragDropLottie.`);
         // Fallback to idle if a segment is missing, and use the defined idle speed
         if (name !== 'idle' && dragDropSegments.idle && dragDropSegments.idle.length > 0) {
             console.warn(`Falling back to "idle" segment.`);
             const [idleStart, idleEnd] = dragDropSegments.idle;
             dragDropCurrentSegment = 'idle';
             dragDropLottieAnimation.setSpeed(DRAG_DROP_SPEEDS.idle); // Use defined idle speed for fallback
             dragDropLottieAnimation.loop = true; // Idle is usually looped
             dragDropLottieAnimation.playSegments([idleStart, idleEnd], true);
         }
         return; // Exit after handling fallback or if no fallback possible
     }

     const [start, end] = dragDropSegments[name];
     dragDropCurrentSegment = name;
     dragDropLottieAnimation.setSpeed(speed); // Set speed for the requested segment
     dragDropLottieAnimation.loop = loop;
     dragDropLottieAnimation.playSegments([start, end], true);
 }

     function onDragDropSegmentComplete() {
         if (dragDropCurrentSegment === 'catch') {
             playDragDropSegment('idle', true, DRAG_DROP_SPEEDS.idle); // After 'catch' completes, go back to looping 'idle'
             isFileOverDropZone = false; // Reset flag after processing a drop
         }
         // For 'idle' and 'waiting', if their loop property was true, they will loop.
         // If loop was false and they complete, they stop, which is fine for 'catch'.
     }


     function handleDragOver(e) {
         e.preventDefault();

         // --- ADD THIS BLOCK TO HIDE CHAT BUBBLE ON DRAGOVER ---
             // Check if files are part of the drag operation
             if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
                 const chatBubble = document.querySelector('.chat-bubble');
                 if (chatBubble && chatBubble.style.display !== 'none') { // Check if not already hidden
                     chatBubble.style.display = 'none';
                 }
             }
             // --- END OF BLOCK TO HIDE CHAT BUBBLE ---

         dragDropOverlay.classList.add('dragover');
         isFileOverDropZone = true; // Set flag as file is now over
         if (dragDropCurrentSegment !== 'waiting' && dragDropLottieAnimation && dragDropLottieAnimation.isLoaded) {
             playDragDropSegment('waiting', true, DRAG_DROP_SPEEDS.waiting); // Switch to looping 'waiting' segment
         }
     }
     function handleDragLeave(e) {
         e.preventDefault();
         dragDropOverlay.classList.remove('dragover');
         isFileOverDropZone = false; // File is no longer over
         // Delay slightly to check if a drop event is fired immediately after.
         // This prevents quickly switching to idle if a drop is about to happen.
         setTimeout(() => {
             if (!isFileOverDropZone && dragDropCurrentSegment === 'waiting' && dragDropLottieAnimation && dragDropLottieAnimation.isLoaded) {
                  // If file is truly gone (not dropped) and we were 'waiting'
                  playDragDropSegment('idle', true, DRAG_DROP_SPEEDS.idle); // Go back to looping 'idle'
             }
         }, 100); // 100ms delay
     }

     function handleDrop(e) {
         e.preventDefault();
         dragDropOverlay.classList.remove('dragover');
         isFileOverDropZone = true; // Indicate that a file operation is in progress

         if (dragDropLottieAnimation && dragDropLottieAnimation.isLoaded) {
             playDragDropSegment('catch', false, DRAG_DROP_SPEEDS.catch); // Play 'catch' segment once
         }

         const files = e.dataTransfer.files;
             if (files.length > 0) {
                 const file = files[0];
                 if (file.type === "application/json" || file.name.endsWith('.json')|| file.name.endsWith('.lottie')) {
                     const dataTransfer = new DataTransfer();
                     dataTransfer.items.add(file);
                     fileInput.files = dataTransfer.files;
                     handleFileLoad({ target: fileInput }, true); // Pass 'true' for fromDrop
                 } else {
                     alert('Please drop a JSON file or a .lottie');
                     isFileOverDropZone = false;
                     if (dragDropLottieAnimation && dragDropLottieAnimation.isLoaded) {
                         playDragDropSegment('idle', true, DRAG_DROP_SPEEDS.idle);
                     }
                 }
             } else {
                 isFileOverDropZone = false;
                 if (dragDropLottieAnimation && dragDropLottieAnimation.isLoaded) {
                     playDragDropSegment('idle', true, DRAG_DROP_SPEEDS.idle);
                 }
             }
     }


dragDropOverlay.addEventListener('click', () => {
  fileInput.click();
});

// Add event listeners for drag and drop
dragDropOverlay.addEventListener('dragover', handleDragOver);
dragDropOverlay.addEventListener('dragleave', handleDragLeave);
dragDropOverlay.addEventListener('drop', handleDrop);




async function handleFileLoad(e, fromDrop = false) { // fromDrop parameter is correctly present
    const file = e.target.files[0];
    initialColorGroups = null;
    initialAnimatedColorGroupsByHex = null;
 const uploadButtonWrapper = document.getElementById('uploadButtonWrapper');

    if (!file) {
        if (fromDrop) isFileOverDropZone = false;
        if (!fromDrop && dragDropLottieAnimation && dragDropLottieAnimation.isLoaded && dragDropCurrentSegment === 'waiting') {
                 playDragDropSegment('idle', true, DRAG_DROP_SPEEDS.idle);
             }
             if (uploadButtonWrapper) {
                 uploadButtonWrapper.classList.remove('animate-out');
                 // Optionally reset styles if needed for immediate reversion on cancel
                 // uploadButtonWrapper.style.opacity = '1';
                 // uploadButtonWrapper.style.transform = 'scaleX(1)';
             }
             return;
    }

    if (file.name.endsWith('.lottie')) {
           try {
               // Optional UI update
               originalUploadedDotLottieFile = file; // Save the pristine File object
               isDotLottieLoaded = true;
               activeDotLottieOriginalName = file.name;
              updateActiveWindowTitle(activeDotLottieOriginalName, true);
              // convertDotLottieToJson returns an object: { animations: [...], hasStateMachines: boolean, stateMachines: [...] }
              const conversionResult = await convertDotLottieToJson(file);
              const lottieAnimationObjects = conversionResult.animations;
              const rawStateMachines = conversionResult.stateMachines || [];

              if (!lottieAnimationObjects || lottieAnimationObjects.length === 0) {
                   throw new Error("No animations found within the .lottie file.");
               }

               // --- NEW: Assign default animation to states with empty animation property ---
               const firstAnimationName = lottieAnimationObjects[0]?.originalPath.split('/').pop().replace(/\.json$/i, '');

               if (firstAnimationName && rawStateMachines.length > 0) {
                   rawStateMachines.forEach(sm => {
                       if (sm && Array.isArray(sm.states)) {
                           sm.states.forEach(state => {
                               if (state && state.animation === "") {
                                   state.animation = firstAnimationName;
                                   console.log(`Assigned default animation '${firstAnimationName}' to state '${state.name}'.`);
                               }
                           });
                       }
                   });
               }
               loadedStateMachines = rawStateMachines; // Store the processed state machines
               // --- END NEW ---

              // Update State Machine Button Style
             updateStateMachineButtonState(conversionResult.hasStateMachines);
              // --- END NEW ---


              const mockFileObjects = [];
               lottieAnimationObjects.forEach((animObject, index) => {
                   try {
                       // Ensure jsonString is valid before creating a Blob/File
                       const jsonDataTest = JSON.parse(animObject.jsonString);
                       if (!jsonDataTest.v) { // Basic Lottie validation
                           console.warn(`Skipping invalid Lottie JSON data from .lottie at path: ${animObject.originalPath}`);
                           return; // Skip this one
                       }

                       let derivedFileName = animObject.originalPath.split('/').pop(); // e.g., "animation1.json"
                       // Ensure it has a .json extension, and make it unique if needed based on original .lottie name
                       if (!derivedFileName || !derivedFileName.toLowerCase().endsWith('.json')) {
                           derivedFileName = `animation_${index}.json`;
                       }
                       // You might want to prefix with the .lottie file name for clarity if it's not already part of originalPath
                       // Example: derivedFileName = `${file.name}-${derivedFileName}`;

                       const blob = new Blob([animObject.jsonString], { type: 'application/json' });
                       const mockFile = new File([blob], derivedFileName, { type: 'application/json' });
                       mockFileObjects.push(mockFile);
                   } catch (parseError) {
                       console.error(`Error processing an animation from .lottie file (${animObject.originalPath}):`, parseError);
                   }
               });

               if (mockFileObjects.length > 0) {
                   const mockEvent = {
                       target: {
                           files: mockFileObjects // FileList-like array
                       }
                       // Add other properties if handleMultipleFiles expects them from the event, though unlikely for 'target.files'
                   };
                   // Delegate to handleMultipleFiles
                   await handleMultipleFiles(mockEvent);
                   // IMPORTANT: Return here to prevent handleFileLoad from doing its single-file processing
                   // for the original .lottie file after handleMultipleFiles has run.
                   if (fileInput) fileInput.value = ''; // Reset original input
                   return;
               } else {
                   throw new Error("No valid individual Lottie animations could be extracted to process.");
               }

           } catch (err) {
               console.error("Error processing .lottie file in handleFileLoad:", err);
               alert(`Error loading .lottie file: ${err.message}`);
               resetUI(); // Or your specific error handling
               // ... (your existing error UI updates for drag-drop animation if applicable) ...
           }
       }


    const reader = new FileReader();
    reader.onload = async (event) => {
      try {

        let finalstring;
        if (file.name.endsWith('.lottie')) {
          console.log('we are doing this');
               // If it's a .lottie file, convert the ArrayBuffer to JSON string
               finalstring = await convertDotLottieToJson(file);
           } else {
               // If it's a JSON file, event.target.result is already the JSON string
               finalstring = event.target.result;

           }

        lottieData = JSON.parse(finalstring);

        if (!lottieData.v || !lottieData.fr || !lottieData.w || !lottieData.h || !lottieData.layers) {
            throw new Error("File does not appear to be a valid Lottie JSON.");
        }


    // --- MODIFIED SECTION: Start button wrapper animation and Lottie 'catch' ---
       if (dragDropLottieAnimation && dragDropLottieAnimation.isLoaded) {
           playDragDropSegment('catch', false, DRAG_DROP_SPEEDS.catch);
       }
       if (uploadButtonWrapper) {
           uploadButtonWrapper.classList.add('animate-out');
       }

       // --- END MODIFIED SECTION ---




        originalLottieDataForReset = JSON.parse(JSON.stringify(lottieData));
        undoStack = [];
        redoStack = [];

        originalFrameRate = lottieData.fr;
        animWidth = lottieData.w;
        animHeight = lottieData.h;
        originalAnimationDuration = (lottieData.op - lottieData.ip) / lottieData.fr;

        const gifScale4xOption = document.getElementById('gifScale4x');
        const gifScale8xOption = document.getElementById('gifScale8x');
        if (gifScale4xOption && gifScale8xOption) {
            if (animWidth < 101 || animHeight < 101) {
                gifScale4xOption.hidden = false;
                gifScale8xOption.hidden = false;
            } else {
                gifScale4xOption.hidden = true;
                gifScale8xOption.hidden = true;
                const gifScaleSelect = document.getElementById('gifScale');
                if (gifScaleSelect.value === '4' || gifScaleSelect.value === '8') {
                    gifScaleSelect.value = '1';
                }
            }
        }

        colorRefs = [];
        allGradients = [];
        preservedTextAccordionStates = {};
        findColors(lottieData);

        detectedTextElements = [];
        findTextLayersRecursive(lottieData.layers, '', ['lottieData']);
        if (lottieData.assets) {
            lottieData.assets.forEach((asset, assetIndex) => {
                if (asset.layers) {
                    findTextLayersRecursive(asset.layers, asset.id || `asset${assetIndex}_`, ['lottieData', 'assets', assetIndex]);
                }
            });
        }

        initialColorGroups = {};
        colorRefs.forEach((ref, i) => {
            const colorArray = getValueByPath(lottieData, ref.path);
            if (!colorArray || colorArray.length < 3) return;
            const [r, g, b] = colorArray;
            const initialHex = rgbToHex(r, g, b);
            if (!initialColorGroups[initialHex]) {
                initialColorGroups[initialHex] = [];
            }
            initialColorGroups[initialHex].push({ ref: ref, index: i, originalHex: initialHex });
        });

        animatedColorRefs = [];
        findAnimatedColors(lottieData);

        initialAnimatedColorGroupsByHex = {};
        if (Array.isArray(animatedColorRefs)) {
          animatedColorRefs.forEach(animProperty => {
            if (!Array.isArray(animProperty.keyframePaths) || animProperty.keyframePaths.length === 0) {
              return;
            }
            const propertyContainerPath = animProperty.path.slice(0, -2);
            const layerName = getLayerNameFromPath(lottieData, propertyContainerPath) || 'Unknown Layer';
            animProperty.keyframePaths.forEach(kfPath => {
              const rawKeyframeColorArray = getValueByPath(lottieData, kfPath);
              if (!Array.isArray(rawKeyframeColorArray) || rawKeyframeColorArray.length < 3) {
                return;
              }
              const [r_norm, g_norm, b_norm, a_norm = 1] = rawKeyframeColorArray;
              const initialHexForGrouping = rgbToHex(r_norm, g_norm, b_norm);
              if (!initialAnimatedColorGroupsByHex[initialHexForGrouping]) {
                initialAnimatedColorGroupsByHex[initialHexForGrouping] = [];
              }
              const keyframeIndex = kfPath[kfPath.length - 2];
              initialAnimatedColorGroupsByHex[initialHexForGrouping].push({
                kfPath: [...kfPath],
                layerName: layerName,
                originalPropertyPath: [...animProperty.path],
                keyframeIndex: keyframeIndex,
                initialAlpha: a_norm,
                originalHexGroup: initialHexForGrouping
              });
            });
          });
        }

       allGradients = extractGradientStops(lottieData);

        // --- FIX: Find animated gradients BEFORE checking if they exist ---
        animatedGradientRefs = findAnimatedGradients(lottieData);
        const hasAnimatedGradients = animatedGradientRefs.length > 0;
        // --- END FIX ---

        const hasSolidColors = colorRefs.length > 0;
        const hasGradients = allGradients.length > 0;
        const hasAnimatedSolidColors = animatedColorRefs.length > 0;
        const hasText = detectedTextElements.length > 0;
        const animatedGradientLabelEl = document.getElementById('animatedGradientLabel');
        const animatedGradientContainer = document.getElementById('animatedGradientEditor');
        anyContent = hasSolidColors || hasGradients || hasAnimatedSolidColors || hasAnimatedGradients || hasText;

        const emptyStateDiv = document.getElementById('emptyStateDiv');
        const colorInstancesLabel = document.getElementById('colorInstancesLabel');
        const editorAreaDiv = document.getElementById('editorArea');

        if (!anyContent) {
          colorEditor.style.display = 'none';
          stopEditor.style.display = 'none';
          if (colorInstancesLabel) colorInstancesLabel.style.display = 'none';
          if(animatedGradientLabelEl) animatedGradientLabelEl.style.display = 'none';
          if (emptyStateDiv) emptyStateDiv.style.display = 'flex';
          if (editorAreaDiv) editorAreaDiv.classList.add('is-empty');
        } else {
            colorInstancesLabel.style.display = 'none';
            if(hasSolidColors){
                colorEditor.style.display = 'block';
               stopEditor.style.display = 'block';
               if (colorInstancesLabel) colorInstancesLabel.style.display = 'block';
            }
          
          if (emptyStateDiv) emptyStateDiv.style.display = 'none';
          if (editorAreaDiv) editorAreaDiv.classList.remove('is-empty');
          renderColorPickers();
          renderGradientEditor();
          renderAnimatedColorEditor();
          renderAnimatedGradientEditor();
          renderTextEditorUI();
        }

        reloadLottiePreview();
        updateDurationPillDisplay();
        initializeElementsToManageVisibility();
        if(!anyContent){
          document.getElementById('activateColorPickerBtn').style.display = 'none';
        }
        updateActiveWindowTitle(file.name, false);

        // --- FIX: Explicitly reset the state machine button for single JSON files ---
        if (!isDotLottieLoaded) {
            updateStateMachineButtonState(false);
        }
        updateDownloadButtonsState();


        lottiePreview.addEventListener('dragover', handleLottiePreviewDragOver);
lottiePreview.addEventListener('dragleave', handleLottiePreviewDragLeave);
lottiePreview.addEventListener('drop', handleLottiePreviewDrop);
isLottiePreviewDropZoneActive = true;

        // The following lines (previously around 1003-1004 and 1008-1047) are now MOVED
        // into the 'if (fromDrop)' conditions below.

        // ----- START: Conditional execution of uploadWrapper animation -----
        if(!firstInitialization) {
          const windowContainer = document.querySelector('.window-container');
          const previewAreaEl = document.getElementById('previewArea');
          const previewRect = previewAreaEl.getBoundingClientRect();
          const windowRect = windowContainer.getBoundingClientRect();
          // const jsonSectionRect = jsonSectionCard.getBoundingClientRect(); // Not used in this block
          const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
          const paddingTopInRem = (windowRect.height + 62) / rootFontSize;
          previewAreaEl.style.paddingTop = `${paddingTopInRem}rem`;


          return;
        }
        if (fromDrop) {
          firstInitialization = 0;
            setTimeout(() => {
                // This is the block that animates uploadWrapper out and mainContent in
                uploadWrapper.style.transform = 'translate(50%, -50%) scale(0.6)';
                uploadWrapper.style.opacity = '0';

                setTimeout(() => {
                  uploadWrapper.style.display = 'none';
                  mainContent.style.display = 'flex';
                  requestAnimationFrame(() => {
                    mainContent.style.transform = 'scale(1)';
                    mainContent.style.opacity = '1';

                    const windowContainer = document.querySelector('.window-container');
                    const previewAreaEl = document.getElementById('previewArea');
                    const jsonSectionCard = document.getElementById('jsonEditorCard');
                    if (windowContainer && previewAreaEl && jsonSectionCard) {
                      const previewRect = previewAreaEl.getBoundingClientRect();
                      const windowRect = windowContainer.getBoundingClientRect();
                      // const jsonSectionRect = jsonSectionCard.getBoundingClientRect(); // Not used in this block
                      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
                      const paddingTopInRem = (windowRect.height + 62) / rootFontSize;
                      previewAreaEl.style.paddingTop = `${paddingTopInRem}rem`;
                      let targetLeft;
                      const deviceWidth = window.innerWidth;
                      if (deviceWidth > 763.63){
                          let multiplier;
                          if(deviceWidth > 1199){ multiplier = 1200 / 2; }
                          else{ multiplier = deviceWidth / 2; }
                          targetLeft = previewRect.left + multiplier * (0.52) - 200;
                      } else { targetLeft = previewRect.left; }
                      const targetTop = 112;
                      windowContainer.style.transition =
                          'transform 580ms cubic-bezier(0.1, 0.1, 0.1, 1), ' +
                          'opacity   450ms cubic-bezier(0.1, 0.1, 0.2, 1)';
                      const translateX = targetLeft - windowRect.left;
                      const translateY = targetTop - windowRect.top;
                      windowContainer.style.opacity = '1';
                      windowContainer.style.transform = `translate(${translateX - 10}px, ${translateY}px)`;
                      translationtoX = translateX - 10;
                      translationtoY = translateY;
                    } else {
                        console.warn("Could not find .window-container, #previewArea or #jsonEditorCard for animation.");
                    }
                  });
                  // isFileOverDropZone is reset by onDragDropSegmentComplete after 'catch' for drop
                }, 250);
                // End of the 280ms timeout for mainContent
            }, 600); // Your desired delay (e.g., 2000 for 2 seconds)
        } else {
            // Execute immediately if not from drop
            firstInitialization=0;
            setTimeout(() => {
            uploadWrapper.style.transform = 'translate(50%, -50%) scale(0.6)';
            uploadWrapper.style.opacity = '0';

            setTimeout(() => {
              uploadWrapper.style.display = 'none';
              mainContent.style.display = 'flex';
              requestAnimationFrame(() => {
                mainContent.style.transform = 'scale(1)';
                mainContent.style.opacity = '1';

                const windowContainer = document.querySelector('.window-container');
                const previewAreaEl = document.getElementById('previewArea');
                const jsonSectionCard = document.getElementById('jsonEditorCard');
                if (windowContainer && previewAreaEl && jsonSectionCard) {
                  const previewRect = previewAreaEl.getBoundingClientRect();
                  const windowRect = windowContainer.getBoundingClientRect();
                  // const jsonSectionRect = jsonSectionCard.getBoundingClientRect(); // Not used
                  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
                  const paddingTopInRem = (windowRect.height + 62) / rootFontSize;
                  previewAreaEl.style.paddingTop = `${paddingTopInRem}rem`;
                  let targetLeft;
                  const deviceWidth = window.innerWidth;
                  if (deviceWidth > 763.63){
                      let multiplier;
                      if(deviceWidth > 1199){ multiplier = 1200 / 2; }
                      else{ multiplier = deviceWidth / 2; }
                      targetLeft = previewRect.left + multiplier * (0.52) - 200;
                  } else { targetLeft = previewRect.left; }
                  const targetTop = 112;
                  windowContainer.style.transition =
                      'transform 580ms cubic-bezier(0.1, 0.1, 0.1, 1), ' +
                      'opacity   450ms cubic-bezier(0.1, 0.1, 0.2, 1)';
                  const translateX = targetLeft - windowRect.left;
                  const translateY = targetTop - windowRect.top;
                  windowContainer.style.opacity = '1';
                  windowContainer.style.transform = `translate(${translateX - 10}px, ${translateY}px)`;
                  translationtoX = translateX - 10;
                  translationtoY = translateY;
                } else {
                    console.warn("Could not find .window-container, #previewArea or #jsonEditorCard for animation.");
                }
              });
              isFileOverDropZone = false; // Reset for non-drop file loads
            }, 250);
          }, 600);
            // End of the 280ms timeout

            // If not from drop, ensure dragDropLottie is reset to idle
            if (dragDropLottieAnimation && dragDropLottieAnimation.isLoaded && dragDropCurrentSegment !== 'idle') {
              playDragDropSegment('catch', true, DRAG_DROP_SPEEDS.catch);
            }
            const chatBubble = document.querySelector('.chat-bubble');
            if (chatBubble && chatBubble.style.display !== 'none') { // Check if not already hidden
                chatBubble.style.display = 'none';
            }
        }
        // ----- END: Conditional execution of uploadWrapper animation -----



      } catch (err) {
        console.error("Error processing Lottie file:", err);
        alert(`Error loading file: ${err.message}\nPlease ensure it's a valid Lottie JSON file.`);
        resetUI();
        if (fromDrop) isFileOverDropZone = false;
        if (dragDropLottieAnimation && dragDropLottieAnimation.isLoaded) playDragDropSegment('idle', true, DRAG_DROP_SPEEDS.idle);
      }
    };

    reader.onerror = () => {
        console.error("Error reading file:", reader.error);
        alert("Error reading file. Please try again.");
        resetUI();
        if (fromDrop) isFileOverDropZone = false;
        if (dragDropLottieAnimation && dragDropLottieAnimation.isLoaded) playDragDropSegment('idle', true, DRAG_DROP_SPEEDS.idle);
    };

    reader.readAsText(file);
  }




    function updateDurationPillDisplay() {
  const durationPill = document.getElementById('animationDurationPill');
  if (!durationPill) return;

  if (!lottieData || originalAnimationDuration === 0) {
    durationPill.style.display = 'none';
    return;
  }

  const currentDisplayDuration = originalAnimationDuration / currentSpeed;
  durationPill.textContent = currentDisplayDuration.toFixed(2) + 's';
  durationPill.style.display = 'block'; // Show the pill
}

    /**
     * Resets the UI to its initial state.
     */
    function resetUI() {

      // Ensure empty state is hidden and editors/heading are visible on reset
    const emptyStateDiv = document.getElementById('emptyStateDiv');
    const colorEditor = document.getElementById('colorEditor');
    const stopEditor = document.getElementById('stopEditor');
    const colorInstancesLabel = document.getElementById('colorInstancesLabel');
    const editorAreaDiv = document.getElementById('editorArea');

    if (emptyStateDiv) emptyStateDiv.style.display = 'none';
    if (colorEditor) colorEditor.style.display = 'block'; // Or initial display
    if (stopEditor) stopEditor.style.display = 'block'; // Or initial display
    if (colorInstancesLabel) colorInstancesLabel.style.display = 'block';
    if (editorAreaDiv) editorAreaDiv.classList.remove('is-empty');

    // ... your existing reset logic ...
    // --- NEW: Clear history on UI reset if not a full reload ---
    originalLottieDataForReset = null;
    undoStack = [];
    redoStack = [];
    // --- END NEW ---

    // Add these to clear multi-file state
       lottieDataArray = [];
       lottieFileNames = [];

       originalUploadedDotLottieFile = null;
activeDotLottieOriginalName = null;

       currentLottieIndex = -1;
       if (lottieFileChipsContainer) lottieFileChipsContainer.style.display = 'none';
       if (lottieFileChips) lottieFileChips.innerHTML = '';

       if (lottiePreview) {
       lottiePreview.removeEventListener('dragover', handleLottiePreviewDragOver);
       lottiePreview.removeEventListener('dragleave', handleLottiePreviewDragLeave);
       lottiePreview.removeEventListener('drop', handleLottiePreviewDrop);
   }
   isLottiePreviewDropZoneActive = false;


      location.reload();
    }



        async function handleDotLottieDownload() {
            console.log('clickedd');
          if(isDotLottieLoaded) {
            console.log('here packaging everything');

            if (!lottieDataArray || lottieDataArray.length === 0) {
       alert("No active Lottie animations loaded to package.");
       return;
   }

   // --- SUGGESTED CHANGE STARTS HERE ---
          // Save the current state of the active lottieData back to the array
          // before packaging. This ensures the latest edits to the
          // currently focused animation are included in the collection.
          if (currentLottieIndex >= 0 && currentLottieIndex < lottieDataArray.length && lottieData) {
              lottieDataArray[currentLottieIndex] = JSON.parse(JSON.stringify(lottieData));
              console.log(`Updated lottieDataArray[${currentLottieIndex}] with live lottieData before packaging.`);
          }
          // --- SUGGESTED CHANGE ENDS HERE ---



   // Prepare the input for convertAllActiveJsonsToDotLottie
   const activeAnimationsForPackaging = lottieDataArray.map((jsonData, index) => {
       // Use lottieFileNames for the animationName, remove .json if present
       let name = lottieFileNames[index] ? lottieFileNames[index].replace(/\.json$/i, '') : `animation_${index}`;
       // Further sanitize if lottieFileNames might have problematic characters for IDs/paths
       name = name.replace(/[^\w.-]/g, '_');
       return {
           animationName: name, // This will be used for ID in manifest and asset prefix
           jsonData: jsonData   // The parsed Lottie JSON object
       };
   });

   try {
       // UI feedback: show loading state


       const dotLottieBlob = await convertAllActiveJsonsToDotLottie(activeAnimationsForPackaging);

       const url = URL.createObjectURL(dotLottieBlob);
       const a = document.createElement("a");
       a.href = url;

       // Determine the filename for the download
       // If it originated from a single .lottie, use that name, otherwise a generic one.
       const dotLottieTitleEl = document.getElementById('dotLottieWindowTitle'); // Your new title for .lottie
       let downloadFileName;

       if (isDotLottieLoaded && dotLottieTitleEl && dotLottieTitleEl.style.display !== 'none') {
           let editedName = dotLottieTitleEl.textContent.trim();
           if (!editedName || editedName === 'No file loaded') {
               editedName = activeDotLottieOriginalName || 'animation';
           }
           downloadFileName = editedName.replace(/\.lottie$/i, '') + '.lottie';
       } else {
           downloadFileName = "packaged_animations.lottie";
       }

       a.download = downloadFileName;
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
       URL.revokeObjectURL(url);
       return;

   } catch (error) {
       console.error("Failed to package all active JSONs into .lottie:", error);
       alert(`Error packaging .lottie: ${error.message}`);// Reset button text
   }
}


            try {
              if (!lottieData) return;

              const exportData = cleanForExport(JSON.parse(JSON.stringify(lottieData)));

              if (originalFrameRate && exportData.fr) {
                  exportData.fr = parseFloat((originalFrameRate * currentSpeed).toFixed(3));
              }

              const jsonString = JSON.stringify(exportData, (key, value) => {
                if (typeof value === 'number') {
                  return parseFloat(value.toFixed(3));
                }
                return value;
              });

              const jsonBlob = new Blob([jsonString], { type: "application/json" });

                const file = new File([jsonBlob], 'tempJsonFile', { type: 'application/json' });

                const dotLottieBlob = await convertJsonToDotLottie(file);

                // Create a URL for the Blob
                const url = URL.createObjectURL(dotLottieBlob);

                // Create a temporary anchor element
                const a = document.createElement("a");
                a.href = url;

                /*
                const originalFilename = windowTitle.textContent || 'animation';
                const baseFilename = originalFilename.replace(/\.json$/i, '');
                a.download = `${baseFilename}.edited.json`;
                */
                let editedName = jsonWindowTitle.textContent.trim(); // Get edited name from the span
          if (!editedName) {
              editedName = 'animation'; // Use a default if the user cleared the title
          }
          // Ensure filename ends with .json (case-insensitive)
          a.download = editedName.replace('.json', '.lottie');



                a.style.display = 'none';

                document.body.appendChild(a);
                a.click();
                  document.body.removeChild(a);
                // Revoke the object URL to free up memory
                URL.revokeObjectURL(url);

                // Optional: Provide feedback to the user (e.g., a success message)
                // const lottieJsonMessageDiv = document.getElementById('your-message-div'); // Replace with your actual message div ID
                // if (lottieJsonMessageDiv) {
                //     showMessage(lottieJsonMessageDiv, 'DotLottie file download initiated!', 'success');
                // }

            } catch (error) {
                console.error("Conversion from JSON to .lottie failed:", error);
                // Optional: Provide error feedback to the user
                // const lottieJsonMessageDiv = document.getElementById('your-message-div'); // Replace with your actual message div ID
                // if (lottieJsonMessageDiv) {
                //     showMessage(lottieJsonMessageDiv, `Conversion failed: ${error.message}`, 'error');
                // }
            }
        }

    /**
     * Handles the JSON download button click.
     */
    function handleJsonDownload() {
      if (!lottieData) return;

      const exportData = cleanForExport(JSON.parse(JSON.stringify(lottieData)));

      if (originalFrameRate && exportData.fr) {
          exportData.fr = parseFloat((originalFrameRate * currentSpeed).toFixed(3));
      }

      const jsonString = JSON.stringify(exportData, (key, value) => {
        if (typeof value === 'number') {
          return parseFloat(value.toFixed(3));
        }
        return value;
      });

      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      /*
      const originalFilename = windowTitle.textContent || 'animation';
      const baseFilename = originalFilename.replace(/\.json$/i, '');
      a.download = `${baseFilename}.edited.json`;
      */
      let editedName = '';
      const selectedChip = document.querySelector('.lottie-file-chip.selected');

      if (isDotLottieLoaded && selectedChip) {
          // If a .lottie was loaded, the active file is represented by the selected chip.
          editedName = selectedChip.title.trim();
      } else {
          // Otherwise, fall back to the visible JSON title.
          editedName = jsonWindowTitle.textContent.trim();
      }

      if (!editedName || editedName === 'No file loaded') {
          editedName = 'animation.json'; // Fallback
      }
      // Ensure filename ends with .json (case-insensitive)
      if (!/\.json$/i.test(editedName)) {
          editedName += '.json';
      }
      a.download = editedName; // Use the determined name


      a.style.display = 'none';

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }


    /**
     * Recursively replaces keyColor with replaceColor for GIF export.
     */
    function replacePureBlack(obj) {
        const keyRGB = hexToRgb(keyColor);
        const replaceRGB = hexToRgb(replaceColor);
        const COLOR_THRESHOLD = 0.01;

        function shouldReplace(r, g, b) {
            return (
            Math.abs(r - keyRGB[0]) < COLOR_THRESHOLD &&
            Math.abs(g - keyRGB[1]) < COLOR_THRESHOLD &&
            Math.abs(b - keyRGB[2]) < COLOR_THRESHOLD
            );
        }

        function processColorArray(colorArray) {
            if (!Array.isArray(colorArray) || colorArray.length < 3) return colorArray;
            const [r, g, b, a = 1] = colorArray;
            if (shouldReplace(r, g, b)) {
                return [...replaceRGB, a];
            }
            return colorArray;
        }

        function traverse(currentObj) {
            if (Array.isArray(currentObj)) {
                currentObj.forEach((item, index) => {
                    if (Array.isArray(item) && item.length >= 3 && item.length <= 4 && item.every(n => typeof n === 'number')) {
                        currentObj[index] = processColorArray(item);
                    } else if (typeof item === 'object') {
                        traverse(item);
                    }
                });
            } else if (currentObj && typeof currentObj === 'object') {
                for (const key in currentObj) {
                    if (!currentObj.hasOwnProperty(key)) continue;
                    const value = currentObj[key];
                    if (key === 'c' && value?.k && Array.isArray(value.k)) {
                        currentObj[key].k = processColorArray(value.k);
                    } else if (key === 'g' && value?.k?.k && Array.isArray(value.k.k) && value.p) {
                        const raw = value.k.k;
                        const stops = value.p;
                        for (let i = 0; i < stops; i++) {
                            const base = i * 4;
                            const r_idx = base + 1;
                            const g_idx = base + 2;
                            const b_idx = base + 3;
                            if (shouldReplace(raw[r_idx], raw[g_idx], raw[b_idx])) {
                                raw[r_idx] = replaceRGB[0];
                                raw[g_idx] = replaceRGB[1];
                                raw[b_idx] = replaceRGB[2];
                            }
                        }
                    } else if (typeof value === 'object' && value !== null) {
                        traverse(value);
                    }
                }
            }
        }
        traverse(obj);
    }


    /**
     * Handles the GIF download button click. Generates the GIF using gif.js.
     */
     function generateGif() {
         if (!lottieData || !window.GIF) {
             alert("GIF generation requires the Lottie data and gif.js library.");
             return;
         }

         // --- UI Feedback: Start Loading ---
         downloadGifBtn.classList.add('btn--loading');
         downloadGifBtn.disabled = true;

         // Optional: Load a Lottie animation as a loading indicator
         // let loadingAnim;
         // try {
         //     loadingAnim = lottie.loadAnimation({ /* options for loader.json */ });
         // } catch(e) { console.warn("Could not load loading animation", e); }


         // --- Prepare Data and Settings ---

         // 1. Deep-clone the master data and replace key colors if needed
         const gifData = JSON.parse(JSON.stringify(lottieData));
         replacePureBlack(gifData); // Replace black/keyColor if necessary

         // 2. Set up a temporary, hidden Lottie instance for rendering frames
         gifContainer.innerHTML = ''; // Clear previous temporary instance
         const tmpAnim = lottie.loadAnimation({
             container: gifContainer,
             renderer: 'svg',
             loop: false, // Don't loop the temporary instance
             autoplay: false, // Don't autoplay
             animationData: gifData
         });

         tmpAnim.addEventListener('DOMLoaded', () => { // Wait for SVG to be ready
             // 3. Calculate GIF dimensions and frame settings
             const scaleValue = parseFloat(gifScaleSelect.value) || 1;
             const aspectRatio = animWidth / animHeight;
             // Calculate dimensions, ensuring they are integers
             const gifW = Math.max(1, Math.round(animWidth * scaleValue));
             const gifH = Math.max(1, Math.round(gifW / aspectRatio));

             const GIF_FPS = 30; // Target FPS for GIF (lower than source is often fine)
             // Calculate delay: 1000ms / FPS. gif.js uses centiseconds (1/100th s), so multiply by 10

             const FRAME_DELAY_CS = Math.round((100 / GIF_FPS) * (1 / 0.127));

             // Calculate total frames based on duration and target FPS
             // Duration = (Out Point - In Point) / Original Frame Rate
             const animDurationSec = (lottieData.op - lottieData.ip) / originalFrameRate;
             // Total frames = Duration * Target FPS (respecting current speed)
             // Limit max frames to prevent excessive generation time/size
             const totalFrames = Math.min(Math.floor((animDurationSec / currentSpeed) * GIF_FPS), 300); // Max 300 frames

             if (totalFrames <= 0) {
                  alert("Calculated duration or frame count is zero. Cannot generate GIF.");
                  cleanupGifGen(tmpAnim);
                  return;
             }


             // 4. Get background settings from UI
             const useTransparentBg = transparentBgCheckbox.checked;
             const customBgColor = bgHexInput.value; // e.g., "#ffffff"

             // 5. Configure gif.js options
             const gifOptions = {
                 workers: Math.max(1, navigator.hardwareConcurrency ? Math.floor(navigator.hardwareConcurrency / 2) : 2), // Use half available cores, min 1, default 2
                 quality: 10, // Lower quality means smaller file, 1-30 range, 10 is default
                 width: gifW,
                 height: gifH,
                 // IMPORTANT: Path to worker script relative to the HTML file or absolute URL
                 workerScript: './gif.worker.js' // Adjust if your worker is elsewhere
             };

             // Set background or transparency based on checkbox
             if (useTransparentBg) {
        // Solid background mode
                  gifOptions.background = customBgColor;
              } else {
                  // Transparent background mode
                  gifOptions.transparent = parseInt(keyColor.replace('#', '0x'), 16);
              }

             // --- Initialize GIF Encoder ---
             let gif;
             try {
                 gif = new GIF(gifOptions);
             } catch (e) {
                 console.error("Failed to initialize GIF encoder:", e);
                 alert("Failed to initialize GIF encoder. Check console and ensure gif.js/worker are loaded correctly.");
                 cleanupGifGen(tmpAnim);
                 return;
             }


             // --- Frame Capturing Loop ---
             const svgEl = gifContainer.querySelector('svg');
             if (!svgEl) {
                 alert("Could not find SVG element for GIF generation.");
                 cleanupGifGen(tmpAnim);
                 return;
             }

             let frameIndex = 0;

             function captureFrame() {
                 if (frameIndex >= totalFrames) {
                     // --- Finalize GIF Rendering ---
                     gif.render();
                     return; // Stop capturing
                 }

                 // Calculate the time and corresponding frame number in the original Lottie timeline
                 const timeSec = (frameIndex / GIF_FPS) * currentSpeed; // Time adjusted for speed
                 const lottieFrame =  timeSec * originalFrameRate;

                 // Go to the calculated frame on the *temporary* animation instance
                 tmpAnim.goToAndStop(lottieFrame, true); // true = isFrame

                 // Use requestAnimationFrame to ensure the SVG has updated visually
                 requestAnimationFrame(() => {
                     // Create a new canvas for this frame
                     const canvas = document.createElement('canvas');
                     canvas.width = gifW;
                     canvas.height = gifH;
                     const ctx = canvas.getContext('2d');

                     // Draw background color OR the transparency key color onto the canvas
                     ctx.fillStyle = useTransparentBg ? customBgColor : keyColor;
                     ctx.fillRect(0, 0, gifW, gifH);

                     // Serialize the current state of the SVG element
                     // Clone the SVG to avoid potential issues with direct manipulation
                     const svgClone = svgEl.cloneNode(true);
                     // Ensure viewBox, width, and height are set correctly for rendering
                     svgClone.setAttribute('viewBox', `0 0 ${animWidth} ${animHeight}`);
                     svgClone.setAttribute('width', gifW);
                     svgClone.setAttribute('height', gifH);
                     const svgString = new XMLSerializer().serializeToString(svgClone);

                     // Create an Image object to draw the SVG onto the canvas
                     const img = new Image();
                     const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                     const url = URL.createObjectURL(svgBlob);

                     img.onload = () => {
                         // Draw the SVG image onto the canvas (over the background/key color)
                         ctx.drawImage(img, 0, 0, gifW, gifH);
                         URL.revokeObjectURL(url); // Clean up blob URL

                         // Add the canvas frame to the GIF encoder
                         try {
                             gif.addFrame(canvas, { delay: FRAME_DELAY_CS, copy: true });
                         } catch(e) {
                             console.error(`Error adding frame ${frameIndex}:`, e);
                             // Decide whether to stop or continue on error
                         }


                         // Capture the next frame
                         frameIndex++;
                         // Use setTimeout for less aggressive looping than rAF for long tasks
                         setTimeout(captureFrame, 0);
                     };
                     img.onerror = () => {
                         console.error(`Failed to load SVG frame ${frameIndex} into image.`);
                         URL.revokeObjectURL(url);
                         // Decide how to handle frame errors (skip, stop, etc.)
                         // For now, let's try skipping to the next frame
                         frameIndex++;
                          setTimeout(captureFrame, 0);
                     };
                     img.src = url; // Load the SVG blob into the image
                 });
             } // End of captureFrame function

             // --- GIF Rendering Finished Callback ---
             gif.on('finished', (blob) => {
                 // --- UI Feedback: Stop Loading ---
                 cleanupGifGen(tmpAnim); // Includes resetting button state

                 // --- Trigger Download ---
                 const downloadUrl = URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = downloadUrl;
                 let fileNametoBeSent = jsonWindowTitle.textContent;
                 let baseFilename = null;
                 const selectedChipElement = document.querySelector('.lottie-file-chip.selected');

                 if(isDotLottieLoaded) {fileNametoBeSent = selectedChipElement.title;}
                  baseFilename = fileNametoBeSent.replace(/\.json$/i, '');
                 a.download = `${baseFilename}.gif`;
                 a.style.display = 'none';
                 document.body.appendChild(a);
                 a.click();

                 // Clean up
                 setTimeout(() => {
                     document.body.removeChild(a);
                     URL.revokeObjectURL(downloadUrl);
                 }, 100);
             });

              // --- GIF Rendering Progress Callback (Optional) ---
             gif.on('progress', (p) => {
                 // Update UI with progress if desired (e.g., update a progress bar)
                  console.log(`GIF rendering progress: ${Math.round(p * 100)}%`);
                  // Example: downloadGifBtn.textContent = `Generating... ${Math.round(p * 100)}%`;
             });


             // --- Start Capturing Frames ---
             captureFrame();

         }); // End of tmpAnim DOMLoaded listener

          // Error handling for temporary animation loading
         tmpAnim.addEventListener('data_failed', () => {
             console.error("Temporary Lottie data failed to load for GIF generation.");
             alert("Failed to load animation data for GIF generation.");
             cleanupGifGen(tmpAnim);
         });
         tmpAnim.addEventListener('error', (error) => {
             console.error("Temporary Lottie animation error:", error);
              alert("An error occurred with the animation instance for GIF generation.");
             cleanupGifGen(tmpAnim);
         });


     } // End of generateGif function

     /**
      * Cleans up resources used during GIF generation and resets button state.
      * @param {object} tmpAnim The temporary Lottie animation instance.
      * @param {object} [loadingAnim] Optional loading indicator animation instance.
      */
     function cleanupGifGen(tmpAnim, loadingAnim) {
          // Destroy temporary Lottie instance
         if (tmpAnim) {
             tmpAnim.destroy();
         }
         // Clear the hidden container
         gifContainer.innerHTML = '';

         // Destroy optional loading animation
         if (loadingAnim) {
             loadingAnim.destroy();
         }

         // Reset GIF button state
         downloadGifBtn.classList.remove('btn--loading');
         downloadGifBtn.disabled = false;
         // Restore icon if it was removed
         // downloadGifBtn.style.backgroundImage = "url(...)"; // Or manage via CSS
     }




    /**
     * Opens the advanced GIF render settings overlay.
     */
    function openSettings() {
        document.getElementById('keyColor').value = keyColor;
        document.getElementById('keyHex').value = keyColor;
        document.getElementById('replaceColor').value = replaceColor;
        document.getElementById('replaceHex').value = replaceColor;
        renderSettingsOverlay.classList.add('active');
    }

    /**
     * Saves settings from the overlay and closes it.
     */
    function closeSettings() {
        keyColor = document.getElementById('keyColor').value;
        replaceColor = document.getElementById('replaceColor').value;
        renderSettingsOverlay.classList.remove('active');
    }

    /**
     * Initializes the sync between color pickers and hex inputs in the settings overlay.
     */
    function initSettingsSync() {
        function setupSync(colorId, hexId) {
            const colorInput = document.getElementById(colorId);
            const hexInput = document.getElementById(hexId);
            if (!colorInput || !hexInput) return;

            colorInput.addEventListener('input', () => {
                hexInput.value = colorInput.value;
            });

            hexInput.addEventListener('change', () => {
                let newHex = hexInput.value.trim();
                 if (!newHex.startsWith("#")) newHex = "#" + newHex;
                 if (/^#[0-9A-F]{6}$/i.test(newHex)) {
                    colorInput.value = newHex;
                 } else {
                     hexInput.value = colorInput.value;
                 }
            });
        }
        setupSync('keyColor', 'keyHex');
        setupSync('replaceColor', 'replaceHex');
    }


    // --- Event Listeners ---

    const mainPageLogo = document.getElementById('mainPageLogo');
    if (mainPageLogo) {
       mainPageLogo.addEventListener('click', () => {
           location.reload(); // This forces a full page reload
       });
    }


    openFlutterPreviewBtn.addEventListener('click', () => {
      if (!lottieData) {
          alert("Please load a Lottie animation first.");
          return;
      }

      // --- Modify Overlay Buttons for "Preview" mode ---
      if (saveAndCloseBtn) {
          saveAndCloseBtn.style.display = 'none'; // Hide the "Save & Close" button
      }
      if (cancelBtnText) {
          cancelBtnText.textContent = 'Close Flutter Preview'; // Change the text of the cancel button
      }
      // --- End of Modification ---

      // Show the overlay
      flutterPreviewOverlay.classList.add('active');

      // Set the source for the iframe to your Flutter app's index.html
      flutterPreviewIframe.src = 'flutterRender/index.html';

      // Set up the onload event to send data AFTER the Flutter app is ready
      flutterPreviewIframe.onload = () => {
          setTimeout(() => {
              if (flutterPreviewIframe.contentWindow) {
                  console.log("Sending Lottie data to Flutter preview...");
                  const dataToSend = JSON.parse(JSON.stringify(lottieData));
                  flutterPreviewIframe.contentWindow.postMessage(JSON.stringify(dataToSend), '*');
              } else {
                  console.error("Could not get iframe content window for Flutter preview.");
                  flutterPreviewOverlay.classList.remove('active');
              }
          }, 2500); // 500ms delay to be safe
      };

      // Handle potential errors loading the iframe itself
      flutterPreviewIframe.onerror = () => {
          console.error("Failed to load Flutter preview iframe:", flutterPreviewIframe.src);
          alert("Error: Could not load the Flutter preview application.");
          flutterPreviewOverlay.classList.remove('active');
      };
  });




    activateColorPickerBtn.addEventListener('click', async () => {
        if (!animationInstance) {
            alert("Please load a Lottie animation first.");
            return;
        }

        if (isColorPickerActive) { // If trying to cancel picker
            console.log("Color picking cancelled by button re-click.");
            isColorPickerActive = false;
            activateColorPickerBtn.style.opacity = '1'; // Or revert to original icon
            if (previewBgToggleContainer) previewBgToggleContainer.style.display = 'flex'; // Show GIF BG toggle
            // Optionally resume animation if it was paused by picker activation
            // if (!isPlaying && previouslyPlayingBeforePicker) animationInstance.play();
            return;
        }

        isColorPickerActive = true;
        activateColorPickerBtn.style.opacity = '0.5'; // Indicate active state or change icon

        if (isPlaying) {
            playPauseBtn.click();
            // Note: We are not changing the global 'isPlaying' state here,
            // just temporarily pausing for picking.
            // Or, if you want it to reflect as a full pause:
            // playPauseBtn.click(); // Simulate a click if it correctly handles state and UI
        }

        if (previewBgToggleContainer) previewBgToggleContainer.style.display = 'none'; // Hide GIF BG toggle
        if (durationpill) durationpill.style.display = 'none';

        if (window.EyeDropper) {
              const eyeDropper = new EyeDropper();
              try {
                  const result = await eyeDropper.open();
                  isColorPickerActive = false; // Reset flag
                  activateColorPickerBtn.style.display = 'none'; // Hide picker button
                  // GIF toggle remains hidden until pill is dismissed

                  isUserInitiatedFilter = true; // <<< SET THIS FLAG
                  handleColorPickedForFiltering(result.sRGBHex.toLowerCase());

              } catch (e) {
                  console.log("EyeDropper cancelled or failed:", e);
                  isColorPickerActive = false;
                  isUserInitiatedFilter = false; // <<< RESET FLAG ON FAILURE/CANCEL
                  activateColorPickerBtn.style.opacity = '1';
                  if (previewBgToggleContainer) previewBgToggleContainer.style.display = 'flex';
                  // If animation was paused by this action, consider resuming it or leaving as is.
              }
          } else {
              alert("Your browser does not support the EyeDropper API. This color picking feature is unavailable.");
              isColorPickerActive = false;
              isUserInitiatedFilter = false; // <<< RESET FLAG
              activateColorPickerBtn.style.opacity = '1';
              if (previewBgToggleContainer) previewBgToggleContainer.style.display = 'flex';
          }
    });

    playPauseBtn.addEventListener('click', () => {
             if (!animationInstance) return; // animationInstance is the Lottie animation object
             if (isPlaying) {
                 // If currently playing, the intention is to pause
                 animationInstance.pause();
                 playPauseBtn.innerHTML = PLAY_ICON_SVG;
                 playPauseBtn.setAttribute('aria-label', 'Play');
             } else {
                 // If currently paused, the intention is to play
                 animationInstance.play();
                 playPauseBtn.innerHTML = PAUSE_ICON_SVG;
                 playPauseBtn.setAttribute('aria-label', 'Pause');
             }
             isPlaying = !isPlaying; // Toggle the state
         });

         lottieSeekbar.addEventListener('input', () => {
       if (!animationInstance) return;
       const frame = parseInt(lottieSeekbar.value, 10);
       animationInstance.goToAndStop(frame, true); // This stops the animation at the selected frame

       // If the animation was playing before seekbar interaction
       if (isPlaying) {
           isPlaying = false; // Update the state to paused
           playPauseBtn.innerHTML = PLAY_ICON_SVG; // Change button to show "Play" icon
           playPauseBtn.setAttribute('aria-label', 'Play');
           // animationInstance.pause(); // goToAndStop already pauses it, but explicit pause can be added if needed for clarity or specific Lottie behaviors.
       }
   });

        speedControlPillBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click from bubbling to document
            speedSliderPopup.classList.toggle('active');
            speedControlPillBtn.setAttribute('aria-expanded', speedSliderPopup.classList.contains('active'));
            if (speedSliderPopup.classList.contains('active')) {
                resetSpeedPopupTimer();
            } else {
                clearTimeout(speedPopupTimer);
            }
        });

        dismissSpeedPopupBtn.addEventListener('click', () => {
            speedSliderPopup.classList.remove('active');
            speedControlPillBtn.setAttribute('aria-expanded', 'false');
            clearTimeout(speedPopupTimer);
        });

        speedSliderMain.addEventListener('input', (e) => {
          currentSpeed = parseFloat(e.target.value);
          speedValuePill.textContent = currentSpeed.toFixed(1) + "x";
          if (animationInstance) {
            animationInstance.setSpeed(currentSpeed);
          }
           updateDurationPillDisplay();
          resetSpeedPopupTimer(); // Reset timer on interaction
        });
        speedSliderMain.addEventListener('mousedown', () => clearTimeout(speedPopupTimer)); // Clear timer when user starts dragging
        speedSliderMain.addEventListener('touchstart', () => clearTimeout(speedPopupTimer));


        // Auto-dismiss speed popup
        function resetSpeedPopupTimer() {
            clearTimeout(speedPopupTimer);
            speedPopupTimer = setTimeout(() => {
                speedSliderPopup.classList.remove('active');
                speedControlPillBtn.setAttribute('aria-expanded', 'false');
            }, 5000); // 5 seconds
        }

        // Close speed popup if clicked outside
        document.addEventListener('click', (event) => {
            if (speedSliderPopup.classList.contains('active') &&
                !speedSliderPopup.contains(event.target) &&
                !speedControlPillBtn.contains(event.target)) {
                speedSliderPopup.classList.remove('active');
                speedControlPillBtn.setAttribute('aria-expanded', 'false');
                clearTimeout(speedPopupTimer);
            }
        });






    // File Input
    fileInput.addEventListener('change', handleFileLoad);

    // Window Close Button (Reset UI)
    windowCloseBtn.addEventListener('click', resetUI);



        if (openShareModalBtn) {
        openShareModalBtn.addEventListener('click', openShareModal);
    }

    if (closeShareModalBtn) {
        closeShareModalBtn.addEventListener('click', closeShareModal);
    }

    if (generateShareCodeBtn) {
        generateShareCodeBtn.addEventListener('click', handleGenerateShareCode);
    }

    // Close modal if backdrop is clicked
    if (shareModalOverlay) {
        shareModalOverlay.addEventListener('click', (e) => {
            if (e.target === shareModalOverlay) {
                closeShareModal();
            }
        });
    }


    // Download Buttons
    downloadJsonBtn.addEventListener('click', handleJsonDownload);
    downloadDotLottieBtn.addEventListener('click', handleDotLottieDownload);
    downloadGifBtn.addEventListener('click', generateGif);



    downloadVideoBtn.addEventListener('click', async () => {
    if (!lottieData) {
        alert("Please load a Lottie animation first.");
        return;
    }

    const downloadBtn = document.getElementById('downloadVideoBtn');
    if (!downloadBtn) return;

    // 1. Show loading state
    downloadBtn.classList.add('btn--loading');
    downloadBtn.disabled = true;

    try {
        // 2. Get settings from the UI
        const scale = parseFloat(document.querySelector('#videoScaleControls button.active').dataset.value) || 1;
const fps = parseInt(document.querySelector('#videoFpsControls button.active').dataset.value, 10) || 30;
       const isTransparent = !document.getElementById('videoTransparentBg').checked;
        const bgColor = document.getElementById('videoBgHexInput').value || '#ffffff';

        const conversionOptions = {
            scale: scale,
            fps: fps,
            transparentBg: isTransparent,
            bgColor: bgColor,
            onProgress: (percent, message) => {
                // Optional: Update UI with progress
                console.log(`WebM Export: [${percent.toFixed(0)}%] ${message}`);
            }
        };

        // 3. Get the *current* Lottie JSON data
        // Your `lottieData` global variable always holds the active animation,
        // so we can just use that. We'll make a clean copy.
        const lottieJsonData = JSON.parse(JSON.stringify(lottieData));

        // 4. Call the converter
        console.log("Starting Lottie to WebM conversion...");
        const videoBlob = await convertLottieToWebm(lottieJsonData, conversionOptions);
        console.log("Conversion successful! Blob created:", videoBlob);

        // 5. Trigger download
        let baseFilename = "animation";
        const selectedChip = document.querySelector('.lottie-file-chip.selected');
        if (isDotLottieLoaded && selectedChip) {
            baseFilename = selectedChip.title.replace(/\.json$/i, '');
        } else if (jsonWindowTitle.textContent) {
            baseFilename = jsonWindowTitle.textContent.replace(/\.json$/i, '');
        }

        downloadBlob(videoBlob, `${baseFilename}.webm`);

    } catch (error) {
        console.error("WebM Conversion Failed:", error.message);
        alert(`Error exporting video: ${error.message}`);
    } finally {
        // 6. Reset button state
        downloadBtn.classList.remove('btn--loading');
        downloadBtn.disabled = false;
    }
});

    // GIF Background Toggle and Color Picker Sync
    transparentBgCheckbox.addEventListener('change', () => {
        bgColorGroup.classList.toggle('hidden', !transparentBgCheckbox.checked);
    });
    bgColorPicker.addEventListener('input', () => {
      bgHexInput.value = bgColorPicker.value;
    });
    bgHexInput.addEventListener('change', () => {
      let newHex = bgHexInput.value.trim();
      if (!newHex.startsWith("#")) newHex = "#" + newHex;
      if (/^#[0-9A-F]{6}$/i.test(newHex)) {
        bgColorPicker.value = newHex;
      } else {
        alert('Invalid hex code. Use format #RRGGBB.');
        bgHexInput.value = bgColorPicker.value;
      }
    });

    // Open Settings Overlay (Ctrl+Click on label)
    gifExportTab.addEventListener('click', (e) => {
      if (e.ctrlKey || e.metaKey) {
        openSettings();
      }
    });

    // Open Trim Editor Overlay Button
    openOverlayBtn.addEventListener('click', () => {
        if (!lottieData) return;

        if (overlayAnimationInstance) {
            overlayAnimationInstance.destroy();
            overlayAnimationInstance = null;
        }

        customOverlay.classList.add('active');
        customOverlayIframe.src = trimEditorSrcCurrent; // Load Trim editor
        console.log(windowTitle.textContent);
        customOverlayIframe.onload = () => {
            try {

                const overlayData = JSON.parse(JSON.stringify(lottieData));
                if (originalFrameRate && overlayData.fr) {
                    overlayData.fr = originalFrameRate * currentSpeed;
                }

                let fileNametoBeSent = jsonWindowTitle.textContent;
                const selectedChipElement = document.querySelector('.lottie-file-chip.selected');
                if(isDotLottieLoaded) {fileNametoBeSent = selectedChipElement.title;}
                customOverlayIframe.contentWindow.postMessage({
                    type: 'lottieData',
                    data: overlayData,
                    filename: fileNametoBeSent
                }, '*'); // Use specific origin in production
            } catch (error) {
                console.error("Error preparing or sending data to trim overlay:", error);
                alert("Could not load data into the trim editor overlay.");
                customOverlay.classList.remove('active');
            }
        };
         customOverlayIframe.onerror = () => {
             console.error("Failed to load trim overlay iframe:", customOverlayIframe.src);
             alert("Failed to load the trim editor overlay (overlay.html).");
             customOverlay.classList.remove('active');
         };
    });




const videoTransparentBg = document.getElementById('videoTransparentBg');
const videoBgColorGroup = document.getElementById('videoBgColorGroup');
const videoBgColorPicker = document.getElementById('videoBgColorPicker');
const videoBgHexInput = document.getElementById('videoBgHexInput');

if (videoTransparentBg && videoBgColorGroup) {
    videoTransparentBg.addEventListener('change', () => {
        // Show color picker when toggle is ON (checked)
        videoBgColorGroup.style.display = videoTransparentBg.checked ? 'flex' : 'none';
    });
}
if (videoBgColorPicker && videoBgHexInput) {
    videoBgColorPicker.addEventListener('input', () => {
        videoBgHexInput.value = videoBgColorPicker.value;
    });
    videoBgHexInput.addEventListener('change', () => {
        let newHex = videoBgHexInput.value.trim();
        if (!newHex.startsWith("#")) newHex = "#" + newHex;
        if (/^#[0-9A-F]{6}$/i.test(newHex)) {
            videoBgColorPicker.value = newHex;
        } else {
            videoBgHexInput.value = videoBgColorPicker.value;
        }
    });
}





// --- Add to Event Listeners ---
openAssetReplacerBtn.addEventListener('click', () => {
    if (!lottieData) return;

    // Optional: Destroy any existing overlay instance if you have one
    // if (overlayAnimationInstance) {
    //     overlayAnimationInstance.destroy();
    //     overlayAnimationInstance = null;
    // }

    customOverlay.classList.add('active');
    customOverlayIframe.src = assetReplacerSrcCurrent; // Path to your asset replacer tool

    customOverlayIframe.onload = () => {
        try {
            const overlayData = JSON.parse(JSON.stringify(lottieData));
            // Adjust frame rate for overlay if needed, similar to other overlays
            if (originalFrameRate && overlayData.fr) {
                overlayData.fr = originalFrameRate * currentSpeed; // Or just originalFrameRate
            }
            let fileNametoBeSent = jsonWindowTitle.textContent;
            const selectedChipElement = document.querySelector('.lottie-file-chip.selected');
            if(isDotLottieLoaded) {fileNametoBeSent = selectedChipElement.title;}

            customOverlayIframe.contentWindow.postMessage({
                type: 'lottieDataAssetTool', // Ensure this matches the type in asset_replacer.html
                lottieData: overlayData,
                filename:fileNametoBeSent
            }, '*'); // In production, specify the iframe's origin
        } catch (error) {
            console.error("Error preparing or sending data to asset replacer overlay:", error);
            alert("Could not load data into the asset replacer overlay.");
            customOverlay.classList.remove('active');
        }
    };
    customOverlayIframe.onerror = () => {
         console.error("Failed to load asset replacer overlay iframe:", customOverlayIframe.src);
         alert("Failed to load the asset replacer overlay (asset_replacer.html).");
         customOverlay.classList.remove('active');
     };
});



    // *** NEW: Open Crop Editor Overlay Button ***
    openCropBtn.addEventListener('click', () => {
        if (!lottieData) return;
        console.log('Current lottieFileNames array before click:', lottieFileNames);

        if (overlayAnimationInstance) {
            overlayAnimationInstance.destroy();
            overlayAnimationInstance = null;
        }

        customOverlay.classList.add('active');
        customOverlayIframe.src = cropEditorSrcCurrent; // Load Crop editor
        let fileNametoBeSent = jsonWindowTitle.textContent;
        const selectedChipElement = document.querySelector('.lottie-file-chip.selected');
        if(isDotLottieLoaded) {fileNametoBeSent = selectedChipElement.title;}

        customOverlayIframe.onload = () => {
            try {
                const overlayData = JSON.parse(JSON.stringify(lottieData));
                if (originalFrameRate && overlayData.fr) {
                    overlayData.fr = originalFrameRate * currentSpeed;
                }
                customOverlayIframe.contentWindow.postMessage({
                    type: 'lottieData',
                    data: overlayData,
                    filename: fileNametoBeSent
                }, '*'); // Use specific origin in production
            } catch (error) {
                console.error("Error preparing or sending data to crop overlay:", error);
                alert("Could not load data into the crop editor overlay.");
                customOverlay.classList.remove('active');
            }
        };
         customOverlayIframe.onerror = () => {
             console.error("Failed to load crop overlay iframe:", customOverlayIframe.src);
             alert("Failed to load the crop editor overlay (crop.html).");
             customOverlay.classList.remove('active');
         };
    });
    // *** END NEW LISTENER ***

    // Close Overlay Buttons (Generic Handler)
   overlayCloseButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const overlay = e.target.closest('.overlay');
          if (overlay) {
            overlay.classList.remove('active');
    
            if (overlay.id === 'customOverlay') {
              // --- NEW: Remove blur effect on close ---
              overlay.style.backdropFilter = '';
              overlay.style.webkitBackdropFilter = ''; // For Safari
                

                const overlayContent = overlay.querySelector('.overlay-content');
             
              // Stop the iframe content to free up resources
              //customOverlayIframe.src = 'about:blank';
              if (overlayAnimationInstance) {
                overlayAnimationInstance.destroy();
                overlayAnimationInstance = null;
              }
    
              // --- Add this block to reset the buttons ---
              if (saveAndCloseBtn) {
                  // Revert to default display (the browser will use the stylesheet's value)
                 
                        saveAndCloseBtn.style.display = '';
                 
                  
              }

              // --- NEW: Hide custom postcard button on close ---
              const postcardBtn = document.getElementById('postcardCloseBtn');
              if (postcardBtn) {
                  postcardBtn.style.display = 'none';
              }
              // --- END NEW ---

              if (cancelBtnText) {
                setTimeout(() => {
                 cancelBtnText.textContent = 'Cancel'; // Change the text back to "Cancel" after 1 second
                      if (cancelBtn) {
                // --- NEW: Ensure original button is visible after close ---
                cancelBtn.style.display = ''; 
                // This removes the 'style="left: auto;"' added by the state machine runner
                cancelBtn.style.left = '';
             
                cancelBtn.style.top = ''
                cancelBtn.style.marginLeft = '';
              }
              overlay.style.maxHeight = '';        //  Reset overlay max width
              overlay.style.padding = '';           // 1. Reset backdrop padding
              overlay.style.backgroundColor = '';
              if (overlayContent) {
                overlayContent.style.maxWidth = '1024px'; // 2. Reset content width
                overlayContent.style.height = '';       // 3. Reset content height
                overlayContent.style.padding = '';      // 4. Reset content padding
                overlayContent.style.borderRadius = ''; // 5. Reset content corners
                overlayContent.style.boxShadow = '';    // NEW: Reset shadow
              }

              // --- NEW: Reset iframe styles ---
              const iframe = overlay.querySelector('#customContent');
              if (iframe) {
                iframe.style.width = '';
                iframe.style.height = '';
                iframe.style.border = '';     
                iframe.style.borderRadius = '';          // NEW: Reset border
              }

             }, 1000); // Change the text back to "Cancel"
              }
              // --- End of reset block ---
            }
          }
        });
      });

      
      overlayCloseButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const overlay = e.target.closest('.overlay');
          if (overlay) {
            overlay.classList.remove('active');
    
            if (overlay.id === 'customOverlay') {
              // --- NEW: Remove blur effect on close ---
              overlay.style.backdropFilter = '';
              overlay.style.webkitBackdropFilter = '';
                

                const overlayContent = overlay.querySelector('.overlay-content');
             
              // Stop the iframe content to free up resources
              //customOverlayIframe.src = 'about:blank';
              if (overlayAnimationInstance) {
                overlayAnimationInstance.destroy();
                overlayAnimationInstance = null;
              }
    
              // --- Add this block to reset the buttons ---
              if (saveAndCloseBtn) {
                  // Revert to default display (the browser will use the stylesheet's value)
                 
                        saveAndCloseBtn.style.display = '';
                 
                  
              }

              // --- MODIFIED: Full reset for cancelBtn ---
              if (cancelBtn) {
                // Use a timeout to restore the 'Cancel' text after the fade-out,
                // matching the original behavior.
                setTimeout(() => {
                    if (originalCancelBtnHTML) {
                        cancelBtn.innerHTML = originalCancelBtnHTML;
                    }
                    // The span inside originalCancelBtnHTML should say 'Cancel' by default
                    // If not, we'd do:
                    // const span = cancelBtn.querySelector('span');
                    // if (span) span.textContent = 'Cancel';

                // 1-second delay matches your original code

                // Reset all inline styles immediately
                cancelBtn.style.display = ''; // Revert to stylesheet default
                cancelBtn.style.left = '';
                cancelBtn.style.top = '';
                cancelBtn.style.marginLeft = ''; // Reset this just in case
                cancelBtn.style.background = '';
                cancelBtn.style.border = '';
                cancelBtn.style.borderRadius = '';
                cancelBtn.style.width = '';
                cancelBtn.style.height = '';
                cancelBtn.style.padding = '';
                cancelBtn.style.boxShadow = '';
                cancelBtn.style.transform = '';
                cancelBtn.onmouseenter = null;
                cancelBtn.onmouseleave = null;
              
              // --- END MODIFIED ---
              
              // --- Reset overlay styles for postcard mode ---
              overlay.style.maxHeight = '';        //  Reset overlay max width
              overlay.style.padding = '';           // 1. Reset backdrop padding
              overlay.style.backgroundColor = '';
              if (overlayContent) {
                overlayContent.style.maxWidth = '1024px'; // 2. Reset content width
                overlayContent.style.height = '';       // 3. Reset content height
                overlayContent.style.padding = '';      // 4. Reset content padding
                overlayContent.style.borderRadius = ''; // 5. Reset content corners
                overlayContent.style.boxShadow = '';    // NEW: Reset shadow
              }

              // --- NEW: Reset iframe styles ---
              const iframe = overlay.querySelector('#customContent');
              if (iframe) {
                iframe.style.width = '';
                iframe.style.height = '';
                iframe.style.border = '';     
                iframe.style.borderRadius = '';          // NEW: Reset border
              }
              // --- End of reset block ---

               }, 1000);
            }
            }
          }
        });
      });




    if (saveAndCloseBtn) {
        saveAndCloseBtn.addEventListener('click', () => {

            const customOverlayIframe = document.getElementById('customContent');
            if (customOverlayIframe && customOverlayIframe.contentWindow) {
                // Send a message to the iframe to tell it to save and close
  console.log('sending message');
                customOverlayIframe.contentWindow.postMessage({
                    type: 'triggerSaveAndCloseCrop'
                }, '*'); // Replace '*' with the iframe's actual origin in production

                  console.log('sending message has been sent');
            }
        });
    }





// Debounce function to prevent rapid updates
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}







resetFilterBtn.addEventListener('click', () => {
    filterInfoPill.style.display = 'none';
    const previouslyActiveColor = activePickedColor;
    activePickedColor = null;
    initialFilteredAccordionIds.clear(); // <<< CLEAR THE SET
    isUserInitiatedFilter = false;      // <<< RESET FLAG

    activateColorPickerBtn.style.display = 'inline-block';
    activateColorPickerBtn.style.opacity = 1;
    if (previewBgToggleContainer) previewBgToggleContainer.style.display = 'flex';

    if (!previouslyActiveColor) {
        console.log("No active filter to reset.");
        return;
    }

    console.log("Filter reset. Restoring default UI structure.");

    // Remove filter-specific classes from all accordions and show their content rows
    document.querySelectorAll('#editorArea .accordion, #editorArea .gradient-accordion').forEach(accordion => {
        accordion.classList.remove('hidden-by-filter', 'accordion-filtered-nomatch');
        const body = accordion.querySelector('.accordion-body, .gradient-content');
        if (body) {
            // Iterate over direct children that are rows
            for (const row of body.children) {
                 if (row.classList.contains('color-row') || row.classList.contains('stop-row') || row.classList.contains('text-instance-row')) {
                    row.style.display = ''; // Revert to default display (flex or block based on CSS)
                    row.classList.remove('row-filtered-nomatch'); // If you used this class
                }
            }
        }
    });

    const emptyStateDiv = document.getElementById('emptyStateDiv');
    if (emptyStateDiv) {
        // Hide empty state as we are restoring all items
        emptyStateDiv.style.display = 'none';

    }

    // Call refreshUIStateAndRender to fully rebuild UI in its unfiltered state.
    // It will handle empty states and label visibility correctly.
    // Since activePickedColor is null, no filter will be applied.
    refreshUIStateAndRender();
});




//all functions begin
// Replace the ENTIRE existing handleColorPickedForFiltering function with this:
// Replace the ENTIRE existing handleColorPickedForFiltering function with this:
function handleColorPickedForFiltering(pickedHexByEyeDropper) {
    const pickedHexClean = pickedHexByEyeDropper.toLowerCase();
    if (isUserInitiatedFilter) {
        activePickedColor = pickedHexClean;
    }
    const currentFilterColor = activePickedColor;
    const pickedRgb = hexToRgbComponents(currentFilterColor);

    console.log(`Filtering for: ${currentFilterColor}. User initiated: ${isUserInitiatedFilter}`);

    const filterPillSwatch = document.getElementById('filterPillColorSwatch');
    const filterPillHexDisplay = document.getElementById('filterPillHexDisplay');
    if (filterInfoPill && filterPillSwatch && filterPillHexDisplay) {
        filterInfoPill.style.display = 'flex';
        filterPillSwatch.style.backgroundColor = currentFilterColor;
        filterPillHexDisplay.textContent = currentFilterColor.toUpperCase();
    }

    if (isUserInitiatedFilter) {
        initialFilteredAccordionIds.clear();
    }
    let totalVisibleAccordionsAcrossAllSections = 0; // Keep track of visible items


    function processSection(containerElement, accordionSelector, getColorFromAccordionFn, isMultiStopType = false) {
        if (!containerElement) return 0;

        const allAccordionsInDOM = Array.from(containerElement.querySelectorAll(accordionSelector));
        let visibleAccordionCountInSection = 0;
        const accordionsToSort = [];

        allAccordionsInDOM.forEach(accordion => {
            const accordionId = accordion.dataset.id;
            if (!accordionId) {
                console.warn("Accordion missing dataset.id in container:", containerElement.id, accordion);
                return;
            }

            let currentDistance = Infinity;
            let matchesNow = false;
            const body = accordion.querySelector('.accordion-body, .gradient-content');
            let hasMatchingStopInternally = false; // Specifically for multi-stop types

            if (isMultiStopType) {
                let minStopDistance = Infinity;
                if (body) {
                    const rows = body.querySelectorAll('.stop-row, .text-instance-row');
                    rows.forEach(row => {
                        const colorInput = row.querySelector('input[type="color"]');
                        if (colorInput) {
                            const stopHex = colorInput.value.toLowerCase();
                            const stopRgb = hexToRgbComponents(stopHex);
                            const dist = colorDistance(pickedRgb, stopRgb);
                            if (dist <= COLOR_DISTANCE_TOLERANCE) {
                                hasMatchingStopInternally = true;
                                minStopDistance = Math.min(minStopDistance, dist);
                            }
                        }
                    });
                }
                if (hasMatchingStopInternally) {
                    matchesNow = true;
                    currentDistance = minStopDistance;
                }
            } else { // Solid Colors, Animated Solid Colors
                const accordionColorHex = getColorFromAccordionFn(accordion);
                if (accordionColorHex) {
                    const accordionRgb = hexToRgbComponents(accordionColorHex);
                    currentDistance = colorDistance(pickedRgb, accordionRgb);
                    if (currentDistance <= COLOR_DISTANCE_TOLERANCE) {
                        matchesNow = true;
                    }
                }
            }

            if (isUserInitiatedFilter && matchesNow) {
                initialFilteredAccordionIds.add(accordionId);
            }

            let sortKey;
            if (matchesNow) { // sortKey = 0
                sortKey = 0;
                accordion.classList.remove('hidden-by-filter', 'accordion-filtered-nomatch');
                if (body) {
                    const rows = body.querySelectorAll('.color-row, .stop-row, .text-instance-row');
                    rows.forEach(row => {
                        row.style.display = ''; // Show all rows within a matching accordion
                        // Optionally, still style individual rows if they don't match the filter color
                        let rowIndividuallyMatches = false;
                        const colorInput = row.querySelector('input[type="color"]');
                        if (colorInput) {
                            const rowHex = colorInput.value.toLowerCase();
                            if (colorDistance(pickedRgb, hexToRgbComponents(rowHex)) <= COLOR_DISTANCE_TOLERANCE) {
                                rowIndividuallyMatches = true;
                            }
                        }
                        row.classList.toggle('row-filtered-nomatch', !rowIndividuallyMatches);
                    });
                }
                visibleAccordionCountInSection++;
            } else if (initialFilteredAccordionIds.has(accordionId)) { // sortKey = 1
                sortKey = 1;
                currentDistance = Infinity;
                accordion.classList.remove('hidden-by-filter');
                accordion.classList.add('accordion-filtered-nomatch');
                if (body) { // Show ALL rows as per main requirement for this state
                    const rows = body.querySelectorAll('.color-row, .stop-row, .text-instance-row');
                    rows.forEach(row => {
                        row.style.display = '';
                        let rowIndividuallyMatches = false; // Check even for these rows
                        const colorInput = row.querySelector('input[type="color"]');
                        if (colorInput) {
                            const rowHex = colorInput.value.toLowerCase();
                            if (colorDistance(pickedRgb, hexToRgbComponents(rowHex)) <= COLOR_DISTANCE_TOLERANCE) {
                                rowIndividuallyMatches = true;
                            }
                        }
                        row.classList.toggle('row-filtered-nomatch', !rowIndividuallyMatches);
                    });
                }
                visibleAccordionCountInSection++;
            } else { // sortKey = 2
                sortKey = 2;
                currentDistance = Infinity;
                accordion.classList.add('hidden-by-filter');
                accordion.classList.remove('accordion-filtered-nomatch');
            }
            accordionsToSort.push({ element: accordion, sortKey, distance: currentDistance });
        });

        accordionsToSort.sort((a, b) => {
            if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
            return a.distance - b.distance;
        });

        const fragment = document.createDocumentFragment();
        accordionsToSort.forEach(item => fragment.appendChild(item.element));
        containerElement.innerHTML = '';
        containerElement.appendChild(fragment);

        return visibleAccordionCountInSection;
    }

    // --- Process Sections ---
    const solidColorsVisibleCount = processSection(
        document.getElementById('colorEditor'),
        '.accordion',
        (acc) => acc.querySelector('.accordion-header-controls input[type="text"]')?.value.toLowerCase()
    );
     totalVisibleAccordionsAcrossAllSections += solidColorsVisibleCount;
    document.getElementById('colorInstancesLabel').style.display = solidColorsVisibleCount > 0 ? 'block' : 'none';

    const animatedSolidColorsVisibleCount = processSection(
        document.getElementById('animatedColorEditor'),
        '.gradient-accordion',
        (acc) => acc.querySelector('.accordion-header-controls input[type="text"]')?.value.toLowerCase()
    );
     totalVisibleAccordionsAcrossAllSections += animatedSolidColorsVisibleCount;
    document.getElementById('animatedColorLabel').style.display = animatedSolidColorsVisibleCount > 0 ? 'block' : 'none';

    const gradientsVisibleCount = processSection(
        document.getElementById('stopEditor'),
        '.gradient-accordion',
        null,
        true
    );
     totalVisibleAccordionsAcrossAllSections += gradientsVisibleCount;
    document.getElementById('gradientInstancesLabel').style.display = gradientsVisibleCount > 0 ? 'block' : 'none';

    const animatedGradientsVisibleCount = processSection(
        document.getElementById('animatedGradientEditor'),
        '.gradient-accordion',
        null,
        true
    );
     totalVisibleAccordionsAcrossAllSections += animatedGradientsVisibleCount;
    document.getElementById('animatedGradientLabel').style.display = animatedGradientsVisibleCount > 0 ? 'block' : 'none';

    const textMainAccordion = document.getElementById('detected-text-main-accordion');
    let textSectionOverallVisible = false;
    if (textMainAccordion) {
        const dummyTextContainer = document.createElement('div');
        const clonedTextAccordion = textMainAccordion.cloneNode(true);
        dummyTextContainer.appendChild(clonedTextAccordion);

        processSection( // This will apply the new row visibility logic to the clone
            dummyTextContainer,
            '.gradient-accordion',
            null,
            true
        );

        // Reflect changes from the processed clone back to the original textMainAccordion in the DOM
        textMainAccordion.className = clonedTextAccordion.className; // Sync classes like hidden-by-filter, accordion-filtered-nomatch

        const originalRows = textMainAccordion.querySelectorAll('.text-instance-row');
        const clonedRows = clonedTextAccordion.querySelectorAll('.text-instance-row');
        originalRows.forEach((origRow, index) => {
            if (clonedRows[index]) {
                origRow.style.display = clonedRows[index].style.display; // Sync display style (most important)
                origRow.className = clonedRows[index].className; // Sync classes like 'row-filtered-nomatch'
            }
        });
        textSectionOverallVisible = !textMainAccordion.classList.contains('hidden-by-filter');
        if (textSectionOverallVisible) {
             totalVisibleAccordionsAcrossAllSections++; // Count the main text accordion if it's visible
        }

    }
    document.getElementById('textEditorLabel').style.display = textSectionOverallVisible ? 'block' : 'none';

    // --- Handle Empty State for No Filter Results ---
const emptyStateDiv = document.getElementById('emptyStateDiv');


if (totalVisibleAccordionsAcrossAllSections === 0) {
    // If no accordions are visible in any section after filtering
    if (emptyStateDiv) {
        emptyStateDiv.style.display = 'flex'; // Show empty state
        // Optionally change the image/text for "no results"

    }

}
// --- End Empty State Handling ---

   durationpill.style.display = 'flex';
    previewBgToggleContainer.style.display = 'flex';
    if (isUserInitiatedFilter) {
        isUserInitiatedFilter = false;
    }
}

    function updatePreviewBackground() {
      const previewBgToggle = document.getElementById('previewBgToggle'); // Ref for the new toggle
const windowBody = document.getElementById('lottiePreview');         // Ref for the preview area body

  if (!previewBgToggle || !windowBody || !bgColorPicker) return;

  if (previewBgToggle.checked) {
    // Solid Background Mode
    // Explicitly remove just in case
    windowBody.style.background = bgColorPicker.value;
  } else {
    // Checkerboard Mode


    windowBody.style.background = 'none'; // Remove inline style to let CSS handle it
  }
}


    // --- Initial Setup ---

/**
 * Loads a Lottie animation from a URL parameter.
 * Checks for `?lottie=<ID>` in the URL, fetches the JSON from jsonkeeper,
 * and simulates a file upload to load it into the tool.
 * @returns {Promise<boolean>} A promise that resolves to `true` if an animation was loaded, `false` otherwise.
 */
async function loadLottieFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const lottieId = urlParams.get('lottie');

    if (!lottieId) {
        console.log("No 'lottie' URL parameter found. Skipping URL load.");
        return false; // Indicate no URL was processed
    }

    console.log(`Found 'lottie' URL parameter with ID: ${lottieId}`);
    const jsonUrl = `https://www.jsonkeeper.com/b/${lottieId}`;

    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const lottieJson = await response.json();

        // Use the 'nm' property for the filename, with a fallback.
        const animationName = lottieJson.nm || `animation_${lottieId}`;
        const fileName = `${animationName}.json`;

        console.log(`Successfully fetched Lottie. Name: ${fileName}`);

        // Create a mock File object to simulate an upload
        const jsonString = JSON.stringify(lottieJson);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const mockFile = new File([blob], fileName, { type: 'application/json' });

        const mockEvent = {
            target: {
                files: [mockFile]
            }
        };

        await handleFileLoad(mockEvent, false); // Process the mock file event
        return true; // Indicate success
    } catch (error) {
        console.error(`Failed to load Lottie from URL: ${jsonUrl}`, error);
        alert(`Failed to load Lottie from the provided URL parameter: ${error.message}`);
        return false; // Indicate failure
    }
}

/**
 * Loads a Lottie animation and its state machine from a URL parameter.
 * Checks for `?dotLottie=<ID>` in the URL, fetches a JSON containing both
 * animation and state machine data, constructs a .lottie file in memory,
 * and simulates a file upload to load it into the tool.
 * @returns {Promise<boolean>} A promise that resolves to `true` if a file was loaded, `false` otherwise.
 */
async function loadDotLottieFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const dotLottieId = urlParams.get('dotLottie');

    if (!dotLottieId) {
        return false; // No parameter found
    }

    console.log(`Found 'dotLottie' URL parameter with ID: ${dotLottieId}`);
    const jsonUrl = `https://www.jsonkeeper.com/b/${dotLottieId}`;

    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const combinedJson = await response.json();

        // Validate the fetched JSON structure
        if (!combinedJson.animation || !combinedJson.stateMachine) {
            throw new Error("Fetched JSON is missing 'animation' or 'stateMachine' key.");
        }

        console.log("Successfully fetched combined animation and state machine data.");

        // --- NEW: Use the animation's 'nm' property for naming ---
        const animationName = combinedJson.animation.nm || `url_loaded_${dotLottieId}`;
        const sanitizedAnimationName = animationName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const dotLottieFileName = `${sanitizedAnimationName}.lottie`;
        const jsonFileName = `${sanitizedAnimationName}.json`;
        // --- END NEW ---

        // --- NEW: Synchronize the state machine to use the new animation name ---
        const stateMachineJson = combinedJson.stateMachine;
        if (stateMachineJson && Array.isArray(stateMachineJson.states)) {
            stateMachineJson.states.forEach(state => {
                // Unconditionally update the animation property for all playback states
                // to match the ID of the animation being bundled.
                if (state.type === 'PlaybackState') {
                    state.animation = sanitizedAnimationName;
                }
            });
        }

        // --- Create a mock .lottie file in memory using JSZip ---
        if (typeof JSZip === 'undefined') {
            throw new Error("JSZip library is not loaded, cannot create .lottie file.");
        }

        const zip = new JSZip();

        // 1. Create manifest.json
        const manifest = {
            version: "1.0",
            generator: "LottieMon URL Loader",
            animations: [{ "id": sanitizedAnimationName }], // Use the animation name as ID
            stateMachines: [{ "id": sanitizedAnimationName }] // Use the animation name as ID
        };
        zip.file("manifest.json", JSON.stringify(manifest));

        // 2. Add animation and state machine data to their respective folders
        zip.folder("animations").file(jsonFileName, JSON.stringify(combinedJson.animation));
        zip.folder("states").file(jsonFileName, JSON.stringify(stateMachineJson)); // Use the updated state machine JSON

        // 3. Generate the blob
        const dotLottieBlob = await zip.generateAsync({ type: "blob" });

        // 4. Create a mock File object
        const mockFile = new File([dotLottieBlob], dotLottieFileName, { type: 'application/zip' });

        // 5. Create a mock event and process the file
        const mockEvent = {
            target: {
                files: [mockFile]
            }
        };

        await handleFileLoad(mockEvent, false); // Process the mock file event

        // --- MODIFIED: Only open runner if postcard=yes ---
        const postcardParam = urlParams.get('postcard');
        if (postcardParam && postcardParam.toLowerCase() === 'yes') {
            await openStateMachineRunnerOverlay(combinedJson, true);
        }
        // --- END MODIFICATION ---
        
        return true; // Indicate success

    } catch (error) {
        console.error(`Failed to load Lottie and State Machine from URL: ${jsonUrl}`, error);
        alert(`Failed to load from the provided URL parameter: ${error.message}`);
        return false; // Indicate failure
    }
}

/**
 * Loads a Lottie JsssSON from a Google Drive URL parameter.
 * Checks for `?gdrivelottie=<ID>` in the URL, fetches the JSON from Google Drive,
 * and simulates a file upload to load it into the tool.
 * @returns {Promise<boolean>} A promise that resolves to `true` if an animation was loaded, `false` otherwise.
 */
async function loadGdriveLottieFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const gdriveLottieId = urlParams.get('gdrivelottie');

    if (!gdriveLottieId) {
        return false; // No parameter found
    }

    console.log(`Found 'gdrivelottie' URL parameter with ID: ${gdriveLottieId}`);
    // Construct the direct download link for Google Drive
    const gdriveUrl = `https://drive.google.com/uc?id=${gdriveLottieId}&export=download`;
          
    // --- FIX: Use a CORS proxy to bypass browser security restrictions ---
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(gdriveUrl)}`;

    try {
        // --- FIX: Fetch from the proxyUrl, not the direct gdriveUrl ---
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // --- FIX: Check for Google's HTML warning page (e.g., virus scan) ---
        // If the proxy returns an HTML page, it's not our JSON.
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
           throw new Error('File could not be accessed directly. It may be too large for Google to scan or requires confirmation.');
        }

        const lottieJson = await response.json();

        // Use the 'nm' property for the filename, with a fallback.
        const animationName = lottieJson.nm || `gdrive_${gdriveLottieId}`;
        const fileName = `${animationName}.json`;

        console.log(`Successfully fetched Lottie from Google Drive. Name: ${fileName}`);

        // Create a mock File object to simulate an upload
        const jsonString = JSON.stringify(lottieJson);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const mockFile = new File([blob], fileName, { type: 'application/json' });

        const mockEvent = {
            target: {
                files: [mockFile]
            }
        };

        await handleFileLoad(mockEvent, false); // Process the mock file event
        return true; // Indicate success

    } catch (error) {
        // --- FIX: Add specific error handling for JSON parsing errors ---
        if (error instanceof SyntaxError) {
             // This often happens if we receive an HTML error page instead of JSON
             console.error(`Failed to parse response as JSON. The file might not be valid JSON, or the proxy returned an error page.`, error);
             alert(`Failed to load Lottie: The file is not valid JSON or could not be accessed from Google Drive.`);
        } else {
             // Handle other errors (network, HTTP status, etc.)
             console.error(`Failed to load Lottie from Google Drive URL: ${gdriveUrl}`, error);
             alert(`Failed to load Lottie from the provided Google Drive URL parameter: ${error.message}`);
        }
        return false; // Indicate failure
    }
}
/**
 * Loads a .lottie file from a Google Drive URL parameter.
 * Checks for `?gdriveDotlottie=<ID>` in the URL, fetches the file from Google Drive,
 * and simulates a file upload to load it into the tool.
 * @returns {Promise<boolean>} A promise that resolves to `true` if a file was loaded, `false` otherwise.
 */
async function loadGdriveDotLottieFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const gdriveDotLottieId = urlParams.get('gdriveDotlottie');

    if (!gdriveDotLottieId) {
        return false; // No parameter found
    }

    console.log(`Found 'gdriveDotlottie' URL parameter with ID: ${gdriveDotLottieId}`);
    const gdriveUrl = `https://drive.google.com/uc?id=${gdriveDotLottieId}&export=download`;

    // --- FIX: Use a CORS proxy to bypass browser security restrictions ---
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(gdriveUrl)}`;

    try {
        // --- FIX: Fetch from the proxyUrl, not the direct gdriveUrl ---
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // --- MODIFICATION: Expect JSON, not a blob ---
        const combinedJson = await response.json();

        // Validate the fetched JSON structure
        if (!combinedJson.animation || !combinedJson.stateMachine) {
            throw new Error("Fetched JSON from Google Drive is missing 'animation' or 'stateMachine' key.");
        }

        console.log("Successfully fetched combined animation and state machine data from Google Drive.");

        // --- Logic copied from loadDotLottieFromUrl to build .lottie in memory ---
        const animationName = combinedJson.animation.nm || `gdrive_${gdriveDotLottieId}`;
        const sanitizedAnimationName = animationName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const dotLottieFileName = `${sanitizedAnimationName}.lottie`;
        const jsonFileName = `${sanitizedAnimationName}.json`;

        // Synchronize the state machine to use the new animation name
        const stateMachineJson = combinedJson.stateMachine;
        if (stateMachineJson && Array.isArray(stateMachineJson.states)) {
            stateMachineJson.states.forEach(state => {
                // Unconditionally update the animation property for all playback states
                if (state.type === 'PlaybackState') {
                    state.animation = sanitizedAnimationName;
                }
            });
        }

        // Create a mock .lottie file in memory using JSZip
        if (typeof JSZip === 'undefined') {
            throw new Error("JSZip library is not loaded, cannot create .lottie file.");
        }

        const zip = new JSZip();

        // 1. Create manifest.json
        const manifest = {
            version: "1.0",
            generator: "LottieMon GDrive Loader",
            animations: [{ "id": sanitizedAnimationName }],
            stateMachines: [{ "id": sanitizedAnimationName }]
        };
        zip.file("manifest.json", JSON.stringify(manifest));

        // 2. Add animation and state machine data
        zip.folder("animations").file(jsonFileName, JSON.stringify(combinedJson.animation));
        zip.folder("states").file(jsonFileName, JSON.stringify(stateMachineJson));

        // 3. Generate the blob
        const dotLottieBlob = await zip.generateAsync({ type: "blob" });
        
        // 4. Create a mock File object
        const mockFile = new File([dotLottieBlob], dotLottieFileName, { type: 'application/zip' });
        
        // Now, process the file as if it were uploaded
        await handleFileLoad({ target: { files: [mockFile] } }, false);
        
        // --- MODIFIED: Only open runner if postcard=yes ---
        const postcardParam = urlParams.get('postcard');
        if (postcardParam && postcardParam.toLowerCase() === 'yes') {
            await openStateMachineRunnerOverlay(combinedJson, true);
        }
        // --- END MODIFICATION ---
        
        return true; // Indicate success
    } catch (error) { // This outer catch will now catch JSON parsing errors, etc.
        console.error(`Failed to load/process data from Google Drive URL: ${gdriveUrl}`, error);
        alert(`Failed to load data from the provided Google Drive URL parameter: ${error.message}`);
        return false; // Indicate failure
    }
}




document.addEventListener('DOMContentLoaded', async () => {

     setupSegmentedControls('videoScaleControls');
        setupSegmentedControls('videoFpsControls');

      const dragDropLottieContainer = document.getElementById('dragDropLottie');
       // const dragDropLottieAnimation; // Already declared globally

       if (dragDropLottieContainer) {
           dragDropLottieAnimation = lottie.loadAnimation({
               container: dragDropLottieContainer,
               renderer: 'svg',
               loop: false, // We will control looping per segment
               autoplay: false, // We will start it manually
               path: 'upload.json' // Make sure this path is correct
           });

           dragDropLottieAnimation.addEventListener('DOMLoaded', () => {
               const markers = dragDropLottieAnimation.animationData.markers || [];
               let foundSegmentsCount = 0;
               markers.forEach(marker => {
                   if (dragDropSegments[marker.cm] !== undefined) { // Check if segment name is one we care about
                       dragDropSegments[marker.cm] = [marker.tm, marker.tm + marker.dr];
                       foundSegmentsCount++;
                   }
               });

               if (foundSegmentsCount < Object.keys(dragDropSegments).length) {
                   console.warn('Not all expected markers (idle, waiting, catch) were found in upload_animation.json.');
               }
               playDragDropSegment('idle', true, DRAG_DROP_SPEEDS.idle); // Start with looping idle segment
           });

           dragDropLottieAnimation.addEventListener('complete', onDragDropSegmentComplete);
       }
       



           // Try to load from URL first.
    const loadedFromUrl = await loadLottieFromUrl();

    // If not loaded from URL, run the contextual chat bubble logic.
    if (!loadedFromUrl) {
        // --- NEW: Try the new dotLottie parameter if the first one fails ---
        const loadedFromDotLottie = await loadDotLottieFromUrl();
        if (!loadedFromDotLottie) {
            const loadedFromGdriveLottie = await loadGdriveLottieFromUrl();
            if (!loadedFromGdriveLottie) {
                const loadedFromGdriveDotLottie = await loadGdriveDotLottieFromUrl();
                if (!loadedFromGdriveDotLottie) {
                    updateChatBubbleContextually();
                }
            }
        } else {
            updateChatBubbleContextually();
        }
    } 

 // --- Feature Degradation Logic ---
    const isLocalRun = window.location.protocol === 'file:';
    let bypassActive = false; // New flag to track if bypass is active
    let bypassTimer = null; // Timer for the long press bypass

    if (isLocalRun) {
        console.warn("Local execution detected (file:// protocol). Disabling advanced features.");

        // 1. Create and inject the warning banner
        const body = document.body;
        const bannerHtml = `
            <div id="localRunBanner" style="
                background-color: #ffe0b2; /* Light orange */
                color: #e65100; /* Darker orange text */
                padding: 12px 20px;
                text-align: center;
                font-family: 'Inter', sans-serif;
                font-size: 0.95em;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                z-index: 9999;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                user-select: none; /* Prevent text selection during long press */
                -webkit-user-select: none; /* For Safari */
                -moz-user-select: none; /* For Firefox */
                -ms-user-select: none; /* For IE/Edge */
            ">
                <span style="font-weight: 500;">Heads Up!</span> It looks like you're running LottieMon locally. For the best experience and full features, please use the official online version.
                <a href="YOUR_GITHUB_PAGES_URL_HERE" target="_blank" style="color: #e65100; text-decoration: underline; font-weight: 600;">Go to Online Version</a>
                <button id="dismissLocalRunBannerBtn" style="
                    background: none;
                    border: none;
                    font-size: 1.5em;
                    cursor: pointer;
                    color: #e65100;
                    margin-left: auto; /* Push to the right */
                    padding: 0 5px;
                ">&times;</button>
            </div>
        `;
        body.insertAdjacentHTML('afterbegin', bannerHtml);

        const localRunBanner = document.getElementById('localRunBanner');
        const dismissLocalRunBannerBtn = document.getElementById('dismissLocalRunBannerBtn');

        // Add event listener to dismiss the banner normally
        if (dismissLocalRunBannerBtn) {
            dismissLocalRunBannerBtn.addEventListener('click', () => {
                localRunBanner.style.display = 'none';
            });
        }

        // --- New Long Press Bypass Logic ---
        if (localRunBanner) {
            localRunBanner.addEventListener('mousedown', (event) => {
                // Check if Command (macOS) or Control (Windows/Linux) key is pressed
                if (event.metaKey || event.ctrlKey) {
                    // Prevent default text selection which can interfere with long press
                    event.preventDefault();
                    console.log("Ctrl/Cmd held. Starting bypass timer...");
                    // Start a timer for 2 seconds
                    bypassTimer = setTimeout(() => {
                        console.log("Bypass timer complete. Activating bypass!");
                        bypassActive = true;
                        localRunBanner.style.display = 'none'; // Dismiss the banner
                        enableRestrictedFeatures(); // Call function to re-enable
                        bypassTimer = null; // Reset timer for next use
                    }, 2000); // 2000 milliseconds = 2 seconds
                }
            });

            // If mouse is released or leaves the banner before 2 seconds, clear the timer
            localRunBanner.addEventListener('mouseup', () => {
                if (bypassTimer) {
                    clearTimeout(bypassTimer);
                    bypassTimer = null;
                    console.log("Mouse released. Bypass timer cleared.");
                }
            });

            localRunBanner.addEventListener('mouseleave', () => {
                if (bypassTimer) {
                    clearTimeout(bypassTimer);
                    bypassTimer = null;
                    console.log("Mouse left banner. Bypass timer cleared.");
                }
            });
        }
        // --- End New Long Press Bypass Logic ---


       


        // 2. Reference your buttons by their IDs
        const downloadGifBtn = document.getElementById('downloadGifBtn');
        const openOverlayBtn = document.getElementById('openOverlayBtn');      // Trim editor
        const openCropBtn = document.getElementById('openCropBtn');            // Crop editor
        const openAssetReplacerBtn = document.getElementById('openAssetReplacerBtn'); // Asset Replacer



        const previewBgToggle = document.getElementById('previewBgToggle');
        const bgColorPicker = document.getElementById('bgColorPicker');
        const bgHexInput = document.getElementById('bgHexInput');
        const gifScaleSelect = document.getElementById('gifScale');
        const gifOptionsCard = document.getElementById('gifOptionsCard');

        // Function to disable features
        function disableRestrictedFeatures() {

		 trimEditorSrcCurrent = 'notfound.html';
   assetReplacerSrcCurrent = 'notfound.html';
   cropEditorSrcCurrent = 'notfound.html';
  featureUnavailablePageCurrent = 'notfound.html';



            if (downloadGifBtn) {
                downloadGifBtn.disabled = true;
                downloadGifBtn.style.pointerEvents = 'none';
            }
            if (openOverlayBtn) {
                openOverlayBtn.disabled = true;
                openOverlayBtn.style.pointerEvents = 'none';
            }
            if (openCropBtn) {
                openCropBtn.disabled = true;
                openCropBtn.style.pointerEvents = 'none';
            }
            if (openAssetReplacerBtn) {
                openAssetReplacerBtn.disabled = true;
                openAssetReplacerBtn.style.pointerEvents = 'none';
            }

            if (previewBgToggle) {
                previewBgToggle.disabled = true;
                previewBgToggle.style.pointerEvents = 'none';
            }
            if (bgColorPicker) {
                bgColorPicker.disabled = true;
                bgColorPicker.style.pointerEvents = 'none';
            }
            if (bgHexInput) {
                bgHexInput.disabled = true;
                bgHexInput.style.pointerEvents = 'none';
            }
            if (gifScaleSelect) {
                gifScaleSelect.disabled = true;
                gifScaleSelect.style.pointerEvents = 'none';
            }
            if (gifOptionsCard) {
                gifOptionsCard.style.opacity = '0.6'; // Still dim the card for visual feedback
            }
        }

        // Function to re-enable features
        function enableRestrictedFeatures() {
 trimEditorSrcCurrent = 'overlay.html';
   assetReplacerSrcCurrent = 'asset_replacer.html';
   cropEditorSrcCurrent = 'crop.html';
  featureUnavailablePageCurrent = 'notfound.html';

            if (downloadGifBtn) {
                downloadGifBtn.disabled = false;
                downloadGifBtn.style.pointerEvents = 'auto'; // Re-enable pointer events
            }
            if (openOverlayBtn) {
                openOverlayBtn.disabled = false;
                openOverlayBtn.style.pointerEvents = 'auto';
            }
            if (openCropBtn) {
                openCropBtn.disabled = false;
                openCropBtn.style.pointerEvents = 'auto';
            }
            if (openAssetReplacerBtn) {
                openAssetReplacerBtn.disabled = false;
                openAssetReplacerBtn.style.pointerEvents = 'auto';
            }

            if (previewBgToggle) {
                previewBgToggle.disabled = false;
                previewBgToggle.style.pointerEvents = 'auto';
            }
            if (bgColorPicker) {
                bgColorPicker.disabled = false;
                bgColorPicker.style.pointerEvents = 'auto';
            }
            if (bgHexInput) {
                bgHexInput.disabled = false;
                bgHexInput.style.pointerEvents = 'auto';
            }
            if (gifScaleSelect) {
                gifScaleSelect.disabled = false;
                gifScaleSelect.style.pointerEvents = 'auto';
            }
             if (gifOptionsCard) {
                gifOptionsCard.style.opacity = ''; // Remove dimming
            }
            // Trigger an update to the download buttons state in case they were hidden
            updateDownloadButtonsState(); // This will re-evaluate based on lottieData being loaded
        }

        // Initially disable features if it's a local run
        disableRestrictedFeatures();

    } else {
        // If it's NOT a local run (i.e., online), ensure all features are enabled by default.
        // This is important in case of a page reload or initial load.
        // The default state of your buttons in HTML should be enabled,
        // and they'll be managed by `updateDownloadButtonsState` later.
    }

    // --- End Feature Degradation Logic ---

      //START COFFEE

      const lottieTriggerElement = document.getElementById('headerLottie');
  const coffeeRoastOverlayElement = document.getElementById('coffeeRoastOverlay');
  const freshBrewFrameElement = document.getElementById('freshBrewFrame');
  const closeEspressoShotBtnElement = document.getElementById('closeEspressoShotBtn');

  const coffeeOrderPageUrl = 'buycoffee.html'; // Your HTML file


    if (openMaximizePreviewBtn) {
        openMaximizePreviewBtn.addEventListener('click', openMaximizePreview);
    }

    if (closeMaximizePreviewBtn) {
        closeMaximizePreviewBtn.addEventListener('click', closeMaximizePreview);
    }

    // Close modal if backdrop is clicked
    if (maximizePreviewOverlay) {
        maximizePreviewOverlay.addEventListener('click', (e) => {
            if (e.target === maximizePreviewOverlay) {
                closeMaximizePreview();
            }
        });
    }



  if (lottieTriggerElement) {
    lottieTriggerElement.addEventListener('click', function() {
      freshBrewFrameElement.src = coffeeOrderPageUrl;
      coffeeRoastOverlayElement.classList.remove('coffeeRoast-hidden');
      coffeeRoastOverlayElement.classList.add('coffeeRoast-visible');
      document.body.style.overflow = 'hidden'; // Optional: Disable body scroll
    });
  } else {
    console.error("Lottie trigger element (e.g., #headerLottie) not found.");
  }

  if (closeEspressoShotBtnElement) {
    closeEspressoShotBtnElement.addEventListener('click', function() {
      closeTheCafe();
    });
  }

  if (coffeeRoastOverlayElement) {
    coffeeRoastOverlayElement.addEventListener('click', function(event) {
      if (event.target === coffeeRoastOverlayElement) {
        closeTheCafe();
      }
    });
  }

  function closeTheCafe() {
    coffeeRoastOverlayElement.classList.remove('coffeeRoast-visible');
    coffeeRoastOverlayElement.classList.add('coffeeRoast-hidden');
    freshBrewFrameElement.src = ''; // Clear iframe to stop content
    document.body.style.overflow = 'auto'; // Optional: Re-enable body scroll
  }






// END COFFEE


        updateDownloadButtonsState(); // Set initial button states (disabled)
        initSettingsSync(); // Setup sync for overlay color/hex inputs
        bgColorGroup.classList.toggle('hidden', !transparentBgCheckbox.checked);


        // Ensure empty state is hidden on initial load
 const emptyStateDiv = document.getElementById('emptyStateDiv');
 if (emptyStateDiv) {
     emptyStateDiv.style.display = 'none';
 }



        const previewBgToggle = document.getElementById('previewBgToggle'); // Ref for the new toggle
 const windowBody = document.getElementById('lottiePreview');         // Ref for the preview area body


 if (previewBgToggle && windowBody && bgColorPicker) {
     previewBgToggle.addEventListener('change', () => {
       updatePreviewBackground();
     });
   } else {
     console.warn("Could not find elements needed for preview background toggle.");
   }

   // Also update preview background if the GIF color picker changes AND solid mode is active
   if (bgColorPicker && windowBody && previewBgToggle) {
     bgColorPicker.addEventListener('input', () => {
       if (previewBgToggle.checked) { // Only update if toggle is ON
         windowBody.style.backgroundColor = bgColorPicker.value;
       }
     });
     // Sync from hex input too
      bgHexInput.addEventListener('change', () => {
       if (previewBgToggle.checked) { // Only update if toggle is ON
         windowBody.style.backgroundColor = bgColorPicker.value; // bgColorPicker is already synced
       }
     });
   }




        // >>> START: Add this block <<<
const initialPositionRef = document.querySelector('.drag-drop-overlay');
const containerToPosition = document.querySelector('.window-container');

if (initialPositionRef && containerToPosition) {
    const refRect = initialPositionRef.getBoundingClientRect();
    // Set initial position based on the drag-drop overlay's viewport position
    // Add scroll offsets in case the page is already scrolled on load

    containerToPosition.style.top = `${refRect.top + window.scrollY}px`;
    containerToPosition.style.left = `${refRect.left + window.scrollX}px`;
    containerToPosition.style.visibility = 'visible'; // Make it visible now that it's positioned
    console.log('Initial window-container position set to:', containerToPosition.style.top, containerToPosition.style.left);
} else {
    console.warn('Could not find .drag-drop-overlay or .window-container for initial positioning.');
    if (containerToPosition) containerToPosition.style.visibility = 'visible'; // Make visible anyway if found
}
// >>> END: Add this block <<<


        if (windowTitle && windowTitle.contentEditable === 'true') {

    // On FOCUS (clicking into the title)
    windowTitle.addEventListener('focus', () => {
        const currentText = windowTitle.textContent.trim();
        if(isDotLottieLoaded) {
          if (/\.lottie/i.test(currentText)) {
              windowTitle.textContent = currentText.replace(/\.lottie$/i, '');
          }
          return;
        }
        // If it ends with .json, remove it for editing
        if (/\.json$/i.test(currentText)) {
            windowTitle.textContent = currentText.replace(/\.json$/i, '');
        }
    });

    // On BLUR (clicking out of the title)
    windowTitle.addEventListener('blur', () => {
        let currentText = windowTitle.textContent.trim();

        // Handle if the user deleted all text
        if (!currentText) {
            currentText = 'animation'; // Default base name
            console.warn("Filename was empty on blur, resetting to 'animation.json'");
        }
        if(isDotLottieLoaded){
          if (!/\.lottie$/i.test(currentText)) {
              windowTitle.textContent = currentText + '.lottie';
          } else {
              // If it already ends with .json, just make sure the trimmed value is set back
              windowTitle.textContent = currentText;
          }

          return;
        }
        // Append .json if it's missing (case-insensitive)
        if (!/\.json$/i.test(currentText)) {
            windowTitle.textContent = currentText + '.json';
        } else {
            // If it already ends with .json, just make sure the trimmed value is set back
            windowTitle.textContent = currentText;
        }
    });

    // Optional: Prevent line breaks if user presses Enter
    windowTitle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent new line
            windowTitle.blur();   // Trigger blur to apply formatting and save
        }
    });




}
let resizeTimer;
window.addEventListener('resize', () => {
clearTimeout(resizeTimer);
resizeTimer = setTimeout(() => {
repositionWindowContainerX();
}, 150); // adjust debounce delay if you like
});


document.addEventListener('keydown', (event) => {
const isCtrlOrCmd = event.ctrlKey || event.metaKey;

if (isCtrlOrCmd && (event.key === 'z' || event.key === 'Z')) {
  event.preventDefault(); // Prevent brossswser's default undo (e.g., in text fields)
  performUndo();
} else if (isCtrlOrCmd && (event.key === 'y' || event.key === 'Y')) {
  event.preventDefault(); // Prevent browser's default redo
  performRedo();
}
});


    const openStateMachineBuilderBtn = document.getElementById('openStateMachineBuilderBtn');
    if (openStateMachineBuilderBtn) {
        openStateMachineBuilderBtn.addEventListener('click', () => {
            // 1. Check if there's any Lottie data loaded
            if (!lottieData) {
                alert("Please load a Lottie animation first.");
                return;
            }

            // 2. Determine which animation data and filename to send
            let dataToSend;
            let filenameToSend;

            if (isDotLottieLoaded && currentLottieIndex > -1) {
                // If a .lottie collection is active, send the currently selected animation
                dataToSend = lottieDataArray[currentLottieIndex];
                filenameToSend = lottieFileNames[currentLottieIndex];
            } else {
                // Otherwise, send the data from the single loaded JSON
                dataToSend = lottieData;
                filenameToSend = jsonWindowTitle.textContent || 'animation.json';
            }

            // 3. Open the new tab at the correct path
            const stateMachineWindow = window.open('statemachinebuilder/index.html', '_blank');

            // 4. Send data after the new window has loaded
            if (stateMachineWindow) {
                stateMachineWindow.onload = () => {
                    console.log("State machine builder window loaded. Sending data...");
                    const message = {
                        type: 'lottieDataForStateMachine', // Match the expected type
                        lottieData: dataToSend,
                        filename: filenameToSend,
                        // NEW: Check if the button has the 'has-statemachine' class.
                        // Only send state machine data if the button indicates it exists.
                        stateMachine: (openStateMachineBuilderBtn.classList.contains('has-statemachine') &&
                                       isDotLottieLoaded &&
                                       loadedStateMachines &&
                                       loadedStateMachines.length > 0)
                                      ? loadedStateMachines[0]
                                      : null,
                    };
                    // Log the data being sent for debugging purposes
                     console.log("Sending message to state machine builder:", message);
                    // Use a specific origin in production for security, e.g., window.location.origin
                    stateMachineWindow.postMessage(message, '*');
                };
            } else {
                alert("Could not open the state machine builder. Please check your browser's pop-up settings.");
            }
        });
    }


    const viewIconBtn = document.getElementById('stateMachineBtnViewIcon');
    if (viewIconBtn) {
        viewIconBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the main button's click event
            
            // Check if data is loaded before trying to run
            if (!lottieDataArray || lottieDataArray.length === 0) {
                 alert("Error: No animation data loaded to run.");
                 return;
            }
            
            // Call your existing function to open the runner overlay
            openStateMachineRunnerOverlay(); 
        });
    }
    

});




function repositionWindowContainerX() {



  const container = document.querySelector('.window-container');
    const previewArea = document.getElementById('previewArea');
  const card      = document.getElementById('jsonEditorCard');

  if (!container || !card) return;

  // 1. Get the bounding boxes
  const cardRect = card.getBoundingClientRect();
  const winRect  = container.getBoundingClientRect();
  const previewRect = previewArea.getBoundingClientRect();

  // 2. Compute the X coordinate so that container’s center
  //    aligns with card’s center


  let targetLeft;
  const deviceWidth = window.innerWidth;
  if (deviceWidth>763.63){
       let multiplier;
    if(deviceWidth>1199){ multiplier = 1200/2; }
    else{ multiplier=deviceWidth/2;}

    targetLeft = previewRect.left + multiplier*(0.52) - 200;


  }
  else {targetLeft = previewRect.left;}


   console.log("windowRectAfter:"+winRect.left);

   const translateX = targetLeft - winRect.left+translationtoX;
  // 3. Apply it directly (absolute positioning assumed in your CSS)
  /*container.style.left = `${targetLeft}px`;*/
  container.style.transform = `translate(${translateX}px, ${translationtoY}px)`;

  translationtoX = translateX;





}


window.addEventListener('load', () => {
const overlay   = document.querySelector('.drag-drop-overlay');
const container = document.querySelector('.window-container');
if (!overlay || !container) return;

const { top, left } = overlay.getBoundingClientRect();
container.style.top        = `${top  + window.scrollY}px`;
container.style.left       = `${left + window.scrollX}px`;
container.style.visibility = 'visible';
});

function recordChange(changeDetails) {
  if (!lottieData) return; // Don't record if no data loaded

  undoStack.push(changeDetails);

  // If undo stack exceeds max steps, remove the oldest one
  if (undoStack.length > MAX_UNDO_STEPS) {
    undoStack.shift(); // Removes the first (oldest) element
  }

  // A new change clears the redo stack (handles branching)
  redoStack = [];

  // Optional: Update UI to enable/disable undo/redo buttons if you add them
  // updateUndoRedoButtonStates();
  console.log('Change recorded. Undo stack size:', undoStack.length);
}




/*function getValueByPathTxt(obj, path) {
      if (!obj || !Array.isArray(path) || path.length === 0) {
          console.warn("getValueByPath: Invalid obj or path.", { obj, path });
          return undefined;
      }
      let current = obj;
      // If path[0] is 'lottieData' (a convention for paths from root),
      // start traversing from path[1]. Otherwise, use the whole path.
      const pathSegments = (path[0] === 'lottieData' && path.length > 1) ? path.slice(1) : path;

      for (let i = 0; i < pathSegments.length; i++) {
          const key = pathSegments[i];
          if (current && typeof current === 'object' && Object.prototype.hasOwnProperty.call(current, key)) {
              current = current[key];
          } else if (Array.isArray(current) && typeof key === 'number' && key >= 0 && key < current.length) {
              current = current[key];
          }
          else {
              console.warn(`getValueByPath: Invalid segment in path. Original: [${path.join(', ')}], Segment Key: '${key}' at index ${i} of effective path [${pathSegments.join(', ')}]. Current object before failing:`, current);
              return undefined;
          }
      }
      return current;
  }*/

  /**
   * Sets a value in an object using a path array.
   * Handles paths that might start with 'lottieData' if obj is the root.
   */
  function setValueByPathTxt(obj, path, newValue) {
      if (!obj || !Array.isArray(path) || path.length === 0) {
          console.warn("setValueByPath: Invalid obj or path.", { obj, path });
          return;
      }

      const pathSegments = (path[0] === 'lottieData' && path.length > 1) ? path.slice(1) : path;

      if (pathSegments.length === 0) {
           console.warn("setValueByPath: effective pathSegments is empty, cannot set value.", { originalPath: path });
           return;
      }

      let current = obj;
      for (let i = 0; i < pathSegments.length - 1; i++) {
          const key = pathSegments[i];
          // Check if current is an object or array and if the key/index is valid
          if (current && typeof current === 'object' && Object.prototype.hasOwnProperty.call(current, key)) {
              current = current[key];
          } else if (Array.isArray(current) && typeof key === 'number' && key >= 0 && key < current.length) {
               current = current[key];
          }
          else {
              console.warn(`setValueByPath: Cannot find valid object at segment. Original: [${path.join(', ')}], Segment Key: '${key}' at index ${i} of effective path [${pathSegments.join(', ')}]. Current object before failing:`, current);
              return;
          }
      }

      const lastKey = pathSegments[pathSegments.length - 1];
      if (current && typeof current === 'object') {
          if (Array.isArray(current) && typeof lastKey !== 'number') {
              console.warn(`setValueByPath: Trying to use non-numeric key '${lastKey}' on an array.`, { originalPath: path, parentObject: current });
              return;
          }
          current[lastKey] = newValue;
      } else {
          console.warn(`setValueByPath: Final target object (parent) is not valid or not an object. Original: [${path.join(', ')}], Last Key: '${lastKey}'. Parent object:`, current);
      }
  }







function performUndo() {
  if (undoStack.length === 0) {
    if (originalLottieDataForReset) {
      console.log("Undo stack empty, attempting to revert to original file state.");
      // To allow "redoing" the reset, we need to capture the current state vs original
      // This is complex for delta, so for now, reset won't be "redoable" in the same way.
      // A simpler "reset" would just load originalLottieDataForReset.
      // If you want reset to be part of the undo/redo chain, it needs its own delta type.

      // For now, a simple reset:
      lottieData = JSON.parse(JSON.stringify(originalLottieDataForReset));
      undoStack = []; // Clear undo stack after a full reset


      console.log("Reverted to original file state.");
    } else {
      console.log("Undo stack empty and no original data for reset.");
      return;
    }
  } else {
    const changeDetails = undoStack.pop();
    redoStack.push(changeDetails); // Push the change itself to redo

    console.log('Performing undo for:', changeDetails.type);

    if (changeDetails.type === 'SOLID_COLOR') {
      setValueByPath(lottieData, changeDetails.path, [...changeDetails.oldValue]); // Use a copy
    } else if (changeDetails.type === 'GRADIENT_STOP') {
      const gradStops = allGradients[changeDetails.gradientIndex];
      if (gradStops && gradStops[changeDetails.stopIndex]) {
        const stopToUpdate = gradStops[changeDetails.stopIndex];
        stopToUpdate.r = changeDetails.oldStopData.r;
        stopToUpdate.g = changeDetails.oldStopData.g;
        stopToUpdate.b = changeDetails.oldStopData.b;
        stopToUpdate.a = changeDetails.oldStopData.a;
        // Offset is not changed by user, so no need to revert it unless recorded.
        updateLottieGradient(); // This will update lottieData from allGradients
      }
    }else if (changeDetails.type === 'SOLID_COLOR_ACCORDION') { // New Handler
      changeDetails.items.forEach(item => {
        setValueByPath(lottieData, item.path, [...item.oldValue]); // Revert each item to its specific old RGBA
      });
    } else if (changeDetails.type === 'ANIMATED_SOLID_COLOR_KEYFRAME') { // <<< NEW HANDLER
      setValueByPath(lottieData, changeDetails.path, [...changeDetails.oldValue]);
    } else if (changeDetails.type === 'ANIMATED_GRADIENT_KEYFRAME') { // <<< NEW HANDLER
      setValueByPath(lottieData, changeDetails.path, [...changeDetails.oldValue]);
    }else if (changeDetails.type === 'ANIMATED_SOLID_COLOR_GROUP_KEYFRAME') { // <<< HANDLER
      changeDetails.items.forEach(item => {
        setValueByPath(lottieData, item.path, [...item.oldValue]);
    });
  } else if (changeDetails.type === 'NAME_CHANGE') {
    setValueByPath(lottieData, changeDetails.path, changeDetails.oldValue);
    changeDetails.items?.forEach(item => { // Handle grouped name changes if implemented
        setValueByPath(lottieData, item.path, item.oldValue);
      });
    }
    else if (changeDetails.type === 'TEXT_PROPERTY') {
    const textElement = detectedTextElements[changeDetails.textElementIndex];
    if (textElement) {
        // The path in changeDetails directly points to either '.t' or '.fc'
        // For text content: changeDetails.path would be like [...layerPath, 't', 'd', 'k', keyframeIndex, 's', 't']
        // For color: changeDetails.path would be like [...layerPath, 't', 'd', 'k', keyframeIndex, 's', 'fc']
        setValueByPathTxt(lottieData, changeDetails.path, Array.isArray(changeDetails.oldValue) ? [...changeDetails.oldValue] : changeDetails.oldValue);

        // Additionally, update the direct reference in detectedTextElements if you rely on it for UI rendering
        // This depends on how `textNodeRef` is used. If `setValueByPath` updates the original lottieData,
        // and `textNodeRef` points into `lottieData`, it should be automatically updated.
        // However, explicitly:
        if (changeDetails.path.slice(-1)[0] === 't') { // If it was a text change
             textElement.textNodeRef.t = changeDetails.oldValue;
        } else if (changeDetails.path.slice(-1)[0] === 'fc') { // If it was a color change
             textElement.textNodeRef.fc = [...changeDetails.oldValue];
        }
    }
  }

  }

  // Refresh UI (common logic after state change)
  refreshUIStateAndRender();
  // ---- ADD THIS BLOCK ----

  // ---- END ADD THIS BLOCK ----
}



function performRedo() {
  if (redoStack.length === 0) {
    console.log("Redo stack empty, nothing to redo.");
    return;
  }

  const changeDetails = redoStack.pop();
  undoStack.push(changeDetails); // Push the change itself to undo

  console.log('Performing redo for:', changeDetails.type);

  if (changeDetails.type === 'SOLID_COLOR') {
    setValueByPath(lottieData, changeDetails.path, [...changeDetails.newValue]); // Use a copy
  } else if (changeDetails.type === 'GRADIENT_STOP') {
    const gradStops = allGradients[changeDetails.gradientIndex];
    if (gradStops && gradStops[changeDetails.stopIndex]) {
      const stopToUpdate = gradStops[changeDetails.stopIndex];
      stopToUpdate.r = changeDetails.newStopData.r;
      stopToUpdate.g = changeDetails.newStopData.g;
      stopToUpdate.b = changeDetails.newStopData.b;
      stopToUpdate.a = changeDetails.newStopData.a;
      updateLottieGradient(); // This will update lottieData from allGradients
    }
  } else if (changeDetails.type === 'SOLID_COLOR_ACCORDION') { // New Handler
    const { newBaseRgbApplied, items } = changeDetails;
    items.forEach(item => {
      // For redo, apply the newBaseRgbApplied with the original alpha of the item (stored in item.oldValue[3])
      const originalAlpha = item.oldValue.length === 4 ? item.oldValue[3] : 1;
      const newColorWithOriginalAlpha = [...newBaseRgbApplied, originalAlpha];
      setValueByPath(lottieData, item.path, newColorWithOriginalAlpha);
    });
  }else if (changeDetails.type === 'ANIMATED_SOLID_COLOR_KEYFRAME') { // <<< NEW HANDLER
    setValueByPath(lottieData, changeDetails.path, [...changeDetails.newValue]);
  } else if (changeDetails.type === 'ANIMATED_GRADIENT_KEYFRAME') { // <<< NEW HANDLER
    setValueByPath(lottieData, changeDetails.path, [...changeDetails.newValue]);
  } else if (changeDetails.type === 'ANIMATED_SOLID_COLOR_GROUP_KEYFRAME') { // <<< HANDLER
    changeDetails.items.forEach(item => {
      setValueByPath(lottieData, item.path, [...item.newValue]);
    });
  } else if (changeDetails.type === 'NAME_CHANGE') {
    setValueByPath(lottieData, changeDetails.path, changeDetails.newValue);
    changeDetails.items?.forEach(item => {
        setValueByPath(lottieData, item.path, item.newValue);
    });
  }
else if (changeDetails.type === 'TEXT_PROPERTY') {
    const textElement = detectedTextElements[changeDetails.textElementIndex];
    if (textElement) {
        setValueByPath(lottieData, changeDetails.path, Array.isArray(changeDetails.newValue) ? [...changeDetails.newValue] : changeDetails.newValue);
        // Explicitly update textNodeRef for consistency:
        if (changeDetails.path.slice(-1)[0] === 't') {
             textElement.textNodeRef.t = changeDetails.newValue;
        } else if (changeDetails.path.slice(-1)[0] === 'fc') {
             textElement.textNodeRef.fc = [...changeDetails.newValue];
        }
    }
}

  // Refresh UI (common logic after state change)
  refreshUIStateAndRender();
  // ---- ADD THIS BLOCK ----

 // ---- END ADD THIS BLOCK ----
}



function refreshUIStateAndRender() {


   recordAccordionStates();

  // Re-evaluate colorRefs and allGradients from the current lottieData
  // This is important because lottieData (or allGradients that affects lottieData) has changed.
  colorRefs = [];
  findColors(lottieData); // findColors populates colorRefs

  // For gradients, if updateLottieGradient() was called, lottieData is updated.
  // We need to re-extract 'allGradients' to ensure the UI renders based on the true current state
  // of the gradient structures within lottieData, which might have been reverted.
  allGradients = extractGradientStops(lottieData);

  animatedColorRefs = [];
  findAnimatedColors(lottieData);
  animatedGradientRefs = findAnimatedGradients(lottieData);
  // Apply empty state logic
  const emptyStateDiv = document.getElementById('emptyStateDiv');
  const colorInstancesLabel = document.getElementById('colorInstancesLabel');
  const editorAreaDiv = document.getElementById('editorArea'); // Get the parent

  if (!anyContent) {
    colorEditor.style.display = 'none';
    stopEditor.style.display = 'none';
    if (colorInstancesLabel) {
        console.log("Hiding 'Color Instance Clusters' heading because no editable content was found at all.");
        colorInstancesLabel.style.display = 'none';
    }
    const gradientInstancesLabel = document.getElementById('gradientInstancesLabel');
    if (gradientInstancesLabel) gradientInstancesLabel.style.display = 'none';
    const textEditorLabel = document.getElementById('textEditorLabel');
    if (textEditorLabel) textEditorLabel.style.display = 'none';
    if(animatedGradientLabel) animatedGradientLabel.style.display = 'none';
    if (emptyStateDiv) emptyStateDiv.style.display = 'flex'; // Show empty state (use flex for centering)

    if (editorAreaDiv) editorAreaDiv.classList.add('is-empty'); // Add class to parent
    console.log("No colors or gradients detected. Displaying empty state.");
  } else {
    document.getElementById('colorEditor').style.display = 'block';
    document.getElementById('stopEditor').style.display = 'block';
    // --- FIX: Only show label if there are solid colors ---
    if (colorInstancesLabel) {
        const hasSolidColors = colorRefs.length > 0;
        if (!hasSolidColors) {
            console.log("Hiding 'Color Instance Clusters' heading because no solid colors were found (though other content might exist).");
        }
        colorInstancesLabel.style.display = hasSolidColors ? 'block' : 'none';
    }
    if (emptyStateDiv) emptyStateDiv.style.display = 'none';
    if (editorAreaDiv) editorAreaDiv.classList.remove('is-empty');
  }

  renderColorPickers();   // Renders based on current colorRefs
  renderGradientEditor();
  renderAnimatedColorEditor(); // Renders based on current allGradients
  renderAnimatedGradientEditor();
  renderTextEditorUI();

   const animatedGradientLabel = document.getElementById('animatedGradientLabel');
  const container = document.getElementById('animatedGradientEditor');
  const editableItemsRendered = container.querySelectorAll('.stop-row');
  if (animatedGradientLabel) {
    console.log('this has happened');
    animatedGradientLabel.style.display = editableItemsRendered.length > 0 ? 'block' : 'none';
  }

  reloadLottiePreview();  // Reloads Lottie player with current lottieData

  detectedTextElements = []; // <<<< ADD THIS: Clear and re-find text elements
    findTextLayersRecursive(lottieData.layers, '', ['lottieData']);
    if (lottieData.assets) {
        lottieData.assets.forEach((asset, assetIndex) => {
            if (asset.layers) {
                findTextLayersRecursive(asset.layers, asset.id || `asset${assetIndex}_`, ['lottieData', 'assets', assetIndex]);
            }
        });
    }




 
  initializeElementsToManageVisibility();
   // --- Handle Empty State and Labels AFTER rendering the base UI ---




       if (emptyStateDiv) emptyStateDiv.style.display = anyContent ? 'none' : 'flex';
       if (editorAreaDiv) editorAreaDiv.classList.toggle('is-empty', !anyContent);

       //document.getElementById('animatedGradientLabel').style.display = hasAnimatedGradients ? 'block' : 'none';
       // textEditorLabel's visibility is typically handled within renderTextEditorUI

       // --- Re-apply filter if active ---
       if (activePickedColor) {
           console.log("Re-applying filter (during undo/redo or refresh) for color:", activePickedColor);
           isUserInitiatedFilter = false; // Ensure this is false when re-applying post-undo/redo
           handleColorPickedForFiltering(activePickedColor);
       }


}

function recordAccordionStates() {
  preservedColorAccordionStates = {};
  const colorAccordions = document.querySelectorAll('#colorEditor .accordion');
  colorAccordions.forEach(accordion => {
      const id = accordion.dataset.id; // We'll add this dataset.id in renderColorPickers
      if (id) {
          const header = accordion.querySelector('.accordion-header');
          // An accordion is open if its header has the 'active' class
          preservedColorAccordionStates[id] = header ? header.classList.contains('active') : false;
      }
  });

  preservedGradientAccordionStates = {};
  const gradientAccordions = document.querySelectorAll('#stopEditor .gradient-accordion');
  gradientAccordions.forEach(accordion => {
      const id = accordion.dataset.id; // We'll add this dataset.id in renderGradientEditor
      if (id) {
          const header = accordion.querySelector('.gradient-header');
          preservedGradientAccordionStates[id] = header ? header.classList.contains('active') : false;
      }
  });

 // --- Animated Color Accordions (Updated for new ID structure) ---
  preservedAnimatedColorAccordionStates = {};
  // The new renderAnimatedColorEditor uses 'gradient-accordion' class and a new dataset.id format.
  const animatedColorAccordions = document.querySelectorAll('#animatedColorEditor .gradient-accordion');
  animatedColorAccordions.forEach(accordion => {
    // The id will be like: `anim-color-group-${hexColor.replace('#', '')}-${groupIdx}`
    const id = accordion.dataset.id;
    if (id) {
      const header = accordion.querySelector('.gradient-header'); // Still uses .gradient-header
      preservedAnimatedColorAccordionStates[id] = header ? header.classList.contains('active') : false;
    }
  });
  // --- End Animated Color Accordions ---

  // --- Animated Gradient Accordions (NEW) ---
  preservedAnimatedGradientAccordionStates = {};
  const animatedGradientAccordions = document.querySelectorAll('#animatedGradientEditor .gradient-accordion');
  animatedGradientAccordions.forEach(accordion => {
      const id = accordion.dataset.id; // We'll add this dataset.id in renderAnimatedGradientEditor
      if (id) {
          const header = accordion.querySelector('.gradient-header');
          preservedAnimatedGradientAccordionStates[id] = header ? header.classList.contains('active') : false;
      }
  });

  // --- MODIFICATION FOR TEXT ACCORDION STATE ---
    // DO NOT CLEAR preservedTextAccordionStates here:
    // preservedTextAccordionStates = {}; // <--- REMOVE THIS LINE

    const mainTextAccordion = document.getElementById('detected-text-main-accordion');
    if (mainTextAccordion) {
        // If the accordion exists in the DOM, record its current state
        const header = mainTextAccordion.querySelector('.gradient-header');
        // Use the accordion's dataset.id as the key, which is 'detected-text-main-accordion'
        if (mainTextAccordion.dataset.id) { // Ensure dataset.id exists
          preservedTextAccordionStates[mainTextAccordion.dataset.id] = header ? header.classList.contains('active') : false;
        }
    }
    // If mainTextAccordion is not found, its state in preservedTextAccordionStates remains untouched,
    // preserving the last known state (e.g., if it was open before text elements disappeared).
    // --- END MODIFICATION ---


}

function commitAfterIdle(inputEl, onCommit, delay = 150) {
  let timer = null;
  inputEl.addEventListener('input', e => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      onCommit(e.target.value);
      timer = null;
    }, delay);
  });
}


/**
 * Recursively finds animated color properties (solid or gradient)
 * i.e. where obj.c.k is an array of keyframe objects ({ t, s: [r,g,b,a], … })
 */
 function findAnimatedColors(obj, path = []) {
   if (Array.isArray(obj)) {
     obj.forEach((item, i) => findAnimatedColors(item, [...path, i]));
   } else if (obj && typeof obj === 'object') {
     // ——— SOLID COLOR ANIMATION ONLY ———
     if (
       obj.c &&                              // has a “color” property
       Array.isArray(obj.c.k) &&            // that .k is an array of keyframes
       obj.c.k.length > 0 &&                // there is at least one keyframe
       Array.isArray(obj.c.k[0].s) &&       // each keyframe has an .s stops array
       obj.c.k[0].s.length >= 3             // and that .s is at least [r,g,b]
     ) {
       const kfPaths = obj.c.k.map((_, i) => [...path, 'c', 'k', i, 's']);
       animatedColorRefs.push({
         path: [...path, 'c', 'k'],
         keyframePaths: kfPaths
       });
     }

     // ——— NO gradient logic here ———

     // recurse into every other property
     for (let key in obj) {
       findAnimatedColors(obj[key], [...path, key]);
     }
   }

   // (optional) at the very top‐level you can still print your summary:
   if (path.length === 0) {
     const solids = animatedColorRefs;
     const solidStops = solids.reduce((sum, g) => sum + g.keyframePaths.length, 0);
     console.log(
       `${solids.length} animated solid color${solids.length!==1?'s':''} found, ` +
       `${solidStops} editable stop${solidStops!==1?'s':''}`
     );
   }
 }

 function renderAnimatedColorEditor() {
  const container = document.getElementById('animatedColorEditor');
  container.innerHTML = ''; // Clear previous UI



  const animatedColorLabel = document.getElementById('animatedColorLabel');
if (!initialAnimatedColorGroupsByHex || Object.keys(initialAnimatedColorGroupsByHex).length === 0) {
    if (animatedColorLabel) animatedColorLabel.style.display = 'none';
 console.log ('whats going on');
    return;
  } else {
    if (animatedColorLabel) animatedColorLabel.style.display = 'block';
  }

 // --- 3. CHANGE: Iterate over sorted keys of initialAnimatedColorGroupsByHex for stable order ---
  const sortedInitialHexKeys = Object.keys(initialAnimatedColorGroupsByHex).sort();

  sortedInitialHexKeys.forEach((initialHexKey, groupIdx) => { // Was: Object.entries(animatedColorsByHex).forEach(([hexColor, instancesArray], groupIdx) => {
    const instancesArray = initialAnimatedColorGroupsByHex[initialHexKey]; // Get instances for this initial hex key

    // --- 4. CHANGE: Accordion ID based on initialHexKey and stable groupIdx ---
    const accordionId = `anim-color-group-${initialHexKey.replace('#', '')}-${groupIdx}`;


    const accordion = document.createElement('div');
    accordion.className = 'gradient-accordion'; // Reuse styling
    accordion.dataset.id = accordionId;

    const header = document.createElement('div');
    header.className = 'gradient-header';

    const headerContent = document.createElement('div');
    headerContent.className = 'accordion-header-content';

    const title = document.createElement('span');
    title.textContent = `${instancesArray.length} Instance${instancesArray.length > 1 ? 's' : ''}`;

    // Master color picker for the group
    const groupControls = document.createElement("div");
    groupControls.className = "accordion-header-controls color-input-group"; // Reuse styles

    const groupHexInput = document.createElement("input");
    groupHexInput.type = "text";
     groupHexInput.value = initialHexKey;
    groupHexInput.setAttribute("aria-label", `Hex code for original color group ${initialHexKey}`);


    const groupColorInput = document.createElement("input");
    groupColorInput.type = "color";
     groupColorInput.value = initialHexKey;
    groupColorInput.setAttribute("aria-label", `Picker for original color group ${initialHexKey}`);

    groupControls.appendChild(groupHexInput); // Or picker first
    groupControls.appendChild(groupColorInput);

    headerContent.appendChild(title);
    headerContent.appendChild(groupControls);
    header.appendChild(headerContent);

    const body = document.createElement('div');
    body.className = 'gradient-content';
    body.id = `anim-color-group-body-${initialHexKey.replace('#', '')}-${groupIdx}`;

    // Apply preserved accordion state
    if (preservedAnimatedColorAccordionStates && preservedAnimatedColorAccordionStates[accordionId] === true) {
      header.classList.add('active');
      body.classList.add('active');
      body.style.display = "flex";
      header.setAttribute('aria-expanded', 'true');
    } else {
      body.style.display = "none";
      header.setAttribute('aria-expanded', 'false');
    }

    // Event listener for the group color picker
   const handleGroupColorChange = (newHex) => {
        if (!/^#[0-9A-F]{6}$/i.test(newHex)) return;
        const [newR_norm, newG_norm, newB_norm] = hexToRgb(newHex);
        const changesToRecord = [];

        // This affects all instances that *initially* belonged to this initialHexKey group
        instancesArray.forEach(instanceData => { // instanceData is from initialAnimatedColorGroupsByHex
            const oldValue = [...getValueByPath(lottieData, instanceData.kfPath)];
            // Apply new RGB, but preserve the alpha this keyframe had at load time (instanceData.initialAlpha)
            const newColorArrayWithInitialAlpha = [newR_norm, newG_norm, newB_norm, instanceData.initialAlpha];
            setValueByPath(lottieData, instanceData.kfPath, newColorArrayWithInitialAlpha);
            changesToRecord.push({
                path: [...instanceData.kfPath],
                oldValue: oldValue,
                newValue: [...newColorArrayWithInitialAlpha]
            });
        });

        if (changesToRecord.length > 0) {
            recordChange({
                type: 'ANIMATED_SOLID_COLOR_GROUP_KEYFRAME',
                items: changesToRecord,
                newBaseHex: newHex
            });
        }

        body.querySelectorAll('.color-row').forEach((rowNode, rowIndex) => {
            const instance = instancesArray[rowIndex];
            if (instance) {
                const rowColorInput = rowNode.querySelector('input[type="color"]');
                const rowHexInput = rowNode.querySelector('input[type="text"]');
                if (rowColorInput) rowColorInput.value = newHex;
                if (rowHexInput) rowHexInput.value = newHex;
            }
        });
        reloadLottiePreview();
    };


    commitAfterIdle(groupColorInput, (newHexValue) => {
        groupHexInput.value = newHexValue; // Sync hex input
        handleGroupColorChange(newHexValue);
    }, 150);

    groupHexInput.addEventListener('change', (e) => {
        let newHexVal = e.target.value.trim();
        if (!newHexVal.startsWith("#")) newHexVal = "#" + newHexVal;
        if (/^#[0-9A-F]{6}$/i.test(newHexVal)) {
            groupColorInput.value = newHexVal; // Sync color picker
            handleGroupColorChange(newHexVal);
        } else {
            alert("Invalid hex code. Please use #RRGGBB format.");
            e.target.value = groupColorInput.value; // Revert
        }
    });


    // Populate accordion body with instances
    instancesArray.forEach((instanceData, instanceIdx) => { // instanceData is from initialAnimatedColorGroupsByHex
      // --- 8. CHANGE: Get CURRENT color from lottieData for instance's picker ---
      const currentActualKfColorArray = getValueByPath(lottieData, instanceData.kfPath);
      const [r_curr, g_curr, b_curr, a_curr = 1] = currentActualKfColorArray; // Use current alpha from lottieData
      const currentInstanceHexDisplay = rgbToHex(r_curr, g_curr, b_curr);

      const row = document.createElement('div');
      row.className = 'color-row stop-row';

      const labelWrapper = document.createElement('div');
      labelWrapper.className = 'title-wrapper';
      labelWrapper.style.display = 'flex';
      labelWrapper.style.alignItems = 'center';
      labelWrapper.style.gap = 'var(--spacing-sm)';

      const instanceLabel = document.createElement('span');
      instanceLabel.className = 'label';
      const layerPathForName = getLayerPathFromPropertyPath(instanceData.originalPropertyPath);
      const layerObjectForName = layerPathForName ? getValueByPath(lottieData, layerPathForName) : null;
      let instanceLabelText = (layerObjectForName && layerObjectForName.nm) || `Layer ${instanceIdx + 1}`;

      instanceLabel.textContent = instanceLabelText;
      instanceLabel.contentEditable = "true";
      instanceLabel.spellcheck = false;
      instanceLabel.title = "Click to edit layer name";
      instanceLabel.style.cursor = "text";

      if (layerPathForName) {
          const layerNamePath = [...layerPathForName, 'nm'];
          instanceLabel.addEventListener('blur', () => {
              const oldName = getValueByPath(lottieData, layerNamePath) || '';
              const newName = instanceLabel.textContent.trim();
              if (newName && oldName !== newName) {
                  setValueByPath(lottieData, layerNamePath, newName);
                  recordChange({ type: 'NAME_CHANGE', path: layerNamePath, oldValue: oldName, newValue: newName });
                  refreshUIStateAndRender();
              } else {
                  instanceLabel.textContent = oldName || instanceLabelText;
              }
          });
          instanceLabel.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') { e.preventDefault(); instanceLabel.blur(); }
          });
      } else {
          instanceLabel.contentEditable = "false";
          instanceLabel.title = "Layer not found";
          instanceLabel.style.cursor = "default";
      }
      // --- FIX: Append the label to its parent BEFORE using it as a reference for insertBefore ---
      labelWrapper.appendChild(instanceLabel);

          // 1. Turn the stored kfPath into the parent “shape” object
    const fullPath = instanceData.kfPath;                  // e.g. [..., 'c','k']
    const shapePath = fullPath.slice(0, -4);               // drop the ['c','k']
    const shapeItem = getValueByPath(lottieData, shapePath);

    const propertyNameForPill = (shapeItem && shapeItem.nm) || 'Unnamed Property';
    const propertyGroupIdentifier = pathToGroupId(instanceData.originalPropertyPath);
if (shapeItem) { // Ensure shapeItem is valid
    pillPropertyGroupMap.set(shapeItem, propertyGroupIdentifier); // <<< SET IN WEAKMAP
}

    // 2. Create a pill that toggles only this fill/stroke
    const layerPill = createLayerNamePill(null, shapeItem);
    if (layerPill) {
      // 3. Prevent the accordion header from toggling when you click the pill
      layerPill.addEventListener('click', e => e.stopPropagation());
      labelWrapper.insertBefore(layerPill, instanceLabel); // Prepend the pill
    }

      const inputGroup = document.createElement('div');
      inputGroup.className = 'color-input-group';

      const hexInput = document.createElement('input');
      hexInput.type = 'text';
      hexInput.value = currentInstanceHexDisplay; // Display current actual color
      hexInput.setAttribute('aria-label', `Hex for Instance ${instanceIdx + 1}`);

      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = currentInstanceHexDisplay; // Display current actual color
      colorInput.setAttribute('aria-label', `Picker for Instance ${instanceIdx + 1}`);

      // --- 9. MODIFY: Individual instance color change to use its initialAlpha ---
      commitAfterIdle(colorInput, (newHexValue) => {
        const oldValue = [...getValueByPath(lottieData, instanceData.kfPath)];
        const [nr, ng, nb] = hexToRgb(newHexValue);
        // Apply new RGB, but preserve the alpha this keyframe had at load time (instanceData.initialAlpha)
        const updatedColorArray = [nr, ng, nb, instanceData.initialAlpha];
        setValueByPath(lottieData, instanceData.kfPath, updatedColorArray);

        hexInput.value = newHexValue;
        reloadLottiePreview();

        recordChange({
          type: 'ANIMATED_SOLID_COLOR_KEYFRAME',
          path: [...instanceData.kfPath],
          oldValue: oldValue,
          newValue: [...updatedColorArray]
        });
      }, 150);

      hexInput.addEventListener('change', (e) => {
        let newHexFromText = e.target.value.trim();
        if (!newHexFromText.startsWith("#")) newHexFromText = "#" + newHexFromText;
        if (/^#[0-9A-F]{6}$/i.test(newHexFromText)) {
          const oldValue = [...getValueByPath(lottieData, instanceData.kfPath)];
          const [nr, ng, nb] = hexToRgb(newHexFromText);
          // Apply new RGB, but preserve the alpha this keyframe had at load time (instanceData.initialAlpha)
          const updatedColorArray = [nr, ng, nb, instanceData.initialAlpha];
          setValueByPath(lottieData, instanceData.kfPath, updatedColorArray);
          colorInput.value = newHexFromText;
          reloadLottiePreview();
          recordChange({
            type: 'ANIMATED_SOLID_COLOR_KEYFRAME',
            path: [...instanceData.kfPath],
            oldValue: oldValue,
            newValue: [...updatedColorArray]
          });
        } else {
          alert('Invalid hex code. Please use #RRGGBB format.');
          e.target.value = colorInput.value;
        }
      });

      inputGroup.append(colorInput, hexInput);
      row.append(labelWrapper, inputGroup);
      body.appendChild(row);
    });


    header.addEventListener('click', (e) => {
      // Prevent toggle if click is on input elements within the header
      if (e.target.closest('input[type="color"], input[type="text"]')) {
          return;
      }
      const open = body.classList.toggle('active');
      header.classList.toggle('active', open);
      body.style.display = open ? 'flex' : 'none';
      header.setAttribute('aria-expanded', open);
    });
    header.setAttribute('role', 'button');
    header.setAttribute('aria-controls', body.id);

    accordion.append(header, body);
    container.appendChild(accordion);
  });
}





if (multipleFileInput) {
    multipleFileInput.addEventListener('change', handleMultipleFiles);
}
async function handleMultipleFiles(event) {
    const files = event.target.files;
    if (!files.length) return;

    const localLottieDataArray = []; // Temporary local arrays
    const localLottieFileNames = [];

    const fileReadPromises = Array.from(files).map(file => {
        return new Promise(async (resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    let fileContentString = e.target.result;
                    if (file.name.endsWith('.lottie')) {
                        const blob = new Blob([e.target.result], {type: file.type});
                        const dotLottieFile = new File([blob], file.name, {type: file.type});
                        fileContentString = await convertDotLottieToJson(dotLottieFile);
                    }
                    const jsonData = JSON.parse(fileContentString);
                    if (!jsonData.v || !jsonData.fr || !jsonData.w || !jsonData.h || !jsonData.layers) {
                        reject(new Error(`File ${file.name} is not valid Lottie JSON.`));
                        return;
                    }
                    // Store parsed data directly
                    localLottieDataArray.push(jsonData);
                    localLottieFileNames.push(file.name);

                    resolve();
                } catch (parseErr) {
                    reject(new Error(`Error parsing ${file.name}: ${parseErr.message}`));
                }
            };
            reader.onerror = () => reject(new Error(`Error reading ${file.name}`));
            if (file.name.endsWith('.lottie')) {

                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        });
    });

    try {
        await Promise.all(fileReadPromises);
    } catch (error) {
        console.error("Error loading one or more files in handleMultipleFiles:", error);
        alert(`Error loading files: ${error.message}`);
        if (multipleFileInput) multipleFileInput.value = '';
        return;
    }

    if (localLottieDataArray.length > 0) {
        // Prepare to call handleFileLoad with the first file
        const firstFileJsonData = localLottieDataArray[0];
        const firstFileName = localLottieFileNames[0];

        // Convert the first file's JSON data back to a string, then Blob, then File
        const jsonStringOfFirstFile = JSON.stringify(firstFileJsonData);
        const blob = new Blob([jsonStringOfFirstFile], { type: 'application/json' });
        const firstFileObject = new File([blob], firstFileName, { type: 'application/json' });

        const mockEvent = {
            target: {
                files: [firstFileObject]
            }
        };

        // Call the existing handleFileLoad.
        // This will set global lottieData and initialize the UI for this first file.
        // It will also likely overwrite global lottieDataArray/lottieFileNames.
        await handleFileLoad(mockEvent, false); // Assuming handleFileLoad might be async

        // After handleFileLoad has run and set up the UI for the first file:
        // Restore the full arrays for multi-file management and chip rendering.
        lottieDataArray = localLottieDataArray.map(data => JSON.parse(JSON.stringify(data))); // Deep copy all
        lottieFileNames = [...localLottieFileNames];
        currentLottieIndex = 0;

        renderFileChips(); // Now render all chips based on the full arrays
        updateDeleteButtonVisibility(); // Update delete button state for the newly loaded collection
    } else {
        alert("No valid Lottie files were loaded.");
    }
    if (multipleFileInput) multipleFileInput.value = ''; // Reset input
    displayOrderOfDataIndices = [];
for (let i = 0; i < localLottieFileNames.length; i++) {
    displayOrderOfDataIndices.push(i); // Initial order: [0, 1, 2, ...]
}
}



if (additionalFileInput) {
    additionalFileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            await addAndActivateChip(file);
        }
        additionalFileInput.value = ''; // Reset the input so 'change' fires for same file if re-selected
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const exportTabs = document.querySelectorAll('.export-tab');
    const exportContents = document.querySelectorAll('.export-content');
    const downloadGifBtn = document.getElementById('downloadGifBtn');
    const downloadVideoBtn = document.getElementById('downloadVideoBtn');

    exportTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all tabs and content
            exportTabs.forEach(t => t.classList.remove('active'));
            exportContents.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });

            // Activate the clicked tab
            tab.classList.add('active');

            // Show the corresponding content
            const targetContent = document.querySelector(tab.dataset.tabTarget);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.display = 'flex';
            }

            // Toggle visibility of download buttons
            if (downloadGifBtn && downloadVideoBtn) {
                const isGifTab = tab.id === 'gifExportTab';
                downloadGifBtn.style.display = isGifTab && lottieData ? 'inline-flex' : 'none';
                downloadVideoBtn.style.display = !isGifTab && lottieData ? 'inline-flex' : 'none';
            }
        });
    });
});

function renderFileChips() {
    if (!lottieFileChips || !lottieFileChipsContainer) {
        console.error("Chip container elements 'lottieFileChips' or 'lottieFileChipsContainer' not found!");
        return;
    }

    lottieFileChips.innerHTML = ''; // Clear previous chips

    // 1. Add the "+" button (for adding more Lottie files)
    const addButton = document.createElement('button');
    addButton.className = 'add-chip-button';
    addButton.innerHTML = '+';
    addButton.title = 'Add another Lottie file';
    addButton.setAttribute('aria-label', 'Add another Lottie file');
    addButton.addEventListener('click', () => {
        if (additionalFileInput) {
            additionalFileInput.value = null; // Clear previous selection to allow re-adding the same file
            additionalFileInput.click();
        } else {
            console.warn("additionalFileInput not found for '+' button.");
        }
    });
    lottieFileChips.appendChild(addButton);

    // If no Lottie files are loaded, only show the add button and then return
    if (!lottieDataArray || lottieDataArray.length === 0) {
        lottieFileChipsContainer.style.display = 'block'; // Ensure container is visible for the add button
        // displayOrderOfDataIndices should also be empty or cleared by the function that emptied lottieDataArray
        if (displayOrderOfDataIndices.length > 0) {
             displayOrderOfDataIndices = [];
        }
        return;
    }
    lottieFileChipsContainer.style.display = 'block'; // Make sure the chip bar is visible


    // 2. Synchronize and validate displayOrderOfDataIndices with lottieDataArray
    // Remove any indices from displayOrderOfDataIndices that are no longer valid (e.g., out of bounds)
    displayOrderOfDataIndices = displayOrderOfDataIndices.filter(idx => idx >= 0 && idx < lottieDataArray.length);

    // Ensure all files in lottieDataArray have their indices present in displayOrderOfDataIndices.
    // Add any missing indices to the end of the displayOrderOfDataIndices array.
    // This maintains existing order for known items and appends new/untracked items.
    if (displayOrderOfDataIndices.length < lottieDataArray.length) {
        const currentIndicesInOrderSet = new Set(displayOrderOfDataIndices);
        for (let i = 0; i < lottieDataArray.length; i++) {
            if (!currentIndicesInOrderSet.has(i)) {
                displayOrderOfDataIndices.push(i); // Add missing data index to the end of the order
            }
        }
    }
    // Ensure uniqueness again in case reconciliation added duplicates (should not happen with Set logic)
    displayOrderOfDataIndices = [...new Set(displayOrderOfDataIndices)];


    // 3. Render up to N_VISIBLE_CHIPS from the displayOrderOfDataIndices array
    // These are the chips that will be visible in the main bar.
    for (let i = 0; i < Math.min(displayOrderOfDataIndices.length, N_VISIBLE_CHIPS); i++) {
        const dataIndex = displayOrderOfDataIndices[i]; // Get the actual data index from our ordered list

        // Safety check for dataIndex validity, though filtering above should cover most cases.
        if (typeof dataIndex !== 'number' || dataIndex < 0 || dataIndex >= lottieFileNames.length) {
            console.warn(`renderFileChips: Invalid dataIndex ${dataIndex} encountered in displayOrderOfDataIndices.`);
            continue;
        }

        const name = lottieFileNames[dataIndex];
        const chip = createChipElement(name, dataIndex);

        // Highlight the chip if it corresponds to the currently active Lottie
        if (dataIndex === currentLottieIndex) {
            chip.classList.add('selected');
        }

        // Clicking a chip in the main bar calls swapLottieData, indicating it's not from the overlay.
        // This preserves its position in the visible bar as per your requirement.
        chip.addEventListener('click', (e) => {
            // Prevent swap if the click was on the edit button or inside the input
            if (e.target.closest('.edit-chip-btn') || e.target.tagName === 'INPUT') {
                return;
            }
            swapLottieData(dataIndex, false);
        });
        lottieFileChips.appendChild(chip);
    }

    // 4. Add a "+X more" chip if the total number of Lottie files exceeds N_VISIBLE_CHIPS
    if (lottieDataArray.length > N_VISIBLE_CHIPS) {
        const numHiddenOrInOverlay = lottieDataArray.length - N_VISIBLE_CHIPS;
        // This condition should be true if lottieDataArray.length > N_VISIBLE_CHIPS
        if (numHiddenOrInOverlay > 0) {
            const moreChip = document.createElement('div');
            moreChip.className = 'more-chip';
            moreChip.textContent = `+${numHiddenOrInOverlay} more`;
            moreChip.title = `Show ${numHiddenOrInOverlay} more animations`;
            moreChip.setAttribute('aria-label', `Show ${numHiddenOrInOverlay} more animations`);
            moreChip.addEventListener('click', showAllChipsOverlay); // Assumes showAllChipsOverlay function exists
            lottieFileChips.appendChild(moreChip);
        }
    }

    // --- START: Adjust padding if scrollbar is active ---
    // After rendering, check if the content overflows, indicating a scrollbar.
    if (lottieFileChips.scrollWidth > lottieFileChips.clientWidth) {
        lottieFileChipsContainer.style.paddingBottom = '0'; // Remove padding when scrollbar is active
    } else {
        lottieFileChipsContainer.style.paddingBottom = '12px'; // Revert to default stylesheet value when no scrollbar
    }
}

function createChipElement(name, dataIndex) {
    const chip = document.createElement('div');
    chip.className = 'lottie-file-chip';
    chip.title = name; // Full name on hover

    const nameSpan = document.createElement('span');
    nameSpan.className = 'chip-name';
    nameSpan.textContent = name.length > 17 ? name.substring(0, 14) + '...' : name;

    const editBtn = document.createElement('button');
    editBtn.className = 'edit-chip-btn';
    editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg>`;
    editBtn.title = 'Rename animation';
    editBtn.setAttribute('aria-label', 'Rename animation');

    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        // --- FIX: Save edited .lottie collection name before renaming a chip ---
        if (isDotLottieLoaded) {
            const dotLottieTitleEl = document.getElementById('dotLottieWindowTitle');
            const currentName = dotLottieTitleEl.textContent.trim();
            if (activeDotLottieOriginalName !== currentName) {
                activeDotLottieOriginalName = currentName;
            }
        }
        const currentName = lottieFileNames[dataIndex];
        const baseName = currentName.replace(/\.json$/i, '');

        nameSpan.style.display = 'none';
        editBtn.style.display = 'none';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'chip-edit-input';
        input.value = baseName;

        // --- APPLY INLINE STYLES ---
        const chipStyle = window.getComputedStyle(chip);
        const nameSpanStyle = window.getComputedStyle(nameSpan);

        input.style.fontFamily = nameSpanStyle.fontFamily;
        input.style.fontSize = nameSpanStyle.fontSize;
        input.style.fontWeight = nameSpanStyle.fontWeight;
        input.style.lineHeight = nameSpanStyle.lineHeight;
        input.style.color = chip.classList.contains('selected') ? 'var(--color-text-on-primary)' : nameSpanStyle.color;
        input.style.border = 'none';
        input.style.outline = 'none';
        input.style.boxShadow = 'none';
        input.style.padding = '0';
        input.style.margin = '0';
        input.style.background = 'transparent';
        input.style.outline = 'none';
        input.style.borderRadius = '0px';

        const saveChanges = () => {
            const newBaseName = input.value.trim();
            if (newBaseName && newBaseName !== baseName) {
                const newFullName = newBaseName + '.json';
                lottieFileNames[dataIndex] = newFullName;

                // --- NEW: Sync with State Machine ---
                // If a .lottie was loaded and we have state machines, update them.
                if (isDotLottieLoaded && loadedStateMachines && loadedStateMachines.length > 0) {
                    loadedStateMachines.forEach(stateMachine => {
                        if (stateMachine && Array.isArray(stateMachine.states)) {
                            stateMachine.states.forEach(state => {
                                // If a state references the old animation name (without extension), update it.
                                if (state.animation === baseName) {
                                    state.animation = newBaseName;
                                    console.log(`State machine updated: State '${state.name}' now references animation '${newBaseName}'.`);
                                }
                            });
                        }
                    });
                }
                // --- END NEW ---

                // Update UI
                nameSpan.textContent = newFullName.length > 17 ? newFullName.substring(0, 14) + '...' : newFullName;
                chip.title = newFullName;

                // If this is the active chip, update the main window title
                if (dataIndex === currentLottieIndex) {
                    updateActiveWindowTitle(newFullName, isDotLottieLoaded);
                }
            }
            // Restore view
            chip.removeChild(input);
            nameSpan.style.display = '';
            editBtn.style.display = '';
        };

        input.addEventListener('blur', saveChanges);
        input.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter') {
                input.blur(); // This will trigger saveChanges
            } else if (ev.key === 'Escape') {
                // Restore view without saving
                chip.removeChild(input);
                nameSpan.style.display = '';
                editBtn.style.display = '';
            }
        });

        chip.insertBefore(input, nameSpan);
        input.focus();
        input.select();
    });

    chip.appendChild(nameSpan);
    chip.appendChild(editBtn);

    return chip;
}




function showAllChipsOverlay() {
    if (!allChipsOverlay || !allChipsListContainer) {
        console.error("Overlay elements not found for showing all chips.");
        return;
    }

    const overlayHeader = allChipsOverlay.querySelector('.all-chips-overlay-header h3');
    const dotLottieTitleEl = document.getElementById('dotLottieWindowTitle');

    if (overlayHeader) {
        let headerName = 'All Animations'; // Default text
        if (isDotLottieLoaded && dotLottieTitleEl && dotLottieTitleEl.style.display !== 'none') {
            headerName = dotLottieTitleEl.textContent.trim();
        } else if (currentLottieIndex !== -1) {
            headerName = lottieFileNames[currentLottieIndex];
        }
        overlayHeader.textContent = headerName.length > 40 ? headerName.substring(0, 37) + '...' : headerName;
    } else if (overlayHeader) {
        overlayHeader.textContent = 'All Animations';
    }

    allChipsListContainer.innerHTML = ''; // Clear previous list

    lottieFileNames.forEach((name, index) => {
        const chipContainer = document.createElement('div');
        chipContainer.className = 'overlay-chip';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'overlay-chip-name';
        nameSpan.textContent = name;
        nameSpan.title = name;

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-chip-btn';
        editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path></svg>`;
        editBtn.title = 'Rename animation';
        editBtn.setAttribute('aria-label', 'Rename animation');

        chipContainer.appendChild(nameSpan);
        chipContainer.appendChild(editBtn);

        if (index === currentLottieIndex) {
            chipContainer.classList.add('selected');
        }

        chipContainer.addEventListener('click', (e) => {
            // Do not swap/close if an edit is in progress or if the edit button was clicked
            const isEditing = chipContainer.querySelector('.chip-edit-input');
            if (isEditing || e.target.closest('.edit-chip-btn')) return;

            hideAllChipsOverlay();
            swapLottieData(index, true);
        });

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentName = lottieFileNames[index];
            const baseName = currentName.replace(/\.json$/i, '');

            nameSpan.style.display = 'none';
            editBtn.style.display = 'none';

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'chip-edit-input'; // Reuse existing style
            input.value = baseName;
            input.style.color = 'var(--color-text-primary)';
            input.style.backgroundColor = 'transparent';
            input.style.border = 'none';
            input.style.outline = 'none';
            input.style.boxShadow = 'none';
            input.style.width = '100%';

            const saveChanges = () => {
                const newBaseName = input.value.trim();
                if (newBaseName && newBaseName !== baseName) {
                    const newFullName = newBaseName + '.json';
                    lottieFileNames[index] = newFullName;
                    nameSpan.textContent = newFullName;
                    nameSpan.title = newFullName;
                    if (index === currentLottieIndex) {
                        updateActiveWindowTitle(newFullName, isDotLottieLoaded);
                    }
                    renderFileChips(); // Re-render the main chips to reflect the name change
                }
                chipContainer.replaceChild(nameSpan, input);
                nameSpan.style.display = '';
                editBtn.style.display = '';
            };

            input.addEventListener('blur', saveChanges);
            input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') input.blur(); });

            chipContainer.insertBefore(input, nameSpan);
            input.focus();
            input.select();
        });

        allChipsListContainer.appendChild(chipContainer);
    });

    // --- NEW: Apply blur effect ---
    allChipsOverlay.style.backdropFilter = 'blur(8px)';
    allChipsOverlay.style.webkitBackdropFilter = 'blur(8px)'; // For Safari

    allChipsOverlay.style.display = 'flex'; // Make the overlay backdrop visible
    setTimeout(() => { // Short delay to allow display:flex to apply before transition
      allChipsOverlay.classList.add('active'); // Add 'active' class to trigger CSS transitions for panel
 }, 10);
}
function hideAllChipsOverlay() {
    if (allChipsOverlay) {
        allChipsOverlay.classList.remove('active'); // Trigger fade out animations
        // --- NEW: Remove blur effect on close ---
        allChipsOverlay.style.backdropFilter = '';
        allChipsOverlay.style.webkitBackdropFilter = '';

        // Wait for animation to finish before setting display to none
        // Ensure transition duration matches CSS (e.g., 0.3s = 300ms)
        setTimeout(() => {
            allChipsOverlay.style.display = 'none';
        }, 300);
    }
}


async function swapLottieData(newlySelectedDataIndex, fromOverlay = false, updatedData = null) {
    if (newlySelectedDataIndex < 0 || newlySelectedDataIndex >= lottieDataArray.length) {
        console.warn("Invalid newlySelectedDataIndex for swapLottieData:", newlySelectedDataIndex);
        return;
    }

    // If clicking the already active chip (not from overlay), and data is current,
    // no need to reload or reorder.
    if (newlySelectedDataIndex === currentLottieIndex && !fromOverlay && lottieData === lottieDataArray[newlySelectedDataIndex]) {
        return;
    }

    // --- FIX: Save edited .lottie collection name before swapping ---
    if (isDotLottieLoaded) {
        const dotLottieTitleEl = document.getElementById('dotLottieWindowTitle');
        const currentName = dotLottieTitleEl.textContent.trim();
        if (activeDotLottieOriginalName !== currentName) {
            activeDotLottieOriginalName = currentName;
        }
    }

    // 1. Save current Lottie's state (if any)
    if (currentLottieIndex >= 0 && currentLottieIndex < lottieDataArray.length && lottieData) {
        lottieDataArray[currentLottieIndex] = JSON.parse(JSON.stringify(lottieData));
    }

    // Backup globals that handleFileLoad might not be aware of
    const tempFullLottieDataArray = lottieDataArray.map(data => JSON.parse(JSON.stringify(data)));
    const tempFullLottieFileNames = [...lottieFileNames];
    // Backup displayOrderOfDataIndices BEFORE potential modification
    const tempDisplayOrderOfDataIndices = [...displayOrderOfDataIndices];
    // Backup other relevant state like isDotLottieLoaded, activeDotLottieOriginalName
    const tempIsDotLottieLoaded = isDotLottieLoaded;
    const tempActiveDotLottieOriginalName = activeDotLottieOriginalName;


    const targetIndexForSwap = newlySelectedDataIndex;

    // ***MODIFICATION START***
    const selectedFileJsonData = updatedData ? updatedData : tempFullLottieDataArray[targetIndexForSwap];
    // ***MODIFICATION END***


    const selectedFileName = tempFullLottieFileNames[targetIndexForSwap];
    // ... (create selectedFileObject and mockEvent as before) ...
    const jsonStringOfSelectedFile = JSON.stringify(selectedFileJsonData);
    const blob = new Blob([jsonStringOfSelectedFile], { type: 'application/json' });
    const selectedFileObject = new File([blob], selectedFileName, { type: 'application/json' });
    const mockEvent = { target: { files: [selectedFileObject] } };


    // Call handleFileLoad with isPrimaryLoadEvent = false
    await handleFileLoad(mockEvent, false, false);

    // Restore the full arrays and set the correct current active index.
    lottieDataArray = tempFullLottieDataArray;
    lottieFileNames = tempFullLottieFileNames;
    currentLottieIndex = targetIndexForSwap; // Set the new active index


    // ***MODIFICATION START***
    // If updatedData was provided, make sure it's also updated in the main array
    if (updatedData) {
        lottieDataArray[currentLottieIndex] = JSON.parse(JSON.stringify(updatedData));
    }
    // ***MODIFICATION END***

    // Restore other backed-up states
    isDotLottieLoaded = tempIsDotLottieLoaded;
    activeDotLottieOriginalName = tempActiveDotLottieOriginalName;


    // Conditionally modify displayOrderOfDataIndices
    if (fromOverlay) {
        const currentOrder = [...tempDisplayOrderOfDataIndices]; // Work on a copy of the backed-up order
        const itemIndexInOrder = currentOrder.indexOf(newlySelectedDataIndex);
        if (itemIndexInOrder !== -1) {
            currentOrder.splice(itemIndexInOrder, 1); // Remove from current position
        }
        currentOrder.unshift(newlySelectedDataIndex); // Add to the front
        displayOrderOfDataIndices = currentOrder; // Assign the new order
    } else {
        // If not from overlay, the order of chips in the bar does not change.
        // So, restore the original order.
        displayOrderOfDataIndices = tempDisplayOrderOfDataIndices;
    }

    undoStack = [];
    redoStack = [];

    // --- NEW: Update State Machine Button visibility based on selected animation ---
    const stateMachineBtn = document.getElementById('openStateMachineBuilderBtn');
    if (stateMachineBtn) {
        let isAssociated = false;
        if (isDotLottieLoaded && loadedStateMachines && loadedStateMachines.length > 0) {
            const selectedAnimationName = lottieFileNames[currentLottieIndex].replace(/\.json$/i, '');

            // Check if any loaded state machine has a state that references the selected animation
            for (const sm of loadedStateMachines) {
                if (sm && Array.isArray(sm.states) && sm.states.some(state => state.animation === selectedAnimationName)) {
                    isAssociated = true;
                    break; // Found a match, no need to check further
                }
            }
        }
        // The button is only visible if we are in a .lottie context AND an association is found.
       stateMachineBtn.style.display = isAssociated ? 'inline-flex' : 'none';
    // Use the new helper function to update the button's appearance
    updateStateMachineButtonState(isAssociated);
    }
    // --- END NEW ---

    updateActiveWindowTitle(lottieFileNames[currentLottieIndex], isDotLottieLoaded);
    renderFileChips(); // Update chip display based on new order and selection
    updateDeleteButtonVisibility(); // Update delete button state

    // --- START: Scroll selected chip into view ---
    // After chips are re-rendered, find the selected one and scroll it into view.
    const selectedChip = lottieFileChips.querySelector('.lottie-file-chip.selected');
    if (selectedChip) {
        selectedChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
    // --- END: Scroll selected chip into view ---
}

function updateActiveWindowTitle(fileName, isDotLottieSource = false) {

    const jsonTitleEl = document.getElementById('jsonWindowTitle');
    const dotLottieTitleEl = document.getElementById('dotLottieWindowTitle');

    if (isDotLottieSource && activeDotLottieOriginalName) {
        // A .lottie file is the primary source of the current view
        let lottieNameForDisplay = activeDotLottieOriginalName;
        dotLottieTitleEl.textContent = lottieNameForDisplay; // Set without .lottie for editing
        dotLottieTitleEl.style.display = 'inline';
        jsonTitleEl.style.display = 'none';
    } else if (!isDotLottieLoaded){
        // A JSON file is active (either single, from multi-upload, or a chip from an exploded .lottie)
        let jsonNameForDisplay = fileName;
        jsonTitleEl.textContent = jsonNameForDisplay; // Set without .json for editing
        jsonTitleEl.style.display = 'inline';
        dotLottieTitleEl.style.display = 'none';
    }
}


// Ensure globals are accessible:
// let lottieDataArray, lottieFileNames, currentLottieIndex, lottieData;
// let originalUploadedDotLottieFile, activeDotLottieOriginalName;
// let fileInput; // Your main single file input (used by handleFileLoad)

async function addAndActivateChip(fileObject) {
    if (!fileObject) {
        console.warn("No file object provided to addAndActivateChip.");
        return;
    }

    // --- Step 1: Validate and Process the new .json file ---
    if (!fileObject.name.endsWith('.json')) {
        alert("Invalid file type. Please add a .json Lottie file.");

        return;
    }

    let newAnimationJsonData;
    const newAnimationName = fileObject.name;



    try {
        const jsonString = await fileObject.text(); // Read file as text
        newAnimationJsonData = JSON.parse(jsonString);

        if (!newAnimationJsonData.v) { // Basic Lottie validation
            throw new Error("The selected file is not a valid Lottie JSON.");
        }

        // --- Step 2: Save state of the current active Lottie (if any) ---
        if (lottieData && currentLottieIndex >= 0 && currentLottieIndex < lottieDataArray.length) {
            lottieDataArray[currentLottieIndex] = JSON.parse(JSON.stringify(lottieData));
            console.log(`Saved state for previously active: ${lottieFileNames[currentLottieIndex]}`);
        }

        // --- Step 3: Prepend the new animation ---
        const tempFullLottieDataArray = lottieDataArray.map(d => JSON.parse(JSON.stringify(d)));
        const tempFullLottieFileNames = [...lottieFileNames];
        const tempDisplayOrder = [...displayOrderOfDataIndices];
        const tempIsDotLottieLoaded = isDotLottieLoaded;
        const tempActiveDotLottieOriginalName = activeDotLottieOriginalName;

        // 1. Prepare new arrays with the item added at the beginning
        tempFullLottieDataArray.unshift(JSON.parse(JSON.stringify(newAnimationJsonData)));
        tempFullLottieFileNames.unshift(newAnimationName);
        const newActiveIndex = 0;

        // 2. Adjust displayOrderOfDataIndices:
        //    - Increment all existing indices by 1.
        //    - Prepend 0 (the index of the new file).
        let updatedDisplayOrder = tempDisplayOrder.map(idx => idx + 1);
        updatedDisplayOrder.unshift(newActiveIndex);
        // Remove duplicates if any (though unshifting 0 after mapping should be fine unless 0 was a result of mapping -1)
        // More robust: filter out the new 0 from mapped if it was created, then unshift.
        // Or, simpler:
        // The new item is at index 0. It becomes the highest priority.
        // Other items shift their data indices by 1, and their relative order is maintained.
        updatedDisplayOrder = [newActiveIndex]; // New item is first in display order
        for (const oldDataIndex of tempDisplayOrder) {
            const newDataIndexOfOldItem = oldDataIndex + 1;
            if (newDataIndexOfOldItem < tempFullLottieFileNames.length) { // Ensure it's a valid index
                 if (!updatedDisplayOrder.includes(newDataIndexOfOldItem)) { // Avoid duplicates if logic allows
                    updatedDisplayOrder.push(newDataIndexOfOldItem);
                 }
            }
        }
        // Ensure it only contains valid indices up to the new length
        updatedDisplayOrder = updatedDisplayOrder.filter(idx => idx < tempFullLottieFileNames.length);


        // Prepare mock event for handleFileLoad
        const blob = new Blob([jsonString], { type: 'application/json' }); // jsonString from await fileObject.text()
        const mockFileToLoad = new File([blob], newAnimationName, { type: 'application/json' });
        const mockEvent = { target: { files: [mockFileToLoad] } };

        await handleFileLoad(mockEvent, false, false);

        // Restore the modified full arrays and set the new state
        lottieDataArray = tempFullLottieDataArray;
        lottieFileNames = tempFullLottieFileNames;
        currentLottieIndex = newActiveIndex;
        displayOrderOfDataIndices = updatedDisplayOrder; // Use the carefully constructed new order

        //isDotLottieLoaded = false; // Adding a JSON file makes the context non-primary-.lottie
        activeDotLottieOriginalName = null;
        originalUploadedDotLottieFile = null;

        undoStack = [];
        redoStack = [];

        updateActiveWindowTitle(lottieFileNames[currentLottieIndex], false);
        renderFileChips();

        // --- NEW: Update State Machine Button visibility after adding a chip ---
        const stateMachineBtn = document.getElementById('openStateMachineBuilderBtn');
        if (stateMachineBtn) {
            let isAssociated = false;
            // This check is only relevant if we were originally in a .lottie context
            if (isDotLottieLoaded && loadedStateMachines && loadedStateMachines.length > 0) {
                const selectedAnimationName = lottieFileNames[currentLottieIndex].replace(/\.json$/i, '');
                for (const sm of loadedStateMachines) {
                    if (sm && Array.isArray(sm.states) && sm.states.some(state => state.animation === selectedAnimationName)) {
                        isAssociated = true;
                        break;
                    }
                }
            }
            stateMachineBtn.style.display = isAssociated ? 'inline-flex' : 'none';
        // Use the new helper function to update the button's appearance
        updateStateMachineButtonState(isAssociated);
        }
        // --- END NEW ---

        updateDeleteButtonVisibility();
 // Ensure chips are correctly displayed with the new one selected



    } catch (error) {
        console.error("Error in addAndActivateChip:", error);
        alert(`Failed to add file: ${error.message}`);

        // Simple rollback if unshift happened before error
        if (newAnimationJsonData && lottieDataArray[0] === newAnimationJsonData) {
            lottieDataArray.shift();
            lottieFileNames.shift();
            if (lottieDataArray.length > 0) {
                currentLottieIndex = 0; // Default to first if rollback
                // Optionally reload lottieDataArray[0] or leave as is
            } else {
                currentLottieIndex = -1;
            }
            renderFileChips();
        }
    }
}

// Add this listener to handle clicks outside of editable elements
document.addEventListener('click', (event) => {
    const focusedElement = document.activeElement;

    // Check if there is a focused element, if it's contenteditable,
    // and if the click was outside of it.
    if (focusedElement && focusedElement.isContentEditable && !focusedElement.contains(event.target)) {
        // The 'blur()' method removes focus from the element.
        focusedElement.blur();
    }
});

if (lottieFileChipsContainer) {
    lottieFileChipsContainer.addEventListener('dragover', (event) => {
        event.preventDefault(); // Necessary to allow drop
        event.stopPropagation();
        lottieFileChipsContainer.classList.add('drag-over');
    });

    lottieFileChipsContainer.addEventListener('dragleave', (event) => {
        event.preventDefault();
        event.stopPropagation();
        chipsContainerForDrop.classList.remove('drag-over');
    });

    lottieFileChipsContainer.addEventListener('drop', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        lottieFileChipsContainer.classList.remove('drag-over');

        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0]; // Process the first dropped file
            await addAndActivateChip(file);
            event.dataTransfer.clearData(); // Recommended to clear dataTransfer
        }
    });
}



if (closeAllChipsOverlayBtn) {
    closeAllChipsOverlayBtn.addEventListener('click', hideAllChipsOverlay);
}
// Also close overlay on ESC key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && allChipsOverlay && allChipsOverlay.style.display === 'flex') {
        hideAllChipsOverlay();
    }
    
});


/**
 * Central function to load a new state into the main tool.
 * Can be called with a single new JSON object, or with data to update a .lottie collection.
 * @param {object} data - The primary data to load. For .lottie, this is the full dotLottie file/data. For JSON, it's the JSON object.
 * @param {string} [animationIdToSelect] - Optional. The filename/ID of the animation to make active, used for .lottie context.
 */
async function loadMainToolState(data, animationIdToSelect = null) {

  try {
        console.log("Clearing tool-specific browser data...");

        // 1. Clear site-specific cookies by expiring them
        // The tool uses a 'lastVisitTimestamp' cookie.
        setCookie("lastVisitTimestamp", "", -1);

        // 2. Clear localStorage for this domain
        localStorage.clear();

        // 3. Clear sessionStorage for this domain
        sessionStorage.clear();

    } catch (error) {
        console.error("Could not clear browser storage:", error);
    }
    // --- End of new block ---


    if (animationIdToSelect && isDotLottieLoaded) {
        // This is the case where we've modified a single JSON from a .lottie collection
        const indexToUpdate = lottieFileNames.findIndex(name => name === animationIdToSelect);

        if (indexToUpdate !== -1) {
            console.log(`Updating animation '${animationIdToSelect}' at index ${indexToUpdate} in the collection.`);
            // Update the master array with the new data
            lottieDataArray[indexToUpdate] = data;
            // Now, trigger a swap to reload the UI with this updated data
            await swapLottieData(indexToUpdate, false, data); // false = not from overlay, keeps chip order stable
        } else {
            console.error(`Could not find animation with ID '${animationIdToSelect}' to update.`);
        }
    } else {
        // This is the simple case: load a single JSON file
        // We'll wrap it in a mock File object to use the existing handleFileLoad function
        const jsonString = JSON.stringify(data);
        const blob = new Blob([jsonString], { type: 'application/json' });
        // Use the window title or a default for the filename
        const fileName = document.getElementById('jsonWindowTitle')?.textContent || 'updated.json';
        const mockFile = new File([blob], fileName, { type: 'application/json' });

        const mockEvent = {
            target: {
                files: [mockFile]
            }
        };
        // Reset multi-file state before loading a single JSON
        isDotLottieLoaded = false;
        lottieDataArray = [];
        displayOrderOfDataIndices = [];
        lottieFileNames = [];
        currentLottieIndex = -1;
        //renderFileChips(); // This will clear the chips



        await handleFileLoad(mockEvent, false); // Let handleFileLoad do all the UI setup
    }

    // --- ADDED: Reset speed-related UI elements and global state ---
   currentSpeed = 1.0; // Reset global speed variable to default
   if (speedSliderMain) {
       speedSliderMain.value = currentSpeed; // Update slider position
   }
   if (speedValuePill) {
       speedValuePill.textContent = currentSpeed.toFixed(1) + "x"; // Update speed display pill
   }
   // Make sure the Lottie animation instance itself reflects the new speed

   updateDurationPillDisplay(); // Recalculate and display duration based on new speed
   // --- END ADDED BLOCK ---
 console.log('did i wait lol');
    // Close the overlay after the state is loaded

    const overlay = document.getElementById('customOverlay');
    overlay.style.backdropFilter = '';
    overlay.style.webkitBackdropFilter = '';


    const iframe = document.getElementById('customContent');
    if (overlay) {
        overlay.classList.remove('active');
        if (iframe) {
            //iframe.src = 'about:blank'; // Stop iframe content
        }
    }


}

function updateDeleteButtonVisibility() {
    if (deleteAnimationBtn) {
        // Show the button only if there is more than one animation loaded.
        const shouldBeVisible = lottieDataArray.length > 1;
        deleteAnimationBtn.style.display = shouldBeVisible ? 'inline-flex' : 'none';
    }
}

async function handleDeleteAnimation() {
    if (lottieDataArray.length <= 1 || currentLottieIndex < 0 || !confirmDeleteOverlay) {
        console.warn("Delete called with one or fewer animations, or no active index. Aborting.");
        updateDeleteButtonVisibility(); // Ensure button is hidden
        return;
    }

    // Show confirmation modal
    const animationName = lottieFileNames[currentLottieIndex];
    if (confirmDeleteAnimationName) {
        confirmDeleteAnimationName.textContent = animationName.length > 30 ? animationName.substring(0, 27) + '...' : animationName;
    }
    
    confirmDeleteOverlay.style.display = 'flex';
    setTimeout(() => confirmDeleteOverlay.classList.add('active'), 10);

    // The actual deletion is now handled by the confirmation button's event listener
}

async function proceedWithDeletion() {
    // Hide the modal first
    if (confirmDeleteOverlay) {
        confirmDeleteOverlay.classList.remove('active');
        setTimeout(() => confirmDeleteOverlay.style.display = 'none', 300);
    }

    // --- Original deletion logic ---
    const deletedIndex = currentLottieIndex;
    const deletedName = lottieFileNames[deletedIndex];

    // Remove the animation from the main arrays
    lottieDataArray.splice(deletedIndex, 1);
    lottieFileNames.splice(deletedIndex, 1);

    // Remove the index from the display order
    const orderIndex = displayOrderOfDataIndices.indexOf(deletedIndex);
    if (orderIndex > -1) {
        displayOrderOfDataIndices.splice(orderIndex, 1);
    }

    // Adjust remaining indices in displayOrderOfDataIndices
    displayOrderOfDataIndices = displayOrderOfDataIndices.map(idx => (idx > deletedIndex ? idx - 1 : idx));

    // Determine the next animation to show
    let nextIndexToShow = -1;
    if (lottieDataArray.length > 0) {
        // Try to show the one that was after the deleted one, or the new last one
        nextIndexToShow = Math.min(deletedIndex, lottieDataArray.length - 1);
    }

    if (nextIndexToShow !== -1) {
        // Use swapLottieData to load the next animation
        // We can treat this as a selection from an overlay to ensure it becomes the first visible chip
        await swapLottieData(nextIndexToShow, true);
    } else {
        // This case happens when the last animation is deleted
        lottieData = null;
        currentLottieIndex = -1;
        isDotLottieLoaded = false;
        activeDotLottieOriginalName = null;
        originalUploadedDotLottieFile = null;
        resetUI(); // Or a more lightweight UI reset
        console.log("Last animation deleted. Resetting UI.");
    }

    console.log(`Deleted animation: "${deletedName}". New active index: ${currentLottieIndex}`);
    
    // Final UI updates
    renderFileChips();
    updateDeleteButtonVisibility();
}

if (deleteAnimationBtn) {
    deleteAnimationBtn.addEventListener('click', handleDeleteAnimation); // This now opens the modal
}

// --- Event Listeners for Confirmation Modal ---
if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', proceedWithDeletion);
}

if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
        if (confirmDeleteOverlay) {
            confirmDeleteOverlay.classList.remove('active');
            setTimeout(() => confirmDeleteOverlay.style.display = 'none', 300);
        }
    });
}



// Add this message listener to index.js
window.addEventListener('message', async (event) => {
    // In production, you should check event.origin for security
    // if (event.origin !== "YOUR_EXPECTED_ORIGIN") return;
    console.log('recieved crop data');
    if (event.data && event.data.type === 'dataFromCropTool') {
        const { lottieData: newLottieData, originalFilename } = event.data;

        console.log(`Received cropped data for: ${originalFilename}`);
        const overlay = document.getElementById('customOverlay');
        overlay.style.backdropFilter = '';
        overlay.style.webkitBackdropFilter = '';

        console.log('Current lottieFileNames array upon receiving data:', lottieFileNames);


        if (isDotLottieLoaded) {
            // If we are in a .lottie context, pass the modified JSON and its ID
            await loadMainToolState(newLottieData, originalFilename);
        } else {
            // If it's just a single JSON, pass only the data
            await loadMainToolState(newLottieData);
        }
    }

    else if (event.data && event.data.type === 'dataFromTrimTool') {
           const { lottieData: newLottieData, originalFilename } = event.data;
           console.log(`Received trimmed data for: ${originalFilename}`);
           const overlay = document.getElementById('customOverlay');
           overlay.style.backdropFilter = '';
           overlay.style.webkitBackdropFilter = '';


           // The same loadMainToolState function can be reused here.
           // It correctly handles updating both single JSONs and items within a .lottie collection.
           if (isDotLottieLoaded) {
               await loadMainToolState(newLottieData, originalFilename);
           } else {
               await loadMainToolState(newLottieData);
           }
       }
       // *** ADD THIS ELSE IF BLOCK for the Asset Replacer ***
           else if (event.data && event.data.type === 'dataFromAssetReplacerTool') {
               const { lottieData: newLottieData, originalFilename } = event.data;
               console.log(`Received asset-replaced data for: ${originalFilename}`);
               const overlay = document.getElementById('customOverlay');
               overlay.style.backdropFilter = '';
               overlay.style.webkitBackdropFilter = '';


               // The same loadMainToolState function can be reused here as well.
               if (isDotLottieLoaded) {
                   await loadMainToolState(newLottieData, originalFilename);
               } else {
                   await loadMainToolState(newLottieData);
               }
           }

});


// Add these functions somewhere in index.js

function handleLottiePreviewDragOver(e) {
    e.preventDefault();
    e.stopPropagation(); // Stop event from bubbling up to other drag-drop zones
    if (isLottiePreviewDropZoneActive) {
        // Add a class for visual feedback
        lottiePreview.classList.add('dragover-preview');
    }
}

function handleLottiePreviewDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    lottiePreview.classList.remove('dragover-preview');
}

async function handleLottiePreviewDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    lottiePreview.classList.remove('dragover-preview');

    if (!isLottiePreviewDropZoneActive) {
        return; // Don't process if the drop zone isn't active
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];

        if (!lottieData) {
            alert("Please load an animation first before dropping files here.");
            return;
        }

        if (isDotLottieLoaded) {
            // If a .lottie collection is active, we add the new file to it
            if (file.name.endsWith('.json')) {
                await addAndActivateChip(file); // Adds to the collection and activates it
            } else {
                alert("Please drop a Lottie JSON (.json) file to add to the current collection.");
            }
        } else {
            // If a single JSON is active, we replace it with the dropped file
            if (file.type === "application/json" || file.name.endsWith('.json') || file.name.endsWith('.lottie')) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files; // Assign to your main hidden file input
                await handleFileLoad({ target: fileInput }, false); // Reload the main view
            } else {
                alert('Please drop a Lottie JSON (.json) or a .lottie file to replace the current animation.');
            }
        }
    }
}
