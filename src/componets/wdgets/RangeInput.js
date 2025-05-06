import React from "react";

function RangeInput({label, value, max, min, onChange, ...props}){
  return (
    <div style={{marginBottom:"10px"}}>
      <label>{label}</label>
      <input type="range" value={value} onChange={onChange} max={max} min={min} {...props}/>
    </div>
  );
};

export default RangeInput; 