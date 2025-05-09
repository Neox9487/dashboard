import React, { useEffect, useState } from "react";
import Camera from "../components/Camera";

function CameraManager() {
  const [availableCameras, setAvailableCameras] = useState([]);
  const [cameraSettings, setCameraSettings] = useState({});

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/available_cameras`);
    
    ws.binaryType = "arraybuffer";

    ws.onmessage = function (event) {
      const text = new TextDecoder().decode(event.data);
      const data = JSON.parse(text);

      setAvailableCameras(data.available_cameras);
      setCameraSettings(data.camera_settings || {});
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

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