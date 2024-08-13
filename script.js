document.getElementById('drop-zone').addEventListener('click', () => {
    document.getElementById('upload').click();
});

document.getElementById('drop-zone').addEventListener('dragover', handleDragOver);
document.getElementById('drop-zone').addEventListener('drop', handleDrop);
document.getElementById('download').addEventListener('click', downloadImage);

let originalFileName = '';
let fullCanvas;

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
    // Define the output size in millimeters
    const outputWidthMM = 133; // updated width
    const outputHeightMM = 193.76; // updated height

    // Convert the size from millimeters to pixels at 300 DPI
    const dpi = 300;
    const mmToInch = 0.0393701;
    const outputWidthPx = Math.round(outputWidthMM * mmToInch * dpi);
    const outputHeightPx = Math.round(outputHeightMM * mmToInch * dpi);

    // Create the full-size canvas for downloading
    fullCanvas = document.createElement('canvas');
    const fullCtx = fullCanvas.getContext('2d');
    fullCanvas.width = outputWidthPx;
    fullCanvas.height = outputHeightPx;

    // Draw the image scaled to fit the specified size on the full canvas
    fullCtx.drawImage(img, 0, 0, outputWidthPx, outputHeightPx);

    // Add the transparent squares to the full canvas
    const squareSizeMM = 4.86;
    const squareSizePx = Math.round(squareSizeMM * mmToInch * dpi);
    const squareOffsetXMM = 3.22;
    const squareOffsetXPx = Math.round(squareOffsetXMM * mmToInch * dpi);
    const squareStartYMM = 8.46;
    const squareStartYPx = Math.round(squareStartYMM * mmToInch * dpi);
    const squareSpacingMM = 3.72;
    const squareSpacingPx = Math.round(squareSpacingMM * mmToInch * dpi);

    for (let i = 0; i < 21; i++) {
        const yPos = squareStartYPx + i * (squareSizePx + squareSpacingPx);
        fullCtx.clearRect(squareOffsetXPx, yPos, squareSizePx, squareSizePx);
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
