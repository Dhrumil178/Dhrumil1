// Global variables
let video, canvas, ctx;
let stream = null;
let isRunning = false;
let lastFrameTime = Date.now();
let frameCount = 0;
let fps = 0;
let currentMode = 'webcam';
let uploadedImage = null;

// Wait for ml5 to be available
async function waitForML5() {
    while (!window.ml5) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    // Set canvas dimensions to match video
    video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    });

    // Button event listeners
    document.getElementById('startBtn').addEventListener('click', startWebcam);
    document.getElementById('stopBtn').addEventListener('click', stopWebcam);

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });

    // Upload area handling
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const clearImageBtn = document.getElementById('clearImageBtn');

    uploadArea.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleImageUpload);
    clearImageBtn.addEventListener('click', clearImage);

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            imageInput.files = files;
            handleImageUpload();
        }
    });

    // Wait for ml5 library to load, then load models
    await waitForML5();
    await loadModels();
});

// Switch between tabs
function switchTab(tabName) {
    currentMode = tabName;

    // Stop webcam if currently running
    if (isRunning) {
        stopWebcam();
    }

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Load ml5 face detection model
async function loadModels() {
    const statusEl = document.getElementById('modelStatus');
    try {
        statusEl.textContent = 'Loading models...';
        
        // Load face detection model
        let faceDetector = await ml5.faceDetection('facemesh', video);
        
        statusEl.textContent = 'Ready';
        console.log('Model loaded successfully');
    } catch (error) {
        console.error('Error loading models:', error);
        statusEl.textContent = 'Error loading models';
        statusEl.parentElement.classList.add('error');
    }
}

// Start webcam
async function startWebcam() {
    try {
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const statusEl = document.getElementById('status');

        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        video.srcObject = stream;
        isRunning = true;

        startBtn.disabled = true;
        stopBtn.disabled = false;
        statusEl.textContent = 'Running';
        statusEl.classList.add('active');

        // Start detection loop
        detectFaces();
    } catch (error) {
        console.error('Error accessing webcam:', error);
        const statusEl = document.getElementById('status');
        statusEl.textContent = 'Camera access denied';
        statusEl.classList.add('error');
    }
}

// Stop webcam
function stopWebcam() {
    isRunning = false;

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    video.srcObject = null;

    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const statusEl = document.getElementById('status');

    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusEl.textContent = 'Stopped';
    statusEl.classList.remove('active');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    document.getElementById('faceCount').textContent = '0';
    document.getElementById('detectionDetails').innerHTML = `<div class="no-faces">Webcam stopped</div>`;
}

// Detect faces in video stream
async function detectFaces() {
    if (!isRunning) return;

    try {
        // Detect faces and expressions
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw detections
        if (detections.length > 0) {
            drawDetections(detections);
            updateFaceInfo(detections);
        } else {
            document.getElementById('faceCount').textContent = '0';
            document.getElementById('detectionDetails').innerHTML = `<div class="no-faces">No faces detected</div>`;
        }

        // Calculate FPS
        frameCount++;
        const now = Date.now();
        if (now - lastFrameTime >= 1000) {
            fps = frameCount;
            document.getElementById('fps').textContent = fps;
            frameCount = 0;
            lastFrameTime = now;
        }

    } catch (error) {
        console.error('Detection error:', error);
    }

    // Continue detection loop
    requestAnimationFrame(detectFaces);
}

// Draw bounding boxes and landmarks
function drawDetections(detections) {
    // Resize canvas overlay to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    detections.forEach((detection, index) => {
        const box = detection.detection.box;
        
        // Draw bounding box
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        // Draw score
        const score = Math.round(detection.detection.score * 100);
        ctx.fillStyle = '#00ff00';
        ctx.font = '16px Arial';
        ctx.fillText(`Face ${index + 1} (${score}%)`, box.x, box.y - 10);

        // Draw confidence
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(box.x, box.y, box.width, 25);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`Confidence: ${score}%`, box.x + 5, box.y + 18);

        // Draw landmarks
        drawLandmarks(detection);

        // Draw expression
        drawExpression(detection, index, box);
    });
}

