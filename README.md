# Face Detection Web App

A real-time face detection web application built with HTML5, CSS3, and JavaScript using the face-api.js library (powered by TensorFlow.js).

## Features

✨ **Real-Time Face Detection**
- Detects multiple faces in real-time from your webcam
- Displays confidence scores for each detected face
- Shows bounding boxes around detected faces

😊 **Facial Expression Recognition**
- Identifies expressions: happy, sad, angry, fearful, surprised, disgusted, neutral
- Displays dominant expression for each face

📍 **Facial Landmarks**
- Detects 68 facial landmarks
- Visualized as green dots on the canvas overlay

📊 **Performance Metrics**
- Real-time FPS (frames per second) counter
- Face detection count
- Model status indicator

🎨 **Modern UI**
- Clean, gradient-based design
- Responsive layout for desktop and mobile
- Smooth animations and transitions

## How to Use

1. **Open the Application**
   - Open `index.html` in a modern web browser

2. **Start Detection**
   - Click the "Start Webcam" button
   - Grant camera access when prompted by your browser
   - The app will begin detecting faces in real-time

3. **View Results**
   - Green bounding boxes show detected faces
   - Confidence scores appear above each face
   - Facial expressions are displayed below each face
   - Detailed information appears in the detection details panel

4. **Stop Detection**
   - Click the "Stop Webcam" button to stop detection and close the camera

## Technical Details

### Libraries Used
- **face-api.js** (v0.22.2) - Face detection and recognition
- **TensorFlow.js** - Machine learning framework
- **HTML5 Canvas API** - Drawing detections

### Supported Browsers
- Chrome/Chromium (recommended)
- Firefox
- Edge
- Safari (with limited support)

### Requirements
- A device with a webcam
- Modern browser with WebGL support
- Stable internet connection (for loading models)

## Model Information

The application uses three pre-trained models:

1. **TinyFaceDetector** - Lightweight face detection
2. **FaceLandmark68Net** - Facial landmark detection
3. **FaceExpressionNet** - Facial expression recognition

Models are loaded from CDN on first use (~60MB)

## Performance

- **Average FPS**: 15-30 fps (depending on device)
- **Latency**: ~100-300ms per frame
- **Supported Concurrent Faces**: 10-20+

## Troubleshooting

### Camera Not Working
- Check browser permission settings
- Ensure no other application is using the camera
- Try a different browser

### Models Not Loading
- Check your internet connection
- Check browser console for errors
- Try hard refreshing the page (Ctrl+F5)

### Low FPS
- Lower video resolution in browser settings
- Close other applications using CPU/GPU
- Try reducing video constraints in script.js

## Security & Privacy

- **No Data Sent to Servers**: All processing happens locally in your browser
- **No Recording**: The app does not record or store video data
- **Camera Control**: You have full control over camera access

## Customization

You can customize the app by modifying:

- **Video Resolution**: Change constraints in `script.js` startWebcam() function
- **Detection Options**: Modify TinyFaceDetectorOptions parameters
- **UI Colors**: Edit CSS variables in `style.css`
- **Landmarks Display**: Toggle landmark drawing in `drawLandmarks()` function

## License

This project is free to use and modify.

## Credits

- Built with [face-api.js](https://github.com/vladmandic/face-api)
- Powered by [TensorFlow.js](https://www.tensorflow.org/js)

---

**Enjoy real-time face detection! 🎥**
