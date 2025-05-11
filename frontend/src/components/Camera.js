import React, { useEffect, useRef, useState } from "react";
import SelectionsButtons from "./wdgets/SelectionButtons";
import InputField from "./wdgets/InputField";

const API_KEY = "localhost"

const modeOptions = [
  { label: "Color", value: "color" },
  { label: "AprilTag", value: "apriltag" }
];

const pipelineOptions = [
  { label: "0", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 }
];

function Camera({id, initialSettings = {}}) {
  // pipeline settings
  const defaultSettings = (pipeline) => ({
    mode: "color",
    pipeline: pipeline,
    brightness: 0,
    saturation: 0,
    contrast: 0,
    blue_balance: 0,
    red_balance: 0,
    highlight: 0,
    HSV: {
      hue_min: 0,
      sat_min: 0,
      val_min: 0,
      hue_max: 360,
      sat_max: 100,
      val_max: 100,
    }
  });
  // parameters
  const [parameters, setParameters] = useState(() => {
    if (!initialSettings || Object.keys(initialSettings).length === 0){
      const settings = {};
      for (let i = 0; i <= 7; i++) {
        settings[`pipeline_${i}`] = defaultSettings(i);
      }
      return { 
        id: id, 
        lastPipeline: 0, 
        settings: settings };
    }
    else return initialSettings;
  });
  const [apriltagPose, setApriltagPose] = React.useState({ rvec: null, tvec: null });

  const wsRef = useRef(null);
  const imgRef = useRef(null);
  const [currentPipeline, setCurrentPipeline] = useState(parameters.lastPipeline);

  //  WebSocket connection
  useEffect(() => {
    wsRef.current = new WebSocket(`ws://${API_KEY}:8080/ws/camera/${id}`);
    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
    };
    wsRef.current.onmessage = function (event) {
      const imgElement = imgRef.current;
      if (parameters.settings[`pipeline_${currentPipeline}`].mode === "apriltag") {
        try {
          const text = new TextDecoder().decode(event.data);
          const data = JSON.parse(text);
    
          if (data.image) {
            const binary = Uint8Array.from(atob(data.image), c => c.charCodeAt(0));
            const blob = new Blob([binary], { type: "image/jpeg" });
            const url = URL.createObjectURL(blob);
    
            if (imgElement) {
              URL.revokeObjectURL(imgElement.src);
              imgElement.src = url;
            }
          }
    
          setApriltagPose({
            rvec: data.rvec,
            tvec: data.tvec
          });
        } catch (error) {
          console.error("Fail! :", error);
          setApriltagPose({ rvec: null, tvec: null });
        }
      } else {
        const blob = new Blob([event.data], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
    
        if (imgElement) {
          if (imgElement.src.startsWith("blob:")) {
            URL.revokeObjectURL(imgElement.src);
          }
          imgElement.src = url;
        }
    
        setApriltagPose({ rvec: null, tvec: null });
      }
    };

    wsRef.current.onclose = () => {
      if (imgRef.current && imgRef.current.src.startsWith("blob:")) {
        URL.revokeObjectURL(imgRef.current.src);
      }
      wsRef.current?.close();
      console.log("WebSocket closed");
    };

    return () => {
      wsRef.current.close();
    };
  }, []);

  // Send settings to server while parameters change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "updateSettings",
          payload: parameters
        }));
      }
    }, 200);
  
    return () => clearTimeout(timer);
  }, [parameters]);

  // Change handlers
  const handleInputChange = (pipeline, key, subkey, value) => {
    if (subkey) {
      setParameters(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [pipeline]: {
            ...prev.settings[pipeline],
            [key]: {
              ...prev.settings[pipeline][key],
              [subkey]: value
            }
          }
        }
      }));
    } else {
      setParameters(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [pipeline]: {
            ...prev.settings[pipeline],
            [key]: value
          }
        }
      }));
    }
  };

  const handlePipelineChange = (pipeline) => {
    setParameters({...parameters, lastPipeline: pipeline});
    setCurrentPipeline(pipeline);
  }

  // render
  return (
    <div>
      <label>Camera {id}</label>
      { /* pipeline */}
      <div className="section-box">
        <select value={currentPipeline} onChange={(e) => handlePipelineChange(parseInt(e.target.value))}>
          {pipelineOptions.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* camera */}
      <div className="camera-box">
        <div className="camera-field">
          <img
            ref={imgRef}
            alt={`Camera ${id}`}
            style={{ width: "320px", height: "240px" }}
          />
        </div>
      </div>

      {/* mode */}
      <div className="section-box">
        <SelectionsButtons
          label="Mode:"
          options={modeOptions}
          onChange={(value) => handleInputChange(`pipeline_${currentPipeline}`,null , "mode", value)}
          value={parameters.settings[`pipeline_${currentPipeline}`].mode}
        />
      </div>

      {/* color */}
      {parameters.settings[`pipeline_${currentPipeline}`].mode === "color" && (
        <>
          <div className="section-box">
            <div className="hsv-row-field">
              <InputField label="Hue_Min" type="range" min="0" max="360"
                value={parameters.settings[`pipeline_${currentPipeline}`].HSV.hue_min}
                onChange={(e) => handleInputChange(`pipeline_${currentPipeline}`, "HSV", "hue_min", parseInt(e.target.value))} />
              <InputField label="Sat_Min" type="range" min="0" max="100"
                value={parameters.settings[`pipeline_${currentPipeline}`].HSV.sat_min}
                onChange={(e) => handleInputChange(`pipeline_${currentPipeline}`, "HSV", "sat_min", parseInt(e.target.value))} />
            </div>
            <div className="hsv-row-field">
              <InputField label="Val_Min" type="range" min="0" max="100"
                value={parameters.settings[`pipeline_${currentPipeline}`].HSV.val_min}
                onChange={(e) => handleInputChange(`pipeline_${currentPipeline}`, "HSV", "val_min", parseInt(e.target.value))} />
              <InputField label="Hue_Max" type="range" min="0" max="360"
                value={parameters.settings[`pipeline_${currentPipeline}`].HSV.hue_max}
                onChange={(e) => handleInputChange(`pipeline_${currentPipeline}`, "HSV", "hue_max", parseInt(e.target.value))} />
            </div>
            <div className="hsv-row-field">
              <InputField label="Sat_Max" type="range" min="0" max="100"
                value={parameters.settings[`pipeline_${currentPipeline}`].HSV.sat_max}
                onChange={(e) => handleInputChange(`pipeline_${currentPipeline}`, "HSV", "sat_max", parseInt(e.target.value))} />
              <InputField label="Val_Max" type="range" min="0" max="100"
                value={parameters.settings[`pipeline_${currentPipeline}`].HSV.val_max}
                onChange={(e) => handleInputChange(`pipeline_${currentPipeline}`, "HSV", "val_max", parseInt(e.target.value))} />
            </div>
          </div>

          <div className="section-box">
            <InputField label="Brightness" type="range" min="0" max="100"
              value={parameters.settings[`pipeline_${currentPipeline}`].brightness}
              onChange={(e) => handleInputChange(`pipeline_${currentPipeline}`, "brightness", parseInt(e.target.value))} />
            <InputField label="Saturation" type="range" min="0" max="100"
              value={parameters.settings[`pipeline_${currentPipeline}`].saturation}
              onChange={(e) => handleInputChange(`pipeline_${currentPipeline}`, "saturation", parseInt(e.target.value))} />
            <InputField label="Contrast" type="range" min="0" max="100"
              value={parameters.settings[`pipeline_${currentPipeline}`].contrast}
              onChange={(e) => handleInputChange(`pipeline_${currentPipeline}`, "contrast", parseInt(e.target.value))} />
            <InputField label="Highlight" type="range" min="0" max="100"
              value={parameters.settings[`pipeline_${currentPipeline}`].highlight}
              onChange={(e) => handleInputChange(`pipeline_${currentPipeline}`, "highlight", parseInt(e.target.value))} />
            <InputField label="Red_Balance" type="range" min="0" max="100"
              value={parameters.settings[`pipeline_${currentPipeline}`].red_balance}
              onChange={(e) => handleInputChange(`pipeline_${currentPipeline}`, "red_balance", parseInt(e.target.value))} />
            <InputField label="Blue_Balance" type="range" min="0" max="100"
              value={parameters.settings[`pipeline_${currentPipeline}`].blue_balance}
              onChange={(e) => handleInputChange(`pipeline_${currentPipeline}`, "blue_balance", parseInt(e.target.value))} />
          </div>
        </>
      )}
      {/* apriltag*/}
      {parameters.settings[`pipeline_${currentPipeline}`].mode === "apriltag" &&
        Array.isArray(apriltagPose.rvec) &&
        apriltagPose.rvec.length === 3 &&
        Array.isArray(apriltagPose.tvec) &&
        apriltagPose.tvec.length === 3 && (
          <div className="section-box">
            <p><strong>R:</strong> [{apriltagPose.rvec.map(v => v.toFixed(3)).join(", ")}]</p>
            <p><strong>t:</strong> [{apriltagPose.tvec.map(v => v.toFixed(3)).join(", ")}]</p>
          </div>
      )}
    </div>
  );
}

export default Camera;