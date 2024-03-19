function refreshVideoElements() {
    const videos = [...document.getElementsByTagName('video')];
    videos.forEach((vid) => {
        let overlayDivs = vid.parentNode.getElementsByClassName('overlay');
        if(overlayDivs.length > 0) {
        } else {
            console.log('This video element does not have a child div with class "overlay".');
            videoMetrics(vid)
        }
    });
  }

// Run the function every 3 seconds
setInterval(refreshVideoElements, 3000);


async function videoMetrics(vid) {
    console.log('Testing console from video stats extension');

    // L3 DRM
    const supportsL3DRM = await (
        navigator.requestMediaKeySystemAccess &&
        navigator.requestMediaKeySystemAccess('com.widevine.alpha', [{
            videoCapabilities: [
                {
                    contentType: 'video/mp4; codecs="avc1.42E01E"',
                    robustness: 'SW_SECURE_DECODE',
                },
            ],
        }])
            .then((access) => access?.createMediaKeys())
            .then((mediaKeys) => mediaKeys !== false)
            .catch(() => false)
    ) || false

    // L1 DRM
    const supportsL1DRM = await (
        navigator.requestMediaKeySystemAccess &&
        navigator.requestMediaKeySystemAccess('com.widevine.alpha', [{
            videoCapabilities: [
                {
                    contentType: 'video/mp4; codecs="avc1.42E01E"',
       robustness: 'HW_SECURE_ALL',
                },
            ],
        }])
            .then((access) => access?.createMediaKeys())
            .then((mediaKeys) => mediaKeys !== false)
            .catch(() => false)
    ) || false

    var drmSupport = 'None';
    if (supportsL1DRM) {
        if (supportsL3DRM) {
            drmSupport = 'L1 and L3';
        } else {
            drmSupport = 'L1 only';
        }
    } else if (supportsL3DRM) {
        drmSupport = 'L3 only';
    }

    // Whether the video is DRM protected.
    var drmProtected = 'No';
    if (vid.mediaKeys !== null) {
        drmProtected = 'Yes';
    }

    // Create an overlay div element
    const overlay = document.createElement("div");
    overlay.className = "overlay";

    if (vid.videoWidth > 0) {
        const videoContainer = vid.parentNode;
        videoContainer.appendChild(overlay);

        // Set the overlay text to the current time
        overlay.innerHTML = `<table>
        <tr>
            <th>Video Stats</th>
            <th>&emsp;<button id="hideButton">X</button></th>
        </tr>
        <tr>
            <td style="text-align:right; font-weight:bold;">Viewport: </td>
            <td id="viewport"></td>
        </tr>
        <tr>
            <td style="text-align:right; font-weight:bold;">Resolution: </td>
            <td id="videoRes"></td>
        </tr>
        <tr>
            <td style="text-align:right; font-weight:bold;">Frame drop: </td>
            <td id="frameDrop"></td>
        </tr>
        <tr>
            <td style="text-align:right; font-weight:bold;">DRM protected: </td>
            <td id="drmProtected"></td>
        </tr>
        </table>
        <table>
        <tr>
            <th>Device Info</th>
        </tr>
        <tr>
            <td style="text-align:right; font-weight:bold;">DRM support: </td>
            <td id="drmSupport"></td>
        </tr>
        </table>`;

        // Update the overlay text on each frame
        vid.addEventListener("timeupdate", function () {
            const rect = vid.getBoundingClientRect();
            var viewportWidth = rect.right - rect.left;
            var viewportHeight = rect.bottom - rect.top;
            var viewport = `${viewportWidth} x ${viewportHeight}`;
            var videoRes = `${vid.videoWidth} x ${vid.videoHeight}`;

            let quality = vid.getVideoPlaybackQuality();
            var totalFrames = quality.totalVideoFrames;
            var droppedFrames = quality.droppedVideoFrames;
            var frameDrop = `${droppedFrames} / ${totalFrames}`;

            document.getElementById("viewport").innerHTML = viewport;
            document.getElementById("videoRes").innerHTML = videoRes;
            document.getElementById("frameDrop").innerHTML = frameDrop;
            document.getElementById("drmProtected").innerHTML = drmProtected;
            document.getElementById("drmSupport").innerHTML = drmSupport;
        });
    }

    // Style the overlay using CSS
    overlay.style.position = "absolute";
    overlay.style.top = "40px";
    overlay.style.left = "40px";
    overlay.style.color = "#fff";
    overlay.style.width = "180px";
    overlay.style.height = "120px";
    overlay.style.fontSize = "12px";
    overlay.style.backgroundColor = "rgba(40, 40, 40, 0.7)";
    overlay.style.padding = "10px";
    overlay.style.borderRadius = "5px";

    // Create the hide button
    var hideButton = document.getElementById('hideButton');
    if (hideButton) {
        hideButton.style.position = "absolute";
        hideButton.style.top = "5";
        hideButton.style.right = "5";
        hideButton.textContent = "X";
        hideButton.style.fontSize = "12px";
        hideButton.style.color = "#fff";
        hideButton.style.backgroundColor = "rgba(40, 40, 40, 0.1)";
        hideButton.style.borderRadius = "5px";
        // Add the click event to the hide button
        hideButton.addEventListener('click', function() {
            overlay.style.display = 'none';
        });

    }
}
