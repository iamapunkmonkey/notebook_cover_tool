document.getElementById('drop-zone').addEventListener('click', () => {
    document.getElementById('upload').click();
});

document.getElementById('drop-zone').addEventListener('dragover', handleDragOver);
document.getElementById('drop-zone').addEventListener('drop', handleDrop);
document.getElementById('download').addEventListener('click', downloadImage);
document.getElementById('preset-select').addEventListener('change', loadPreset);

let originalFileName = '';
let fullCanvas;

// Preset configurations
const presets = {
    medium: {
        width: 133,
        height: 193.76,
        numSquares: 21,
        squareSize: 4.86,
        spacing: 3.72,
        topDistance: 8.46,
        cornerRadius: 0 // Rounded corner for medium is 0
    },
    small: {
        width: 106.11,
        height: 146,
        numSquares: 16,
        squareSize: 4.11,
        spacing: 4.349333333,
        topDistance: 6.46,
        cornerRadius: 6 // Rounded corner for small is 6 mm
    }
};

// Load the selected preset
function loadPreset() {
    const selectedPreset = document.getElementById('preset-select').value;
    const preset = presets[selectedPreset];

    // Update the input fields with the selected preset values
    document.getElementById('image-width').value = preset.width;
    document.getElementById('image-height').value = preset.height;
    document.getElementById('num-squares').value = preset.numSquares;
    document.getElementById('square-size').value = preset.squareSize;
    document.getElementById('square-spacing').value = preset.spacing;
    document.getElementById('top-distance').value = preset.topDistance;
    document.getElementById('corner-radius').value = preset.cornerRadius;
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    processFile(file);
}

function processFile(file) {
    originalFileName = file.name;
    const reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            processImage(img);
        }
        img.src = e.target.result;
    }
    reader.readAsDataURL(file);
}

function processImage(img) {
    // Get the values from the input fields
    const outputWidthMM = parseFloat(document.getElementById('image-width').value);
    const outputHeightMM = parseFloat(document.getElementById('image-height').value);
    const numSquares = parseInt(document.getElementById('num-squares').value, 10);
    const squareSizeMM = parseFloat(document.getElementById('square-size').value);
    const squareSpacingMM = parseFloat(document.getElementById('square-spacing').value);
    const topDistanceMM = parseFloat(document.getElementById('top-distance').value);
    const cornerRadiusMM = parseFloat(document.getElementById('corner-radius').value);

    // Convert the size from millimeters to pixels at 300 DPI
    const dpi = 300;
    const mmToPx = dpi / 25.4; // Convert millimeters directly to pixels

    const outputWidthPx = Math.round(outputWidthMM * mmToPx);
    const outputHeightPx = Math.round(outputHeightMM * mmToPx);
    const squareSizePx = Math.round(squareSizeMM * mmToPx);
    const squareSpacingPx = Math.round(squareSpacingMM * mmToPx);
    const topDistancePx = Math.round(topDistanceMM * mmToPx);
    const cornerRadiusPx = Math.round(cornerRadiusMM * mmToPx);

    // Create the full-size canvas for downloading
    fullCanvas = document.createElement('canvas');
    const fullCtx = fullCanvas.getContext('2d');
    fullCanvas.width = outputWidthPx;
    fullCanvas.height = outputHeightPx;

    // Draw the image scaled to fit the specified size on the full canvas
    fullCtx.save();
    fullCtx.beginPath();

    // Draw rounded corners on the right side
    fullCtx.moveTo(0, 0); // Start at the top-left
    fullCtx.lineTo(outputWidthPx - cornerRadiusPx, 0); // Line to the top-right minus radius
    fullCtx.quadraticCurveTo(outputWidthPx, 0, outputWidthPx, cornerRadiusPx); // Top-right rounded corner
    fullCtx.lineTo(outputWidthPx, outputHeightPx - cornerRadiusPx); // Right side down to bottom-right minus radius
    fullCtx.quadraticCurveTo(outputWidthPx, outputHeightPx, outputWidthPx - cornerRadiusPx, outputHeightPx); // Bottom-right rounded corner
    fullCtx.lineTo(0, outputHeightPx); // Bottom line
    fullCtx.closePath();
    fullCtx.clip();

    fullCtx.drawImage(img, 0, 0, outputWidthPx, outputHeightPx);
    fullCtx.restore();

    // Add the transparent squares to the full canvas
    for (let i = 0; i < numSquares; i++) {
        const yPos = topDistancePx + i * (squareSizePx + squareSpacingPx);
        fullCtx.clearRect(3.22 * mmToPx, yPos, squareSizePx, squareSizePx);
    }

    // Display the preview on a separate canvas
    const previewCanvas = document.getElementById('preview-canvas');
    const previewCtx = previewCanvas.getContext('2d');
    const scaleFactor = Math.min(previewCanvas.clientWidth / outputWidthPx, previewCanvas.clientHeight / outputHeightPx);

    previewCanvas.width = outputWidthPx * scaleFactor;
    previewCanvas.height = outputHeightPx * scaleFactor;

    previewCtx.drawImage(fullCanvas, 0, 0, outputWidthPx, outputHeightPx, 0, 0, previewCanvas.width, previewCanvas.height);

    document.getElementById('download').style.display = 'block';
}

function downloadImage() {
    const link = document.createElement('a');
    link.href = fullCanvas.toDataURL('image/png');

    // Add the prefix to the original file name
    const newFileName = 'printedcuriosities_' + originalFileName;
    link.download = newFileName;

    link.click();
}

// Load the default "Medium" preset on page load
loadPreset();
