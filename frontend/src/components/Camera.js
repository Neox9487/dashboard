import React, { useState, useEffect, use } from "react";
import InputField from "./wdgets/InputField";
import SelectionsButtons from "./wdgets/SelectionButtons"; 

const modeOptions = [
  { label: "Color", value: "color" },
  { label: "AprilTag", value: "apriltag" }
];

function Camera({ id, initialSettings = {} }) {
  const [pipeline, setPipeline] = useState(initialSettings.pipelineType || 0);
  const [pipelineSettings, setPipelineSettings] = useState({
    mode: initialSettings.mode || "color",
    brightness: initialSettings.brightness || 0,
    saturation: initialSettings.saturation || 0,
    contrast: initialSettings.contrast || 0,
    blue_balance: initialSettings.blue_balance || 0,
    red_balance: initialSettings.red_balance || 0,
    highlight: initialSettings.highlight || 0,
    HSV: {
      hue_min: initialSettings.HSV?.hue_min || 0,
      sat_min: initialSettings.HSV?.sat_min || 0,
      val_min: initialSettings.HSV?.val_min || 0,
      hue_max: initialSettings.HSV?.hue_max || 360,
      sat_max: initialSettings.HSV?.sat_max || 100,
      val_max: initialSettings.HSV?.val_max || 100,
    }
  });
  const [apriltagPose, setApriltagPose] = useState({ rvec: null, tvec: null });
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/${id}?pipeline=${pipeline}`);
    ws.binaryType = "arraybuffer";
  
    ws.onmessage = function (event) {
      const imgElement = document.getElementById("camera-" +  id);
  
      if (pipelineSettings.mode === "apriltag") {
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
          URL.revokeObjectURL(imgElement.src);
          imgElement.src = url;
        }
  
        setApriltagPose({ rvec: null, tvec: null });
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    setWs(ws);
  
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [pipeline]);

  useEffect(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(pipelineSettings));
    }
  }, [pipelineSettings, ws]);
  
  const handleInputChange = (section, field, value) => {
    if (section) {
      setPipelineSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: Number(value),
        },
      }));
    } else {
      setPipelineSettings(prev => ({
        ...prev,
        [field]: Number(value),
      }));
    }
  };

  const handleModeChange = (mode) => {
    setPipelineSettings((prev) => ({
      ...prev,
      mode: mode,
    }));
  };

  return (
    <div>
      <label>Camera {id}</label>
      <div className="camera-box">
        <div className="camera-field">
          <img id={"camera-" + id} alt={`Camera ${id}`} style={{ width: "320px", height: "240px" }} />
        </div>
      </div>

      {/* mode */}
      <div className="section-box">
        <SelectionsButtons
          label="Mode:"
          options={modeOptions}
          onChange={handleModeChange}
        />
      </div>

      {/* color */}
      {pipelineSettings.mode === "color" && (
        <>
          <div className="section-box">
            <div className="hsv-row-field">
              <InputField label="Hue_Min" type="range" min="0" max="360"
                value={pipelineSettings.HSV.hue_min}
                onChange={(e) => handleInputChange("HSV", "hue_min", e.target.value)} />
              <InputField label="Sat_Min" type="range" min="0" max="100"
                value={pipelineSettings.HSV.sat_min}
                onChange={(e) => handleInputChange("HSV", "sat_min", e.target.value)} />
            </div>
            <div className="hsv-row-field">
              <InputField label="Val_Min" type="range" min="0" max="100"
                value={pipelineSettings.HSV.val_min}
                onChange={(e) => handleInputChange("HSV", "val_min", e.target.value)} />
              <InputField label="Hue_Max" type="range" min="0" max="360"
                value={pipelineSettings.HSV.hue_max}
                onChange={(e) => handleInputChange("HSV", "hue_max", e.target.value)} />
            </div>
            <div className="hsv-row-field">
              <InputField label="Sat_Max" type="range" min="0" max="100"
                value={pipelineSettings.HSV.sat_max}
                onChange={(e) => handleInputChange("HSV", "sat_max", e.target.value)} />
              <InputField label="Val_Max" type="range" min="0" max="100"
                value={pipelineSettings.HSV.val_max}
                onChange={(e) => handleInputChange("HSV", "val_max", e.target.value)} />
            </div>
          </div>

          <div className="section-box">
            <div className="hsv-row-field">
              <InputField label="Brightness" type="range" min="0" max="100"
                value={pipelineSettings.brightness}
                onChange={(e) => handleInputChange(null, "brightness", e.target.value)} />
              <InputField label="Saturation" type="range" min="0" max="100"
                value={pipelineSettings.saturation}
                onChange={(e) => handleInputChange(null, "saturation", e.target.value)} />
            </div>
            <div className="hsv-row-field">
              <InputField label="Contrast" type="range" min="0" max="100"
                value={pipelineSettings.contrast}
                onChange={(e) => handleInputChange(null, "contrast", e.target.value)} />
              <InputField label="Highlight" type="range" min="0" max="100"
                value={pipelineSettings.highlight}
                onChange={(e) => handleInputChange(null, "highlight", e.target.value)} />
            </div>
            <div className="hsv-row-field">
              <InputField label="Red_Balance" type="range" min="0" max="100"
                value={pipelineSettings.red_balance}
                onChange={(e) => handleInputChange(null, "red_balance", e.target.value)} />
              <InputField label="Blue_Balance" type="range" min="0" max="100"
                value={pipelineSettings.blue_balance}
                onChange={(e) => handleInputChange(null, "blue_balance", e.target.value)} />
            </div>
          </div>
        </>
      )}

      {/* apriltag*/}
      {pipelineSettings.mode === "apriltag" &&
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
