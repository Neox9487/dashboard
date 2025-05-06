import React from "react";

function RangeInput({label, type, value, onChange, ...props}){
  return (
    <div style={{marginBottom:"10px"}}>
      <label>{label}</label>
      <input type={type} value={value} onChange={onChange} {...props}/>
    </div>
  );
};

export default RangeInput; 