import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import './App.css';
import axios from 'axios';

const cloudinaryCloudName = 'dalsog2hb';
const cloudinaryUploadPreset = 'alphtdg5';
const cloudinaryApiKey = '778342524695887';
const flaskApiUrl = 'https://bichoback-production.up.railway.app/predict'; // Update with your Flask API URL

function App() {
  const webcamRef = useRef(null);
  const [insect, setInsect] = useState(null);
  const [loading, setLoading] = useState(false);

  const capture = useCallback(async () => {
    setLoading(true); // Set loading to true when starting the capture process

    const imageSrc = webcamRef.current.getScreenshot();
    const formData = new FormData();
    formData.append('file', dataURLtoFile(imageSrc, 'capturedImage.jpg'));

    try {
      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload?upload_preset=${cloudinaryUploadPreset}&api_key=${cloudinaryApiKey}`,
        formData
      );

      const image_url = cloudinaryResponse.data.secure_url;
      
      const predictionResponse = await axios.post(flaskApiUrl, {
        image_url: image_url,
      });

      const insectPrediction = predictionResponse.data.insect;
      setInsect(insectPrediction);

      console.log('Insect prediction:', insectPrediction);
    } catch (error) {
      console.error('Error capturing and predicting:', error);
    } finally {
      setLoading(false); // Set loading back to false when the process is completed (success or error)
    }
  }, [webcamRef]);

  // Helper function to convert data URL to File
  const dataURLtoFile = (dataURL, fileName) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  };

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="webcam"
        />
        <button onClick={capture} disabled={loading}>
          Capture Photo
        </button>
        {loading && <p>Cargando...</p>}
        {insect && <p>Causa posible de la picadura: {insect}</p>}
      </header>
    </div>
  );
}

export default App;