// Draw face landmarks
function drawLandmarks(detection) {
    if (!detection.landmarks) return;

    ctx.fillStyle = '#00ff00';
    ctx.strokeStyle = '#00ff00';

    detection.landmarks.positions.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Draw dominant expression
function drawExpression(detection, index, box) {
    if (!detection.expressions) return;

    const expressions = detection.expressions;
    const maxExpression = Object.keys(expressions).reduce((a, b) =>
        expressions[a] > expressions[b] ? a : b
    );
    const confidence = Math.round(expressions[maxExpression] * 100);

    ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
    ctx.fillRect(box.x, box.y + box.height + 5, box.width, 25);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${maxExpression}: ${confidence}%`, box.x + 5, box.y + box.height + 25);
}

// Update face information panel
function updateFaceInfo(detections) {
    const faceCount = detections.length;
    document.getElementById('faceCount').textContent = faceCount;

    const detailsHtml = detections.map((detection, index) => {
        const box = detection.detection.box;
        const score = Math.round(detection.detection.score * 100);
        const expressions = detection.expressions;
        
        let expressionText = '';
        if (expressions) {
            const maxExpression = Object.keys(expressions).reduce((a, b) =>
                expressions[a] > expressions[b] ? a : b
            );
            expressionText = `${maxExpression.charAt(0).toUpperCase() + maxExpression.slice(1)}`;
        }

        return `
            <div class="detection-item">
                <strong>Face ${index + 1}</strong><br>
                Confidence: ${score}% | 
                Position: (${Math.round(box.x)}, ${Math.round(box.y)}) | 
                Size: ${Math.round(box.width)}x${Math.round(box.height)}
                ${expressionText ? `<br>Expression: ${expressionText}` : ''}
            </div>
        `;
    }).join('');

    document.getElementById('detectionDetails').innerHTML = `<h3>Detection Details:</h3>${detailsHtml}`;
}

// Handle image upload
async function handleImageUpload() {
    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0];
    
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        uploadedImage = new Image();
        uploadedImage.onload = () => {
            // Draw image on canvas
            canvas.width = uploadedImage.width;
            canvas.height = uploadedImage.height;
            ctx.drawImage(uploadedImage, 0, 0);

            // Detect faces in image
            detectFacesInImage();

            // Show clear button
            document.getElementById('clearImageBtn').style.display = 'inline-block';
            document.getElementById('uploadArea').style.opacity = '0.5';
            document.getElementById('uploadArea').style.pointerEvents = 'none';
        };
        uploadedImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Detect faces in uploaded image
async function detectFacesInImage() {
    if (!uploadedImage || !ml5) return;

    try {
        const predictions = await ml5.faceDetection('facemesh', uploadedImage);

        // Clear canvas and redraw image
        ctx.drawImage(uploadedImage, 0, 0);

        if (predictions && predictions.length > 0) {
            drawDetectionsOnImage(predictions);
            updateImageFaceInfo(predictions);
        } else {
            document.getElementById('faceCount').textContent = '0';
            document.getElementById('detectionDetails').innerHTML = `<div class="no-faces">No faces detected in image</div>`;
        }
    } catch (error) {
        console.error('Error detecting faces:', error);
    }
}

// Draw detections on image
function drawDetectionsOnImage(predictions) {
    predictions.forEach((prediction, index) => {
        const start = prediction.boundingBox.topLeft;
        const end = prediction.boundingBox.bottomRight;
        const width = end[0] - start[0];
        const height = end[1] - start[1];

        // Draw bounding box
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(start[0], start[1], width, height);

        // Draw face label
        ctx.fillStyle = 'rgba(0, 255, 0, 0.9)';
        ctx.fillRect(start[0], start[1] - 30, width, 30);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`Face ${index + 1}`, start[0] + 10, start[1] - 10);

        // Draw landmarks
        drawImageLandmarks(prediction.landmarks);
    });
}

// Draw landmarks on image
function drawImageLandmarks(landmarks) {
    ctx.fillStyle = '#00ff00';
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;

    landmarks.forEach(point => {
        ctx.beginPath();
        ctx.arc(point[0], point[1], 2, 0, 2 * Math.PI);
        ctx.fill();
    });

    // Draw face mesh
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.lineWidth = 1;
    
    const keyConnections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [5, 6], [6, 7], [7, 8], [8, 9],
        [9, 10], [10, 11], [11, 12], [12, 13],
        [13, 14], [14, 0],
        [33, 34], [34, 35], [35, 36], [36, 37], [37, 38], [38, 39], [39, 40], [40, 41], [41, 36],
        [42, 43], [43, 44], [44, 45], [45, 46], [46, 47], [47, 48], [48, 49], [49, 42],
        [27, 28], [28, 29], [29, 30],
        [49, 59], [50, 60], [51, 61], [52, 62], [53, 63], [54, 64], [55, 65], [56, 66], [57, 67], [58, 68],
    ];

    keyConnections.forEach(([start, end]) => {
        if (landmarks[start] && landmarks[end]) {
            ctx.beginPath();
            ctx.moveTo(landmarks[start][0], landmarks[start][1]);
            ctx.lineTo(landmarks[end][0], landmarks[end][1]);
            ctx.stroke();
        }
    });
}

// Update face info for image
function updateImageFaceInfo(predictions) {
    const faceCount = predictions.length;
    document.getElementById('faceCount').textContent = faceCount;

    const detailsHtml = predictions.map((prediction, index) => {
        const start = prediction.boundingBox.topLeft;
        const end = prediction.boundingBox.bottomRight;
        const width = end[0] - start[0];
        const height = end[1] - start[1];

        return `
            <div class="detection-item">
                <strong>Face ${index + 1}</strong><br>
                Position: (${Math.round(start[0])}, ${Math.round(start[1])}) | 
                Size: ${Math.round(width)}x${Math.round(height)} |
                Landmarks: ${prediction.landmarks.length}
            </div>
        `;
    }).join('');

    document.getElementById('detectionDetails').innerHTML = `<h3>Detection Details:</h3>${detailsHtml}`;
}

// Clear uploaded image
function clearImage() {
    uploadedImage = null;
    document.getElementById('imageInput').value = '';
    document.getElementById('clearImageBtn').style.display = 'none';
    document.getElementById('uploadArea').style.opacity = '1';
    document.getElementById('uploadArea').style.pointerEvents = 'auto';
    document.getElementById('faceCount').textContent = '0';
    document.getElementById('detectionDetails').innerHTML = `<div class="no-faces">Upload an image to detect faces</div>`;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
