import React from "react";
import { useState, useEffect } from "react";
import InputField from "./InputField"

function Camera({id, initialSettings = {}}) {
  const [cameraPipeline, setCameraPipeline] = useState({ 
    HSV: {
      hue_min: initialSettings.HSV.hue_min || 0,
      sat_min: initialSettings.HSV.sat_min || 0,
      val_min: initialSettings.HSV.val_min || 0,
      hue_max: initialSettings.HSV.hue_max || 0,
      sat_max: initialSettings.HSV.sat_max || 0,
      val_max: initialSettings.HSV.val_max || 0
    }
  });

  useEffect(
    ()=>{ 
      setCameraPipeline({
        HSV: {
          hue_min: initialSettings.HSV.hue_min || 0,
          sat_min: initialSettings.HSV.sat_min || 0,
          val_min: initialSettings.HSV.val_min || 0,
          hue_max: initialSettings.HSV.hue_max || 0,
          sat_max: initialSettings.HSV.sat_max || 0,
          val_max: initialSettings.HSV.val_max || 0
        }
      })
    }, [initialSettings]
  );

  const handleInputChange = (section, field, value) => {
    if(section) {

    }else{
      
    }
  }

  const setWebSocket = () => {
    let ws = new WebSocket(`ws://localhost:8000/ws/${id}`);
    ws.binaryType = 'arraybuffer';  
    ws.onmessage = function(event) {
      let imgElement = document.getElementById('camera_' + id);
      let blob = new Blob([event.data], { type: 'image/jpeg' });
      let url = URL.createObjectURL(blob);
      imgElement.src = url;
    };
    return ws;
  }

  return (
    <div>
      <label>Camera {id}</label>
      <div className="camera-box">
        <div className="camera-field">
          <img id={"camara-"+id} style={{width: "320px", height: "240px"}}/>
        </div>
      </div>
      {/* HSV */}
      <div className="section-box">
        <div className="hsv-row-field">
          <InputField
            label="Hue_Min"
            type="range"
            min="0"
            max="360"
            value={cameraPipeline.HSV.hue_min}
            onChange={(e) => handleInputChange("HSV", "hue_min", e.target.value)}
          />
          <InputField
            label="Sat_Min"
            type="range"
            min="0"
            max="100"
            value={cameraPipeline.HSV.sat_min}
            onChange={(e) => handleInputChange("HSV", "sat_min", e.target.value)}
          />
        </div>
        <div className="hsv-row-field">
          <InputField
            label="Val_Min"
            type="range"
            min="0"
            max="100"
            value={cameraPipeline.HSV.val_min}
            onChange={(e) => handleInputChange("HSV", "val_min", e.target.value)}
          />
          <InputField
            label="Hue_Max"
            type="range"
            min="0"
            max="360"
            value={cameraPipeline.HSV.hue_max}
            onChange={(e) => handleInputChange("HSV", "hue_max", e.target.value)}
          />
        </div>
        <div className="hsv-row-field">
          <InputField
            label="Sat_Max"
            type="range"
            min="0"
            max="100"
            value={cameraPipeline.HSV.sat_max}
            onChange={(e) => handleInputChange("HSV", "sat_max", e.target.value)}
          />
          <InputField
            label="Val_Max"
            type="range"
            min="0"
            max="100"
            value={cameraPipeline.HSV.val_max}
            onChange={(e) => handleInputChange("HSV", "val_max", e.target.value)}
          />
        </div>
      </div>
      {/* Settings */}
      <div className="section-box">
        
      </div>
    </div>
  );
}