window.onload = async function () {
    await videoMetrics();
}

async function videoMetrics() {
    console.log('Testing console from video stats extension');

    // L3 DRM
    const isL3DRM = await (
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
    const isL1DRM = await (
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

    var drm = 'Not found';
    if (isL1DRM) {
        drm = 'L1';
    } else if (isL3DRM) {
        drm = 'L3';
    }

    const videos = [...document.getElementsByTagName('video')];

    // Create an overlay div element
    const overlay = document.createElement("div");
    overlay.className = "overlay";

    videos.forEach((vid) => {
        if (vid.videoWidth > 0) {
            const videoContainer = vid.parentNode;
            videoContainer.appendChild(overlay);

            // Update the overlay text on each frame
            vid.addEventListener("timeupdate", function () {
                const rect = vid.getBoundingClientRect();
                var viewportWidth = rect.right - rect.left;
                var viewportHeight = rect.bottom - rect.top;
                var viewport = `${viewportWidth} x ${viewportHeight}`;
                var videoRes = `${vid.videoWidth} x ${vid.videoHeight}`;

                var totalFrames = vid.getVideoPlaybackQuality().totalVideoFrames;
                var droppedFrames = vid.getVideoPlaybackQuality().droppedVideoFrames;
                var frameDrop = `${droppedFrames} / ${totalFrames}`;

                // Set the overlay text to the current time
                // overlay.innerHTML = `Res: ${vid.videoWidth} x ${vid.videoHeight} <br>DRM: ${drm}`;
                overlay.innerHTML = `<table>
                <tr>
                  <th>Video Stats</th>
                </tr>
                <tr>
                  <td style="text-align:right; font-weight:bold;">Viewport: </td>
                  <td>${viewport}</td>
                </tr>
                <tr>
                  <td style="text-align:right; font-weight:bold;">Resolution: </td>
                  <td>${videoRes}</td>
                </tr>
                <tr>
                  <td style="text-align:right; font-weight:bold;">Frame drop: </td>
                  <td>${frameDrop}</td>
                </tr>
                <tr>
                  <td style="text-align:right; font-weight:bold;">DRM: </td>
                  <td>${drm}</td>
                </tr>
              </table>`;
            });
        }
    });

    // Style the overlay using CSS
    overlay.style.position = "absolute";
    overlay.style.top = "40px";
    overlay.style.left = "40px";
    overlay.style.color = "#fff";
    overlay.style.fontSize = "12px";
    overlay.style.backgroundColor = "rgba(40, 40, 40, 0.7)";
    overlay.style.padding = "10px";
    overlay.style.borderRadius = "5px";
}
