import React from "react";
export const Slider = ({ value, onChange, min, max,  step = 1 }) => (
    <input
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
    />
);