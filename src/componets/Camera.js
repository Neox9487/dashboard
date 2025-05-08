import React, { useState, useEffect } from "react";
import InputField from "./wdgets/InputField";
import SelectionsButtons from "./wdgets/SelectionButtons"; 

const pipelineOptions = [
  { label: "Color", value: "color" },
  { label: "AprilTag", value: "apriltag" }
];

function Camera({ id, initialSettings = {} }) {
  const [pipelineType, setPipelineType] = useState(initialSettings.pipelineType || "color");

  const [cameraPipeline, setCameraPipeline] = useState({
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

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/${id}?pipeline=${pipelineType}`);
    ws.binaryType = "arraybuffer";
  
    ws.onmessage = function (event) {
      const imgElement = document.getElementById("camera-" + id);
  
      if (pipelineType === "apriltag") {
        try {
          const text = new TextDecoder().decode(event.data);
          const data = JSON.parse(text);
  
          if (data.image) {
            const binary = Uint8Array.from(atob(data.image), c => c.charCodeAt(0));
            const blob = new Blob([binary], { type: "image/jpeg" });
            const url = URL.createObjectURL(blob);
            if (imgElement) imgElement.src = url;
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
        if (imgElement) imgElement.src = url;
  
        setApriltagPose({ rvec: null, tvec: null });
      }
    };
  
    return () => {
      ws.close();
    };
  }, [id, pipelineType]);
  

  const handleInputChange = (section, field, value) => {
    if (section === "HSV") {
      setCameraPipeline(prevState => ({
        ...prevState,
        HSV: {
          ...prevState.HSV,
          [field]: Number(value)
        }
      }));
    } else {
      setCameraPipeline(prevState => ({
        ...prevState,
        [field]: Number(value)
      }));
    }
  };

  return (
    <div>
      <label>Camera {id}</label>
      <div className="camera-box">
        <div className="camera-field">
          <img id={"camera-" + id} alt={`Camera ${id}`} style={{ width: "320px", height: "240px" }} />
        </div>
      </div>

      {/* pipeline */}
      <div className="section-box">
        <SelectionsButtons
          label="Pipeline:"
          options={pipelineOptions}
          onChange={(option) => setPipelineType(option.value)}
        />
      </div>

      {/* color */}
      {pipelineType === "color" && (
        <>
          <div className="section-box">
            <div className="hsv-row-field">
              <InputField label="Hue_Min" type="range" min="0" max="360"
                value={cameraPipeline.HSV.hue_min}
                onChange={(e) => handleInputChange("HSV", "hue_min", e.target.value)} />
              <InputField label="Sat_Min" type="range" min="0" max="100"
                value={cameraPipeline.HSV.sat_min}
                onChange={(e) => handleInputChange("HSV", "sat_min", e.target.value)} />
            </div>
            <div className="hsv-row-field">
              <InputField label="Val_Min" type="range" min="0" max="100"
                value={cameraPipeline.HSV.val_min}
                onChange={(e) => handleInputChange("HSV", "val_min", e.target.value)} />
              <InputField label="Hue_Max" type="range" min="0" max="360"
                value={cameraPipeline.HSV.hue_max}
                onChange={(e) => handleInputChange("HSV", "hue_max", e.target.value)} />
            </div>
            <div className="hsv-row-field">
              <InputField label="Sat_Max" type="range" min="0" max="100"
                value={cameraPipeline.HSV.sat_max}
                onChange={(e) => handleInputChange("HSV", "sat_max", e.target.value)} />
              <InputField label="Val_Max" type="range" min="0" max="100"
                value={cameraPipeline.HSV.val_max}
                onChange={(e) => handleInputChange("HSV", "val_max", e.target.value)} />
            </div>
          </div>

          <div className="section-box">
            <div className="hsv-row-field">
              <InputField label="Brightness" type="range" min="0" max="100"
                value={cameraPipeline.brightness}
                onChange={(e) => handleInputChange(null, "brightness", e.target.value)} />
              <InputField label="Saturation" type="range" min="0" max="100"
                value={cameraPipeline.saturation}
                onChange={(e) => handleInputChange(null, "saturation", e.target.value)} />
            </div>
            <div className="hsv-row-field">
              <InputField label="Contrast" type="range" min="0" max="100"
                value={cameraPipeline.contrast}
                onChange={(e) => handleInputChange(null, "contrast", e.target.value)} />
              <InputField label="Highlight" type="range" min="0" max="100"
                value={cameraPipeline.highlight}
                onChange={(e) => handleInputChange(null, "highlight", e.target.value)} />
            </div>
            <div className="hsv-row-field">
              <InputField label="Red_Balance" type="range" min="0" max="100"
                value={cameraPipeline.red_balance}
                onChange={(e) => handleInputChange(null, "red_balance", e.target.value)} />
              <InputField label="Blue_Balance" type="range" min="0" max="100"
                value={cameraPipeline.blue_balance}
                onChange={(e) => handleInputChange(null, "blue_balance", e.target.value)} />
            </div>
          </div>
        </>
      )}

      {/* apriltag*/}
      {pipelineType === "apriltag" &&
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
