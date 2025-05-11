import React, { useEffect, useState } from "react";
import Camera from "../components/Camera";

const API_BASE_URL = "http://127.0.0.1:8000/"

function CameraManager() {
  const [availableCameras, setAvailableCameras] = useState([]);
  const [cameraSettings, setCameraSettings] = useState({});

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/camera_settings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed!\n${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed!', error);
      throw error;
    }
  };

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/available_cameras`);
    const fetchSettingsAndUpdate = async () => {
      try {
        const settings = await fetchSettings();
        setCameraSettings(settings);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettingsAndUpdate();

    ws.binaryType = "arraybuffer";

    ws.onmessage = function (event) {
      const text = new TextDecoder().decode(event.data);
      const data = JSON.parse(text);

      setAvailableCameras(data.available_cameras);
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // update camera settings when available cameras change
  useEffect(() => {
    if (availableCameras.length > 0) {
      fetchSettings().then(setCameraSettings);
    }
  }, [availableCameras]);

  return (
    <div>
      {availableCameras.length === 0 ? (<p>No cameras available.</p>) 
      :(
        availableCameras.map((id) => (
          <Camera key={"camera_" + id} id={id} initialSettings={cameraSettings[id] || {}}/>
        ))
      )}
    </div>
  );
}

export default CameraManager;